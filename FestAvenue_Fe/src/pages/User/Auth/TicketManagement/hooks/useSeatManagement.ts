import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import serviceSeatManagementApi from '@/apis/serviceSeatManagement.api'
import serviceTicketManagementApi from '@/apis/serviceTicketManagement.api'
import eventApis from '@/apis/event.api'
import type { bodyCreateSeatingChart } from '@/types/serviceSeatChartManagement'

// Query keys
export const seatKeys = {
  all: ['seats'] as const,
  lists: () => [...seatKeys.all, 'list'] as const,
  list: (eventCode: string) => [...seatKeys.lists(), eventCode] as const,
  detail: (seatId: string) => [...seatKeys.all, 'detail', seatId] as const
}

/**
 * Hook để lấy thông tin event (bao gồm capacity)
 */
export const useEventCapacity = (eventCode: string) => {
  return useQuery({
    queryKey: ['event', eventCode],
    queryFn: () => eventApis.getEventById(eventCode),
    enabled: !!eventCode,
    staleTime: 60000 // 1 minute
  })
}

/**
 * Hook để lấy danh sách tickets của event
 */
export const useEventTickets = (eventCode: string) => {
  return useQuery({
    queryKey: ['tickets', eventCode],
    queryFn: () =>
      serviceTicketManagementApi.getAllTicketSearchFilter({
        search: '',
        eventCode,
        minPrice: 0,
        maxPrice: Number.MAX_SAFE_INTEGER,
        pagination: {
          pageIndex: 1,
          isPaging: false,
          pageSize: 100
        }
      }),
    enabled: !!eventCode,
    staleTime: 30000, // 30 seconds
    select: (data) => data?.data?.result || []
  })
}

/**
 * Validate số lượng seat không vượt quá capacity
 */
export const validateSeatCapacity = (
  seatingChartStructure: string | object,
  capacity: number
): { isValid: boolean; message?: string; totalSeats?: number } => {
  try {
    // Parse JSON nếu là string
    const structure =
      typeof seatingChartStructure === 'string' ? JSON.parse(seatingChartStructure) : seatingChartStructure

    // Đếm tổng số seat trong structure
    // Logic linh hoạt để hỗ trợ nhiều format JSON khác nhau
    let totalSeats = 0
    const processedObjects = new WeakSet() // Tránh đếm trùng

    const countSeats = (obj: any): void => {
      if (!obj || typeof obj !== 'object') return

      // Tránh đếm trùng object
      if (processedObjects.has(obj)) return
      processedObjects.add(obj)

      // Nếu là array
      if (Array.isArray(obj)) {
        obj.forEach((item) => {
          // Nếu item có seats array
          if (item && item.seats && Array.isArray(item.seats)) {
            totalSeats += item.seats.length
          }
          // Nếu item có seatCount
          else if (item && typeof item.seatCount === 'number') {
            totalSeats += item.seatCount
          }
          // Recursive count
          else {
            countSeats(item)
          }
        })
      }
      // Nếu là object
      else {
        // Kiểm tra các properties phổ biến
        if (obj.sections && Array.isArray(obj.sections)) {
          obj.sections.forEach((section: any) => {
            if (section.seats && Array.isArray(section.seats)) {
              totalSeats += section.seats.length
            } else {
              countSeats(section)
            }
          })
        }

        if (obj.rows && Array.isArray(obj.rows)) {
          obj.rows.forEach((row: any) => {
            if (row.seats && Array.isArray(row.seats)) {
              totalSeats += row.seats.length
            } else {
              countSeats(row)
            }
          })
        }

        // Nếu chính object này có seats
        if (obj.seats && Array.isArray(obj.seats) && !obj.sections && !obj.rows) {
          totalSeats += obj.seats.length
        }
      }
    }

    countSeats(structure)

    if (totalSeats > capacity) {
      return {
        isValid: false,
        message: `Số lượng ghế (${totalSeats}) vượt quá sức chứa của sự kiện (${capacity})`,
        totalSeats
      }
    }

    return {
      isValid: true,
      totalSeats
    }
  } catch (error) {
    return {
      isValid: false,
      message: 'Không thể đọc cấu trúc seating chart. Vui lòng kiểm tra lại format JSON.'
    }
  }
}

/**
 * Hook để tạo seating chart với validation capacity
 */
export const useCreateSeatingChart = (eventCode: string) => {
  const queryClient = useQueryClient()
  const { data: eventData } = useEventCapacity(eventCode)

  const capacity = eventData?.data?.capacity || 0

  return useMutation({
    mutationFn: async (data: bodyCreateSeatingChart) => {
      // Validate capacity trước khi gửi
      const validation = validateSeatCapacity(data.seatingChartStructure, capacity)

      if (!validation.isValid) {
        throw new Error(validation.message)
      }

      // Ensure seatingChartStructure is string
      const bodyData: bodyCreateSeatingChart = {
        ...data,
        seatingChartStructure:
          typeof data.seatingChartStructure === 'string'
            ? data.seatingChartStructure
            : JSON.stringify(data.seatingChartStructure)
      }

      return serviceSeatManagementApi.createSeatingChart(bodyData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: seatKeys.list(variables.eventCode) })

      const validation = validateSeatCapacity(variables.seatingChartStructure, capacity)

      toast.success('Tạo sơ đồ chỗ ngồi thành công!', {
        description: `Đã tạo ${validation.totalSeats} ghế / ${capacity} sức chứa`
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || 'Có lỗi xảy ra khi tạo sơ đồ chỗ ngồi'
      toast.error(errorMessage)
    }
  })
}

/**
 * Hook để cập nhật seating chart với validation capacity
 */
export const useUpdateSeatingChart = (eventCode: string) => {
  const queryClient = useQueryClient()
  const { data: eventData } = useEventCapacity(eventCode)

  const capacity = eventData?.data?.capacity || 0

  return useMutation({
    mutationFn: async (data: bodyCreateSeatingChart & { id: string }) => {
      // Validate capacity trước khi gửi
      const validation = validateSeatCapacity(data.seatingChartStructure, capacity)

      if (!validation.isValid) {
        throw new Error(validation.message)
      }

      // Ensure seatingChartStructure is string
      const bodyData = {
        ...data,
        seatingChartStructure:
          typeof data.seatingChartStructure === 'string'
            ? data.seatingChartStructure
            : JSON.stringify(data.seatingChartStructure)
      }

      return serviceSeatManagementApi.updateSeatingChart(bodyData)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: seatKeys.list(variables.eventCode) })
      queryClient.invalidateQueries({ queryKey: seatKeys.detail(variables.id) })

      const validation = validateSeatCapacity(variables.seatingChartStructure, capacity)

      toast.success('Cập nhật sơ đồ chỗ ngồi thành công!', {
        description: `Đã cập nhật ${validation.totalSeats} ghế / ${capacity} sức chứa`
      })
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message || error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sơ đồ chỗ ngồi'
      toast.error(errorMessage)
    }
  })
}

/**
 * Hook để xóa seating chart
 */
export const useDeleteSeatingChart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => serviceSeatManagementApi.deleteSeatingChart(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: seatKeys.lists() })
      toast.success(response?.data?.message || 'Xóa sơ đồ chỗ ngồi thành công!')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa sơ đồ chỗ ngồi'
      toast.error(errorMessage)
    }
  })
}

/**
 * Hook tổng hợp để quản lý seating chart
 */
export const useSeatManagement = (eventCode: string) => {
  const { data: eventData, isLoading: isLoadingEvent } = useEventCapacity(eventCode)
  const { data: tickets, isLoading: isLoadingTickets } = useEventTickets(eventCode)
  const createMutation = useCreateSeatingChart(eventCode)
  const updateMutation = useUpdateSeatingChart(eventCode)
  const deleteMutation = useDeleteSeatingChart()

  const capacity = eventData?.data?.capacity || 0

  return {
    // Event data
    event: eventData?.data,
    capacity,
    isLoadingEvent,

    // Tickets data
    tickets: tickets || [],
    isLoadingTickets,

    // Mutations
    createSeatingChart: createMutation.mutate,
    updateSeatingChart: updateMutation.mutate,
    deleteSeatingChart: deleteMutation.mutate,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Utility
    validateCapacity: (seatingChartStructure: string | object) => validateSeatCapacity(seatingChartStructure, capacity)
  }
}

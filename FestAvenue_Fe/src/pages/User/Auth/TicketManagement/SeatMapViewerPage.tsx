/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import SeatMapViewer from '@/components/custom/EditorSeat/SeatMapViewer'
import { useExistingStructure, useEventCapacity } from './hooks/useSeatManagement'
import { getAccessTokenFromLS } from '@/utils/auth'
import configBase from '@/constants/config'
import { toast } from 'sonner'
import { useUsersStore } from '@/contexts/app.context'
import { getIdFromNameId } from '@/utils/utils'
import type { SeatMapData } from '@/types/seat.types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import serviceTicketManagementApi from '@/apis/serviceTicketManagement.api'
import paymentApis from '@/apis/payment.api'
import type { TicketForSeat, UnlockSeatEvent, UnlockSeatResult } from '@/types/payment.types'
import { PaymentStatus } from '@/types/payment.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import VietQRBanking from '@/components/custom/QR/QRSection'
import { Clock, ShoppingCart, X, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react'
import path from '@/constants/path'

interface SeatLockEvent {
  chartId: string
  seatIndex: string
  email: string
  isSeatLock: boolean
}

// interface ScanSeatEvent {
//   eventCode: string
//   seatIndex: string
//   email: string
// }

interface SeatScannedBroadcast {
  EventCode: string
  SeatIndex: string
  Email: string
  Status: string
}

export default function SeatMapViewerPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const eventParams = useParams()
  const eventCode = getIdFromNameId(eventParams.eventCode as string)
  const userProfile = useUsersStore((state) => state.isProfile)

  const { data: structure, isLoading: isLoadingStructure, error } = useExistingStructure(eventCode)
  const { data: eventData } = useEventCapacity(eventCode)

  // Fetch seat map data to get ticketsForSeats info
  const { data: seatMapData, refetch: refetchSeatMap } = useQuery({
    queryKey: ['seatMap', eventCode],
    queryFn: () => serviceTicketManagementApi.getSeatMapByEventCode(eventCode),
    enabled: !!eventCode
    // SignalR handles real-time updates, no need for polling
  })

  const [isConnected, setIsConnected] = useState(false)
  const [seatStatuses, setSeatStatuses] = useState<Map<string, 'available' | 'occupied' | 'locked'>>(new Map())
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set())
  const [ticketsForSeats, setTicketsForSeats] = useState<TicketForSeat[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [seatCountdowns, setSeatCountdowns] = useState<Map<string, number>>(new Map())

  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const seatUnlockTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Parse ticketsForSeats from API
  useEffect(() => {
    console.log('ticketsForSeats from API:', seatMapData?.data?.ticketsForSeats)

    if (seatMapData?.data?.ticketsForSeats) {
      try {
        // ticketsForSeats is already an array, map to TicketForSeat format
        const mapped: any[] = seatMapData.data.ticketsForSeats.map((ticket) => ({
          seatIndex: ticket.seatIndex,
          email: ticket.email,
          expirationTime: ticket.expirationTime,
          paymentInitiatedTime: ticket.paymentInitiatedTime,
          ticketId: ticket.ticketId,
          price: ticket.seatPrice,
          seatPrice: ticket.seatPrice,
          isLocked: ticket.isSeatLock,
          isSeatLock: ticket.isSeatLock,
          isPayment: ticket.isPayment
        }))

        console.log('Mapped ticketsForSeats:', mapped)
        setTicketsForSeats(mapped)

        // Update seat statuses based on ticketsForSeats
        const newStatuses = new Map<string, 'available' | 'occupied' | 'locked'>()
        mapped.forEach((ticket) => {
          if (ticket.isLocked && ticket.email) {
            newStatuses.set(ticket.seatIndex, 'locked')
          }
        })
        setSeatStatuses(newStatuses)

        // Auto-add user's reserved seats (blue - locked but not paid) to selectedSeats
        const userReservedSeats = mapped.filter(
          (ticket) => ticket.isLocked && !ticket.isPayment && ticket.email === userProfile?.email
        )
        if (userReservedSeats.length > 0) {
          setSelectedSeats(new Set(userReservedSeats.map((t) => t.seatIndex)))
        }
      } catch (error) {
        console.error('Error processing ticketsForSeats:', error)
        setTicketsForSeats([])
      }
    }
  }, [seatMapData, userProfile?.email])

  // Auto-unlock seats when 15 minutes timer expires
  useEffect(() => {
    // Clear old timers
    seatUnlockTimersRef.current.forEach((timer) => clearTimeout(timer))
    seatUnlockTimersRef.current.clear()

    // Create new timers for locked seats with paymentInitiatedTime
    ticketsForSeats.forEach((ticket) => {
      if (ticket.isLocked && !ticket.isPayment && ticket.paymentInitiatedTime) {
        const initiatedTime = new Date(ticket.paymentInitiatedTime).getTime()
        const currentTime = Date.now()
        const elapsed = currentTime - initiatedTime
        const fifteenMinutes = 15 * 60 * 1000 // 15 minutes in ms
        const timeLeft = fifteenMinutes - elapsed

        console.log(`Seat ${ticket.seatIndex} - Time left: ${timeLeft}ms (${Math.round(timeLeft / 1000)}s)`)

        if (timeLeft > 0) {
          // Set timer to unlock seat after timeLeft
          const timer = setTimeout(() => {
            console.log(`Auto-unlocking seat ${ticket.seatIndex} after 15 minutes`)
            autoUnlockSeat(ticket.seatIndex)
          }, timeLeft)

          seatUnlockTimersRef.current.set(ticket.seatIndex, timer)
        } else {
          // Time already expired, unlock immediately
          console.log(`Seat ${ticket.seatIndex} already expired, unlocking now`)
          autoUnlockSeat(ticket.seatIndex)
        }
      }
    })

    // Update countdown display every second
    const countdownInterval = setInterval(() => {
      const newCountdowns = new Map<string, number>()
      ticketsForSeats.forEach((ticket) => {
        if (ticket.isLocked && !ticket.isPayment && ticket.paymentInitiatedTime) {
          const initiatedTime = new Date(ticket.paymentInitiatedTime).getTime()
          const currentTime = Date.now()
          const elapsed = currentTime - initiatedTime
          const fifteenMinutes = 15 * 60 * 1000
          const timeLeft = fifteenMinutes - elapsed

          if (timeLeft > 0) {
            newCountdowns.set(ticket.seatIndex, timeLeft)
          }
        }
      })
      setSeatCountdowns(newCountdowns)
    }, 1000)

    return () => {
      clearInterval(countdownInterval)
      seatUnlockTimersRef.current.forEach((timer) => clearTimeout(timer))
      seatUnlockTimersRef.current.clear()
    }
  }, [ticketsForSeats])

  // Auto-unlock seat when timer expires
  const autoUnlockSeat = async (seatId: string) => {
    const currentConnection = connectionRef.current

    if (!currentConnection || currentConnection.state !== 'Connected') {
      console.warn('Cannot auto-unlock seat: SignalR not connected')
      return
    }

    try {
      const unlockEvent: UnlockSeatEvent = {
        eventCode: eventCode,
        seatIndex: seatId,
        email: undefined // undefined để loại bỏ
      }

      await currentConnection.invoke('UnlockSeat', unlockEvent)
      console.log(`Successfully auto-unlocked seat ${seatId}`)
      toast.info(`Ghế ${seatId} đã hết thời gian giữ và được mở khóa`)
      refetchSeatMap()
    } catch (error: any) {
      console.error('Error auto-unlocking seat:', error)
    }
  }

  // Initialize SignalR connection
  useEffect(() => {
    if (!eventCode || !structure) return

    const initConnection = async () => {
      try {
        const token = getAccessTokenFromLS()
        if (!token) {
          toast.error('Vui lòng đăng nhập để xem sơ đồ chỗ ngồi')
          return
        }

        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${configBase.socketURLSeatingChart}/seatingcharthub`, {
            accessTokenFactory: () => token
          })
          .configureLogging(signalR.LogLevel.Information)
          .withAutomaticReconnect()
          .build()

        // Handle SeatLocked event (broadcast from server to all clients in group)
        newConnection.on('SeatLocked', (response: SeatLockEvent) => {
          console.log('SeatLocked event received:', response)

          setSeatStatuses((prev) => {
            const newMap = new Map(prev)
            newMap.set(response.seatIndex, response.isSeatLock ? 'locked' : 'available')
            return newMap
          })

          // Refetch seat map to get updated data
          refetchSeatMap()

          if (response.email === userProfile?.email) {
            toast.success(response.isSeatLock ? 'Đã khóa ghế thành công' : 'Đã mở khóa ghế')
          } else {
            toast.info(`Ghế ${response.seatIndex} đã được ${response.isSeatLock ? 'khóa' : 'mở khóa'} bởi người khác`)
          }
        })

        // Handle LockSeatResult (direct response to caller)
        newConnection.on('LockSeatResult', (result: any) => {
          console.log('LockSeatResult received:', result)

          if (!result) {
            toast.error('Không nhận được phản hồi từ server')
            return
          }

          const statusCode = result.StatusCode || result.statusCode
          const message = result.Message || result.message

          if (statusCode !== 200) {
            toast.error(message || 'Không thể khóa ghế')
            console.error('Lock seat failed:', { statusCode, message })
          }
        })

        // Handle UnlockSeatResult (direct response to unlock)
        newConnection.on('UnlockSeatResult', (result: UnlockSeatResult) => {
          console.log('UnlockSeatResult received:', result)

          if (!result) {
            toast.error('Không nhận được phản hồi từ server')
            return
          }

          if (result.StatusCode !== 200) {
            toast.error(result.Message || 'Không thể mở khóa ghế')
            console.error('Unlock seat failed:', result)
          } else {
            refetchSeatMap()
          }
        })

        // Handle ScanSeat events
        newConnection.on('ScanSeatResult', (result: any) => {
          console.log('ScanSeatResult received:', result)

          if (!result) {
            toast.error('Không nhận được phản hồi từ server')
            return
          }

          const statusCode = result.StatusCode || result.statusCode
          const message = result.Message || result.message

          if (statusCode !== 200) {
            toast.error(message || 'Không thể quét ghế')
          } else {
            toast.success('Quét ghế thành công')
          }
        })

        newConnection.on('SeatScanned', (response: SeatScannedBroadcast) => {
          console.log('SeatScanned event received:', response)
          refetchSeatMap()
        })

        // Handle UserJoined event
        newConnection.on('UserJoined', (response: { ChartId: string; UserConnectionId: string }) => {
          console.log('User joined:', response)
        })

        // Connection state handlers
        newConnection.onclose(() => {
          setIsConnected(false)
          console.log('SignalR connection closed')
          toast.warning('Mất kết nối đến máy chủ')
        })

        newConnection.onreconnecting(() => {
          setIsConnected(false)
          console.log('SignalR reconnecting...')
          toast.info('Đang kết nối lại...')
        })

        newConnection.onreconnected(async () => {
          setIsConnected(true)
          console.log('SignalR reconnected')
          toast.success('Đã kết nối lại thành công')

          try {
            await newConnection.invoke('JoinSeatingChartGroup', eventCode)
          } catch (error) {
            console.error('Error rejoining group after reconnect:', error)
          }
        })

        // Start connection
        await newConnection.start()
        setIsConnected(true)
        connectionRef.current = newConnection

        console.log('SignalR connected successfully')

        // Join seating chart group
        await newConnection.invoke('JoinSeatingChartGroup', eventCode)
        console.log('Joined seating chart group:', eventCode)

        toast.success('Đã kết nối đến sơ đồ chỗ ngồi')
      } catch (error) {
        console.error('SignalR connection error:', error)
        toast.error('Không thể kết nối đến máy chủ')
        setIsConnected(false)
      }
    }

    initConnection()

    // Cleanup on unmount
    return () => {
      const conn = connectionRef.current
      if (conn) {
        conn
          .invoke('LeaveSeatingChartGroup', eventCode)
          .then(() => {
            console.log('Left seating chart group:', eventCode)
          })
          .catch((error) => {
            console.error('Error leaving group:', error)
          })
          .finally(() => {
            conn.stop()
            console.log('SignalR connection stopped')
          })
      }
      stopCountdown()
    }
  }, [eventCode, structure, userProfile?.email, refetchSeatMap])

  // Handle seat click - add to selection instead of locking immediately
  const handleSeatClick = (seatId: string, status: 'available' | 'occupied') => {
    if (!userProfile?.email) {
      toast.error('Vui lòng đăng nhập để chọn ghế')
      return
    }
    console.log(status)

    // Check if seat is locked by current user, allow unlock
    const seatInfo = ticketsForSeats.find((t) => t.seatIndex === seatId)
    if (seatInfo && seatInfo.isLocked && seatInfo.email === userProfile.email) {
      handleUnlockSeat(seatId)
      return
    }

    // Toggle seat selection
    setSelectedSeats((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(seatId)) {
        newSet.delete(seatId)
      } else {
        newSet.add(seatId)
      }
      return newSet
    })
  }

  // Unlock seat for current user
  const handleUnlockSeat = async (seatId: string) => {
    const currentConnection = connectionRef.current

    if (!currentConnection || currentConnection.state !== 'Connected') {
      toast.error('Chưa kết nối đến máy chủ')
      return
    }

    try {
      const unlockEvent: UnlockSeatEvent = {
        eventCode: eventCode,
        seatIndex: seatId,
        email: undefined // undefined để loại bỏ
      }

      await currentConnection.invoke('UnlockSeat', unlockEvent)
      toast.success('Đã hủy ghế thành công')
      refetchSeatMap()
    } catch (error: any) {
      console.error('Error unlocking seat:', error)
      toast.error(error?.message || 'Không thể hủy ghế')
    }
  }

  // Calculate total price for selected seats
  const calculateTotalPrice = () => {
    let total = 0
    selectedSeats.forEach((seatId) => {
      const ticket = ticketsForSeats.find((t) => t.seatIndex === seatId)
      if (ticket?.price) {
        total += ticket.price
      }
    })
    return total
  }

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: paymentApis.createEventSeatPayment,
    onSuccess: async (data) => {
      if (data?.data) {
        const { code, paymentId, expirationTime } = data.data

        setPaymentId(paymentId)
        setQrCode(code)
        setPaymentAmount(calculateTotalPrice())

        // Calculate timeout from expirationTime
        const expTime = new Date(expirationTime).getTime()
        const currentTime = Date.now()
        const calculatedTimeRemaining = expTime - currentTime

        if (calculatedTimeRemaining > 0) {
          setTimeRemaining(calculatedTimeRemaining)
          startCountdown(calculatedTimeRemaining)
          toast.success('Tạo thanh toán thành công! Vui lòng quét mã QR để thanh toán.')

          // Lock seats via SignalR
          const currentConnection = connectionRef.current
          if (currentConnection && currentConnection.state === 'Connected') {
            for (const seatId of selectedSeats) {
              try {
                await currentConnection.invoke('LockSeat', {
                  eventCode: eventCode,
                  seatIndex: seatId,
                  email: userProfile?.email,
                  isSeatLock: true
                })
              } catch (error) {
                console.error('Error locking seat via SignalR:', error)
              }
            }
          }

          // Clear selected seats
          setSelectedSeats(new Set())
          setShowPaymentModal(true)
        } else {
          toast.error('Mã QR đã hết hạn')
        }
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Không thể tạo thanh toán')
    }
  })

  const handleCreatePayment = () => {
    if (selectedSeats.size === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế')
      return
    }

    const seatIndexes = Array.from(selectedSeats)
    createPaymentMutation.mutate({
      eventCode: eventCode,
      seatIndexes: seatIndexes
    })
  }

  // Countdown timer
  const startCountdown = (initialTime: number) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }

    const startTime = Date.now()
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = initialTime - elapsed

      if (remaining <= 0) {
        setTimeRemaining(0)
        stopCountdown()
        toast.error('Hết thời gian thanh toán!')
        handlePaymentTimeout()
      } else {
        setTimeRemaining(remaining)
      }
    }, 1000)
  }

  const stopCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }

  const handlePaymentTimeout = () => {
    // Auto-unlock seats when payment times out
    setShowPaymentModal(false)
    setQrCode(null)
    setPaymentId(null)
    refetchSeatMap()
  }

  // Manual check payment status
  const handleCheckPaymentStatus = async () => {
    if (!paymentId) {
      toast.error('Không tìm thấy mã thanh toán')
      return
    }

    setIsCheckingStatus(true)
    try {
      const response = await paymentApis.getStatusPaymentByPaymentId(paymentId)

      // Debug: Log response structure
      console.log('Payment status response:', response)
      console.log('response.data:', response?.data)
      console.log('response.data.data:', response?.data?.data)

      // Try different possible paths for status
      const status = response?.data?.data ?? response?.data

      console.log('Extracted status:', status)
      console.log('PaymentStatus.Completed:', PaymentStatus.Completed)
      console.log('Status comparison:', status === PaymentStatus.Completed, status === 1, Number(status) === 1)

      // Convert to number for comparison (in case API returns string)
      const statusNumber = typeof status === 'string' ? parseInt(status, 10) : status

      if (statusNumber === PaymentStatus.Completed) {
        handlePaymentSuccess()
      } else if (statusNumber === PaymentStatus.Failed || statusNumber === PaymentStatus.Cancelled) {
        toast.error('Thanh toán thất bại')
      } else if (statusNumber === PaymentStatus.Pending) {
        toast.info('Thanh toán đang chờ xử lý. Vui lòng kiểm tra lại sau.')
      } else {
        toast.warning(`Trạng thái thanh toán không xác định: ${status} (type: ${typeof status})`)
      }
    } catch (error: any) {
      console.error('Error checking payment status:', error)
      toast.error(error?.message || 'Không thể kiểm tra trạng thái thanh toán')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handlePaymentSuccess = () => {
    stopCountdown()
    toast.success('Thanh toán thành công!')
    setShowPaymentModal(false)
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['seatMap', eventCode] })
      navigate(path.user.my.payment)
    }, 2000)
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Get countdown for a specific seat (15 minutes from paymentInitiatedTime)
  const getSeatCountdown = (seatId: string): number | null => {
    // Use seatCountdowns map for real-time countdown
    return seatCountdowns.get(seatId) || null
  }

  // Loading state
  if (isLoadingStructure) {
    return (
      <div className='flex items-center justify-center h-screen bg-white'>
        <div className='text-center'>
          <div className='animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4' />
          <p className='text-lg text-gray-800'>Đang tải sơ đồ chỗ ngồi...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='flex items-center justify-center h-screen bg-white'>
        <div className='text-center'>
          <p className='text-lg text-red-600 mb-4'>Không thể tải sơ đồ chỗ ngồi</p>
          <p className='text-sm text-gray-600'>{String(error)}</p>
        </div>
      </div>
    )
  }

  // No structure found
  if (!structure) {
    return (
      <div className='flex items-center justify-center h-screen bg-white'>
        <div className='text-center'>
          <p className='text-lg text-yellow-600 mb-4'>Chưa có sơ đồ chỗ ngồi</p>
          <p className='text-sm text-gray-600'>
            Sự kiện &quot;{eventData?.data?.eventName || eventCode}&quot; chưa được tạo sơ đồ chỗ ngồi
          </p>
        </div>
      </div>
    )
  }

  // Transform structure to match SeatMapData interface
  const mapData: SeatMapData = structure as SeatMapData

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' onClick={() => navigate(-1)}>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Quay lại
              </Button>
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent'>
                  {eventData?.data?.eventName || 'Sơ đồ chỗ ngồi'}
                </h1>
                <p className='text-sm text-gray-600'>Chọn ghế và thanh toán</p>
              </div>
            </div>

            {/* Connection status */}
            <div
              className={`px-4 py-2 rounded-lg ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isConnected ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
            </div>
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div className='w-full mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 xl:grid-cols-4 gap-6'>
          {/* Seat Map Viewer */}
          <div className='xl:col-span-3 h-[calc(100vh-12rem)]'>
            <SeatMapViewer
              mapData={mapData}
              initialSeatStatuses={seatStatuses}
              onSeatStatusChange={handleSeatClick}
              readonly={false}
              showControls={false}
              ticketsForSeats={ticketsForSeats}
              userEmail={userProfile?.email}
            />
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Selected Seats */}
            <Card className='border-cyan-200'>
              <CardHeader className='bg-gradient-to-r from-cyan-50 to-blue-50'>
                <CardTitle className='flex items-center gap-2'>
                  <ShoppingCart className='w-5 h-5 text-cyan-600' />
                  Ghế đã chọn ({selectedSeats.size})
                </CardTitle>
              </CardHeader>
              <CardContent className='pt-4'>
                {selectedSeats.size === 0 ? (
                  <p className='text-center text-gray-500 py-4'>Chưa chọn ghế nào</p>
                ) : (
                  <>
                    <div className='space-y-2 max-h-60 overflow-y-auto mb-4'>
                      {Array.from(selectedSeats).map((seatId) => {
                        const ticket = ticketsForSeats.find((t) => t.seatIndex === seatId)
                        return (
                          <div key={seatId} className='flex items-center justify-between p-2 bg-cyan-50 rounded'>
                            <span className='font-medium text-sm'>{seatId}</span>
                            <div className='flex items-center gap-2'>
                              <span className='text-cyan-600 font-semibold'>{formatCurrency(ticket?.price || 0)}</span>
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => {
                                  setSelectedSeats((prev) => {
                                    const newSet = new Set(prev)
                                    newSet.delete(seatId)
                                    return newSet
                                  })
                                }}
                              >
                                <X className='w-4 h-4' />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className='border-t pt-4 mb-4'>
                      <div className='flex items-center justify-between'>
                        <span className='text-lg font-semibold'>Tổng cộng:</span>
                        <span className='text-2xl font-bold text-cyan-600'>
                          {formatCurrency(calculateTotalPrice())}
                        </span>
                      </div>
                    </div>

                    <Button
                      className='w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                      onClick={handleCreatePayment}
                      disabled={createPaymentMutation.isPending}
                    >
                      {createPaymentMutation.isPending ? (
                        <>
                          <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className='w-4 h-4 mr-2' />
                          Thanh toán ngay
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className='border-cyan-200'>
              <CardHeader className='bg-gradient-to-r from-cyan-50 to-blue-50'>
                <CardTitle className='text-sm'>Chú thích</CardTitle>
              </CardHeader>
              <CardContent className='pt-4'>
                <div className='space-y-3 text-sm'>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 rounded-full bg-green-500'></div>
                    <span>Ghế trống</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 rounded-full bg-blue-500'></div>
                    <span>Ghế của bạn (chờ thanh toán)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 rounded-full bg-purple-500'></div>
                    <span>Ghế bạn đã mua</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 rounded-full bg-red-500'></div>
                    <span>Ghế người khác giữ</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 rounded-full bg-gray-400'></div>
                    <span>Ghế đã bán</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 rounded-full bg-orange-500'></div>
                    <span>Ghế đang được chủ sự kiện xử lí</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User's reserved seats (locked but not paid - BLUE) */}
            {ticketsForSeats.filter((t) => t.isLocked && !t.isPayment && t.email === userProfile?.email).length > 0 && (
              <Card className='border-blue-200'>
                <CardHeader className='bg-gradient-to-r from-blue-50 to-cyan-50'>
                  <CardTitle className='text-sm flex items-center gap-2'>
                    <Clock className='w-4 h-4 text-blue-600' />
                    Ghế đang giữ của bạn
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-4'>
                  <div className='space-y-2'>
                    {ticketsForSeats
                      .filter((t) => t.isLocked && !t.isPayment && t.email === userProfile?.email)
                      .map((ticket) => {
                        const countdown = getSeatCountdown(ticket.seatIndex)
                        return (
                          <div
                            key={ticket.seatIndex}
                            className='flex items-center justify-between p-2 bg-blue-50 rounded'
                          >
                            <div className='flex-1'>
                              <div className='flex items-center justify-between'>
                                <span className='font-medium text-sm'>{ticket.seatIndex}</span>
                                <span className='text-blue-600 font-semibold text-sm'>
                                  {formatCurrency(ticket.price || 0)}
                                </span>
                              </div>
                              {countdown && (
                                <span className='text-blue-600 text-xs font-mono block mt-1'>
                                  ⏱ {formatTime(countdown)}
                                </span>
                              )}
                            </div>
                            <Button
                              size='sm'
                              variant='outline'
                              className='text-xs ml-2'
                              onClick={() => handleUnlockSeat(ticket.seatIndex)}
                            >
                              Hủy
                            </Button>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* User's purchased seats (paid - PURPLE) */}
            {ticketsForSeats.filter((t) => t.isPayment && t.email === userProfile?.email).length > 0 && (
              <Card className='border-purple-200'>
                <CardHeader className='bg-gradient-to-r from-purple-50 to-pink-50'>
                  <CardTitle className='text-sm flex items-center gap-2'>
                    <CheckCircle2 className='w-4 h-4 text-purple-600' />
                    Ghế đã mua
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-4'>
                  <div className='space-y-2'>
                    {ticketsForSeats
                      .filter((t) => t.isPayment && t.email === userProfile?.email)
                      .map((ticket) => (
                        <div
                          key={ticket.seatIndex}
                          className='flex items-center justify-between p-2 bg-purple-50 rounded'
                        >
                          <span className='font-medium text-sm'>{ticket.seatIndex}</span>
                          <span className='text-purple-600 font-semibold text-sm'>
                            {formatCurrency(ticket.price || 0)}
                          </span>
                        </div>
                      ))}
                  </div>
                  <Alert className='bg-green-50 border-green-200 mt-4'>
                    <AlertDescription className='text-xs text-green-800'>
                      ✅ Ghế đã được thanh toán thành công. Vui lòng giữ vé để check-in tại sự kiện.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && qrCode && (
        <div className='fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4'>
          <Card className='max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <CardHeader className='bg-gradient-to-r from-cyan-50 to-blue-50'>
              <div className='flex items-center justify-between'>
                <CardTitle>Thanh toán đặt ghế</CardTitle>
                <Button variant='ghost' size='sm' onClick={() => setShowPaymentModal(false)}>
                  <X className='w-5 h-5' />
                </Button>
              </div>
            </CardHeader>
            <CardContent className='pt-6'>
              {/* Timer */}
              <div className='mb-6 flex items-center justify-center gap-4 bg-white px-6 py-4 rounded-xl border-2 border-cyan-200 shadow'>
                <Clock className='w-6 h-6 text-cyan-600' />
                <div>
                  <p className='text-sm text-gray-600'>Thời gian còn lại</p>
                  <p className='text-2xl font-bold text-cyan-600'>{formatTime(timeRemaining)}</p>
                </div>
              </div>

              {/* Payment Info & QR */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Payment Info */}
                <div className='space-y-4'>
                  <h3 className='font-semibold text-lg mb-4'>Thông tin thanh toán</h3>

                  <div className='space-y-3'>
                    <div className='flex justify-between items-center py-2 border-b'>
                      <span className='text-gray-600'>Số tiền:</span>
                      <span className='font-bold text-xl text-cyan-600'>{formatCurrency(paymentAmount)}</span>
                    </div>

                    <div className='flex justify-between items-center py-2 border-b'>
                      <span className='text-gray-600'>Mã giao dịch:</span>
                      <span className='font-mono text-sm bg-gray-100 px-2 py-1 rounded'>
                        {paymentId?.slice(0, 12)}...
                      </span>
                    </div>
                  </div>

                  <Alert className='bg-blue-50 border-blue-200 mt-4'>
                    <AlertDescription className='text-sm text-blue-800'>
                      <p className='font-semibold mb-2'>Hướng dẫn thanh toán:</p>
                      <ol className='list-decimal list-inside space-y-1 text-xs'>
                        <li>Mở ứng dụng ngân hàng của bạn</li>
                        <li>Quét mã QR bên cạnh</li>
                        <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                        <li>Đợi hệ thống xác nhận (tự động)</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  {/* Check Payment Status Button */}
                  <div className='space-y-3 mt-6'>
                    <Button
                      className='w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-6'
                      onClick={handleCheckPaymentStatus}
                      disabled={isCheckingStatus}
                    >
                      {isCheckingStatus ? (
                        <>
                          <RefreshCw className='w-5 h-5 mr-2 animate-spin' />
                          Đang kiểm tra...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className='w-5 h-5 mr-2' />
                          Kiểm tra trạng thái thanh toán
                        </>
                      )}
                    </Button>
                    <p className='text-xs text-center text-gray-500'>
                      Sau khi chuyển khoản thành công, bấm nút trên để kiểm tra
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className='flex items-center justify-center'>
                  <VietQRBanking amount={paymentAmount} content={qrCode} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

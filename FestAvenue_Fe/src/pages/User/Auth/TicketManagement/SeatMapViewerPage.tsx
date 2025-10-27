/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import SeatMapViewer from '@/components/custom/EditorSeat/SeatMapViewer'
import { useExistingStructure, useEventCapacity } from './hooks/useSeatManagement'
import { getAccessTokenFromLS } from '@/utils/auth'
import configBase from '@/constants/config'
import { toast } from 'sonner'
import { useUsersStore } from '@/contexts/app.context'
import { getIdFromNameId } from '@/utils/utils'
import type { SeatMapData } from '@/types/seat.types'

interface SeatLockEvent {
  chartId: string
  seatIndex: string
  email: string
  isSeatLock: boolean
}

export default function SeatMapViewerPage() {
  const eventParams = useParams()
  const eventCode = getIdFromNameId(eventParams.eventCode as string)
  const userProfile = useUsersStore((state) => state.isProfile)

  const { data: structure, isLoading: isLoadingStructure, error } = useExistingStructure(eventCode)
  const { data: eventData } = useEventCapacity(eventCode)

  const [isConnected, setIsConnected] = useState(false)
  const [seatStatuses, setSeatStatuses] = useState<Map<string, 'available' | 'occupied' | 'locked'>>(new Map())
  const connectionRef = useRef<signalR.HubConnection | null>(null)

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

          // Backend returns full seatIndex (e.g., 'imported-section-1761501557268-0-R1-S1')
          setSeatStatuses((prev) => {
            const newMap = new Map(prev)
            newMap.set(response.seatIndex, response.isSeatLock ? 'locked' : 'available')
            return newMap
          })

          // Show toast notification
          if (response.email === userProfile?.email) {
            toast.success(response.isSeatLock ? 'Đã khóa ghế thành công' : 'Đã mở khóa ghế')
          } else {
            toast.info(`Ghế ${response.seatIndex} đã được ${response.isSeatLock ? 'khóa' : 'mở khóa'} bởi người khác`)
          }
        })

        // Handle LockSeatResult (direct response to caller)
        newConnection.on('LockSeatResult', (result: any) => {
          console.log('LockSeatResult received:', JSON.stringify(result, null, 2))
          console.log('Result type:', typeof result)
          console.log('Result keys:', result ? Object.keys(result) : 'null/undefined')

          if (!result) {
            toast.error('Không nhận được phản hồi từ server')
            return
          }

          // Check both PascalCase and camelCase
          const statusCode = result.StatusCode || result.statusCode
          const message = result.Message || result.message

          if (statusCode !== 200) {
            toast.error(message || 'Không thể khóa ghế')
            console.error('Lock seat failed:', { statusCode, message })
          } else {
            toast.success('Đã khóa ghế thành công')
          }
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

          // Rejoin the seating chart group after reconnection
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
    }
  }, [eventCode, structure, userProfile?.email])

  // Handle seat status change (lock/unlock)
  const handleSeatStatusChange = async (seatId: string, status: 'available' | 'occupied') => {
    const currentConnection = connectionRef.current

    if (!currentConnection || currentConnection.state !== 'Connected') {
      toast.error('Chưa kết nối đến máy chủ')
      console.log('Connection state:', currentConnection?.state)
      return
    }

    if (!userProfile?.email) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này')
      return
    }

    try {
      console.log('Locking seat:', {
        seatId,
        status,
        eventCode,
        email: userProfile.email
      })

      // Send LockSeat event to server (use full seatId as seatIndex)
      await currentConnection.invoke('LockSeat', {
        eventCode: eventCode,
        seatIndex: seatId,
        email: userProfile.email
      })

      // Optimistic update
      setSeatStatuses((prev) => {
        const newMap = new Map(prev)
        newMap.set(seatId, status === 'occupied' ? 'locked' : 'available')
        return newMap
      })
    } catch (error: any) {
      console.error('Error locking seat:', error)
      toast.error(error?.message || 'Không thể khóa ghế')
    }
  }

  // Loading state
  if (isLoadingStructure) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-900'>
        <div className='text-center'>
          <div className='animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4' />
          <p className='text-lg text-white'>Đang tải sơ đồ chỗ ngồi...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-900'>
        <div className='text-center'>
          <p className='text-lg text-red-400 mb-4'>Không thể tải sơ đồ chỗ ngồi</p>
          <p className='text-sm text-gray-400'>{String(error)}</p>
        </div>
      </div>
    )
  }

  // No structure found
  if (!structure) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-900'>
        <div className='text-center'>
          <p className='text-lg text-yellow-400 mb-4'>Chưa có sơ đồ chỗ ngồi</p>
          <p className='text-sm text-gray-400'>
            Sự kiện &quot;{eventData?.data?.eventName || eventCode}&quot; chưa được tạo sơ đồ chỗ ngồi
          </p>
        </div>
      </div>
    )
  }

  // Transform structure to match SeatMapData interface if needed
  const mapData: SeatMapData = structure as SeatMapData

  return (
    <div className='w-full h-screen bg-gray-950'>
      <SeatMapViewer
        mapData={mapData}
        initialSeatStatuses={seatStatuses}
        onSeatStatusChange={handleSeatStatusChange}
        readonly={false}
        showControls={true}
      />

      {/* Connection status indicator */}
      <div className='fixed bottom-4 right-4 z-50'>
        <div
          className={`px-4 py-2 rounded-lg shadow-lg ${
            isConnected ? 'bg-green-500/90' : 'bg-red-500/90'
          } text-white text-sm font-medium`}
        >
          {isConnected ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
        </div>
      </div>
    </div>
  )
}

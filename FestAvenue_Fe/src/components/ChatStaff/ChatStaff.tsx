import { useState, useEffect } from 'react'
import { Headphones, Loader2 } from 'lucide-react'
import { useUsersStore } from '@/contexts/app.context'
import chatApi from '@/apis/chat.api'
import { toast } from 'sonner'

export default function ChatStaff() {
  const userProfile = useUsersStore().isProfile
  const [isConnecting, setIsConnecting] = useState(false)
  const [hasConnected, setHasConnected] = useState(false)

  // Check localStorage on mount to see if already connected
  useEffect(() => {
    if (userProfile?.id) {
      const connectedKey = `staff_support_connected_${userProfile.id}`
      const connected = localStorage.getItem(connectedKey)
      if (connected) {
        setHasConnected(true)
      }
    }
  }, [userProfile?.id])

  const handleConnectStaff = async () => {
    if (!userProfile?.id || isConnecting) return

    setIsConnecting(true)
    try {
      const response = await chatApi.GroupChat.addGroupSupport(userProfile.id)
      if (response?.data) {
        // Mark as connected in localStorage
        const connectedKey = `staff_support_connected_${userProfile.id}`
        localStorage.setItem(connectedKey, 'true')
        setHasConnected(true)
        toast.success('Đã kết nối với hỗ trợ! Kiểm tra tin nhắn trong Chat.')
      }
    } catch (error) {
      console.error('Error connecting to staff:', error)
      toast.error('Không thể kết nối với hỗ trợ')
    } finally {
      setIsConnecting(false)
    }
  }

  // Don't render if already connected
  if (hasConnected) {
    return null
  }

  return (
    <div className='fixed bottom-24 right-6 z-50'>
      <button
        onClick={handleConnectStaff}
        disabled={isConnecting}
        className='relative bg-gradient-to-r from-teal-400 to-cyan-300 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 p-4 border-2 border-white hover:scale-110 disabled:opacity-70 disabled:hover:scale-100'
        title='Liên hệ hỗ trợ'
      >
        {isConnecting ? <Loader2 className='w-6 h-6 animate-spin' /> : <Headphones className='w-6 h-6' />}
        <div className='absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse' />
      </button>
    </div>
  )
}

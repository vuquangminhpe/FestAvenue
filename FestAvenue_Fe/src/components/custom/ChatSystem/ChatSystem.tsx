/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { Send, MessageCircle, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAccessTokenFromLS } from '@/utils/auth'
import { useUsersStore } from '@/contexts/app.context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Message {
  id?: string
  groupId: string
  userId: string
  message: string
  senderName: string
  avatar?: string
  sentAt: Date
  isCurrentUser?: boolean
}

interface ChatSystemProps {
  groupChatId: string
  organizationName: string
  isVisible: boolean
  onClose: () => void
  requestType: 'request_admin' | 'request_user' | 'dispute'
}

export default function ChatSystem({
  groupChatId,
  organizationName,
  isVisible,
  onClose,
  requestType
}: ChatSystemProps) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const userProfile = useUsersStore((state) => state.isProfile)

  // Get chat title based on request type
  const getChatTitle = () => {
    switch (requestType) {
      case 'request_admin':
        return `Yêu cầu admin - ${organizationName}`
      case 'request_user':
        return `Yêu cầu tham gia - ${organizationName}`
      case 'dispute':
        return `Tranh chấp tổ chức - ${organizationName}`
      default:
        return `Chat - ${organizationName}`
    }
  }

  // Get chat description based on request type
  const getChatDescription = () => {
    switch (requestType) {
      case 'request_admin':
        return 'Yêu cầu quyền admin cho tầng làm việc cùng tòa nhà'
      case 'request_user':
        return 'Yêu cầu tham gia tổ chức từ người dùng đã tạo trước'
      case 'dispute':
        return 'Tranh chấp về quyền sở hữu tổ chức'
      default:
        return 'Cuộc trò chuyện về tổ chức'
    }
  }

  // Get initial message based on request type
  const getInitialMessage = () => {
    const userName = `${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim() || 'Người dùng'

    switch (requestType) {
      case 'request_admin':
        return `Xin chào! Tôi là ${userName}. Tôi đang làm việc tại cùng tòa nhà với tổ chức "${organizationName}" và muốn yêu cầu quyền admin để quản lý tầng làm việc của tôi. Tôi có thể cung cấp bằng chứng về việc làm việc tại đây.`
      case 'request_user':
        return `Xin chào! Tôi là ${userName}. Tôi muốn tham gia vào tổ chức "${organizationName}" mà bạn đã tạo. Có thể tôi đã nhầm lẫn khi tạo tổ chức mới. Bạn có thể cho tôi tham gia được không?`
      case 'dispute':
        return `Xin chào! Tôi là ${userName}. Tôi tin rằng có vấn đề với quyền sở hữu tổ chức "${organizationName}". Tôi có thể cung cấp bằng chứng về quyền hợp pháp của mình đối với tổ chức này. Chúng ta có thể thảo luận để giải quyết vấn đề này.`
      default:
        return `Xin chào! Tôi muốn thảo luận về tổ chức "${organizationName}".`
    }
  }

  // Initialize SignalR connection
  useEffect(() => {
    if (!isVisible || !groupChatId) return

    const initConnection = async () => {
      try {
        setIsLoading(true)
        const token = getAccessTokenFromLS()

        if (!token) {
          toast.error('Vui lòng đăng nhập để sử dụng chat')
          return
        }

        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl('https://hoalacrent.io.vn/chathub', {
            accessTokenFactory: () => token
          })
          .configureLogging(signalR.LogLevel.Information)
          .build()

        // Handle incoming messages
        newConnection.on('ReceiveGroupMessage', (response: any) => {
          console.log(response)

          const newMessage: Message = {
            groupId: response.groupChatId,
            userId: response.senderId,
            message: response.message,
            senderName: response.senderName || 'Unknown',
            avatar: response.avatar,
            sentAt: new Date(),
            isCurrentUser: response.senderId === userProfile?.id
          }

          setMessages((prev) => [...prev, newMessage])
        })

        // Handle connection events
        newConnection.onclose(() => {
          setIsConnected(false)
          console.log('SignalR connection closed')
        })

        newConnection.onreconnecting(() => {
          setIsConnected(false)
          console.log('SignalR reconnecting...')
        })

        newConnection.onreconnected(() => {
          setIsConnected(true)
          console.log('SignalR reconnected')
        })

        // Start connection
        await newConnection.start()
        setIsConnected(true)
        setConnection(newConnection)

        // Send initial message
        const initialMessage = getInitialMessage()
        const messageData = {
          message: initialMessage,
          senderId: userProfile?.id || '',
          senderName: `${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim() || 'Anonymous',
          avatar: userProfile?.avatar || null,
          groupChatId: groupChatId
        }

        await newConnection.invoke('SendMessage', messageData)

        toast.success('Kết nối chat thành công')
      } catch (error) {
        console.error('SignalR connection error:', error)
        toast.error('Không thể kết nối chat')
      } finally {
        setIsLoading(false)
      }
    }

    initConnection()

    // Cleanup on unmount
    return () => {
      if (connection) {
        connection.stop()
      }
    }
  }, [isVisible, groupChatId, userProfile?.id])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const sendMessage = async () => {
    if (!connection || !messageInput.trim() || !isConnected) return

    try {
      const messageData = {
        message: messageInput.trim(),
        senderId: userProfile?.id || '',
        senderName: `${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim() || 'Anonymous',
        avatar: userProfile?.avatar || null,
        groupChatId: groupChatId
      }

      await connection.invoke('SendMessage', messageData)
      setMessageInput('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Không thể gửi tin nhắn')
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (!isVisible) return null

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl h-[600px] bg-white shadow-2xl flex flex-col'>
        {/* Header */}
        <CardHeader className='flex-shrink-0 border-b bg-gradient-to-r from-cyan-50 to-blue-50'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-gradient-to-r from-cyan-400 to-blue-300 rounded-full'>
                <MessageCircle className='w-5 h-5 text-white' />
              </div>
              <div>
                <CardTitle className='text-lg font-semibold text-slate-800'>{getChatTitle()}</CardTitle>
                <p className='text-sm text-slate-600'>{getChatDescription()}</p>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Badge variant={isConnected ? 'default' : 'destructive'} className='text-xs'>
                {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
              </Badge>
              <Button variant='ghost' size='sm' onClick={onClose} className='hover:bg-red-50 hover:text-red-600'>
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className='flex-1 p-0 overflow-hidden'>
          <ScrollArea className='h-full p-4'>
            {isLoading ? (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <div className='animate-spin w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2' />
                  <p className='text-sm text-slate-600'>Đang kết nối chat...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className='flex items-center justify-center h-full'>
                <div className='text-center'>
                  <MessageCircle className='w-12 h-12 text-slate-300 mx-auto mb-3' />
                  <p className='text-slate-500'>Đang khởi tạo cuộc trò chuyện...</p>
                  <p className='text-sm text-slate-400'>Tin nhắn đầu tiên sẽ được gửi tự động</p>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start space-x-3',
                      message.isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
                    )}
                  >
                    <Avatar className='w-8 h-8 flex-shrink-0'>
                      <AvatarImage src={message.avatar} />
                      <AvatarFallback className='bg-gradient-to-r from-cyan-400 to-blue-300 text-white text-xs'>
                        <User className='w-4 h-4' />
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn('max-w-[80%] space-y-1', message.isCurrentUser ? 'items-end' : 'items-start')}>
                      <div className='flex items-center space-x-2 text-xs text-slate-500'>
                        {!message.isCurrentUser && <span className='font-medium'>{message.senderName}</span>}
                        <span>{formatTime(message.sentAt)}</span>
                      </div>

                      <div
                        className={cn(
                          'p-3 rounded-2xl max-w-full break-words',
                          message.isCurrentUser
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white rounded-br-md'
                            : 'bg-slate-100 text-slate-800 rounded-bl-md'
                        )}
                      >
                        <p className='text-sm leading-relaxed whitespace-pre-wrap'>{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {/* Input Area */}
        <div className='flex-shrink-0 border-t bg-white p-4'>
          <div className='flex items-center space-x-3'>
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? 'Nhập tin nhắn...' : 'Đang kết nối...'}
              disabled={!isConnected || isLoading}
              className='flex-1 h-12 bg-slate-50 border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
            />
            <Button
              onClick={sendMessage}
              disabled={!messageInput.trim() || !isConnected || isLoading}
              className='h-12 px-6 bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white'
            >
              <Send className='w-4 h-4' />
            </Button>
          </div>

          <div className='flex items-center justify-center mt-2'>
            <p className='text-xs text-slate-500'>
              {isConnected ? 'Nhấn Enter để gửi tin nhắn' : 'Đang kết nối lại...'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

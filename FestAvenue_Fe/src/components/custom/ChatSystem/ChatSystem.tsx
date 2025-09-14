/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { Send, MessageCircle, X, User, Trash2, ImagePlus } from 'lucide-react'
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
import { useMutation } from '@tanstack/react-query'
import userApi from '@/apis/user.api'
import { formatTime } from '@/utils/utils'

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const userProfile = useUsersStore((state) => state.isProfile)
  const deletedGroupChatOrganizationMutation = useMutation({
    mutationFn: (groupChatId: string) => userApi.deletedGroupChatOrganization(groupChatId)
  })

  const uploadsImagesMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadsStorage(file),
    onSuccess: (data) => {
      return data
    },
    onError: (error) => {
      console.error('Upload error:', error)
      toast.error('Upload ảnh thất bại')
      setIsUploadingImage(false)
    }
  })

  const handleDeleteGroupChat = () => {
    deletedGroupChatOrganizationMutation.mutate(groupChatId, {
      onSuccess: () => {
        toast.success('Xóa group chat thành công!')
        onClose()
      },
      onError: (error: any) => {
        toast.error(error?.data?.message || 'Không thể xóa group chat')
      }
    })
  }
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

        newConnection.on('ReceiveGroupMessage', (response: any) => {
          const newMessage: Message = {
            id: response.id || `signalr-${Date.now()}-${Math.random()}`,
            groupId: response.groupChatId,
            userId: response.senderId,
            message: response.message,
            senderName: response.senderName || 'Unknown',
            avatar: response.avatar,
            sentAt: new Date(response.sentAt || new Date()),
            isCurrentUser: response.senderId === userProfile?.id
          }

          // Only add if not already exists (prevent duplicates)
          setMessages((prev) => {
            const isImageMessage =
              newMessage.message.startsWith('http') &&
              (newMessage.message.includes('.jpg') ||
                newMessage.message.includes('.png') ||
                newMessage.message.includes('.jpeg') ||
                newMessage.message.includes('.gif') ||
                newMessage.message.includes('.webp'))

            const exists = prev.some((msg) => {
              const isSameUser = msg.userId === newMessage.userId
              const isSameMessage = msg.message === newMessage.message

              // For image messages, use larger time tolerance due to upload delay
              const timeLimit = isImageMessage ? 15000 : 5000 // 15s for images, 5s for text
              const isSameTime = Math.abs(msg.sentAt.getTime() - newMessage.sentAt.getTime()) < timeLimit

              return isSameMessage && isSameUser && isSameTime
            })

            if (exists) return prev
            return [...prev, newMessage]
          })
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

    return () => {
      if (connection) {
        connection.off('ReceiveGroupMessage')
        connection.stop()
      }
    }
  }, [isVisible, groupChatId, userProfile?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const sendMessage = async () => {
    if (!connection || (!messageInput.trim() && !selectedImage) || !isConnected) return

    try {
      let imageUrl = null
      let currentAvatar = userProfile?.avatar

      if (selectedImage) {
        setIsUploadingImage(true)
        const uploadResult = await uploadsImagesMutation.mutateAsync(selectedImage)
        imageUrl = uploadResult.data || uploadResult

        if (imageUrl && !userProfile?.avatar) {
          currentAvatar = imageUrl as any
        }
      }

      const messageData = {
        message: selectedImage ? imageUrl || 'Image' : messageInput.trim(),
        senderId: userProfile?.id || '',
        senderName: `${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim() || 'Anonymous',
        avatar: currentAvatar || null,
        groupChatId: groupChatId,
        isImage: !!selectedImage
      }

      await connection.invoke('SendMessage', messageData)
      setMessageInput('')
      setSelectedImage(null)
      setImagePreview(null)
      setIsUploadingImage(false)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Gửi tin nhắn thất bại')
      setIsUploadingImage(false)
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
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
              <Button
                variant='ghost'
                size='sm'
                onClick={handleDeleteGroupChat}
                disabled={deletedGroupChatOrganizationMutation.isPending}
                className='hover:bg-red-50 hover:text-red-600'
              >
                {deletedGroupChatOrganizationMutation.isPending ? (
                  <div className='w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
                ) : (
                  <Trash2 className='w-4 h-4' />
                )}
              </Button>
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
                      <div
                        className={cn(
                          'flex items-center space-x-2 text-xs text-slate-500',
                          message.isCurrentUser ? 'justify-end' : 'justify-start'
                        )}
                      >
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
                        {message.message.startsWith('http') &&
                        (message.message.includes('.jpg') ||
                          message.message.includes('.png') ||
                          message.message.includes('.jpeg') ||
                          message.message.includes('.gif') ||
                          message.message.includes('.webp')) ? (
                          <img
                            src={message.message}
                            alt='Shared image'
                            className='max-w-full h-auto rounded-lg'
                            style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }}
                          />
                        ) : (
                          <p className='text-sm leading-relaxed whitespace-pre-wrap'>{message.message}</p>
                        )}
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
          {/* Image Preview */}
          {imagePreview && (
            <div className='mb-4 relative inline-block'>
              <img
                src={imagePreview}
                alt='Preview'
                className='max-w-xs h-auto rounded-lg border border-gray-300'
                style={{ maxHeight: '200px', objectFit: 'cover' }}
              />
              <button
                onClick={handleRemoveImage}
                className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
              {isUploadingImage && (
                <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg'>
                  <div className='animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full'></div>
                </div>
              )}
            </div>
          )}

          <div className='flex items-center space-x-3'>
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                imagePreview ? 'Thêm mô tả cho ảnh (tùy chọn)...' : isConnected ? 'Nhập tin nhắn...' : 'Đang kết nối...'
              }
              disabled={!isConnected || isLoading || isUploadingImage}
              className='flex-1 h-12 bg-slate-50 border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
            />

            {/* Image Upload Button */}
            <div className='relative'>
              <input
                type='file'
                accept='image/*'
                onChange={handleImageSelect}
                className='hidden'
                id='chat-image-upload'
              />
              <label
                htmlFor='chat-image-upload'
                className='flex items-center justify-center w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors border border-slate-200'
              >
                <ImagePlus className='w-5 h-5 text-slate-600' />
              </label>
            </div>

            <Button
              onClick={sendMessage}
              disabled={(!messageInput.trim() && !selectedImage) || !isConnected || isLoading || isUploadingImage}
              className='h-12 px-6 bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white'
            >
              {isUploadingImage ? (
                <div className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full'></div>
              ) : (
                <Send className='w-4 h-4' />
              )}
            </Button>
          </div>

          <div className='flex items-center justify-center mt-2'>
            <p className='text-xs text-slate-500'>
              {isUploadingImage
                ? 'Đang tải ảnh...'
                : isConnected
                ? 'Nhấn Enter để gửi tin nhắn hoặc chọn ảnh'
                : 'Đang kết nối lại...'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { Send, MessageCircle, X, User, Trash2, ImagePlus, Edit2, Check } from 'lucide-react'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import userApi from '@/apis/user.api'
import chatApi from '@/apis/chat.api'
import { formatTime } from '@/utils/utils'
import type {
  NewMessageReceived,
  MessageUpdated,
  MessageDeleted,
  MessageError,
  GetChatMessagesInput
} from '@/types/ChatMessage.types'

interface Message {
  id: string
  groupChatId: string
  senderId: string
  message: string
  senderName: string
  avatar?: string
  sentAt: Date
  isCurrentUser?: boolean
  isUrl?: boolean
}

interface ChatSystemProps {
  groupChatId: string
  isVisible: boolean
  onClose: () => void
}

export default function ChatSystem({ groupChatId, isVisible, onClose }: ChatSystemProps) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const userProfile = useUsersStore((state) => state.isProfile)

  const deletedGroupChatMutation = useMutation({
    mutationFn: (groupChatId: string) => chatApi.GroupChat.deleteGroupChatByGroupChatId(groupChatId)
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

  const updateMessageMutation = useMutation({
    mutationFn: ({ messageId, newContent }: { messageId: string; newContent: string }) =>
      chatApi.ChatApis.updateMessage(messageId, newContent),
    onSuccess: () => {
      toast.success('Cập nhật tin nhắn thành công')
      setEditingMessageId(null)
      setEditingMessageContent('')
    },
    onError: () => {
      toast.error('Cập nhật tin nhắn thất bại')
    }
  })

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: string) => chatApi.ChatApis.deleteMessage(messageId),
    onSuccess: () => {
      toast.success('Xóa tin nhắn thành công')
    },
    onError: () => {
      toast.error('Xóa tin nhắn thất bại')
    }
  })

  // Load initial messages
  const { data: initialMessages } = useQuery({
    queryKey: ['chat-messages', groupChatId],
    queryFn: async () => {
      const input: GetChatMessagesInput = {
        groupChatId,
        page: 1,
        pageSize: 50
      }
      const response = await chatApi.ChatApis.getChatMessages(input)
      return response
    },
    enabled: !!groupChatId && isVisible
  })

  useEffect(() => {
    if (initialMessages?.chatMessages) {
      const formattedMessages: Message[] = initialMessages.chatMessages.map((msg) => ({
        id: msg.id,
        groupChatId: msg.groupChatId,
        senderId: msg.senderId,
        message: msg.message,
        senderName: msg.senderName,
        avatar: msg.avatar || undefined,
        sentAt: new Date(msg.createdAt),
        isCurrentUser: msg.senderId === userProfile?.id,
        isUrl: msg.isUrl
      }))
      setMessages(formattedMessages)
    }
  }, [initialMessages, userProfile?.id])

  const handleDeleteGroupChat = () => {
    deletedGroupChatMutation.mutateAsync(groupChatId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['group-chats'] })
        toast.success('Xóa group chat thành công!')
        onClose()
      },
      onError: (error: any) => {
        toast.error(error?.data?.message || 'Không thể xóa group chat')
      }
    })
  }

  // Initialize SignalR connection to ChatMessageHub
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
          .withUrl('https://hoalacrent.io.vn/chatmessagehub', {
            accessTokenFactory: () => token
          })
          .configureLogging(signalR.LogLevel.Information)
          .withAutomaticReconnect()
          .build()

        // Register SignalR event handlers
        newConnection.on('NewMessageReceived', (data: NewMessageReceived) => {
          if (data.groupChatId === groupChatId) {
            const newMessage: Message = {
              id: data.id,
              groupChatId: data.groupChatId,
              senderId: data.senderId,
              message: data.message,
              senderName: data.senderName,
              avatar: data.avatar,
              sentAt: new Date(data.sentAt),
              isCurrentUser: data.senderId === userProfile?.id,
              isUrl: data.isUrl
            }

            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === newMessage.id)
              if (exists) return prev
              return [...prev, newMessage]
            })
          }
        })

        newConnection.on('MessageSentResult', (data: any) => {
          if (data.success) {
            console.log('Message sent successfully:', data.messageId)
          } else {
            toast.error(data.error || 'Gửi tin nhắn thất bại')
          }
        })

        newConnection.on('ChatMessagesLoaded', (data: any) => {
          console.log('Chat messages loaded:', data)
        })

        newConnection.on('MessageUpdated', (data: MessageUpdated) => {
          if (data.groupChatId === groupChatId) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.messageId
                  ? { ...msg, message: data.newMessage, sentAt: new Date(data.updatedAt) }
                  : msg
              )
            )
            toast.success('Tin nhắn đã được cập nhật')
          }
        })

        newConnection.on('MessageDeleted', (data: MessageDeleted) => {
          if (data.groupChatId === groupChatId) {
            setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
            toast.success('Tin nhắn đã được xóa')
          }
        })

        newConnection.on('MessagesMarkedAsRead', (data: any) => {
          console.log('Messages marked as read:', data)
        })

        newConnection.on('MessageReadByUser', (data: any) => {
          console.log('Message read by user:', data)
        })

        newConnection.on('MessageError', (data: MessageError) => {
          toast.error(data.error)
          console.error('Message error:', data)
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
          // Rejoin group after reconnection
          newConnection.invoke('JoinChatGroup', groupChatId)
        })

        // Start connection
        await newConnection.start()
        setIsConnected(true)
        setConnection(newConnection)

        // Join chat group
        await newConnection.invoke('JoinChatGroup', groupChatId)

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
        connection.off('NewMessageReceived')
        connection.off('MessageSentResult')
        connection.off('ChatMessagesLoaded')
        connection.off('MessageUpdated')
        connection.off('MessageDeleted')
        connection.off('MessagesMarkedAsRead')
        connection.off('MessageReadByUser')
        connection.off('MessageError')
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
      let messageContent = messageInput.trim()
      let isUrl = false

      if (selectedImage) {
        setIsUploadingImage(true)
        const uploadResult = await uploadsImagesMutation.mutateAsync(selectedImage)
        messageContent = (uploadResult.data || uploadResult) as string
        isUrl = true
      }

      const messageData = {
        groupChatId: groupChatId,
        message: messageContent,
        isUrl: isUrl
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

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id)
    setEditingMessageContent(message.message)
  }

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingMessageContent.trim()) return

    await updateMessageMutation.mutateAsync({
      messageId: editingMessageId,
      newContent: editingMessageContent.trim()
    })
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingMessageContent('')
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
      await deleteMessageMutation.mutateAsync(messageId)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editingMessageId) {
        handleSaveEdit()
      } else {
        sendMessage()
      }
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
                <CardTitle className='text-lg font-semibold text-slate-800'>Chat</CardTitle>
                <p className='text-sm text-slate-600'>Group Chat</p>
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
                disabled={deletedGroupChatMutation.isPending}
                className='hover:bg-red-50 hover:text-red-600'
              >
                {deletedGroupChatMutation.isPending ? (
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
                  <p className='text-slate-500'>Chưa có tin nhắn nào</p>
                  <p className='text-sm text-slate-400'>Hãy bắt đầu cuộc trò chuyện</p>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex items-start space-x-3 group',
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

                      <div className='relative'>
                        <div
                          className={cn(
                            'p-3 rounded-2xl max-w-full break-words',
                            message.isCurrentUser
                              ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white rounded-br-md'
                              : 'bg-slate-100 text-slate-800 rounded-bl-md'
                          )}
                        >
                          {editingMessageId === message.id ? (
                            <div className='flex items-center space-x-2'>
                              <Input
                                value={editingMessageContent}
                                onChange={(e) => setEditingMessageContent(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className='text-sm'
                              />
                              <Button size='sm' onClick={handleSaveEdit}>
                                <Check className='w-4 h-4' />
                              </Button>
                              <Button size='sm' variant='ghost' onClick={handleCancelEdit}>
                                <X className='w-4 h-4' />
                              </Button>
                            </div>
                          ) : message.isUrl ? (
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

                        {/* Message actions */}
                        {message.isCurrentUser && editingMessageId !== message.id && (
                          <div className='absolute right-0 top-0 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1'>
                            {!message.isUrl && (
                              <Button size='sm' variant='ghost' onClick={() => handleEditMessage(message)}>
                                <Edit2 className='w-3 h-3' />
                              </Button>
                            )}
                            <Button
                              size='sm'
                              variant='ghost'
                              className='text-red-600'
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash2 className='w-3 h-3' />
                            </Button>
                          </div>
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

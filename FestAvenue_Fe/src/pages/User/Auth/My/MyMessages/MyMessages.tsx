import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, MessageCircle, Smile, Search, Wifi, WifiOff, ImagePlus, X, Edit2, Trash2, Check } from 'lucide-react'
import { gsap } from 'gsap'
import * as signalR from '@microsoft/signalr'
import { useUsersStore } from '@/contexts/app.context'
import { getAccessTokenFromLS } from '@/utils/auth'
import userApi from '@/apis/user.api'
import chatApi from '@/apis/chat.api'
import { formatTime, generateNameId } from '@/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type {
  NewMessageReceived,
  MessageUpdated,
  MessageDeleted,
  MessageError,
  GetChatMessagesInput
} from '@/types/ChatMessage.types'
import { EmojiPicker } from '@/utils/helper'
import { toast } from 'sonner'

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

interface GroupChat {
  groupChatId: string
  groupChatName: string
  avatarGroupUrl?: string
  lastMessage?: {
    senderName: string
    content: string
    sentAt: string
  }
}

export default function ChatMyMessagesSystem() {
  const userProfile = useUsersStore().isProfile
  const queryClient = useQueryClient()

  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const chatButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 1024) {
        setSidebarVisible(true)
      } else if (window.innerWidth < 768 && selectedChatId) {
        setSidebarVisible(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [selectedChatId])

  useEffect(() => {
    if (sidebarRef.current) {
      if (sidebarVisible) {
        gsap.fromTo(sidebarRef.current, { x: isMobile ? -320 : 0 }, { x: 0, duration: 0.3, ease: 'power2.out' })
      }
    }
  }, [sidebarVisible, isMobile])

  // Initialize SignalR connection to ChatMessageHub
  useEffect(() => {
    if (!userProfile?.id) return

    const initConnection = async () => {
      try {
        const token = getAccessTokenFromLS()
        if (!token) {
          console.error('No access token found')
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

          // Invalidate group chats to update last message
          queryClient.invalidateQueries({ queryKey: ['group-chats'] })
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
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId ? { ...msg, message: data.newMessage, sentAt: new Date(data.updatedAt) } : msg
            )
          )
        })

        newConnection.on('MessageDeleted', (data: MessageDeleted) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
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

        newConnection.onclose(() => {
          setIsConnected(false)
        })

        newConnection.onreconnecting(() => {
          setIsConnected(false)
        })

        newConnection.onreconnected(() => {
          setIsConnected(true)
          // Rejoin current group if exists
          if (selectedChatId) {
            newConnection.invoke('JoinChatGroup', selectedChatId)
          }
        })

        // Start connection
        await newConnection.start()
        setIsConnected(true)
        setConnection(newConnection)
      } catch (error) {
        console.error('SignalR connection error:', error)
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
  }, [userProfile?.id])

  const { data: groupChatsData, isLoading: isLoadingChats } = useQuery({
    queryKey: ['group-chats'],
    queryFn: async () => {
      const response = await chatApi.GroupChat.getGroupChatByUserId(userProfile?.id || '')
      return response
    },
    enabled: !!userProfile?.id,
    staleTime: 5 * 60 * 1000
  })

  const filteredChats = useMemo(() => {
    if (!groupChatsData?.data || !searchTerm) return (groupChatsData?.data || []) as GroupChat[]
    return (groupChatsData.data as GroupChat[]).filter((chat) =>
      chat.groupChatName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [groupChatsData, searchTerm])

  const selectedChat = useMemo(() => {
    return filteredChats.find((chat) => chat.groupChatId === selectedChatId)
  }, [filteredChats, selectedChatId])

  // Load messages when chat is selected
  const { data: chatMessagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat-messages', selectedChatId],
    queryFn: async () => {
      if (!selectedChatId) return null
      const input: GetChatMessagesInput = {
        groupChatId: selectedChatId,
        page: 1,
        pageSize: 50
      }
      const response = await chatApi.ChatApis.getChatMessages(input)
      return response
    },
    enabled: !!selectedChatId
  })

  useEffect(() => {
    if (chatMessagesData?.chatMessages) {
      const formattedMessages: Message[] = chatMessagesData.chatMessages.map((msg) => ({
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
  }, [chatMessagesData, userProfile?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleChatSelect = async (chatId: string, chatName: string) => {
    setSelectedChatId(chatId)
    generateNameId({ name: chatName, id: chatId })

    if (isMobile) {
      setSidebarVisible(false)
    }

    // Join the chat group via SignalR
    if (connection && isConnected) {
      try {
        await connection.invoke('JoinChatGroup', chatId)
      } catch (error) {
        console.error('Error joining chat group:', error)
      }
    }
  }

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

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !selectedChatId || !userProfile || !connection || !isConnected)
      return

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
        groupChatId: selectedChatId,
        message: messageContent,
        isUrl: isUrl
      }

      await connection.invoke('SendMessage', messageData)
      setMessageInput('')
      setSelectedImage(null)
      setImagePreview(null)
      setIsUploadingImage(false)
    } catch (error) {
      console.error('Error handling message send:', error)
      setIsUploadingImage(false)
      toast.error('Gửi tin nhắn thất bại')
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

  const handleEmojiSelect = (emoji: string) => {
    if (inputRef.current) {
      const cursorPosition = inputRef.current.selectionStart || 0
      const text = inputRef.current.value
      const newText = text.slice(0, cursorPosition) + emoji + text.slice(cursorPosition)
      setMessageInput(newText)
      inputRef.current.focus()
      inputRef.current.selectionEnd = cursorPosition + emoji.length
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (editingMessageId) {
        handleSaveEdit()
      } else {
        handleSendMessage()
      }
    }
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <div className='flex h-[800px] rounded-md bg-gray-50 w-full'>
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`absolute top-4 ${
            sidebarVisible ? 'left-80' : 'left-4'
          } z-30 p-2 rounded-full bg-white shadow-lg border border-gray-200`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            className='w-5 h-5 text-gray-600'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            {sidebarVisible ? (
              <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
            ) : (
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
            )}
          </svg>
        </button>
      )}

      {/* Chat List Sidebar */}
      {sidebarVisible && (
        <div
          ref={sidebarRef}
          className='w-80 min-w-80 bg-white border-r border-gray-200 flex flex-col absolute md:relative z-20 h-full'
        >
          {/* Header */}
          <div className='p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-400 to-blue-300'>
            <h1 className='text-xl font-bold text-white mb-4'>Nhóm tin nhắn của tôi</h1>

            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='Tìm kiếm nhóm...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white transition-all'
              />
            </div>
          </div>

          {/* Connection status */}
          <div className='px-6 py-2 bg-gray-50 border-b border-gray-200'>
            <div className='flex items-center space-x-2'>
              {isConnected ? (
                <>
                  <Wifi className='w-4 h-4 text-green-500' />
                  <span className='text-sm text-green-600'>Kết nối</span>
                </>
              ) : (
                <>
                  <WifiOff className='w-4 h-4 text-red-500' />
                  <span className='text-sm text-red-600'>Mất kết nối</span>
                </>
              )}
            </div>
          </div>

          {/* Chat List */}
          <div className='flex-1 overflow-y-auto'>
            {isLoadingChats ? (
              <div className='flex items-center justify-center h-32'>
                <div className='animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full'></div>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.groupChatId}
                  ref={(el) => {
                    if (el) {
                      chatButtonRefs.current.set(chat.groupChatId, el)
                    }
                  }}
                  onClick={() => handleChatSelect(chat.groupChatId, chat.groupChatName)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                    selectedChatId === chat.groupChatId
                      ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-400'
                      : ''
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='relative'>
                      <Avatar className='w-12 h-12 rounded-full object-cover'>
                        <AvatarImage src={chat.avatarGroupUrl || chat.groupChatName} />
                        <AvatarFallback>{chat.groupChatName.slice(0, 3)}</AvatarFallback>
                      </Avatar>

                      <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-gray-900 truncate'>{chat.groupChatName}</h3>
                        {chat.lastMessage && (
                          <span className='text-xs text-gray-500'>{formatTime(new Date(chat.lastMessage.sentAt))}</span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <p className='text-sm text-gray-600 truncate mt-1'>
                          {chat.lastMessage.senderName}: {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className='flex-1 flex flex-col h-full'>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className='bg-white border-b border-gray-200 p-4 shadow-sm'>
              <div className='flex items-center space-x-3'>
                <Avatar className='w-10 h-10 rounded-full object-cover'>
                  <AvatarImage src={selectedChat.avatarGroupUrl || selectedChat.groupChatName} />
                  <AvatarFallback>{selectedChat.groupChatName.slice(0, 3)}</AvatarFallback>
                </Avatar>
                <div className='font-semibold'>{selectedChat.groupChatName}</div>
              </div>
            </div>

            {/* Messages Container */}
            <div ref={chatContainerRef} className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
              {isLoadingMessages ? (
                <div className='flex items-center justify-center h-32'>
                  <div className='animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full'></div>
                </div>
              ) : (
                messages
                  .filter((msg) => msg.groupChatId === selectedChatId)
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 group ${
                        message.isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <img
                        src={
                          message.avatar ||
                          `https://ui-avatars.com/api/?name=${message.senderName}&background=06b6d4&color=fff`
                        }
                        alt={message.senderName}
                        className='w-8 h-8 rounded-full object-cover'
                      />

                      <div className={`max-w-[70%] ${message.isCurrentUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`flex items-center space-x-2 mb-1 ${
                            message.isCurrentUser ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span className='text-sm font-medium text-gray-700'>{message.senderName}</span>
                          <span className='text-xs text-gray-500'>{formatTime(message.sentAt)}</span>
                        </div>

                        <div className='relative'>
                          <div
                            className={`px-4 py-2 rounded-lg max-w-full break-words ${
                              message.isCurrentUser
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                            }`}
                          >
                            {editingMessageId === message.id ? (
                              <div className='flex items-center space-x-2'>
                                <input
                                  type='text'
                                  value={editingMessageContent}
                                  onChange={(e) => setEditingMessageContent(e.target.value)}
                                  onKeyPress={handleKeyPress as any}
                                  className='text-sm px-2 py-1 rounded text-gray-900'
                                />
                                <button onClick={handleSaveEdit}>
                                  <Check className='w-4 h-4' />
                                </button>
                                <button onClick={handleCancelEdit}>
                                  <X className='w-4 h-4' />
                                </button>
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
                            <div className='absolute right-0 top-0 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1'>
                              {!message.isUrl && (
                                <button className='text-xs p-1' onClick={() => handleEditMessage(message)}>
                                  <Edit2 className='w-3 h-3' />
                                </button>
                              )}
                              <button
                                className='text-xs p-1 text-red-600'
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className='w-3 h-3' />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className='bg-white border-t border-gray-200 p-4'>
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
                <div className='flex-1 relative'>
                  <input
                    ref={inputRef}
                    type='text'
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      imagePreview ? 'Thêm mô tả cho ảnh (tùy chọn)...' : isConnected ? 'Nhập tin nhắn...' : 'Connecting...'
                    }
                    disabled={!isConnected || isUploadingImage}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all'
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  {/* Image Upload */}
                  <div className='relative'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageSelect}
                      className='hidden'
                      id='image-upload'
                    />
                    <label htmlFor='image-upload' className='p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'>
                      <ImagePlus className='w-5 h-5' />
                    </label>
                  </div>

                  {/* Emoji Picker */}
                  <div className='relative'>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                    >
                      <Smile className='w-5 h-5' />
                    </button>

                    {showEmojiPicker && (
                      <EmojiPicker
                        onEmojiSelect={handleEmojiSelect}
                        isVisible={showEmojiPicker}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    )}
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && !selectedImage) || !isConnected || isUploadingImage}
                    className='px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-300 text-white rounded-lg hover:from-cyan-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2'
                  >
                    {isUploadingImage ? (
                      <div className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full'></div>
                    ) : (
                      <Send className='w-4 h-4' />
                    )}
                    <span>{isUploadingImage ? 'Đang tải...' : 'Gửi'}</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className='flex-1 flex items-center justify-center bg-gray-50'>
            <div className='text-center'>
              <MessageCircle className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-600 mb-2'>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</h3>
              <p className='text-gray-500'>Chọn một cuộc trò chuyện từ thanh bên để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

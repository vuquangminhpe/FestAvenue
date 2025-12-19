/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
  Send,
  MessageCircle,
  Search,
  Wifi,
  WifiOff,
  ImagePlus,
  X,
  Trash2,
  Edit2,
  Check,
  MoreHorizontal
} from 'lucide-react'
import { gsap } from 'gsap'
import * as signalR from '@microsoft/signalr'
import { useUsersStore } from '@/contexts/app.context'
import { getAccessTokenFromLS } from '@/utils/auth'
import userApi from '@/apis/user.api'
import chatApi from '@/apis/chat.api'
import { formatTime, generateNameId } from '@/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import type {
  NewMessageReceived,
  MessageUpdated,
  MessageDeleted,
  EventGroup,
  resChatMessage,
  resChatPaging
} from '@/types/ChatMessage.types'
import { toast } from 'sonner'

interface Message {
  id: string
  groupChatId: string
  senderId: string
  message: string
  senderName: string
  avatar?: string
  createdAt: Date
  isCurrentUser?: boolean
  isUrl?: boolean
}

const MESSAGE_PAGE_SIZE = 20
const IMAGE_REGEX = /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i

const isImageUrl = (value: string) => {
  if (!value?.startsWith('http')) return false
  const urlWithoutParams = value.split('?')[0]
  return IMAGE_REGEX.test(urlWithoutParams)
}

const parseMessageDate = (value?: string | Date | null) => {
  if (!value) return new Date()
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

const buildHistoryMessage = (message: resChatMessage, currentUserId?: string): Message => ({
  id: message.id,
  groupChatId: message.groupChatId,
  senderId: message.senderId,
  senderName: message.senderName,
  message: message.message,
  avatar: message.avatar || undefined,
  createdAt: parseMessageDate(message.createdAt),
  isCurrentUser: message.senderId === currentUserId,
  isUrl: isImageUrl(message.message)
})

const buildMessageSignature = (message: Message) => {
  const timestamp =
    message.createdAt instanceof Date ? message.createdAt.getTime() : new Date(message.createdAt).getTime()
  return `${message.groupChatId}::${message.senderId}::${timestamp}::${message.message}`
}

export default function StaffMessages() {
  const userProfile = useUsersStore().isProfile
  const queryClient = useQueryClient()
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([])

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState('')
  const [messageActionOpenId, setMessageActionOpenId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const loadOlderRef = useRef<HTMLDivElement>(null)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const selectedChatIdRef = useRef<string | null>(null)
  const shouldForceScrollRef = useRef(false)

  const uploadsImagesMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadsStorage(file),
    onSuccess: (data) => {
      return data
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Upload ảnh thất bại')
      setIsUploadingImage(false)
    }
  })

  // Tương tự như MyMessages nhưng thêm staff controls
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

  // Update ref when selectedChatId changes
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId
    if (selectedChatId) {
      shouldForceScrollRef.current = true
    }
  }, [selectedChatId])

  // SignalR Connection - using chatmessagehub like MyMessages
  useEffect(() => {
    if (!userProfile?.id) return

    let activeConnection: signalR.HubConnection | null = null

    const initConnection = async () => {
      try {
        const token = getAccessTokenFromLS()
        if (!token) {
          console.error('No access token found')
          return
        }

        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl('https://hoalacrent.io.vn/chatmessagehub', {
            accessTokenFactory: () => getAccessTokenFromLS() || ''
          })
          .withAutomaticReconnect()
          .build()

        newConnection.on('NewMessageReceived', (data: NewMessageReceived) => {
          const derivedId = data.id || `${data.groupChatId}-${Date.now()}`
          const normalized: Message = {
            id: derivedId,
            groupChatId: data.groupChatId,
            senderId: data.senderId,
            message: data.message,
            senderName: data.senderName,
            avatar: data.avatar || undefined,
            createdAt: parseMessageDate(data.createdAt),
            isCurrentUser: data.senderId === userProfile?.id,
            isUrl: data.isUrl
          }

          setRealtimeMessages((prev) => {
            const signature = buildMessageSignature(normalized)
            let replaced = false
            const updated = prev.map((msg) => {
              if (buildMessageSignature(msg) === signature) {
                replaced = true
                if (!msg.id && normalized.id) return normalized
                if (normalized.createdAt.getTime() >= msg.createdAt.getTime()) return normalized
              }
              return msg
            })

            if (replaced) return updated
            return [...updated, normalized]
          })

          shouldForceScrollRef.current = true
          queryClient.invalidateQueries({ queryKey: ['staff-chat-messages', data.groupChatId] })
        })

        newConnection.on('MessageUpdated', (data: MessageUpdated) => {
          setRealtimeMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId
                ? { ...msg, message: data.newContent, createdAt: parseMessageDate(data.updatedAt || msg.createdAt) }
                : msg
            )
          )
        })

        newConnection.on('MessageDeleted', (data: MessageDeleted) => {
          setRealtimeMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
        })

        newConnection.onclose(() => {
          setIsConnected(false)
        })

        newConnection.onreconnecting(() => {
          setIsConnected(false)
        })

        newConnection.onreconnected(() => {
          setIsConnected(true)
          if (selectedChatIdRef.current) {
            newConnection.invoke('JoinChatGroup', selectedChatIdRef.current).catch((error) => console.error(error))
            newConnection.invoke('MarkMessagesAsRead', selectedChatIdRef.current).catch((error) => console.error(error))
          }
        })

        await newConnection.start()
        activeConnection = newConnection
        connectionRef.current = newConnection
        setIsConnected(true)
        setConnection(newConnection)

        // Call StaffOnline to register staff online status
        console.log('[StaffMessages] Calling StaffOnline...', { userId: userProfile?.id })
        try {
          await newConnection.invoke('StaffOnline')
          console.log('[StaffMessages] StaffOnline success - Staff is now online')
        } catch (staffOnlineError) {
          console.error('[StaffMessages] StaffOnline error:', staffOnlineError)
        }
      } catch (error) {
        console.error('SignalR connection error:', error)
      }
    }

    initConnection()

    return () => {
      if (activeConnection) {
        activeConnection.off('NewMessageReceived')
        activeConnection.off('MessageUpdated')
        activeConnection.off('MessageDeleted')
        activeConnection.stop()
      }
    }
  }, [userProfile?.id, queryClient])

  const { data: groupChatsData, isLoading: isLoadingChats } = useQuery({
    queryKey: ['staff-group-chats', userProfile?.id],
    queryFn: async () => {
      const response = await chatApi.GroupChat.getGroupChatByUserId(userProfile?.id || '')
      return response
    },
    enabled: !!userProfile?.id,
    staleTime: 5 * 60 * 1000
  })

  const filteredChats = useMemo(() => {
    const chats = (groupChatsData as EventGroup[] | undefined) ?? []
    if (!searchTerm.trim()) return chats
    return chats.filter((chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [groupChatsData, searchTerm])

  const selectedChat = useMemo(() => {
    return filteredChats?.find((chat) => chat.id === selectedChatId)
  }, [filteredChats, selectedChatId])

  // Fetch messages with pagination
  const {
    data: pagedMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages
  } = useInfiniteQuery<resChatPaging>({
    queryKey: ['staff-chat-messages', selectedChatId],
    queryFn: async ({ pageParam }) => {
      if (!selectedChatId) throw new Error('No chat selected')
      const currentPage = typeof pageParam === 'number' ? pageParam : 1
      const response = await chatApi.ChatMessage.getMessagesWithPagging({
        groupChatId: selectedChatId,
        page: currentPage,
        pageSize: MESSAGE_PAGE_SIZE
      })
      if (!response) {
        return {
          chatMessages: [],
          currentPage,
          totalPages: currentPage,
          pageSize: MESSAGE_PAGE_SIZE
        }
      }
      return response
    },
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined
    },
    enabled: !!selectedChatId,
    initialPageParam: 1,
    staleTime: 60 * 1000
  })

  const historyMessages = pagedMessages?.pages.flatMap((page: resChatPaging) => page.chatMessages ?? []) ?? []

  const normalizedHistory = useMemo(() => {
    return historyMessages.map((message) => buildHistoryMessage(message, userProfile?.id))
  }, [historyMessages, userProfile?.id])

  const combinedMessages = useMemo(() => {
    if (!selectedChatId) return []
    const relevantRealtime = realtimeMessages.filter((msg) => msg.groupChatId === selectedChatId)
    const merged = [...normalizedHistory, ...relevantRealtime]
    const dedup = new Map<string, Message>()

    merged.forEach((msg) => {
      const key = buildMessageSignature(msg)
      const existing = dedup.get(key)
      if (!existing) {
        dedup.set(key, msg)
        return
      }

      if (!existing.id && msg.id) {
        dedup.set(key, msg)
        return
      }

      if (msg.createdAt.getTime() > existing.createdAt.getTime()) {
        dedup.set(key, msg)
      }
    })

    return Array.from(dedup.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }, [normalizedHistory, realtimeMessages, selectedChatId])

  // Join chat group when selecting
  useEffect(() => {
    if (selectedChatId && connection && isConnected) {
      connection.invoke('JoinChatGroup', selectedChatId).catch((error) => console.error(error))
      connection.invoke('MarkMessagesAsRead', selectedChatId).catch((error) => console.error(error))
    }
  }, [connection, isConnected, selectedChatId])

  // Reset realtime messages when changing chat
  useEffect(() => {
    if (selectedChatId) {
      setRealtimeMessages([])
    }
  }, [selectedChatId])

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
        messageContent = (uploadResult.data || uploadResult) as any
        isUrl = true
      }

      await connection.invoke('SendMessage', {
        GroupChatId: selectedChatId,
        Message: messageContent,
        IsUrl: isUrl
      })

      shouldForceScrollRef.current = true
      setMessageInput('')
      setSelectedImage(null)
      setImagePreview(null)
      setIsUploadingImage(false)
    } catch (error: any) {
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
    if (!editingMessageId || !editingMessageContent.trim() || !connection || !isConnected) return

    try {
      await connection.invoke('UpdateMessage', {
        messageId: editingMessageId,
        newContent: editingMessageContent
      })
      setEditingMessageId(null)
      setEditingMessageContent('')
    } catch (error) {
      console.error('Error updating message:', error)
      toast.error('Cập nhật tin nhắn thất bại')
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingMessageContent('')
  }

  const handleDeleteMessage = (message: Message) => {
    setDeleteTarget(message)
  }

  const confirmDeleteMessage = async () => {
    if (!deleteTarget || !connection || !isConnected) return
    try {
      setIsDeletingMessage(true)
      await connection.invoke('DeleteMessage', deleteTarget.id)
      setDeleteTarget(null)
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Xóa tin nhắn thất bại')
    } finally {
      setIsDeletingMessage(false)
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

  // Auto scroll to bottom
  useEffect(() => {
    if (!combinedMessages.length) return
    const container = chatContainerRef.current
    if (!container) return

    if (isNearBottom || shouldForceScrollRef.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: shouldForceScrollRef.current || combinedMessages.length < 5 ? 'auto' : 'smooth'
      })
      shouldForceScrollRef.current = false
    }
  }, [combinedMessages, isNearBottom])

  // Infinite scroll: Load older messages when scrolling to top
  useEffect(() => {
    if (!chatContainerRef.current || !selectedChatId) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          const container = chatContainerRef.current
          const previousHeight = container?.scrollHeight || 0
          fetchNextPage().then(() => {
            requestAnimationFrame(() => {
              if (container) {
                const newHeight = container.scrollHeight
                container.scrollTop = newHeight - previousHeight + container.scrollTop
              }
            })
          })
        }
      },
      {
        root: chatContainerRef.current,
        threshold: 0.1
      }
    )

    if (loadOlderRef.current) {
      observer.observe(loadOlderRef.current)
    }

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, selectedChatId])

  // Handle scroll detection
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120
      setIsNearBottom(nearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const handleChatSelect = (chat: EventGroup) => {
    setSelectedChatId(chat.id)
    generateNameId({ name: chat.name, id: chat.id })
    if (isMobile) {
      setSidebarVisible(false)
    }
  }

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const renderMessageContent = (message: Message) => {
    if (editingMessageId === message.id) {
      return (
        <div className='flex items-center space-x-2'>
          <input
            type='text'
            value={editingMessageContent}
            onChange={(e) => setEditingMessageContent(e.target.value)}
            onKeyPress={handleKeyPress as any}
            className='text-sm px-2 py-1 rounded text-gray-900 border border-gray-300 flex-1'
          />
          <button onClick={handleSaveEdit} className='text-green-600 hover:text-green-700'>
            <Check className='w-4 h-4' />
          </button>
          <button onClick={handleCancelEdit} className='text-gray-600 hover:text-gray-700'>
            <X className='w-4 h-4' />
          </button>
        </div>
      )
    }

    if (message.isUrl || isImageUrl(message.message)) {
      return (
        <img
          src={message.message}
          alt='Shared content'
          className='max-w-full h-auto rounded-lg'
          style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }}
        />
      )
    }
    return <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>{message.message}</p>
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
          <div className='p-6 border-b border-gray-200 bg-gradient-to-r from-blue-400 to-blue-600'>
            <h1 className='text-xl font-bold text-white mb-4'>Staff Messages</h1>

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
                <div className='animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full'></div>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div key={chat.id} className='border-b border-gray-100'>
                  <button
                    onClick={() => handleChatSelect(chat)}
                    className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                      selectedChatId === chat.id
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400'
                        : ''
                    }`}
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='relative'>
                        <Avatar className='w-12 h-12 rounded-full object-cover'>
                          <AvatarImage src={chat.avatar || chat.name} />
                          <AvatarFallback>{chat.name.slice(0, 3)}</AvatarFallback>
                        </Avatar>
                        <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <h3 className='font-semibold text-gray-900 truncate'>{chat.name}</h3>
                          <span className='text-xs text-gray-500'>{formatTime(new Date(chat.createdAt))}</span>
                        </div>
                        <p className='text-sm text-gray-600 truncate mt-1'>{chat.members.length} thành viên</p>
                      </div>
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Messages Area - Same as MyMessages */}
      <div className='flex-1 flex flex-col h-full'>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className='bg-white border-b border-gray-200 p-4 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <Avatar className='w-10 h-10 rounded-full object-cover'>
                    <AvatarImage src={selectedChat.avatar || selectedChat.name} />
                    <AvatarFallback>{selectedChat.name.slice(0, 3)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='font-semibold'>{selectedChat.name}</div>
                    <p className='text-xs text-gray-500'>{selectedChat.members.length} thành viên</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div ref={chatContainerRef} className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
              {/* Infinite scroll trigger */}
              <div ref={loadOlderRef} className='h-1' />

              {/* Loading older messages indicator */}
              {isFetchingNextPage && hasNextPage && (
                <div className='flex justify-center py-2'>
                  <div className='flex items-center space-x-2 text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm'>
                    <div className='animate-spin w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full' />
                    <span>Đang tải tin nhắn cũ...</span>
                  </div>
                </div>
              )}

              {/* Messages */}
              {isLoadingMessages ? (
                <div className='flex items-center justify-center h-32'>
                  <div className='animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full'></div>
                </div>
              ) : (
                combinedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 group ${
                      message.isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <img
                      src={
                        message.avatar ||
                        `https://ui-avatars.com/api/?name=${message.senderName}&background=3b82f6&color=fff`
                      }
                      alt={message.senderName}
                      className='w-8 h-8 rounded-full object-cover flex-shrink-0'
                    />

                    <div className={`max-w-[70%] ${message.isCurrentUser ? 'items-end' : 'items-start'}`}>
                      {/* Sender name and timestamp */}
                      <div
                        className={`flex items-center space-x-2 mb-1 ${
                          message.isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span className='text-sm font-medium text-gray-700'>{message.senderName}</span>
                        <span className='text-xs text-gray-500'>{formatTime(message.createdAt)}</span>
                      </div>

                      <div
                        className={`relative flex items-start gap-2 ${
                          message.isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.isCurrentUser && editingMessageId !== message.id && (
                          <Popover
                            open={messageActionOpenId === message.id}
                            onOpenChange={(open) => setMessageActionOpenId(open ? message.id : null)}
                          >
                            <PopoverTrigger asChild>
                              <button
                                type='button'
                                className='opacity-0 group-hover:opacity-100 p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200 shadow-sm bg-white/70'
                              >
                                <MoreHorizontal className='w-4 h-4' />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align='end' className='w-32 p-1 text-xs'>
                              {!message.isUrl && (
                                <button
                                  type='button'
                                  onClick={() => {
                                    handleEditMessage(message)
                                    setMessageActionOpenId(null)
                                  }}
                                  className='flex w-full items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-left'
                                >
                                  <Edit2 className='w-3 h-3' />
                                  Sửa
                                </button>
                              )}
                              <button
                                type='button'
                                onClick={() => {
                                  handleDeleteMessage(message)
                                  setMessageActionOpenId(null)
                                }}
                                className='flex w-full items-center gap-2 px-2 py-1.5 rounded text-red-600 hover:bg-red-50 text-left'
                              >
                                <Trash2 className='w-3 h-3' />
                                Xóa
                              </button>
                            </PopoverContent>
                          </Popover>
                        )}
                        <div
                          className={`px-4 py-2 rounded-lg max-w-full break-words ${
                            message.isCurrentUser
                              ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          {renderMessageContent(message)}
                        </div>
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
                      imagePreview
                        ? 'Thêm mô tả cho ảnh (tùy chọn)...'
                        : isConnected
                        ? 'Nhập tin nhắn...'
                        : 'Đang kết nối...'
                    }
                    disabled={!isConnected || isUploadingImage}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all'
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
                      id='staff-image-upload'
                    />
                    <label
                      htmlFor='staff-image-upload'
                      className='p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
                    >
                      <ImagePlus className='w-5 h-5' />
                    </label>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={(!messageInput.trim() && !selectedImage) || !isConnected || isUploadingImage}
                    className='px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2'
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
              <h3 className='text-lg font-semibold text-gray-600 mb-2'>Staff Chat Management</h3>
              <p className='text-gray-500'>Chọn một cuộc trò chuyện để quản lý</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tin nhắn?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.message ? (
                <span>
                  Bạn có chắc chắn muốn xóa tin nhắn "{deleteTarget.message}"? Thao tác này không thể hoàn tác.
                </span>
              ) : (
                'Bạn có chắc chắn muốn xóa tin nhắn này? Thao tác này không thể hoàn tác.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)} disabled={isDeletingMessage}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMessage} disabled={isDeletingMessage}>
              {isDeletingMessage ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

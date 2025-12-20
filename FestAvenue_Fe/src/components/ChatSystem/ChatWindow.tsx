import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import * as signalR from '@microsoft/signalr'
import { Send, X, Minus, Smile, ImagePlus, Loader2, Edit2, Trash2, Check, MoreHorizontal } from 'lucide-react'
import { getAccessTokenFromLS } from '@/utils/auth'
import { useUsersStore } from '@/contexts/app.context'
import chatApi from '@/apis/chat.api'
import userApi from '@/apis/user.api'
import { formatTime } from '@/utils/utils'

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
import { EmojiPicker } from '@/utils/helper'
import { toast } from 'sonner'
import type {
  NewMessageReceived,
  MessageUpdated,
  MessageDeleted,
  resChatMessage,
  resChatPaging
} from '@/types/ChatMessage.types'

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

interface ChatWindowProps {
  groupChatId: string
  groupName: string
  groupAvatar?: string
  initialMessages?: any[]
  onClose: () => void
  onMinimize: () => void
  isMinimized: boolean
  position: number
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

export default function ChatWindow({
  groupChatId,
  groupName,
  groupAvatar,
  onClose,
  onMinimize,
  isMinimized,
  position
}: ChatWindowProps) {
  const userProfile = useUsersStore().isProfile
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([])
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState('')
  const [messageActionOpenId, setMessageActionOpenId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const shouldForceScrollRef = useRef(false)
  const loadOlderRef = useRef<HTMLDivElement>(null)

  // Upload image mutation
  const uploadsImagesMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadsStorage(file),
    onSuccess: (data) => data,
    onError: (error: any) => {
      console.error('Upload error:', error)
      toast.error(error?.response?.data?.message || 'Upload ảnh thất bại')
      setIsUploadingImage(false)
    }
  })

  // Fetch messages with pagination
  const {
    data: pagedMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages
  } = useInfiniteQuery<resChatPaging>({
    queryKey: ['chat-messages-window', groupChatId],
    queryFn: async ({ pageParam }) => {
      const currentPage = typeof pageParam === 'number' ? pageParam : 1
      const response = await chatApi.ChatMessage.getMessagesWithPagging({
        groupChatId,
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
    enabled: !!groupChatId && !isMinimized,
    initialPageParam: 1,
    staleTime: 60 * 1000
  })

  const historyMessages = pagedMessages?.pages.flatMap((page: resChatPaging) => page.chatMessages ?? []) ?? []

  const normalizedHistory = useMemo(() => {
    return historyMessages.map((message) => buildHistoryMessage(message, userProfile?.id))
  }, [historyMessages, userProfile?.id])

  // Combine initial messages from notification with history
  const combinedMessages = useMemo(() => {
    const relevantRealtime = realtimeMessages.filter((msg) => msg.groupChatId === groupChatId)
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
  }, [normalizedHistory, realtimeMessages, groupChatId])

  // Initialize SignalR connection
  useEffect(() => {
    if (!userProfile?.id) return

    let activeConnection: signalR.HubConnection | null = null

    const initConnection = async () => {
      try {
        const token = getAccessTokenFromLS()
        if (!token) return

        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl('https://hoalacrent.io.vn/chatmessagehub', {
            accessTokenFactory: () => getAccessTokenFromLS() || ''
          })
          .withAutomaticReconnect()
          .build()

        newConnection.on('NewMessageReceived', (data: NewMessageReceived) => {
          if (data.groupChatId !== groupChatId) return

          const normalized: Message = {
            id: data.id || `${data.groupChatId}-${Date.now()}`,
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
        })

        newConnection.on('MessageUpdated', (data: MessageUpdated) => {
          if (data.groupChatId !== groupChatId) return
          setRealtimeMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId
                ? { ...msg, message: data.newContent, createdAt: parseMessageDate(data.updatedAt || msg.createdAt) }
                : msg
            )
          )
        })

        newConnection.on('MessageDeleted', (data: MessageDeleted) => {
          if (data.groupChatId !== groupChatId) return
          setRealtimeMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
        })

        await newConnection.start()
        activeConnection = newConnection
        connectionRef.current = newConnection
        setConnection(newConnection)
        setIsConnected(true)

        // Join chat group
        await newConnection.invoke('JoinChatGroup', groupChatId)
        await newConnection.invoke('MarkMessagesAsRead', groupChatId)
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
  }, [userProfile?.id, groupChatId])

  // Auto scroll to bottom
  useEffect(() => {
    if (!combinedMessages.length || isMinimized) return
    const container = chatContainerRef.current
    if (!container) return

    if (isNearBottom || shouldForceScrollRef.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: shouldForceScrollRef.current || combinedMessages.length < 5 ? 'auto' : 'smooth'
      })
      shouldForceScrollRef.current = false
    }
  }, [combinedMessages, isNearBottom, isMinimized])

  // Infinite scroll: Load older messages when scrolling to top
  useEffect(() => {
    if (!chatContainerRef.current || !groupChatId || isMinimized) return

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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, groupChatId, isMinimized])

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
    if ((!messageInput.trim() && !selectedImage) || !connection || !isConnected) return

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
        GroupChatId: groupChatId,
        Message: messageContent,
        IsUrl: isUrl
      })

      shouldForceScrollRef.current = true
      setMessageInput('')
      setSelectedImage(null)
      setImagePreview(null)
      setIsUploadingImage(false)
    } catch (error: any) {
      console.error('Error sending message:', error)
      setIsUploadingImage(false)
      toast.error('Gửi tin nhắn thất bại')
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
          style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
        />
      )
    }
    return <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>{message.message}</p>
  }

  // Calculate position from right (360px window width + 15px gap)
  const rightPosition = position * 375 + 20
  // Higher index = higher z-index (on top)
  const zIndex = 50 + position

  if (isMinimized) {
    return (
      <div
        className='fixed bottom-0 w-[360px] bg-white rounded-t-lg shadow-2xl border border-gray-200'
        style={{ right: `${rightPosition}px`, zIndex }}
      >
        <div className='bg-gradient-to-r from-cyan-400 to-blue-300 p-3 rounded-t-lg flex items-center justify-between cursor-pointer'>
          <div className='flex items-center space-x-2 flex-1 min-w-0' onClick={onMinimize}>
            <Avatar className='w-8 h-8 flex-shrink-0'>
              <AvatarImage src={groupAvatar || groupName} />
              <AvatarFallback>{groupName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className='font-semibold text-white text-sm break-words leading-tight'>{groupName}</span>
          </div>
          <button onClick={onClose} className='text-white hover:bg-white/20 rounded-full p-1 flex-shrink-0'>
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className='fixed bottom-0 w-[360px]  h-[550px] bg-white rounded-t-lg shadow-2xl border border-gray-200 flex flex-col'
      style={{ right: `${rightPosition}px`, zIndex }}
    >
      {/* Header */}
      <div className='bg-gradient-to-r from-cyan-400 to-blue-300 p-3 rounded-t-lg flex items-center justify-between'>
        <div className='flex items-center space-x-2 flex-1 min-w-0'>
          <Avatar className='w-8 h-8 flex-shrink-0'>
            <AvatarImage src={groupAvatar || groupName} />
            <AvatarFallback>{groupName.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span className='font-semibold text-white text-sm break-words leading-tight'>{groupName}</span>
        </div>
        <div className='flex items-center space-x-1 flex-shrink-0'>
          <button onClick={onMinimize} className='text-white hover:bg-white/20 rounded-full p-1'>
            <Minus className='w-4 h-4' />
          </button>
          <button onClick={onClose} className='text-white hover:bg-white/20 rounded-full p-1'>
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className='flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50'>
        {/* Infinite scroll trigger */}
        <div ref={loadOlderRef} className='h-1' />

        {/* Loading older messages indicator */}
        {isFetchingNextPage && hasNextPage && (
          <div className='flex justify-center py-2'>
            <div className='flex items-center space-x-2 text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm'>
              <div className='animate-spin w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full' />
              <span>Đang tải tin nhắn cũ...</span>
            </div>
          </div>
        )}

        {isLoadingMessages ? (
          <div className='flex items-center justify-center h-full'>
            <div className='animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full'></div>
          </div>
        ) : (
          combinedMessages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 group ${
                message.isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <img
                src={
                  message.avatar || `https://ui-avatars.com/api/?name=${message.senderName}&background=06b6d4&color=fff`
                }
                alt={message.senderName}
                className='w-6 h-6 rounded-full object-cover flex-shrink-0'
              />
              <div className={`max-w-[70%] ${message.isCurrentUser ? 'items-end' : 'items-start'}`}>
                {/* Sender name and timestamp */}
                <div
                  className={`flex items-center space-x-2 mb-1 ${
                    message.isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span className='text-xs font-medium text-gray-700'>{message.senderName}</span>
                  <span className='text-[10px] text-gray-500'>{formatTime(message.createdAt)}</span>
                </div>

                <div className={`relative flex items-start gap-2 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
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
                          <MoreHorizontal className='w-3 h-3' />
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
                    className={`px-3 py-2 rounded-lg ${
                      message.isCurrentUser
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white'
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

      {/* Input */}
      <div className='bg-white border-t border-gray-200 p-2'>
        {imagePreview && (
          <div className='mb-2 relative inline-block'>
            <img
              src={imagePreview}
              alt='Preview'
              className='max-w-[150px] h-auto rounded-lg border border-gray-300'
              style={{ maxHeight: '100px', objectFit: 'cover' }}
            />
            <button
              onClick={handleRemoveImage}
              className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5'
            >
              <X className='w-3 h-3' />
            </button>
          </div>
        )}

        <div className='flex items-center space-x-2'>
          <div className='flex-1 relative'>
            <input
              ref={inputRef}
              type='text'
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? 'Nhập tin nhắn...' : 'Đang kết nối...'}
              disabled={!isConnected || isUploadingImage}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400'
            />
          </div>

          <div className='flex items-center space-x-1'>
            <div className='relative'>
              <input
                type='file'
                accept='image/*'
                onChange={handleImageSelect}
                className='hidden'
                id={`image-upload-${groupChatId}`}
              />
              <label
                htmlFor={`image-upload-${groupChatId}`}
                className='p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer'
              >
                <ImagePlus className='w-4 h-4' />
              </label>
            </div>

            <div className='relative'>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className='p-1.5 text-gray-400 hover:text-gray-600'
              >
                <Smile className='w-4 h-4' />
              </button>
              {showEmojiPicker && (
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  isVisible={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>

            <button
              onClick={handleSendMessage}
              disabled={(!messageInput.trim() && !selectedImage) || !isConnected || isUploadingImage}
              className='p-1.5 bg-gradient-to-r from-cyan-400 to-blue-300 text-white rounded-full hover:from-cyan-500 hover:to-blue-400 disabled:opacity-50'
            >
              {isUploadingImage ? <Loader2 className='w-4 h-4 animate-spin' /> : <Send className='w-4 h-4' />}
            </button>
          </div>
        </div>
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

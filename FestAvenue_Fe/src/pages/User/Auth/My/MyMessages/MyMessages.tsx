import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'
import {
  Send,
  MessageCircle,
  Smile,
  Search,
  Wifi,
  WifiOff,
  ImagePlus,
  X,
  Edit2,
  Trash2,
  Check,
  Settings,
  UserPlus,
  UserMinus,
  Loader2,
  Users,
  MoreHorizontal,
  Clapperboard
} from 'lucide-react'
import { gsap } from 'gsap'
import * as signalR from '@microsoft/signalr'
import { useUsersStore } from '@/contexts/app.context'
import { getAccessTokenFromLS } from '@/utils/auth'
import userApi from '@/apis/user.api'
import chatApi from '@/apis/chat.api'
import { formatTime, generateNameId } from '@/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader } from '@/components/ui/dialog'
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
  MessageError,
  EventGroup,
  MessagesMarkedAsRead,
  MessageReadByUser,
  resChatMessage,
  resChatPaging
} from '@/types/ChatMessage.types'
import type { MemberAddGroup } from '@/types/GroupChat.types'
import { EmojiPicker } from '@/utils/helper'
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
interface MessageReadEntry {
  userId: string
  userName: string
  readAt: string
}

type GifsResult = Awaited<ReturnType<GiphyFetch['trending']>>

const buildEmptyGifResult = (offset = 0): GifsResult =>
  ({
    data: [],
    pagination: { count: 0, offset, total_count: 0 },
    meta: { status: 200, msg: 'missing giphy api key', response_id: 'local' }
  } as GifsResult)

const MESSAGE_PAGE_SIZE = 20
const IMAGE_REGEX = /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i
const INITIAL_MEMBER_ROW: MemberAddGroup = { name: '', email: '', phone: '' }

const isImageUrl = (value: string) => {
  if (!value?.startsWith('http')) return false
  // Loại bỏ query parameters trước khi kiểm tra extension
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

export default function ChatMyMessagesSystem() {
  const userProfile = useUsersStore().isProfile
  const queryClient = useQueryClient()

  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false)
  const [gifSearchTerm, setGifSearchTerm] = useState('')
  const [gifGridWidth, setGifGridWidth] = useState(600)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageContent, setEditingMessageContent] = useState('')
  const [messageActionOpenId, setMessageActionOpenId] = useState<string | null>(null)
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([])
  const [unreadCounters, setUnreadCounters] = useState<Record<string, number>>({})
  const [messageReadReceipts, setMessageReadReceipts] = useState<Record<string, MessageReadEntry[]>>({})
  const [isGroupPanelOpen, setIsGroupPanelOpen] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [membersToRemove, setMembersToRemove] = useState<Set<string>>(new Set())
  const [newMembers, setNewMembers] = useState<MemberAddGroup[]>([INITIAL_MEMBER_ROW])
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [managerTab, setManagerTab] = useState<'management' | 'media'>('management')
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)
  const [deletedMessageIds, setDeletedMessageIds] = useState<Record<string, boolean>>({})
  const giphyApiKey = import.meta.env.VITE_GIPHY_API_KEY as string | undefined
  const giphyClient = useMemo(() => {
    if (!giphyApiKey) return null
    return new GiphyFetch(giphyApiKey)
  }, [giphyApiKey])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const chatButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const loadOlderRef = useRef<HTMLDivElement>(null)
  const selectedChatIdRef = useRef<string | null>(null)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const isConnectedRef = useRef(false)
  const selectedChatMembersRef = useRef<EventGroup['members']>([])
  const selectedChatMessagesRef = useRef<Message[]>([])
  const shouldForceScrollRef = useRef(false)

  useEffect(() => {
    selectedChatIdRef.current = selectedChatId
    if (selectedChatId) {
      shouldForceScrollRef.current = true
    }
  }, [selectedChatId])

  useEffect(() => {
    if (!isGroupPanelOpen) {
      setManagerTab('management')
    }
  }, [isGroupPanelOpen])

  useEffect(() => {
    const updateWidth = () => {
      if (typeof window === 'undefined') return
      const base = window.innerWidth || 1024
      setGifGridWidth(Math.max(320, Math.min(base - 120, 1400)))
    }

    updateWidth()
    if (typeof window === 'undefined') return
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const uploadsImagesMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadsStorage(file),
    onSuccess: (data) => data,
    onError: (error) => {
      console.error('Upload error:', error)
      toast.error('Upload ảnh thất bại')
      setIsUploadingImage(false)
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
    if (sidebarRef.current && sidebarVisible) {
      gsap.fromTo(sidebarRef.current, { x: isMobile ? -320 : 0 }, { x: 0, duration: 0.3, ease: 'power2.out' })
    }
  }, [sidebarVisible, isMobile])

  useEffect(() => {
    isConnectedRef.current = isConnected
  }, [isConnected])

  const resolveMemberName = useCallback((userId: string) => {
    const member = selectedChatMembersRef.current.find((m) => m.userId === userId)
    return member?.fullName || member?.email || 'Thành viên'
  }, [])

  const appendReadReceipt = useCallback((messageId: string, entry: MessageReadEntry) => {
    if (!messageId) return
    setMessageReadReceipts((prev) => {
      const existing = prev[messageId] || []
      if (existing.some((item) => item.userId === entry.userId)) return prev
      return {
        ...prev,
        [messageId]: [...existing, entry]
      }
    })
  }, [])

  const applyMarkedAsRead = useCallback(
    (userId: string, timestamp: string) => {
      const lastMessageId = selectedChatMessagesRef.current.at(-1)?.id
      if (!lastMessageId) return
      appendReadReceipt(lastMessageId, {
        userId,
        userName: resolveMemberName(userId),
        readAt: timestamp
      })
    },
    [appendReadReceipt, resolveMemberName]
  )

  const requestMarkMessagesAsRead = useCallback((groupChatId?: string) => {
    const hub = connectionRef.current
    if (!hub || !isConnectedRef.current) return
    const targetId = groupChatId || selectedChatIdRef.current
    if (!targetId) return
    hub.invoke('MarkMessagesAsRead', targetId).catch((error) => console.error('MarkMessagesAsRead error:', error))
  }, [])

  const fetchGifs = useCallback(
    (offset: number) => {
      if (!giphyClient) {
        return Promise.resolve(buildEmptyGifResult(offset))
      }

      const query = gifSearchTerm.trim()
      const baseOptions = { offset, limit: 21, rating: 'pg-13' as const }
      return query ? giphyClient.search(query, { ...baseOptions, sort: 'relevant' }) : giphyClient.trending(baseOptions)
    },
    [giphyClient, gifSearchTerm]
  )

  const sendGifMessage = useCallback(
    async (url: string) => {
      if (!url || !selectedChatId || !userProfile || !connection || !isConnected) {
        toast.error('Không thể gửi GIF ngay bây giờ')
        return
      }

      try {
        await connection.invoke('SendMessage', {
          GroupChatId: selectedChatId,
          Message: url,
          IsUrl: true
        })
        shouldForceScrollRef.current = true
        setIsGifPickerOpen(false)
      } catch (error) {
        console.error('Error sending GIF:', error)
        toast.error('Gửi GIF thất bại')
      }
    },
    [connection, isConnected, selectedChatId, userProfile]
  )

  const handleGifClick = useCallback(
    (gif: any, e: React.SyntheticEvent) => {
      e.preventDefault()
      const gifUrl =
        gif?.images?.original?.url ||
        gif?.images?.downsized_large?.url ||
        gif?.images?.downsized?.url ||
        gif?.images?.preview_gif?.url

      if (!gifUrl) {
        toast.warning('GIF này không khả dụng để gửi')
        return
      }

      sendGifMessage(gifUrl)
    },
    [sendGifMessage]
  )

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
            accessTokenFactory: () => {
              const currentToken = getAccessTokenFromLS()
              return currentToken || ''
            }
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

            if (replaced) {
              return updated
            }

            return [...updated, normalized]
          })

          if (selectedChatIdRef.current === data.groupChatId) {
            requestMarkMessagesAsRead(data.groupChatId)
            setUnreadCounters((prev) => ({ ...prev, [data.groupChatId]: 0 }))
          } else {
            setUnreadCounters((prev) => ({ ...prev, [data.groupChatId]: (prev[data.groupChatId] || 0) + 1 }))
          }

          queryClient.invalidateQueries({ queryKey: ['chat-messages', data.groupChatId] })
        })

        newConnection.on('MessageSentResult', (result: { success: boolean; error?: string }) => {
          if (!result) {
            toast.error('Gửi tin nhắn thất bại')
          }
        })

        newConnection.on('MessageUpdated', (data: MessageUpdated) => {

          queryClient.setQueryData<InfiniteData<resChatPaging>>(['chat-messages', data.groupChatId], (cached) => {
            if (!cached) return cached
            return {
              ...cached,
              pages: cached.pages.map((page) => ({
                ...page,
                chatMessages: page.chatMessages.map((msg) =>
                  msg.id === data.messageId ? { ...msg, message: data.newContent, updatedAt: data.updatedAt } : msg
                )
              }))
            }
          })

          setRealtimeMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.messageId
                ? { ...msg, message: data.newContent, createdAt: parseMessageDate(data.updatedAt || msg.createdAt) }
                : msg
            )
          )
        })

        newConnection.on('MessageDeleted', (data: MessageDeleted) => {

          queryClient.setQueryData<InfiniteData<resChatPaging>>(['chat-messages', data.groupChatId], (cached) => {
            if (!cached) return cached
            return {
              ...cached,
              pages: cached.pages.map((page) => ({
                ...page,
                chatMessages: page.chatMessages.filter((msg) => msg.id !== data.messageId)
              }))
            }
          })
          setDeletedMessageIds((prev) => ({ ...prev, [data.messageId]: true }))
          setRealtimeMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
        })

        newConnection.on('MessagesMarkedAsRead', (data: MessagesMarkedAsRead) => {

          setUnreadCounters((prev) => ({ ...prev, [data.groupChatId]: 0 }))
          if (data.groupChatId === selectedChatIdRef.current && data.userId !== userProfile?.id) {
            applyMarkedAsRead(data.userId, data.markedAt)
          }
        })

        newConnection.on('MessageReadByUser', (data: MessageReadByUser) => {

          if (data.userId === userProfile?.id) return
          appendReadReceipt(data.messageId, {
            userId: data.userId,
            userName: data.userName || resolveMemberName(data.userId),
            readAt: data.readAt
          })
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
          if (selectedChatIdRef.current) {
            newConnection.invoke('JoinChatGroup', selectedChatIdRef.current).catch((error) => console.error(error))
            requestMarkMessagesAsRead(selectedChatIdRef.current)
          }
        })

        await newConnection.start()
        activeConnection = newConnection
        connectionRef.current = newConnection
        setConnection(newConnection)
        setIsConnected(true)
      } catch (error) {
        console.error('SignalR connection error:', error)
      }
    }

    initConnection()

    return () => {
      if (activeConnection) {
        activeConnection.off('NewMessageReceived')
        activeConnection.off('MessageSentResult')
        activeConnection.off('MessageUpdated')
        activeConnection.off('MessageDeleted')
        activeConnection.off('MessagesMarkedAsRead')
        activeConnection.off('MessageReadByUser')
        activeConnection.off('MessageError')
        activeConnection.stop()
        if (connectionRef.current === activeConnection) {
          connectionRef.current = null
        }
      }
    }
  }, [queryClient, userProfile?.id])

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
    const chats = (groupChatsData as EventGroup[] | undefined) ?? []
    if (!searchTerm.trim()) return chats
    return chats.filter((chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [groupChatsData, searchTerm])

  const selectedChat = useMemo(() => {
    return filteredChats?.find((chat) => chat.id === selectedChatId)
  }, [filteredChats, selectedChatId])

  useEffect(() => {
    selectedChatMembersRef.current = selectedChat?.members || []
  }, [selectedChat?.members])

  const {
    data: pagedMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages
  } = useInfiniteQuery<resChatPaging>({
    queryKey: ['chat-messages', selectedChatId],
    queryFn: async ({ pageParam }) => {
      if (!selectedChatId) throw new Error('Missing group chat id')
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

  const {
    data: mediaPages,
    fetchNextPage: fetchNextMediaPage,
    hasNextPage: hasMoreMedia,
    isFetchingNextPage: isFetchingMoreMedia,
    isLoading: isLoadingMedia
  } = useInfiniteQuery<resChatPaging>({
    queryKey: ['chat-messages', selectedChatId, 'media-gallery'],
    queryFn: async ({ pageParam }) => {
      if (!selectedChatId) throw new Error('Missing group chat id')
      const currentPage = typeof pageParam === 'number' ? pageParam : 1
      const response = await chatApi.ChatMessage.getMessagesWithPagging({
        groupChatId: selectedChatId,
        page: currentPage,
        pageSize: MESSAGE_PAGE_SIZE,
        isUrl: true
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

  const mediaMessages = mediaPages?.pages.flatMap((page: resChatPaging) => page.chatMessages ?? []) ?? []

  const normalizedHistory = useMemo(() => {
    return historyMessages.map((message) => buildHistoryMessage(message, userProfile?.id))
  }, [historyMessages, userProfile?.id])

  const mediaGallery = useMemo(() => {
    return mediaMessages
      .map((message) => buildHistoryMessage(message, userProfile?.id))
      .filter((message) => !deletedMessageIds[message.id])
  }, [mediaMessages, userProfile?.id, deletedMessageIds])

  const effectiveGifWidth = Math.min(gifGridWidth, 400)
  const gifGridColumns = effectiveGifWidth < 520 ? 2 : effectiveGifWidth < 800 ? 3 : effectiveGifWidth < 1100 ? 4 : 5

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

    return Array.from(dedup.values())
      .filter((message) => !deletedMessageIds[message.id])
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }, [normalizedHistory, realtimeMessages, selectedChatId, deletedMessageIds])

  useEffect(() => {
    if (!selectedChatId) return
    setRealtimeMessages([])
    setMessageReadReceipts({})
    setMembersToRemove(new Set())
    setNewMembers([INITIAL_MEMBER_ROW])
    setMemberSearch('')
    setUnreadCounters((prev) => ({ ...prev, [selectedChatId]: 0 }))
    requestMarkMessagesAsRead(selectedChatId)
    setDeletedMessageIds({})
  }, [requestMarkMessagesAsRead, selectedChatId])

  useEffect(() => {
    if (!isGifPickerOpen) {
      setGifSearchTerm('')
    }
  }, [isGifPickerOpen])

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

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120
      setIsNearBottom(nearBottom)
      if (nearBottom && selectedChatId) {
        requestMarkMessagesAsRead(selectedChatId)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [requestMarkMessagesAsRead, selectedChatId])

  useEffect(() => {
    if (selectedChatId && connection && isConnected) {
      connection.invoke('JoinChatGroup', selectedChatId).catch((error) => console.error(error))
    }
  }, [connection, isConnected, selectedChatId])

  const handleChatSelect = (chat: EventGroup) => {
    setSelectedChatId(chat.id)
    generateNameId({ name: chat.name, id: chat.id })
    if (isMobile) {
      setSidebarVisible(false)
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
        messageContent = (uploadResult.data || uploadResult) as any
        isUrl = true
      }

      const messageData = {
        GroupChatId: selectedChatId,
        Message: messageContent,
        IsUrl: isUrl
      }

      await connection.invoke('SendMessage', messageData)
      shouldForceScrollRef.current = true
      setMessageInput('')
      setSelectedImage(null)
      setImagePreview(null)
      setIsUploadingImage(false)
    } catch (error: any) {
      console.error('Error handling message send:', error)
      setIsUploadingImage(false)
      toast.error(`Gửi tin nhắn thất bại: ${error?.message || error?.toString() || 'Unknown error'}`)
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

  const handleMemberCheckbox = (memberId: string) => {
    setMembersToRemove((prev) => {
      const updated = new Set(prev)
      if (updated.has(memberId)) {
        updated.delete(memberId)
      } else {
        updated.add(memberId)
      }
      return updated
    })
  }

  const handleAddMemberRow = () => {
    setNewMembers((prev) => [...prev, { ...INITIAL_MEMBER_ROW }])
  }

  const handleRemoveMemberRow = (index: number) => {
    setNewMembers((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index)))
  }

  const handleNewMemberChange = (index: number, field: keyof MemberAddGroup, value: string) => {
    setNewMembers((prev) => prev.map((member, idx) => (idx === index ? { ...member, [field]: value } : member)))
  }

  const addMembersMutation = useMutation({
    mutationFn: (body: { groupChatId: string; informationNewMembers: MemberAddGroup[] }) =>
      chatApi.GroupChat.addMemberInGroup(body),
    onSuccess: () => {
      toast.success('Đã thêm thành viên mới')
      setNewMembers([INITIAL_MEMBER_ROW])
      queryClient.invalidateQueries({ queryKey: ['group-chats'] })
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Không thể thêm thành viên')
    }
  })

  const removeMembersMutation = useMutation({
    mutationFn: (body: { groupChatId: string; memberIds: string[] }) => chatApi.GroupChat.removeMemberInGroup(body),
    onSuccess: () => {
      toast.success('Đã cập nhật thành viên nhóm')
      setMembersToRemove(new Set())
      queryClient.invalidateQueries({ queryKey: ['group-chats'] })
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Không thể cập nhật thành viên')
    }
  })

  const handleSubmitNewMembers = () => {
    if (!selectedChatId) return
    const sanitized = newMembers.filter((member) => member.email && member.name)
    if (!sanitized.length) {
      toast.warning('Vui lòng nhập đầy đủ thông tin thành viên mới')
      return
    }
    addMembersMutation.mutate({ groupChatId: selectedChatId, informationNewMembers: sanitized })
  }

  const handleRemoveMembers = () => {
    if (!selectedChatId || membersToRemove.size === 0) return
    removeMembersMutation.mutate({ groupChatId: selectedChatId, memberIds: Array.from(membersToRemove) })
  }

  const handleLeaveGroup = () => {
    if (!selectedChatId || !userProfile?.id) return
    removeMembersMutation.mutate({ groupChatId: selectedChatId, memberIds: [userProfile.id] })
    setSelectedChatId(null)
  }

  const filteredMembers = useMemo(() => {
    const members = selectedChat?.members || []
    if (!memberSearch.trim()) return members
    const keyword = memberSearch.toLowerCase()
    return members.filter(
      (member) =>
        member.fullName?.toLowerCase().includes(keyword) ||
        member.email?.toLowerCase().includes(keyword) ||
        member.userId.toLowerCase().includes(keyword)
    )
  }, [memberSearch, selectedChat?.members])

  const selectedChatMessages = combinedMessages.filter((msg) => msg.groupChatId === selectedChatId)

  useEffect(() => {
    selectedChatMessagesRef.current = selectedChatMessages
  }, [selectedChatMessages])

  useEffect(() => {
    if (!selectedChatId || !selectedChatMessages.length) return
    const container = chatContainerRef.current
    if (!container) return

    if (isNearBottom || shouldForceScrollRef.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: shouldForceScrollRef.current || selectedChatMessages.length < 5 ? 'auto' : 'smooth'
      })
      shouldForceScrollRef.current = false
    }
  }, [selectedChatId, selectedChatMessages, isNearBottom])

  const renderMessageContent = (message: Message) => {
    if (editingMessageId === message.id) {
      return (
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

    return <p className='text-sm leading-relaxed whitespace-pre-wrap'>{message.message}</p>
  }

  const renderReadReceipt = (message: Message) => {
    if (!message.isCurrentUser) return null
    const readers = (messageReadReceipts[message.id] || []).filter((reader) => reader.userId !== userProfile?.id)
    if (!readers.length) return <span className='text-[10px] text-gray-400'>Đã gửi</span>
    return (
      <div className='flex items-center justify-end text-[10px] text-gray-500 gap-1'>
        <Check className='w-3 h-3' />
        <span>{`Các thành viên khác đã đọc`}</span>
      </div>
    )
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

      {sidebarVisible && (
        <div
          ref={sidebarRef}
          className='w-80 min-w-80 bg-white border-r border-gray-200 flex flex-col absolute md:relative z-20 h-full'
        >
          <div className='p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-400 to-blue-300'>
            <h1 className='text-xl font-bold text-white mb-4'>Nhóm tin nhắn của tôi</h1>
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

          <div className='flex-1 overflow-y-auto'>
            {isLoadingChats ? (
              <div className='flex items-center justify-center h-32'>
                <div className='animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full'></div>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const unread = unreadCounters[chat.id] || 0
                return (
                  <button
                    key={chat.id}
                    ref={(el) => {
                      if (el) {
                        chatButtonRefs.current.set(chat.id, el)
                      }
                    }}
                    onClick={() => handleChatSelect(chat)}
                    className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                      selectedChatId === chat.id
                        ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-400'
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
                        <div className='flex items-center justify-between mt-1'>
                          <p className='text-sm text-gray-600 truncate'>{chat.members.length} thành viên</p>
                          {unread > 0 && (
                            <span className='text-xs bg-red-500 text-white rounded-full px-2 py-0.5'>{unread}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      <div className='flex-1 flex flex-col h-full'>
        {selectedChat ? (
          <>
            <div className='bg-white border-b border-gray-200 p-4 shadow-sm flex items-center justify-between'>
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
              <Button variant='ghost' size='icon' onClick={() => setIsGroupPanelOpen(true)}>
                <Settings className='w-5 h-5' />
              </Button>
            </div>

            <div ref={chatContainerRef} className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
              <div ref={loadOlderRef} className='h-1'></div>
              {isFetchingNextPage && hasNextPage && (
                <div className='flex justify-center py-2 text-xs text-gray-400'>Đang tải tin nhắn cũ...</div>
              )}

              {isLoadingMessages ? (
                <div className='flex items-center justify-center h-32'>
                  <div className='animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full'></div>
                </div>
              ) : (
                selectedChatMessages.map((message) => (
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
                                className='p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200 shadow-sm bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                              >
                                <MoreHorizontal className='w-4 h-4' />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align='end' className='w-40 p-2 space-y-1 text-sm'>
                              {!message.isUrl && (
                                <button
                                  type='button'
                                  onClick={() => {
                                    handleEditMessage(message)
                                    setMessageActionOpenId(null)
                                  }}
                                  className='flex w-full items-center gap-2 px-2 py-1 rounded hover:bg-slate-100 text-left'
                                >
                                  <Edit2 className='w-3.5 h-3.5' />
                                  Chỉnh sửa
                                </button>
                              )}
                              <button
                                type='button'
                                onClick={() => {
                                  handleDeleteMessage(message)
                                  setMessageActionOpenId(null)
                                }}
                                className='flex w-full items-center gap-2 px-2 py-1 rounded text-red-600 hover:bg-red-50 text-left'
                              >
                                <Trash2 className='w-3.5 h-3.5' />
                                Xóa
                              </button>
                            </PopoverContent>
                          </Popover>
                        )}

                        <div
                          className={`px-4 py-2 rounded-lg max-w-full break-words ${
                            message.isCurrentUser
                              ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                          }`}
                        >
                          {renderMessageContent(message)}
                        </div>
                      </div>
                      <div className='mt-1'>{renderReadReceipt(message)}</div>
                    </div>
                  </div>
                ))
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className='bg-white border-t border-gray-200 p-4'>
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
                        : 'Connecting...'
                    }
                    disabled={!isConnected || isUploadingImage}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all'
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <div className='relative'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageSelect}
                      className='hidden'
                      id='image-upload'
                    />
                    <label
                      htmlFor='image-upload'
                      className='p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
                    >
                      <ImagePlus className='w-5 h-5' />
                    </label>
                  </div>

                  <button
                    type='button'
                    onClick={() => setIsGifPickerOpen(true)}
                    className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                    title={
                      giphyApiKey ? 'Chèn GIF từ GIPHY' : 'Thêm biến môi trường VITE_GIPHY_API_KEY để bật thư viện GIF'
                    }
                  >
                    <Clapperboard className='w-5 h-5' />
                  </button>

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

            <Dialog open={isGifPickerOpen} onOpenChange={setIsGifPickerOpen}>
              <DialogContent className='max-w-5xl w-full'>
                <DialogHeader>
                  <DialogDescription>
                    Tìm kiếm hoặc chọn nhanh các ảnh động từ thư viện GIPHY để gửi cho nhóm.
                  </DialogDescription>
                </DialogHeader>

                {giphyApiKey ? (
                  <div className='space-y-4'>
                    <Input
                      value={gifSearchTerm}
                      onChange={(e) => setGifSearchTerm(e.target.value)}
                      placeholder='Nhập từ khóa (ví dụ: smile, happy, congrats, ... )'
                    />
                    <div className='rounded-lg border border-slate-200 bg-slate-50/70 p-4 max-h-[70vh] overflow-y-auto'>
                      <div className='flex justify-center w-full'>
                        <Grid
                          key={gifSearchTerm || 'trending'}
                          width={effectiveGifWidth}
                          columns={gifGridColumns}
                          gutter={8}
                          fetchGifs={fetchGifs}
                          onGifClick={handleGifClick}
                        />
                      </div>
                    </div>
                    <p className='text-[11px] text-gray-400 text-center'>Powered by GIPHY</p>
                  </div>
                ) : (
                  <div className='rounded-lg border border-dashed border-yellow-300 bg-yellow-50/70 p-4 text-sm text-yellow-900'>
                    <p>Có lỗi khi tải Gif </p>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Sheet open={isGroupPanelOpen} onOpenChange={setIsGroupPanelOpen}>
              <SheetContent side='right' className='w-full sm:max-w-lg overflow-y-auto p-6'>
                <SheetHeader>
                  <SheetTitle>Quản lý nhóm</SheetTitle>
                  <SheetDescription>
                    Thêm thành viên, rời nhóm hoặc xem nhanh hình ảnh đã chia sẻ. Giữ mọi thứ gọn gàng và rõ ràng hơn.
                  </SheetDescription>
                </SheetHeader>

                <div className='mt-4 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-4 shadow-sm'>
                  <p className='text-sm text-gray-600 mb-3'>
                    Một vài số liệu nhanh để bạn kiểm soát nhóm trò chuyện tốt hơn.
                  </p>
                  <div className='grid gap-3 sm:grid-cols-3 text-sm'>
                    <div className='rounded-xl bg-white/90 border border-white/60 p-3 shadow-sm'>
                      <span className='text-[11px] uppercase tracking-wide text-gray-500'>Tổng thành viên</span>
                      <p className='text-2xl font-semibold text-gray-900 mt-1'>{selectedChat?.members.length ?? 0}</p>
                    </div>
                    <div className='rounded-xl bg-white/90 border border-white/60 p-3 shadow-sm'>
                      <span className='text-[11px] uppercase tracking-wide text-gray-500'>Đang chọn gỡ</span>
                      <p className='text-2xl font-semibold text-gray-900 mt-1'>{membersToRemove.size}</p>
                    </div>
                    <div className='rounded-xl bg-white/90 border border-white/60 p-3 shadow-sm'>
                      <span className='text-[11px] uppercase tracking-wide text-gray-500'>Dòng thêm mới</span>
                      <p className='text-2xl font-semibold text-gray-900 mt-1'>{newMembers.length}</p>
                    </div>
                  </div>
                </div>

                <Tabs
                  value={managerTab}
                  onValueChange={(value) => setManagerTab(value as 'management' | 'media')}
                  className='mt-6'
                >
                  <TabsList className='grid grid-cols-2 w-full rounded-xl bg-slate-100 p-1'>
                    <TabsTrigger
                      value='management'
                      className='data-[state=active]:bg-white data-[state=active]:shadow-sm'
                    >
                      Quản lý
                    </TabsTrigger>
                    <TabsTrigger value='media' className='data-[state=active]:bg-white data-[state=active]:shadow-sm'>
                      Hình ảnh
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value='management' className='focus-visible:outline-none'>
                    <div className='pt-6 space-y-6'>
                      <div className='rounded-2xl border border-slate-200 bg-white shadow-sm p-4'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='font-semibold flex items-center gap-2 text-slate-900'>
                            <Users className='w-4 h-4 text-cyan-500' /> Thành viên hiện tại
                          </h3>
                          <Badge variant='secondary' className='text-xs px-3 py-1 rounded-full'>
                            {filteredMembers.length} thành viên phù hợp
                          </Badge>
                        </div>
                        <p className='text-xs text-gray-500 mb-4'>
                          Chọn thành viên cần gỡ bằng cách nhấn vào checkbox bên phải.
                        </p>
                        <Input
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          placeholder='Tìm theo tên, email hoặc ID'
                          className='mb-3 focus-visible:ring-cyan-400'
                        />
                        <div className='max-h-64 overflow-y-auto space-y-2 pr-1'>
                          {filteredMembers.map((member) => (
                            <label
                              key={member.userId}
                              className='flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 transition hover:border-cyan-200 cursor-pointer'
                            >
                              <div>
                                <p className='text-sm font-medium text-slate-900'>{member.fullName || member.email}</p>
                                <p className='text-xs text-gray-500'>{member.email}</p>
                              </div>
                              <input
                                type='checkbox'
                                checked={membersToRemove.has(member.userId)}
                                onChange={() => handleMemberCheckbox(member.userId)}
                                className='h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-400'
                              />
                            </label>
                          ))}
                          {!filteredMembers.length && (
                            <p className='text-xs text-gray-400 text-center py-6'>Không có thành viên phù hợp</p>
                          )}
                        </div>
                        <div className='flex flex-wrap gap-2 mt-4'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={handleRemoveMembers}
                            disabled={!membersToRemove.size || removeMembersMutation.isPending}
                            className='flex-1 min-w-[140px]'
                          >
                            {removeMembersMutation.isPending ? (
                              <Loader2 className='w-4 h-4 animate-spin' />
                            ) : (
                              <>
                                <UserMinus className='w-4 h-4 mr-2' /> Gỡ thành viên
                              </>
                            )}
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={handleLeaveGroup}
                            disabled={removeMembersMutation.isPending}
                            className='flex-1 min-w-[120px]'
                          >
                            Rời nhóm
                          </Button>
                        </div>
                      </div>

                      <div className='rounded-2xl border border-slate-200 bg-white shadow-sm p-4'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='font-semibold flex items-center gap-2 text-slate-900'>
                            <UserPlus className='w-4 h-4 text-cyan-500' /> Thêm thành viên mới
                          </h3>
                          <Badge variant='outline' className='text-xs px-3 py-1 rounded-full'>
                            {newMembers.length} dòng đang nhập
                          </Badge>
                        </div>
                        <p className='text-xs text-gray-500 mb-4'>
                          Điền thông tin cơ bản cho từng thành viên bạn muốn mời.
                        </p>
                        <div className='space-y-3'>
                          {newMembers.map((member, index) => (
                            <div
                              key={`member-${index}`}
                              className='grid grid-cols-1 gap-2 border border-dashed border-cyan-200 p-3 rounded-2xl bg-cyan-50/40'
                            >
                              <Input
                                value={member.name}
                                onChange={(e) => handleNewMemberChange(index, 'name', e.target.value)}
                                placeholder='Họ và tên'
                                className='bg-white'
                              />
                              <Input
                                value={member.email}
                                onChange={(e) => handleNewMemberChange(index, 'email', e.target.value)}
                                placeholder='Email'
                                type='email'
                                className='bg-white'
                              />
                              <Input
                                value={member.phone}
                                onChange={(e) => handleNewMemberChange(index, 'phone', e.target.value)}
                                placeholder='Số điện thoại (tuỳ chọn)'
                                className='bg-white'
                              />
                              {newMembers.length > 1 && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='justify-start text-red-500'
                                  onClick={() => handleRemoveMemberRow(index)}
                                >
                                  Xoá dòng này
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className='flex flex-wrap gap-2 mt-4'>
                          <Button
                            variant='secondary'
                            size='sm'
                            onClick={handleAddMemberRow}
                            className='flex-1 min-w-[130px]'
                          >
                            Thêm dòng
                          </Button>
                          <Button
                            size='sm'
                            onClick={handleSubmitNewMembers}
                            disabled={addMembersMutation.isPending}
                            className='flex-1 min-w-[130px]'
                          >
                            {addMembersMutation.isPending ? (
                              <Loader2 className='w-4 h-4 animate-spin' />
                            ) : (
                              'Thêm thành viên'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='media' className='focus-visible:outline-none'>
                    <div className='pt-6 space-y-4'>
                      <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
                        <h3 className='font-semibold text-slate-900 mb-1'>Thư viện hình ảnh</h3>
                        <p className='text-xs text-gray-500'>
                          Những hình ảnh đã chia sẻ gần đây trong nhóm sẽ hiển thị tại đây.
                        </p>
                      </div>
                      {isLoadingMedia ? (
                        <div className='flex items-center justify-center py-10'>
                          <div className='w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin' />
                        </div>
                      ) : mediaGallery.length ? (
                        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                          {mediaGallery.map((media) => (
                            <div
                              key={media.id}
                              className='border rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition'
                            >
                              <img
                                src={media.message}
                                alt={media.senderName}
                                className='w-full h-32 object-cover'
                                loading='lazy'
                              />
                              <div className='p-2 text-[11px] text-gray-600 flex items-center justify-between gap-2'>
                                <span className='truncate font-medium'>{media.senderName}</span>
                                <span>{formatTime(media.createdAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-sm text-gray-500 text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50'>
                          Chưa có hình ảnh nào trong nhóm.
                        </div>
                      )}

                      {hasMoreMedia && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => fetchNextMediaPage()}
                          disabled={isFetchingMoreMedia}
                        >
                          {isFetchingMoreMedia ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Tải thêm ảnh'}
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center bg-gray-50'>
            <div className='text-center'>
              <MessageCircle className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-600 mb-2'>Chọn một cuộc trò chuyện để bắt đầu nhắn tin</h3>
              <p className='text-gray-500'>Chọn một cuộc trò chuyện từ thanh bên để bắt đầu</p>
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá tin nhắn?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.message ? (
                <span>
                  Bạn có chắc chắn muốn xoá tin nhắn "{deleteTarget.message}"? Thao tác này không thể hoàn tác.
                </span>
              ) : (
                'Bạn có chắc chắn muốn xoá tin nhắn này? Thao tác này không thể hoàn tác.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)} disabled={isDeletingMessage}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMessage} disabled={isDeletingMessage}>
              {isDeletingMessage ? 'Đang xoá...' : 'Xoá'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

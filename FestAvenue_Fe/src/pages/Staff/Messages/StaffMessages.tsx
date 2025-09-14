/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query'
import { Send, MessageCircle, Search, Wifi, WifiOff, ImagePlus, X, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { gsap } from 'gsap'
import * as signalR from '@microsoft/signalr'
import { useUsersStore } from '@/contexts/app.context'
import { getAccessTokenFromLS } from '@/utils/auth'
import userApi from '@/apis/user.api'
import organizationApi from '@/apis/organization.api'
import { formatTime, generateNameId } from '@/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { SignalRMessage, ChatMessage, ChatMessagesResponse } from '@/types/chat.types'
import { toast } from 'sonner'

export default function StaffMessages() {
  const userProfile = useUsersStore().isProfile

  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeMessages, setRealtimeMessages] = useState<SignalRMessage[]>([])

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [click, setClick] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const loadPreviousRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const animatedMessages = useRef<Set<string>>(new Set())
  const lastMessageCount = useRef<number>(0)
  const shouldAutoScroll = useRef<boolean>(true)
  const isInitialLoad = useRef<boolean>(true)

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

  const updateGroupChatStatusAcceptedMutation = useMutation({
    mutationFn: organizationApi.updateGroupChatStatusAccepted,
    onSuccess: () => {
      toast.success('Đã chấp nhận yêu cầu thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Không thể chấp nhận yêu cầu')
    }
  })

  const updateGroupChatStatusRejectedMutation = useMutation({
    mutationFn: organizationApi.updateGroupChatStatusRejected,
    onSuccess: () => {
      toast.success('Đã từ chối yêu cầu thành công!')
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Không thể từ chối yêu cầu')
    }
  })

  const deletedGroupChatOrganizationMutation = useMutation({
    mutationFn: (groupChatId: string) => userApi.deletedGroupChatOrganization(groupChatId),
    onSuccess: () => {
      toast.success('Đã xóa group chat thành công!')
      setSelectedChatId(null)
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Không thể xóa group chat')
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

  // SignalR Connection - same as MyMessages
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
          .withUrl('https://hoalacrent.io.vn/chathub', {
            accessTokenFactory: () => token
          })
          .configureLogging(signalR.LogLevel.Information)
          .build()

        newConnection.on('ReceiveGroupMessage', (response: any) => {
          const newMessage: SignalRMessage = {
            id: response.id || `signalr-${Date.now()}-${Math.random()}`,
            groupChatId: response.groupChatId,
            senderId: response.senderId,
            message: response.message,
            senderName: response.senderName || 'Unknown',
            avatar: response.avatar,
            sentAt: new Date(response.sentAt || new Date()),
            isCurrentUser: response.senderId === userProfile?.id
          }

          // Enhanced duplicate detection for images
          setRealtimeMessages((prev) => {
            const isImageMessage =
              newMessage.message.startsWith('http') &&
              (newMessage.message.includes('.jpg') ||
                newMessage.message.includes('.png') ||
                newMessage.message.includes('.jpeg') ||
                newMessage.message.includes('.gif') ||
                newMessage.message.includes('.webp'))

            const exists = prev.some((msg) => {
              const isSameUser = msg.senderId === newMessage.senderId
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

        newConnection.onclose(() => {
          setIsConnected(false)
        })

        newConnection.onreconnecting(() => {
          setIsConnected(false)
        })

        newConnection.onreconnected(() => {
          setIsConnected(true)
        })

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
        connection.off('ReceiveGroupMessage')
        connection.stop()
      }
    }
  }, [userProfile?.id])

  const { data: groupChatsData, isLoading: isLoadingChats } = useQuery({
    queryKey: ['group-chats'],
    queryFn: userApi.getGroupChats,
    staleTime: 5 * 60 * 1000
  })

  const filteredChats = useMemo(() => {
    if (!groupChatsData?.data || !searchTerm) return groupChatsData?.data || []
    return groupChatsData.data.filter((chat) => chat.groupChatName.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [groupChatsData, searchTerm])

  const selectedChat = useMemo(() => {
    return groupChatsData?.data?.find((chat) => chat.groupChatId === selectedChatId)
  }, [groupChatsData, selectedChatId])

  // Fetch initial data to get totalPages
  useEffect(() => {
    async function fetchInitialData() {
      if (selectedChatId) {
        try {
          const response = (await userApi.getChatMessagesWithPagging({
            groupChatId: selectedChatId,
            pageSize: 20,
            page: 1
          })) as any
          setTotalPages(response.data.totalPages)
        } catch (error) {
          console.error('Error fetching initial chat data:', error)
        }
      }
    }

    if (selectedChatId) {
      fetchInitialData()
    }
  }, [selectedChatId])

  const {
    data: chatData,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isLoading: isLoadingMessages
  } = useInfiniteQuery({
    queryKey: ['chat-messages', selectedChatId, totalPages],
    queryFn: async ({ pageParam = Number(totalPages) }) => {
      if (!selectedChatId) throw new Error('No chat selected')

      const res = (await userApi.getChatMessagesWithPagging({
        groupChatId: selectedChatId,
        pageSize: 10,
        page: pageParam
      })) as any
      return res.data as ChatMessagesResponse
    },
    getPreviousPageParam: (firstPage: ChatMessagesResponse) => {
      if (click && firstPage.currentPage < firstPage.totalPages) {
        return firstPage.currentPage + 1
      }
      return undefined
    },
    getNextPageParam: () => undefined,
    initialPageParam: 1,
    enabled: !!selectedChatId && !!totalPages,
    staleTime: 5 * 60 * 1000,
    select: (data) => ({
      pages: [...data.pages],
      pageParams: [...data.pageParams]
    })
  })

  const allMessages = useMemo(() => {
    const fetchedMessages = chatData?.pages?.flatMap((page: ChatMessagesResponse) => page?.chatMessages) ?? []
    const currentChatRealtimeMessages = realtimeMessages.filter((msg) => msg.groupChatId === selectedChatId)

    // Convert realtime messages to ChatMessage format
    const convertedRealtimeMessages: ChatMessage[] = currentChatRealtimeMessages.map((msg) => ({
      id: msg.id || `temp-${Date.now()}-${Math.random()}`,
      groupChatId: msg.groupChatId,
      senderId: msg.senderId,
      senderName: msg.senderName,
      avatar: msg.avatar || '',
      message: msg.message,
      createdAt: msg.sentAt.toISOString(),
      createAtNumbers: msg.sentAt.getTime(),
      updatedAt: null,
      updateAtNumbers: null
    }))

    // Combine and remove duplicates based on message content, sender and timestamp
    const allMessages = [...fetchedMessages, ...convertedRealtimeMessages]
    const uniqueMessages = allMessages.reduce((acc: ChatMessage[], current) => {
      const duplicate = acc.find(
        (msg) =>
          msg.message === current.message &&
          msg.senderId === current.senderId &&
          Math.abs(new Date(msg.createdAt).getTime() - new Date(current.createdAt).getTime()) < 5000 // 5 seconds tolerance
      )
      if (!duplicate) {
        acc.push(current)
      }
      return acc
    }, [])

    return uniqueMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [chatData, realtimeMessages, selectedChatId])

  // Staff action handlers
  const handleAcceptRequest = (groupChatId: string) => {
    updateGroupChatStatusAcceptedMutation.mutate(groupChatId)
  }

  const handleRejectRequest = (groupChatId: string) => {
    updateGroupChatStatusRejectedMutation.mutate(groupChatId)
  }

  const handleDeleteGroupChat = (groupChatId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa group chat này?')) {
      deletedGroupChatOrganizationMutation.mutate(groupChatId)
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

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      message: string
      senderId: string
      senderName: string
      avatar: string | null
      groupChatId: string
      isImage?: boolean
    }) => {
      if (!connection || !isConnected) {
        throw new Error('SignalR connection not established')
      }

      return connection.invoke('SendMessage', messageData)
    },
    onSuccess: () => {
      setMessageInput('')
      setSelectedImage(null)
      setImagePreview(null)
      setIsUploadingImage(false)
    },
    onError: (error) => {
      console.error('Error sending message:', error)
      setIsUploadingImage(false)
    }
  })

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !selectedChatId || !userProfile) return

    try {
      let imageUrl = null
      let currentAvatar = userProfile.avatar

      if (selectedImage) {
        setIsUploadingImage(true)
        const uploadResult = await uploadsImagesMutation.mutateAsync(selectedImage)
        imageUrl = uploadResult.data || uploadResult

        if (imageUrl && !userProfile.avatar) {
          currentAvatar = imageUrl as any
        }
      }

      const messageData = {
        message: selectedImage ? imageUrl || 'Image' : messageInput.trim(),
        senderId: userProfile.id,
        senderName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        avatar: currentAvatar,
        groupChatId: selectedChatId,
        isImage: !!selectedImage
      }

      sendMessageMutation.mutate(messageData as any)
    } catch (error) {
      console.error('Error handling message send:', error)
      setIsUploadingImage(false)
      toast.error('Gửi tin nhắn thất bại')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasPreviousPage && !isFetchingPreviousPage) {
        const currentScrollHeight = chatContainerRef.current?.scrollHeight || 0
        fetchPreviousPage().then(() => {
          requestAnimationFrame(() => {
            if (chatContainerRef.current) {
              const newScrollHeight = chatContainerRef.current.scrollHeight
              chatContainerRef.current.scrollTop = newScrollHeight - currentScrollHeight
            }
          })
        })
      }
    },
    [fetchPreviousPage, hasPreviousPage, isFetchingPreviousPage]
  )

  useEffect(() => {
    const element = loadPreviousRef.current
    if (element && selectedChatId) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        threshold: 0.5,
        rootMargin: '50px'
      })
      observerRef.current.observe(element)
    }
    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [handleObserver, selectedChatId])

  // Handle scroll behavior - simplified and more reliable auto-scrolling
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container || !messagesEndRef.current || isFetchingPreviousPage) return

    // Check if this is a new message (not just a re-render)
    const currentMessageCount = allMessages.length
    const isNewMessage = currentMessageCount > lastMessageCount.current
    lastMessageCount.current = currentMessageCount

    // Auto-scroll for new messages when user is near bottom or on initial load
    if ((isNewMessage || isInitialLoad.current) && allMessages.length > 0) {
      const container = chatContainerRef.current
      const isNearBottom = container
        ? container.scrollHeight - container.scrollTop - container.clientHeight < 100
        : true

      // Auto-scroll if user is near bottom, it's initial load, or it's user's own message
      const lastMessage = allMessages[allMessages.length - 1]
      const isOwnMessage = lastMessage?.senderId === userProfile?.id

      if (isInitialLoad.current || isNearBottom || isOwnMessage) {
        const scrollBehavior = isInitialLoad.current ? 'auto' : 'smooth'
        setTimeout(
          () => {
            messagesEndRef.current?.scrollIntoView({ behavior: scrollBehavior })
          },
          isInitialLoad.current ? 100 : 150
        )
      }
    }

    // Mark initial load as complete after first render
    if (isInitialLoad.current && allMessages.length > 0) {
      isInitialLoad.current = false
    }
  }, [allMessages.length, isFetchingPreviousPage, userProfile?.id])

  const handleChatSelect = (chatId: string, chatName: string) => {
    setSelectedChatId(chatId)
    isInitialLoad.current = true
    shouldAutoScroll.current = true
    lastMessageCount.current = 0
    animatedMessages.current.clear()
    generateNameId({ name: chatName, id: chatId })

    if (isMobile) {
      setSidebarVisible(false)
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
                <div key={chat.groupChatId} className='border-b border-gray-100'>
                  <button
                    onClick={() => handleChatSelect(chat.groupChatId, chat.groupChatName)}
                    className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                      selectedChatId === chat.groupChatId
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400'
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
                          <span className='text-xs text-gray-500'>{formatTime(new Date(chat.chatMessage.sentAt))}</span>
                        </div>
                        <p className='text-sm text-gray-600 truncate mt-1'>
                          {chat.chatMessage.senderName}: {chat.chatMessage.content}
                        </p>
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
                    <AvatarImage src={selectedChat.avatarGroupUrl || selectedChat.groupChatName} />
                    <AvatarFallback>{selectedChat.groupChatName.slice(0, 3)}</AvatarFallback>
                  </Avatar>
                  <div className='font-semibold'>{selectedChat.groupChatName}</div>
                </div>

                {/* Staff Controls in Header */}
                <div className='flex items-center gap-2'>
                  <div className='text-sm text-blue-600 font-medium mr-3'>Staff Mode</div>
                  <Button
                    size='sm'
                    onClick={() => handleAcceptRequest(selectedChat.groupChatId)}
                    disabled={updateGroupChatStatusAcceptedMutation.isPending}
                    className='bg-green-500 hover:bg-green-600 text-white text-xs'
                  >
                    {updateGroupChatStatusAcceptedMutation.isPending ? (
                      <div className='w-3 h-3 border border-white border-t-transparent rounded-full animate-spin' />
                    ) : (
                      <CheckCircle className='w-3 h-3' />
                    )}
                    Accept
                  </Button>
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => handleRejectRequest(selectedChat.groupChatId)}
                    disabled={updateGroupChatStatusRejectedMutation.isPending}
                    className='text-xs'
                  >
                    {updateGroupChatStatusRejectedMutation.isPending ? (
                      <div className='w-3 h-3 border border-white border-t-transparent rounded-full animate-spin' />
                    ) : (
                      <XCircle className='w-3 h-3' />
                    )}
                    Reject
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleDeleteGroupChat(selectedChat.groupChatId)}
                    disabled={deletedGroupChatOrganizationMutation.isPending}
                    className='text-xs border-red-200 text-red-600 hover:bg-red-50'
                  >
                    {deletedGroupChatOrganizationMutation.isPending ? (
                      <div className='w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin' />
                    ) : (
                      <Trash2 className='w-3 h-3' />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div
              ref={chatContainerRef}
              className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'
              onScroll={() => {
                // Track user manual scrolling - simplified logic
                const container = chatContainerRef.current
                if (container) {
                  const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50
                  shouldAutoScroll.current = isAtBottom
                }
              }}
            >
              {/* Show button only when at page 1 and click is false */}
              {chatData?.pages && chatData.pages.length === 1 && !click && (
                <div className='flex justify-center py-4 relative z-10'>
                  <button
                    onClick={() => {
                   
                      setClick(true)
                    }}
                    className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer'
                  >
                    Bạn có muốn tải tin nhắn cũ hay không?
                  </button>
                </div>
              )}

              {/* Load previous messages trigger */}
              <div ref={loadPreviousRef} className='h-1'>
                {isFetchingPreviousPage && (
                  <div className='flex justify-center py-2'>
                    <div className='animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full'></div>
                  </div>
                )}
              </div>

              {/* Messages */}
              {isLoadingMessages ? (
                <div className='flex items-center justify-center h-32'>
                  <div className='animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full'></div>
                </div>
              ) : (
                allMessages.map((message) => {
                  const messageKey = message.id
                  return (
                    <div
                      key={message.id}
                      ref={(el) => {
                        if (el && !animatedMessages.current.has(messageKey)) {
                          messageRefs.current.set(messageKey, el)
                          animatedMessages.current.add(messageKey)
                          gsap.fromTo(
                            el,
                            { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
                          )
                        }
                      }}
                      className={`flex items-start space-x-3 ${
                        message.senderId === userProfile?.id ? 'flex-row-reverse space-x-reverse' : ''
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

                      <div
                        className={`max-w-[70%] ${message.senderId === userProfile?.id ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`flex items-center space-x-2 mb-1 ${
                            message.senderId === userProfile?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span className='text-sm font-medium text-gray-700'>{message.senderName}</span>
                          <span className='text-xs text-gray-500'>{formatTime(new Date(message.createdAt))}</span>
                        </div>

                        <div
                          className={`px-4 py-2 rounded-lg max-w-full break-words ${
                            message.senderId === userProfile?.id
                              ? 'bg-gradient-to-r from-blue-400 to-blue-300 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                          }`}
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
                  )
                })
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
                        : 'Connecting...'
                    }
                    disabled={!isConnected || sendMessageMutation.isPending || isUploadingImage}
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
                      id='image-upload'
                    />
                    <label
                      htmlFor='image-upload'
                      className='p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
                    >
                      <ImagePlus className='w-5 h-5' />
                    </label>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      (!messageInput.trim() && !selectedImage) ||
                      !isConnected ||
                      sendMessageMutation.isPending ||
                      isUploadingImage
                    }
                    className='px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2'
                  >
                    {sendMessageMutation.isPending || isUploadingImage ? (
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
    </div>
  )
}

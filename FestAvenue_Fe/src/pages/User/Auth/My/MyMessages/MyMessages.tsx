import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useInfiniteQuery, useQuery, useMutation } from '@tanstack/react-query'
import { Send, MessageCircle, Smile, Search, Wifi, WifiOff } from 'lucide-react'
import { gsap } from 'gsap'
import * as signalR from '@microsoft/signalr'
import { useUsersStore } from '@/contexts/app.context'
import { getAccessTokenFromLS } from '@/utils/auth'
import userApi from '@/apis/user.api'
import { formatTime, generateNameId } from '@/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ChatMessage, ChatMessagesResponse, SignalRMessage } from '@/types/chat.types'
import { EmojiPicker } from '@/utils/helper'

export default function ChatMyMessagesSystem() {
  const userProfile = useUsersStore().isProfile

  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeMessages, setRealtimeMessages] = useState<SignalRMessage[]>([])

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [totalPages, setTotalPages] = useState<number | undefined>()
  const [click, setClick] = useState<boolean>(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const loadPreviousRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const chatButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const animatedMessages = useRef<Set<string>>(new Set())
  const lastMessageCount = useRef<number>(0)
  const shouldAutoScroll = useRef<boolean>(true)
  const isInitialLoad = useRef<boolean>(true)

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

          // Only add if not already exists (prevent duplicates)
          setRealtimeMessages((prev) => {
            const exists = prev.some(
              (msg) =>
                msg.message === newMessage.message &&
                msg.senderId === newMessage.senderId &&
                Math.abs(msg.sentAt.getTime() - newMessage.sentAt.getTime()) < 5000
            )
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

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      message: string
      senderId: string
      senderName: string
      avatar: string | null
      groupChatId: string
    }) => {
      if (!connection || !isConnected) {
        throw new Error('SignalR connection not established')
      }

      return connection.invoke('SendMessage', messageData)
    },
    onSuccess: () => {
      setMessageInput('')
      // Don't clear realtime messages - let the deduplication logic handle it
    },
    onError: (error) => {
      console.error('Error sending message:', error)
    }
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

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChatId || !userProfile) return

    const messageData = {
      message: messageInput.trim(),
      senderId: userProfile.id,
      senderName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
      avatar: userProfile.avatar || null,
      groupChatId: selectedChatId
    }

    sendMessageMutation.mutate(messageData)
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
      handleSendMessage()
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
                  onMouseEnter={() => {
                    const element = chatButtonRefs.current.get(chat.groupChatId)
                    if (element) {
                      gsap.to(element, { x: 4, duration: 0.2 })
                    }
                  }}
                  onMouseLeave={() => {
                    const element = chatButtonRefs.current.get(chat.groupChatId)
                    if (element) {
                      gsap.to(element, { x: 0, duration: 0.2 })
                    }
                  }}
                  onMouseDown={() => {
                    const element = chatButtonRefs.current.get(chat.groupChatId)
                    if (element) {
                      gsap.to(element, { scale: 0.98, duration: 0.1 })
                    }
                  }}
                  onMouseUp={() => {
                    const element = chatButtonRefs.current.get(chat.groupChatId)
                    if (element) {
                      gsap.to(element, { scale: 1, duration: 0.1 })
                    }
                  }}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                    selectedChatId === chat.groupChatId
                      ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-400'
                      : ''
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='relative'>
                      <Avatar className='w-12 h-12 rounded-full object-cover'>
                        <AvatarImage src={selectedChat?.avatarGroupUrl || selectedChat?.groupChatName} />
                        <AvatarFallback>{selectedChat?.groupChatName.slice(0, 3)}</AvatarFallback>
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
                      console.log('Button clicked!')
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
                    <div className='animate-spin w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full'></div>
                  </div>
                )}
              </div>

              {/* Messages */}
              {isLoadingMessages ? (
                <div className='flex items-center justify-center h-32'>
                  <div className='animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full'></div>
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
                              ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                          }`}
                        >
                          <p className='text-sm leading-relaxed whitespace-pre-wrap'>{message.message}</p>
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
              <div className='flex items-center space-x-3'>
                <div className='flex-1 relative'>
                  <input
                    ref={inputRef}
                    type='text'
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
                    disabled={!isConnected || sendMessageMutation.isPending}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all'
                  />
                </div>

                <div className='flex items-center space-x-2'>
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
                    disabled={!messageInput.trim() || !isConnected || sendMessageMutation.isPending}
                    className='px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-300 text-white rounded-lg hover:from-cyan-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2'
                  >
                    {sendMessageMutation.isPending ? (
                      <div className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full'></div>
                    ) : (
                      <Send className='w-4 h-4' />
                    )}
                    <span>Send</span>
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
              <h3 className='text-lg font-semibold text-gray-600 mb-2'>Select a chat to start messaging</h3>
              <p className='text-gray-500'>Choose a conversation from the sidebar to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

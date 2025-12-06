import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, X, Minus, Bot, Loader2, Trash2, LogIn } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import eventApis from '@/apis/event.api'
import { formatTime } from '@/utils/utils'
import { getAccessTokenFromLS } from '@/utils/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { useUsersStore } from '@/contexts/app.context'
import { useNavigate } from 'react-router-dom'
import path from '@/constants/path'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

// Agent Chat API base URL
const AGENT_CHAT_URL = 'https://minhvtt-ChatbotRAG.hf.space/agent/chat'

// Session key includes user ID for multi-user support
const getChatbotSessionKey = (userId?: string) => {
  return userId ? `chatbot_session_${userId}` : 'chatbot_session_guest'
}

// Suggestion bubbles for users WITHOUT purchased events (Sales mode)
const SALES_SUGGESTION_BUBBLES = [
  { text: '🎯 Tìm sự kiện phù hợp với tôi', message: 'Tìm event phù hợp với tôi' },
  { text: '🔥 Có sự kiện hot nào cuối tuần này?', message: 'Có event hot nào cuối tuần này?' },
  { text: '🎵 Tìm show nhạc gần đây', message: 'Tìm show nhạc gần đây' },
  { text: '💰 Sự kiện có giá vé dưới 500k', message: 'Tìm event có giá vé dưới 500k' }
]

// Format markdown text to React elements
const formatMarkdown = (text: string): React.ReactNode => {
  if (!text) return null

  // Pre-process: add line breaks before numbered items (1. 2. 3.) and after ?
  let processedText = text
    // Remove markdown bold markers ** and __
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove standalone * markers (bullet points will be handled separately)
    .replace(/(?<!\*)\*(?!\*)/g, '')
    // Add newline before numbered items like "1." "2." etc (but not if already at start of line)
    .replace(/([^\n])(\d+\.)\s/g, '$1\n$2 ')
    // Add newline after ? (but not if followed by another ? or newline)
    .replace(/\?([^\n\?])/g, '?\n$1')

  // Split by lines to handle list items and paragraphs
  const lines = processedText.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Handle bullet points (* item or - item)
    const bulletMatch = line.match(/^[\*\-]\s+(.*)$/)
    if (bulletMatch) {
      const bulletContent = formatInlineMarkdown(bulletMatch[1], `bullet-${key}`)
      elements.push(
        <div key={key++} className='flex items-start gap-2 my-0.5'>
          <span className='text-purple-500 mt-0.5'>•</span>
          <span>{bulletContent}</span>
        </div>
      )
      continue
    }

    // Handle numbered lists (1. item, 2. item, etc.)
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/)
    if (numberedMatch) {
      const numberedContent = formatInlineMarkdown(numberedMatch[2], `num-${key}`)
      elements.push(
        <div key={key++} className='flex items-start gap-2 my-0.5'>
          <span className='text-purple-500 font-medium min-w-[1.2rem]'>{numberedMatch[1]}.</span>
          <span>{numberedContent}</span>
        </div>
      )
      continue
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      elements.push(<div key={key++} className='h-2' />)
      continue
    }

    // Regular paragraph with inline formatting
    elements.push(
      <div key={key++} className='my-0.5'>
        {formatInlineMarkdown(line, `p-${key}`)}
      </div>
    )
  }

  return <>{elements}</>
}

// Format inline markdown (bold, italic, links)
const formatInlineMarkdown = (text: string, keyPrefix: string): React.ReactNode => {
  const parts: React.ReactNode[] = []
  let remaining = text
  let partKey = 0

  while (remaining.length > 0) {
    // Bold: **text** or __text__
    const boldMatch = remaining.match(/^(.+?)\*\*(.+?)\*\*(.*)$/s) || remaining.match(/^(.+?)__(.+?)__(.*)$/s)
    if (boldMatch) {
      if (boldMatch[1]) {
        parts.push(<span key={`${keyPrefix}-${partKey++}`}>{boldMatch[1]}</span>)
      }
      parts.push(
        <strong key={`${keyPrefix}-${partKey++}`} className='font-semibold text-purple-600'>
          {boldMatch[2]}
        </strong>
      )
      remaining = boldMatch[3]
      continue
    }

    // Check if bold is at the start
    const boldStartMatch = remaining.match(/^\*\*(.+?)\*\*(.*)$/s) || remaining.match(/^__(.+?)__(.*)$/s)
    if (boldStartMatch) {
      parts.push(
        <strong key={`${keyPrefix}-${partKey++}`} className='font-semibold text-purple-600'>
          {boldStartMatch[1]}
        </strong>
      )
      remaining = boldStartMatch[2]
      continue
    }

    // No more markdown, add rest as text
    parts.push(<span key={`${keyPrefix}-${partKey++}`}>{remaining}</span>)
    break
  }

  return <>{parts}</>
}

export default function ChatBot() {
  const navigate = useNavigate()

  // Get user info from context
  const { isAuth, isProfile, userAvatar } = useUsersStore()
  const userId = isProfile?.id
  const userName = isProfile?.firstName
    ? `${isProfile.firstName}${isProfile.lastName ? ' ' + isProfile.lastName : ''}`
    : isProfile?.email?.split('@')[0]

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [chatMode, setChatMode] = useState<'sales' | 'feedback'>('sales')
  const [showSuggestionBubbles, setShowSuggestionBubbles] = useState(true)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const currentMessageRef = useRef('')

  // Fetch purchased events for logged-in user
  const { data: purchasedEventData, isLoading: isLoadingPurchased } = useQuery({
    queryKey: ['purchased-event', userId],
    queryFn: () => eventApis.getPurchaseEventByUserId(userId!),
    enabled: isAuth && !!userId
  })

  // Determine if user has purchased events
  const hasPurchasedEvents = purchasedEventData?.data && purchasedEventData.data.length > 0

  // Auto-open chatbot after 3 seconds for new visitors (no purchased events)
  useEffect(() => {
    if (!hasAutoOpened && !isLoadingPurchased) {
      const timer = setTimeout(() => {
        if (!hasPurchasedEvents) {
          setIsOpen(true)
          setHasAutoOpened(true)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [hasAutoOpened, hasPurchasedEvents, isLoadingPurchased])

  // Set chat mode based on purchased events
  useEffect(() => {
    if (hasPurchasedEvents) {
      setChatMode('feedback')
    } else {
      setChatMode('sales')
    }
  }, [hasPurchasedEvents])

  // Load session from localStorage on mount or when user changes
  useEffect(() => {
    const sessionKey = getChatbotSessionKey(userId)
    const savedSessionId = localStorage.getItem(sessionKey)

    if (savedSessionId) {
      setSessionId(savedSessionId)
      setShowSuggestionBubbles(false)
    } else {
      setMessages([])
      setSessionId(null)
      setShowSuggestionBubbles(true)
    }
  }, [userId])

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isMinimized])

  // Save session ID with user-specific key
  const saveSessionId = useCallback(
    (newSessionId: string) => {
      const sessionKey = getChatbotSessionKey(userId)
      setSessionId(newSessionId)
      localStorage.setItem(sessionKey, newSessionId)
    },
    [userId]
  )

  // Agent Chat SSE handler
  const handleAgentChat = useCallback(
    async (userMessage: string, mode: 'sales' | 'feedback' = chatMode) => {
      setIsStreaming(true)
      setStatusMessage('')
      currentMessageRef.current = ''
      setShowSuggestionBubbles(false)

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date()
        }
      ])

      try {
        abortControllerRef.current = new AbortController()

        // Get access token for feedback mode (required for checking purchase history)
        const accessToken = getAccessTokenFromLS()

        // Build request body according to new Agent Chat API
        const requestBody = {
          message: userMessage,
          mode: mode,
          ...(sessionId && { session_id: sessionId }),
          ...(userId && { user_id: userId }),
          // Include access_token for feedback mode (required for authenticated API calls)
          ...(mode === 'feedback' && accessToken && { access_token: accessToken })
        }

        console.log('Sending agent chat request:', requestBody)

        const response = await fetch(AGENT_CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream'
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          throw new Error('Agent chat request failed')
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        // Add placeholder for assistant message
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true
          }
        ])

        // Buffer to accumulate partial SSE data across chunks
        let sseBuffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          sseBuffer += chunk

          // Process complete SSE events (separated by double newline)
          const eventBlocks = sseBuffer.split('\n\n')
          // Keep the last incomplete block in buffer
          sseBuffer = eventBlocks.pop() || ''

          for (const block of eventBlocks) {
            if (!block.trim()) continue

            // Parse event type and data from block
            let eventType = ''
            let data = ''

            const lines = block.split('\n')
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.substring(6).trim()
              } else if (line.startsWith('data:')) {
                // Get data after "data: " (with single space)
                data = line.substring(6)
              }
            }

            if (!eventType) continue

            switch (eventType) {
              case 'status':
                setStatusMessage(data)
                break

              case 'token':
                // Append token data to accumulated content
                currentMessageRef.current += data
                // Update UI in real-time
                setMessages((prev) => {
                  return prev.map((msg, idx) => {
                    if (idx === prev.length - 1 && msg.role === 'assistant' && msg.isStreaming) {
                      return { ...msg, content: currentMessageRef.current }
                    }
                    return msg
                  })
                })
                break

              case 'metadata':
                try {
                  const metadata = JSON.parse(data)
                  if (metadata.session_id) {
                    saveSessionId(metadata.session_id)
                  }
                } catch (e) {
                  console.error('Error parsing metadata:', e)
                }
                break

              case 'done':
                // Finalize message with accumulated content
                const finalContent = currentMessageRef.current
                setIsStreaming(false)
                setStatusMessage('')
                setMessages((prev) => {
                  return prev.map((msg, idx) => {
                    if (idx === prev.length - 1 && msg.isStreaming) {
                      return { ...msg, isStreaming: false, content: finalContent }
                    }
                    return msg
                  })
                })
                currentMessageRef.current = ''
                break

              case 'error':
                console.error('Stream error:', data)
                toast.error(data || 'Có lỗi xảy ra')
                setIsStreaming(false)
                setStatusMessage('')
                setMessages((prev) => prev.filter((m) => !m.isStreaming))
                break
            }
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Stream aborted')
        } else {
          console.error('Agent chat error:', error)
          toast.error('Lỗi kết nối. Vui lòng thử lại.')
          // Remove streaming message on error
          setMessages((prev) => prev.filter((m) => !m.isStreaming))
        }
        setIsStreaming(false)
        setStatusMessage('')
      } finally {
        abortControllerRef.current = null
      }
    },
    [sessionId, userId, chatMode, saveSessionId]
  )

  // Handle suggestion bubble click
  const handleBubbleClick = (message: string, mode?: 'sales' | 'feedback') => {
    handleAgentChat(message, mode || chatMode)
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || isStreaming) return

    const message = messageInput.trim()
    setMessageInput('')
    handleAgentChat(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setMessages([])
    setSessionId(null)
    setShowSuggestionBubbles(true)
    const sessionKey = getChatbotSessionKey(userId)
    localStorage.removeItem(sessionKey)
    toast.success('Đã xóa lịch sử chat')
  }

  const handleToggleOpen = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const handleClose = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleLoginClick = () => {
    setIsOpen(false)
    navigate(path.auth.login)
  }

  // Floating button
  if (!isOpen) {
    return (
      <div className='fixed bottom-6 left-6 z-50'>
        <button
          onClick={handleToggleOpen}
          className='relative bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 p-4 border-2 border-white hover:scale-110'
        >
          <Bot className='w-6 h-6' />
          <div className='absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse' />
        </button>
      </div>
    )
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className='fixed bottom-0 left-6 w-[360px] bg-white rounded-t-lg shadow-2xl border border-gray-200 z-50'>
        <div className='bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-t-lg flex items-center justify-between cursor-pointer'>
          <div className='flex items-center space-x-2 flex-1' onClick={handleMinimize}>
            <Avatar className='w-8 h-8 bg-white'>
              <AvatarFallback className='bg-gradient-to-r from-purple-400 to-pink-400 text-white'>
                <Bot className='w-5 h-5' />
              </AvatarFallback>
            </Avatar>
            <span className='font-semibold text-white text-sm'>AI Assistant</span>
            {isStreaming && <span className='text-xs text-white/80 animate-pulse'>Đang trả lời...</span>}
          </div>
          <button onClick={handleClose} className='text-white hover:bg-white/20 rounded-full p-1'>
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>
    )
  }

  // Full chat window
  return (
    <div className='fixed bottom-0 left-6 w-[360px] h-[550px] bg-white rounded-t-lg shadow-2xl border border-gray-200 flex flex-col z-50'>
      {/* Header */}
      <div className='bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-t-lg flex items-center justify-between'>
        <div className='flex items-center space-x-2 flex-1'>
          <Avatar className='w-8 h-8 bg-white'>
            <AvatarFallback className='bg-gradient-to-r from-purple-400 to-pink-400 text-white'>
              <Bot className='w-5 h-5' />
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-semibold text-white text-sm'>AI Assistant</span>
            <span className='text-xs text-white/80'>
              {isStreaming
                ? statusMessage || 'Đang trả lời...'
                : chatMode === 'feedback'
                ? '💬 Chế độ phản hồi'
                : '💼 Tư vấn sự kiện 24/7'}
            </span>
          </div>
        </div>
        <div className='flex items-center space-x-1'>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              disabled={isStreaming}
              className='text-white hover:bg-white/20 rounded-full p-1'
              title='Xóa lịch sử chat'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          )}
          <button onClick={handleMinimize} className='text-white hover:bg-white/20 rounded-full p-1'>
            <Minus className='w-4 h-4' />
          </button>
          <button onClick={handleClose} className='text-white hover:bg-white/20 rounded-full p-1'>
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* User Status Bar - Show login prompt if not authenticated */}
      {!isAuth && (
        <div className='bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center justify-between'>
          <span className='text-xs text-amber-700'>Đăng nhập để lưu lịch sử chat</span>
          <button
            onClick={handleLoginClick}
            className='flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors'
          >
            <LogIn className='w-3 h-3' />
            Đăng nhập
          </button>
        </div>
      )}

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50'>
        {messages.length === 0 ? (
          <div className='flex flex-col h-full'>
            {/* Welcome message */}
            <div className='text-center py-4'>
              <Bot className='w-10 h-10 mx-auto text-purple-400 mb-2' />
              <p className='text-sm text-gray-600'>
                {isAuth
                  ? `Xin chào ${userName}! Tôi có thể giúp gì cho bạn?`
                  : 'Xin chào! Tôi có thể giúp gì cho bạn về sự kiện?'}
              </p>
            </div>

            {/* Suggestion Bubbles */}
            {showSuggestionBubbles && (
              <div className='flex-1 flex flex-col justify-end space-y-2 pb-2'>
                <p className='text-xs text-gray-500 text-center mb-1'>Chọn một chủ đề bên dưới:</p>

                {/* Show feedback bubble if user has purchased events */}
                {hasPurchasedEvents && purchasedEventData?.data && (
                  <button
                    onClick={() => handleBubbleClick('Hello', 'feedback')}
                    disabled={isStreaming}
                    className='w-full text-left px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg text-sm text-amber-800 hover:from-amber-100 hover:to-orange-100 transition-all duration-200 flex items-center gap-2'
                  >
                    <span className='text-base'>⭐</span>
                    <span>Chia sẻ cảm nhận về "{purchasedEventData.data[0].eventName}"</span>
                  </button>
                )}

                {/* Sales suggestion bubbles */}
                {SALES_SUGGESTION_BUBBLES.map((bubble, index) => (
                  <button
                    key={index}
                    onClick={() => handleBubbleClick(bubble.message, 'sales')}
                    disabled={isStreaming}
                    className='w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-200 transition-all duration-200'
                  >
                    {bubble.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar className='w-6 h-6 flex-shrink-0'>
                  {message.role === 'user' && userAvatar ? <AvatarImage src={userAvatar} alt={userName} /> : null}
                  <AvatarFallback
                    className={
                      message.role === 'assistant'
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white'
                    }
                  >
                    {message.role === 'assistant' ? (
                      <Bot className='w-4 h-4' />
                    ) : (
                      userName?.charAt(0).toUpperCase() || 'U'
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className='text-sm leading-relaxed break-words'>
                      {message.role === 'assistant' ? (
                        <>
                          {formatMarkdown(message.content)}
                          {message.isStreaming && (
                            <span className='inline-block w-1.5 h-4 bg-purple-500 animate-pulse ml-0.5' />
                          )}
                        </>
                      ) : (
                        <p className='whitespace-pre-wrap'>{message.content}</p>
                      )}
                    </div>
                  </div>
                  <span className='text-[10px] text-gray-500 mt-1 block'>{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}

            {/* Show status while streaming */}
            {isStreaming && statusMessage && (
              <div className='flex items-center justify-center py-2'>
                <div className='flex items-center space-x-2 text-xs text-gray-500'>
                  <Loader2 className='w-3 h-3 animate-spin' />
                  <span>{statusMessage}</span>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='bg-white border-t border-gray-200 p-2'>
        <div className='flex items-center space-x-2'>
          <div className='flex-1 relative'>
            <input
              ref={inputRef}
              type='text'
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={chatMode === 'feedback' ? 'Chia sẻ cảm nhận của bạn...' : 'Hỏi về sự kiện...'}
              disabled={isStreaming}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100'
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isStreaming}
            className='p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all'
          >
            {isStreaming ? <Loader2 className='w-4 h-4 animate-spin' /> : <Send className='w-4 h-4' />}
          </button>
        </div>
      </div>
    </div>
  )
}

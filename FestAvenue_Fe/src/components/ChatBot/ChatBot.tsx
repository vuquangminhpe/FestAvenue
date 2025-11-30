import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, X, Minus, Bot, Loader2, Trash2, Sparkles, LogIn } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import AIApis from '@/apis/AI.api'
import { formatTime } from '@/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import type { bodyEventChatBot, messagesChatBotRole, Scenario } from '@/types/API.types'
import { useUsersStore } from '@/contexts/app.context'
import { useNavigate } from 'react-router-dom'
import path from '@/constants/path'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

// Session key includes user ID for multi-user support
const getChatbotSessionKey = (userId?: string) => {
  return userId ? `chatbot_session_${userId}` : 'chatbot_session_guest'
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
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [showScenarios, setShowScenarios] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch scenarios
  const { data: scenariosData } = useQuery({
    queryKey: ['chatbot-scenarios'],
    queryFn: () => AIApis.getScenarios(),
    enabled: isOpen
  })

  // Load session from localStorage on mount or when user changes
  useEffect(() => {
    const sessionKey = getChatbotSessionKey(userId)
    const savedSessionId = localStorage.getItem(sessionKey)

    if (savedSessionId) {
      setSessionId(savedSessionId)
      loadChatHistory(savedSessionId)
    } else {
      // Clear messages if no session for this user
      setMessages([])
      setSessionId(null)
    }
  }, [userId]) // Re-run when user changes

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isMinimized, streamingContent])

  const loadChatHistory = async (sessionIdToLoad: string) => {
    try {
      setIsLoadingHistory(true)
      const response = await AIApis.getHistoryChatBySessionId(sessionIdToLoad)
      if (response?.data?.messages) {
        const historyMessages: Message[] = response.data.messages.map((msg: messagesChatBotRole) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date()
        }))
        setMessages(historyMessages)
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      // If session not found, clear local storage
      const sessionKey = getChatbotSessionKey(userId)
      localStorage.removeItem(sessionKey)
      setSessionId(null)
      setMessages([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Save session ID with user-specific key
  const saveSessionId = useCallback(
    (newSessionId: string) => {
      const sessionKey = getChatbotSessionKey(userId)
      setSessionId(newSessionId)
      localStorage.setItem(sessionKey, newSessionId)
    },
    [userId]
  )

  // SSE Streaming chat handler
  const handleStreamingChat = useCallback(
    async (userMessage: string) => {
      setIsStreaming(true)
      setStreamingContent('')

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

      try {
        abortControllerRef.current = new AbortController()

        const requestBody: bodyEventChatBot = {
          message: userMessage,
          use_rag: true,
          ...(sessionId && { session_id: sessionId }),
          ...(userId && { user_id: userId }) // Include user_id if logged in
        }

        const response = await fetch('https://minhvtt-ChatbotRAG.hf.space/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          throw new Error('Stream request failed')
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader available')

        const decoder = new TextDecoder()
        let fullContent = ''
        let newSessionId: string | null = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            // Handle token events
            if (line.startsWith('event: token')) {
              const dataLine = lines[i + 1]
              if (dataLine?.startsWith('data: ')) {
                const token = dataLine.substring(6)
                fullContent += token
                setStreamingContent(fullContent)

                // Update the last message with streaming content
                setMessages((prev) => {
                  const newMessages = [...prev]
                  const lastIndex = newMessages.length - 1
                  if (lastIndex >= 0 && newMessages[lastIndex].isStreaming) {
                    newMessages[lastIndex] = {
                      ...newMessages[lastIndex],
                      content: fullContent
                    }
                  }
                  return newMessages
                })
              }
            }

            // Handle metadata events (get session_id)
            if (line.startsWith('event: metadata')) {
              const dataLine = lines[i + 1]
              if (dataLine?.startsWith('data: ')) {
                try {
                  const metadata = JSON.parse(dataLine.substring(6))
                  if (metadata.session_id) {
                    newSessionId = metadata.session_id
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }

            // Handle done events
            if (line.startsWith('event: done')) {
              const dataLine = lines[i + 1]
              if (dataLine?.startsWith('data: ')) {
                try {
                  const doneData = JSON.parse(dataLine.substring(6))
                  if (doneData.session_id) {
                    newSessionId = doneData.session_id
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }

            // Handle status events
            if (line.startsWith('event: status')) {
              // Can show status in UI if needed
            }

            // Handle error events
            if (line.startsWith('event: error')) {
              const dataLine = lines[i + 1]
              if (dataLine?.startsWith('data: ')) {
                const errorMsg = dataLine.substring(6)
                toast.error(errorMsg)
              }
            }
          }
        }

        // Save session ID with user-specific key
        if (newSessionId) {
          saveSessionId(newSessionId)
        }

        // Finalize the message
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastIndex = newMessages.length - 1
          if (lastIndex >= 0 && newMessages[lastIndex].isStreaming) {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: fullContent,
              isStreaming: false
            }
          }
          return newMessages
        })
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Stream aborted')
        } else {
          console.error('Streaming error:', error)
          toast.error('Lỗi kết nối streaming')

          // Remove the streaming message on error
          setMessages((prev) => prev.filter((m) => !m.isStreaming))
        }
      } finally {
        setIsStreaming(false)
        setStreamingContent('')
        abortControllerRef.current = null
      }
    },
    [sessionId, userId, saveSessionId]
  )

  // Non-streaming fallback
  const sendMessageMutation = useMutation({
    mutationFn: (body: bodyEventChatBot) => AIApis.eventChatBot(body),
    onSuccess: (response) => {
      if (response?.data) {
        if (response.data.session_id) {
          saveSessionId(response.data.session_id)
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.data.response,
            timestamp: new Date()
          }
        ])
      }
    },
    onError: (error) => {
      console.error('Error sending message:', error)
      toast.error('Gửi tin nhắn thất bại')
    }
  })

  // Start scenario mutation
  const startScenarioMutation = useMutation({
    mutationFn: (scenario: Scenario) =>
      AIApis.startScenario(scenario.scenario_id, {
        user_id: userId // Include user_id if logged in
      }),
    onSuccess: (response) => {
      if (response?.data) {
        if (response.data.session_id) {
          saveSessionId(response.data.session_id)
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.data.message,
            timestamp: new Date()
          }
        ])
        setShowScenarios(false)
      }
    },
    onError: (error) => {
      console.error('Error starting scenario:', error)
      toast.error('Không thể bắt đầu kịch bản')
    }
  })

  const deleteChatHistoryMutation = useMutation({
    mutationFn: (sessionIdToDelete: string) => AIApis.deleteHistoryChatBySessionId(sessionIdToDelete),
    onSuccess: () => {
      setMessages([])
      setSessionId(null)
      const sessionKey = getChatbotSessionKey(userId)
      localStorage.removeItem(sessionKey)
      toast.success('Đã xóa lịch sử chat')
    },
    onError: (error) => {
      console.error('Error deleting chat history:', error)
      toast.error('Xóa lịch sử chat thất bại')
    }
  })

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isStreaming || sendMessageMutation.isPending) return

    const userMessage: Message = {
      role: 'user',
      content: messageInput.trim(),
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    const messageToSend = messageInput.trim()
    setMessageInput('')

    // Use streaming by default
    handleStreamingChat(messageToSend)
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

    if (sessionId) {
      deleteChatHistoryMutation.mutate(sessionId)
    } else {
      setMessages([])
    }
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

  const handleStartScenario = (scenario: Scenario) => {
    startScenarioMutation.mutate(scenario)
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
            <span className='font-semibold text-white text-sm'>AI Chatbot</span>
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
            <span className='font-semibold text-white text-sm'>AI Chatbot</span>
            <span className='text-xs text-white/80'>
              {isStreaming ? 'Đang trả lời...' : isAuth ? `Xin chào, ${userName}` : 'Hỗ trợ sự kiện 24/7'}
            </span>
          </div>
        </div>
        <div className='flex items-center space-x-1'>
          {/* Scenarios button */}
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            className={`text-white hover:bg-white/20 rounded-full p-1 ${showScenarios ? 'bg-white/20' : ''}`}
            title='Kịch bản chat'
          >
            <Sparkles className='w-4 h-4' />
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              disabled={deleteChatHistoryMutation.isPending}
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

      {/* Scenarios Dropdown */}
      {showScenarios && scenariosData?.data?.scenarios && (
        <div className='bg-purple-50 border-b border-purple-200 p-2 max-h-40 overflow-y-auto'>
          <p className='text-xs text-purple-600 font-medium mb-2'>Chọn kịch bản:</p>
          <div className='space-y-1'>
            {scenariosData.data.scenarios.map((scenario) => (
              <button
                key={scenario.scenario_id}
                onClick={() => handleStartScenario(scenario)}
                disabled={startScenarioMutation.isPending}
                className='w-full text-left px-2 py-1.5 rounded text-xs hover:bg-purple-100 transition-colors'
              >
                <span className='font-medium text-purple-700'>{scenario.name}</span>
                <span className='block text-purple-500 text-[10px]'>{scenario.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50'>
        {isLoadingHistory ? (
          <div className='flex items-center justify-center h-full'>
            <div className='flex flex-col items-center space-y-2'>
              <Loader2 className='w-6 h-6 animate-spin text-purple-500' />
              <span className='text-sm text-gray-500'>Đang tải lịch sử...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center space-y-2'>
              <Bot className='w-12 h-12 mx-auto text-purple-400' />
              <p className='text-sm text-gray-600'>
                {isAuth
                  ? `Xin chào ${userName}! Tôi có thể giúp gì cho bạn?`
                  : 'Xin chào! Tôi có thể giúp gì cho bạn về sự kiện?'}
              </p>
              <button
                onClick={() => setShowScenarios(true)}
                className='text-xs text-purple-500 hover:text-purple-700 flex items-center justify-center gap-1'
              >
                <Sparkles className='w-3 h-3' />
                Xem các kịch bản có sẵn
              </button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
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
                  <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
                    {message.content}
                    {message.isStreaming && (
                      <span className='inline-block w-1.5 h-4 bg-purple-500 animate-pulse ml-0.5' />
                    )}
                  </p>
                </div>
                <span className='text-[10px] text-gray-500 mt-1 block'>{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))
        )}

        {sendMessageMutation.isPending && !isStreaming && (
          <div className='flex items-start space-x-2'>
            <Avatar className='w-6 h-6 flex-shrink-0'>
              <AvatarFallback className='bg-gradient-to-r from-purple-400 to-pink-400 text-white'>
                <Bot className='w-4 h-4' />
              </AvatarFallback>
            </Avatar>
            <div className='bg-white border border-gray-200 rounded-lg px-3 py-2'>
              <div className='flex items-center space-x-2'>
                <Loader2 className='w-4 h-4 animate-spin text-purple-500' />
                <span className='text-sm text-gray-600'>Đang suy nghĩ...</span>
              </div>
            </div>
          </div>
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
              placeholder='Hỏi về sự kiện...'
              disabled={isStreaming || sendMessageMutation.isPending}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100'
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isStreaming || sendMessageMutation.isPending}
            className='p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all'
          >
            {isStreaming ? <Loader2 className='w-4 h-4 animate-spin' /> : <Send className='w-4 h-4' />}
          </button>
        </div>
      </div>
    </div>
  )
}

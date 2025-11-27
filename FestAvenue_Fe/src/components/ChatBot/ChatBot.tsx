import { useState, useEffect, useRef } from 'react'
import { Send, X, Minus, Bot, Loader2, Trash2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import AIApis from '@/apis/AI.api'
import { formatTime } from '@/utils/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import type { bodyEventChatBot, messagesChatBotRole } from '@/types/API.types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const CHATBOT_SESSION_KEY = 'chatbot_session_id'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem(CHATBOT_SESSION_KEY)
    if (savedSessionId) {
      setSessionId(savedSessionId)
      loadChatHistory(savedSessionId)
    }
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isMinimized])

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
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const sendMessageMutation = useMutation({
    mutationFn: (body: bodyEventChatBot) => AIApis.eventChatBot(body),
    onSuccess: (response) => {
      console.log(response)

      if (response?.data) {
        // Save session_id
        if (response.data.session_id) {
          setSessionId(response.data.session_id)
          localStorage.setItem(CHATBOT_SESSION_KEY, response.data.session_id)
        }

        // Add AI response to messages
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

  const deleteChatHistoryMutation = useMutation({
    mutationFn: (sessionIdToDelete: string) => AIApis.deleteHistoryChatBySessionId(sessionIdToDelete),
    onSuccess: () => {
      setMessages([])
      setSessionId(null)
      localStorage.removeItem(CHATBOT_SESSION_KEY)
      toast.success('Đã xóa lịch sử chat')
    },
    onError: (error) => {
      console.error('Error deleting chat history:', error)
      toast.error('Xóa lịch sử chat thất bại')
    }
  })

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sendMessageMutation.isPending) return

    const userMessage: Message = {
      role: 'user',
      content: messageInput.trim(),
      timestamp: new Date()
    }

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage])
    setMessageInput('')

    // Send to AI
    const requestBody: bodyEventChatBot = {
      message: userMessage.content,
      use_rag: true,
      use_advanced_rag: true,
      use_query_expansion: true,
      use_reranking: false,
      top_k: 6,
      temperature: 0.5,
      ...(sessionId && { session_id: sessionId })
    }

    sendMessageMutation.mutate(requestBody)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
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
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
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
            <span className='text-xs text-white/80'>Hỗ trợ sự kiện 24/7</span>
          </div>
        </div>
        <div className='flex items-center space-x-1'>
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
              <p className='text-sm text-gray-600'>Xin chào! Tôi có thể giúp gì cho bạn về sự kiện?</p>
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
                <AvatarFallback
                  className={
                    message.role === 'assistant'
                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white'
                  }
                >
                  {message.role === 'assistant' ? <Bot className='w-4 h-4' /> : 'U'}
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
                  <p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>{message.content}</p>
                </div>
                <span className='text-[10px] text-gray-500 mt-1 block'>{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))
        )}

        {sendMessageMutation.isPending && (
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
              disabled={sendMessageMutation.isPending}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400'
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className='p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all'
          >
            <Send className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  )
}

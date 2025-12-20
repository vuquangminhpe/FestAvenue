import { useState, useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { MessageCircle } from 'lucide-react'
import { getAccessTokenFromLS } from '@/utils/auth'
import { useUsersStore } from '@/contexts/app.context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ChatWindow from './ChatWindow'
import chatApi from '@/apis/chat.api'

interface GroupChat {
  id: string
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
}

interface Notification {
  id?: string
  createdAt: string
  updatedAt?: string
  type: NotificationType
  title: string
  body: string
  targetId: string
  fromUserId: string
  isBroadcast: boolean
  groupChatId: string
  fromUserFullName: string
  avatar?: string
  oldMessages?: any[]
}

export const NotificationType = {
  Message: 1,
  Event: 2
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export default function ChatSystem() {
  const userProfile = useUsersStore().isProfile
  const [, setNotiConnection] = useState<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [groupChats, setGroupChats] = useState<GroupChat[]>([])
  const [openChatWindows, setOpenChatWindows] = useState<string[]>([])
  const [minimizedChats, setMinimizedChats] = useState<Set<string>>(new Set())
  const [notifications, setNotifications] = useState<Record<string, Notification>>({})

  const connectionRef = useRef<signalR.HubConnection | null>(null)

  // Load initial group chats and auto-open top 3
  useEffect(() => {
    const loadGroupChats = async () => {
      const token = getAccessTokenFromLS()
      if (!userProfile?.id || !token) return

      try {
        const groupChatList = await chatApi.GroupChat.getGroupChatByUserId(userProfile.id)
        if (groupChatList && groupChatList.length > 0) {
          // Sort by updated time (most recent first)
          const sortedGroups = groupChatList
            .map((group) => ({
              id: group.id,
              name: group.name,
              avatar: group.avatar || undefined,
              lastMessage: undefined,
              lastMessageTime: group.updatedAt ? new Date(group.updatedAt) : undefined,
              unreadCount: 0
            }))
            .sort((a, b) => {
              if (!a.lastMessageTime) return 1
              if (!b.lastMessageTime) return -1
              return b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
            })

          // Set top 3 groups
          const top3Groups = sortedGroups.slice(0, 3)
          setGroupChats(top3Groups)

          // Auto-open top 3 chat windows
          setOpenChatWindows(top3Groups.map((g) => g.id))
        }
      } catch (error) {
        console.error('Error loading group chats:', error)
      }
    }

    loadGroupChats()
  }, [userProfile?.id])

  // Initialize SignalR notification connection
  useEffect(() => {
    const token = getAccessTokenFromLS()
    if (!userProfile?.id || !token) return

    let activeConnection: signalR.HubConnection | null = null

    const initConnection = async () => {
      try {
        const token = getAccessTokenFromLS()
        if (!token) return

        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl('https://hoalacrent.io.vn/notificationhub', {
            accessTokenFactory: () => getAccessTokenFromLS() || ''
          })
          .configureLogging(signalR.LogLevel.Information)
          .withAutomaticReconnect()
          .build()

        // Listen for notifications
        newConnection.on('ReceiveNotification', (notification: Notification) => {
          // Only handle Message type notifications
          if (notification.type !== NotificationType.Message) return

          const groupId = notification.groupChatId || notification.targetId

          // Don't show notification badge if user sent the message themselves
          const isOwnMessage = notification.fromUserId === userProfile?.id

          // Update notifications store
          setNotifications((prev) => ({
            ...prev,
            [groupId]: notification
          }))

          // Check if this group exists in groupChats
          setGroupChats((prev) => {
            const existingIndex = prev.findIndex((g) => g.id === groupId)

            const shouldIncrementUnread = !isOwnMessage && !openChatWindows.includes(groupId)

            const newGroup: GroupChat = {
              id: groupId,
              name: notification.title || 'Chat Group',
              avatar: notification.avatar,
              lastMessage: notification.body,
              lastMessageTime: new Date(notification.createdAt),
              unreadCount: shouldIncrementUnread ? 1 : 0
            }

            if (existingIndex !== -1) {
              // Update existing group
              const updated = [...prev]
              updated[existingIndex] = {
                ...updated[existingIndex],
                lastMessage: notification.body,
                lastMessageTime: new Date(notification.createdAt),
                unreadCount: shouldIncrementUnread
                  ? updated[existingIndex].unreadCount + 1
                  : updated[existingIndex].unreadCount,
                avatar: notification.avatar || updated[existingIndex].avatar
              }
              // Move to top
              return [updated[existingIndex], ...updated.filter((_, i) => i !== existingIndex)]
            } else {
              // Add new group at top, keep only 3 most recent
              return [newGroup, ...prev].slice(0, 3)
            }
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
        activeConnection = newConnection
        connectionRef.current = newConnection
        setNotiConnection(newConnection)
        setIsConnected(true)
      } catch (error) {
        console.error('NotificationHub connection error:', error)
      }
    }

    initConnection()

    return () => {
      if (activeConnection) {
        activeConnection.off('ReceiveNotification')
        activeConnection.stop()
      }
    }
  }, [userProfile?.id])

  const handleGroupClick = (group: GroupChat) => {
    // Clear unread count
    setGroupChats((prev) => prev.map((g) => (g.id === group.id ? { ...g, unreadCount: 0 } : g)))

    // Open chat window if not already open
    if (!openChatWindows.includes(group.id)) {
      setOpenChatWindows((prev) => [...prev, group.id])
    }

    // Un-minimize if minimized
    if (minimizedChats.has(group.id)) {
      setMinimizedChats((prev) => {
        const newSet = new Set(prev)
        newSet.delete(group.id)
        return newSet
      })
    }
  }

  const handleCloseChatWindow = (groupId: string) => {
    setOpenChatWindows((prev) => prev.filter((id) => id !== groupId))
    setMinimizedChats((prev) => {
      const newSet = new Set(prev)
      newSet.delete(groupId)
      return newSet
    })
  }

  const handleMinimizeChatWindow = (groupId: string) => {
    setMinimizedChats((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  return (
    <>
      {/* 3 Floating Chat Bubbles */}
      <div className='fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end space-y-reverse space-y-3'>
        {groupChats.slice(0, 3).map((group) => (
          <div key={group.id} className='relative group/bubble'>
            <button
              onClick={() => handleGroupClick(group)}
              className='relative -translate-y-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 p-1 border-2 border-gray-100 hover:border-cyan-300'
            >
              <Avatar className='w-14 h-14'>
                <AvatarImage src={group.avatar || group.name} />
                <AvatarFallback className='bg-gradient-to-r from-cyan-400 to-blue-300 text-white font-semibold'>
                  {group.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {group.unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md animate-pulse'>
                  {group.unreadCount}
                </span>
              )}
              {/* Online indicator */}
              <div className='absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white' />
            </button>

            {/* Tooltip on hover */}
            <div className='absolute right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200 pointer-events-none'>
              <div className='bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl max-w-xs break-words'>
                {group.name}
                <div className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-full'>
                  <div className='w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-gray-900' />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Connection Status Indicator */}
        {groupChats.length === 0 && (
          <div className='bg-white rounded-full shadow-lg p-1 border-2 border-gray-100'>
            <div className='relative bg-gradient-to-r from-cyan-400 to-blue-300 text-white p-4 rounded-full'>
              <MessageCircle className='w-6 h-6' />
              <div
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Chat Windows */}
      {openChatWindows.map((groupId, index) => {
        const group = groupChats.find((g) => g.id === groupId)
        if (!group) return null

        const notification = notifications[groupId]

        return (
          <ChatWindow
            key={groupId}
            groupChatId={groupId}
            groupName={group.name}
            groupAvatar={group.avatar}
            initialMessages={notification?.oldMessages || []}
            onClose={() => handleCloseChatWindow(groupId)}
            onMinimize={() => handleMinimizeChatWindow(groupId)}
            isMinimized={minimizedChats.has(groupId)}
            position={index}
          />
        )
      })}
    </>
  )
}

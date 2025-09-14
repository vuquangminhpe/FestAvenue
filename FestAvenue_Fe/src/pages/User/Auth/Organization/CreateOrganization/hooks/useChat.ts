import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import userApi from '@/apis/user.api'
import organizationApi from '@/apis/organization.api'
import { useUsersStore } from '@/contexts/app.context'
import type { OrganizationType } from '@/types/user.types'
import type { ChatConfig } from '../types'
import { type MemberInput, GroupChatStatus } from '@/types/organization.types'

export const useChat = () => {
  const [showChatSystem, setShowChatSystem] = useState(false)
  const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const userProfile = useUsersStore((state) => state.isProfile)

  const uploadsImagesMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadsStorage(file),
    onSuccess: (data) => {
      setIsUploadingAvatar(false)
      return data
    },
    onError: (error) => {
      console.error('Avatar upload error:', error)
      toast.error('Upload avatar thất bại')
      setIsUploadingAvatar(false)
    }
  })

  const createdGroupChatOrganizationMutation = useMutation({
    mutationFn: userApi.createdGroupChatOrganization
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

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const handleConflictResolution = async (
    type: 'request_admin' | 'request_user' | 'dispute',
    existingOrganization: OrganizationType
  ) => {
    const groupChatName = `${type}_${existingOrganization?.name}_${Date.now()}`

    try {
      let avatarUrl = existingOrganization?.logo || ''

      // Upload avatar if selected
      if (avatarFile) {
        setIsUploadingAvatar(true)
        const uploadResult = await uploadsImagesMutation.mutateAsync(avatarFile)
        avatarUrl = (uploadResult.data as any) || (uploadResult as any)
      }

      // Create members array with the new structure
      const members: MemberInput[] = [
        {
          userId: userProfile?.id || '',
          isRequest: type === 'request_admin' || type === 'request_user'
        },
        {
          userId: existingOrganization?.createdBy || existingOrganization?.id || '',
          isRequest: false
        }
      ]

      const groupChatData = {
        organizationId: existingOrganization?.id || '',
        groupChatName,
        members,
        avatar: avatarUrl || '',
        statusId: GroupChatStatus.CombatPending
      }

      createdGroupChatOrganizationMutation.mutate(groupChatData, {
        onSuccess: (response) => {
          const groupChatId = response.data as any

          setChatConfig({
            groupChatId,
            requestType: type
          })
          setShowChatSystem(true)
          setAvatarFile(null)
          setAvatarPreview(null)
          toast.success('Tạo group chat thành công!')
        },
        onError: (error: any) => {
          toast.error(error?.data?.message || 'Không thể tạo group chat')
          setIsUploadingAvatar(false)
        }
      })
    } catch (error) {
      console.error('Error creating group chat:', error)
      toast.error('Tạo group chat thất bại')
      setIsUploadingAvatar(false)
    }
  }

  const closeChatSystem = () => {
    setShowChatSystem(false)
    setChatConfig(null)
  }

  const handleAcceptRequest = (groupChatId: string) => {
    updateGroupChatStatusAcceptedMutation.mutate(groupChatId)
  }

  return {
    showChatSystem,
    chatConfig,
    avatarFile,
    avatarPreview,
    isUploadingAvatar,
    handleAvatarSelect,
    handleRemoveAvatar,
    handleConflictResolution,
    handleAcceptRequest,
    closeChatSystem,
    createdGroupChatOrganizationMutation,
    uploadsImagesMutation,
    updateGroupChatStatusAcceptedMutation
  }
}

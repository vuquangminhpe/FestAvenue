import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router'
import userApi from '@/apis/user.api'
import eventApis, { type updateEventWithOrg } from '@/apis/event.api'
import type { EventFormData } from '../types'
import path from '@/constants/path'
import { EventTempStatusValues, type createEvent } from '@/types/event.types'
import { getIdFromNameId } from '@/utils/utils'

interface OrganizationData {
  name: string
  description: string
  website: string
  contact: {
    email: string
    phone: string
    fax: string
  }
}

export const useCreateEvent = () => {
  const navigate = useNavigate()
  const { nameId } = useParams<{ nameId: string }>()
  const isUpdateMode = !!nameId
  const eventId = nameId ? getIdFromNameId(nameId) : null

  const [organizationData, setOrganizationData] = useState<OrganizationData | undefined>()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [trailerFile, setTrailerFile] = useState<File | null>(null)

  const [logoPreview, setLogoPreview] = useState<string>('')
  const [bannerPreview, setBannerPreview] = useState<string>('')
  const [trailerPreview, setTrailerPreview] = useState<string>('')
  const { data: getDataByEventId } = useQuery({
    queryKey: ['getDataByEventId', eventId],
    queryFn: () => eventApis.getEventByEventCodeForEventOwner(eventId as string),
    enabled: !!eventId
  })
  // Upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadsStorage(file),
    onError: () => {
      toast.error('Lỗi khi tải file lên')
    }
  })

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: (data: updateEventWithOrg) => eventApis.updateEvent(data),
    onSuccess: () => {
      toast.success('Cập nhật sự kiện thành công!', {
        description: 'Sự kiện của bạn đã được cập nhật'
      })
      navigate(path.user.my.events)
    },
    onError: (error: any) => {
      toast.error('Lỗi khi cập nhật sự kiện', {
        description: error?.response?.data?.message || 'Vui lòng thử lại'
      })
    }
  })

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (data: createEvent) => eventApis.createEvent(data),
    onSuccess: () => {
      toast.success('Tạo sự kiện thành công!', {
        description: 'Sự kiện của bạn đang chờ phê duyệt từ staff'
      })
      navigate(path.user.my.events)
    },
    onError: (error: any) => {
      toast.error('Lỗi khi tạo sự kiện', {
        description: error?.response?.data?.message || 'Vui lòng thử lại'
      })
    }
  })

  const handleLogoUpload = (file: File) => {
    setLogoFile(file)
    const preview = URL.createObjectURL(file)
    setLogoPreview(preview)
    return preview
  }

  const handleBannerUpload = (file: File) => {
    setBannerFile(file)
    const preview = URL.createObjectURL(file)
    setBannerPreview(preview)
    return preview
  }

  const handleTrailerUpload = (file: File) => {
    setTrailerFile(file)
    const preview = URL.createObjectURL(file)
    setTrailerPreview(preview)
    return preview
  }

  const uploadMedia = async () => {
    const uploadedUrls: { logo?: string; banner?: string; trailer?: string } = {}

    try {
      // Upload logo
      if (logoFile) {
        const logoResult = await uploadFileMutation.mutateAsync(logoFile)
        uploadedUrls.logo = logoResult?.data?.data || ''
      }

      // Upload banner
      if (bannerFile) {
        const bannerResult = await uploadFileMutation.mutateAsync(bannerFile)
        uploadedUrls.banner = bannerResult?.data?.data || ''
      }

      // Upload trailer
      if (trailerFile) {
        const trailerResult = await uploadFileMutation.mutateAsync(trailerFile)
        uploadedUrls.trailer = trailerResult?.data?.data || ''
      }

      return uploadedUrls
    } catch (error) {
      throw new Error('Lỗi khi tải media lên')
    }
  }

  const onSubmit = async (data: EventFormData) => {
    try {
      // Upload media files
      toast.info('Đang tải media lên...')
      const uploadedUrls = await uploadMedia()
      setOrganizationData({
        name: data.name,
        description: data.description,
        website: data.website || '',
        contact: {
          email: data.organization.contact.email,
          phone: data.organization.contact.phone,
          fax: data.organization.contact.fax || ''
        }
      })

      // Prepare event data
      const eventData: createEvent = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        categoryId: data.categoryId,
        status: EventTempStatusValues.Draft,
        visibility: data.visibility,
        capacity: data.capacity,
        startEventLifecycleTime: data.startEventLifecycleTime,
        endEventLifecycleTime: data.endEventLifecycleTime,
        startTicketSaleTime: data.startTicketSaleTime,
        endTicketSaleTime: data.endTicketSaleTime,
        startTimeEventTime: data.startTimeEventTime,
        endTimeEventTime: data.endTimeEventTime,
        logoUrl: uploadedUrls.logo || data.logoUrl,
        bannerUrl: uploadedUrls.banner || data.bannerUrl,
        trailerUrl: uploadedUrls.trailer || (data.trailerUrl as any),
        website: data.website,
        publicContactEmail: data.publicContactEmail,
        publicContactPhone: data.publicContactPhone,
        location: data.location,
        hashtags: data.hashtags,
        organization: {
          name: data.name,
          description: data.description,
          logo: '',
          website: data.website || '',
          contact: {
            email: data.organization.contact.email,
            phone: data.organization.contact.phone,
            fax: data.organization.contact.fax || ''
          }
        }
      }

      // Create or update event
      if (isUpdateMode && eventId) {
        const updateData: updateEventWithOrg = {
          ...eventData,
          eventCode: getDataByEventId?.data?.eventCode || ''
        }
        await updateEventMutation.mutateAsync(updateData)
      } else {
        await createEventMutation.mutateAsync(eventData)
      }
    } catch (error) {
      console.error('Error creating/updating event:', error)
    }
  }

  return {
    logoPreview,
    bannerPreview,
    trailerPreview,
    handleLogoUpload,
    handleBannerUpload,
    handleTrailerUpload,
    onSubmit,
    createEventMutation: isUpdateMode ? updateEventMutation : createEventMutation,
    uploadFileMutation,
    organizationData
  }
}

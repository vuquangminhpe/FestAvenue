import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import userApi from '@/apis/user.api'
import path from '@/constants/path'
import { SubDescriptionStatus } from '@/types/user.types'
import type { FormData } from '../types'

export const useCreateOrganization = () => {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadsStorage(file)
  })

  const createOrganizationMutation = useMutation({
    mutationFn: userApi.createOrganization,
    onSuccess: (data) => {
      console.log(data?.data)
      queryClient.invalidateQueries({ queryKey: ['getMyProfile'] })
      toast.success('Tạo tổ chức thành công!')
      // navigate(path.home)
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo tổ chức')
    }
  })

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      let logoUrl = ''

      if (logoFile) {
        await uploadLogoMutation.mutateAsync(logoFile, {
          onSuccess: (data) => {
            logoUrl = (data?.data as any) || ('' as string)
            toast.success('Cập nhật ảnh tổ chức thành công')
          },
          onError: () => {
            toast.error('Cập nhật ảnh tổ chức thất bại')
          }
        })
      }

      const organizationData = {
        name: data.name,
        description: data.description,
        industry: data.industry,
        size: Number(data.size),
        website: data.website,
        logo: logoUrl,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          latitude: data.latitude,
          longitude: data.longitude
        },
        contact: {
          email: data.email,
          phone: data.phone,
          fax: data.fax
        },
        socialMedia: {
          facebook: data.facebook,
          twitter: data.twitter,
          linkedin: data.linkedin,
          instagram: data.instagram
        },
        subDescription: {
          plan: data.plan,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: SubDescriptionStatus.Active
        },
        settings: {
          branding: {
            colors: {
              primary: data.primaryColor,
              secondary: data.secondaryColor,
              accent: data.accentColor
            },
            customDomain: data.customDomain
          },
          security: {
            ssoEnabled: data.ssoEnabled,
            passwordPolicy: {
              minLength: data.minPasswordLength,
              requireSpecialChar: data.requireSpecialChar,
              requireNumber: data.requireNumber,
              requireUppercase: data.requireUppercase,
              expirationDays: data.passwordExpirationDays
            }
          }
        }
      }

      await createOrganizationMutation.mutateAsync(organizationData)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  return {
    logoFile,
    logoPreview,
    handleLogoUpload,
    onSubmit,
    createOrganizationMutation,
    uploadLogoMutation
  }
}

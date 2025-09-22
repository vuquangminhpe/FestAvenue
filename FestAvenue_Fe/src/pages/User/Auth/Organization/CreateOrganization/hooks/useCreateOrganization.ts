import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import userApi from '@/apis/user.api'
import organizationApi from '@/apis/organization.api'
import path from '@/constants/path'
import { SubDescriptionStatus } from '@/types/user.types'
import type { FormData } from '../types'
import { generateNameId, getIdFromNameId } from '@/utils/utils'

export const useCreateOrganization = (
  form: any,
  isUpdateMode: boolean = false,
  organizationId: string | null = null
) => {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [savedOrganizationId, setSavedOrganizationId] = useState<string | null>(null)

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadsStorage(file)
  })

  const saveOrganizationMutation = useMutation({
    mutationFn: organizationApi.saveOrganization,
    onSuccess: (data) => {
      const organizationId = data?.data?.id
      if (organizationId) {
        setSavedOrganizationId(organizationId)
        const nameId = generateNameId({
          id: organizationId,
          name: data?.data?.name || 'organization'
        })
        setSearchParams({ id: nameId })
        toast.success('Lưu tổ chức thành công!')
      }
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi lưu tổ chức')
    }
  })

  const createOrganizationMutation = useMutation({
    mutationFn: (data: any) => {
      if (isUpdateMode && organizationId) {
        return userApi.updateOrganizationById(organizationId, data)
      }
      return userApi.createOrganization(data)
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['getMyProfile'] })
      if (isUpdateMode) {
        toast.success('Cập nhật tổ chức thành công!')
        navigate(path.user.my.organization)
      } else {
        toast.success('Tạo tổ chức thành công!')
        navigate(
          `${path.user.payment.payment_organization}?${generateNameId({
            id: `${(data?.data as any)?.id}_${(data?.data as any)?.subDescription.plan}` as any,
            name: data?.data?.name
          })}`
        )
      }
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || `Có lỗi xảy ra khi ${isUpdateMode ? 'cập nhật' : 'tạo'} tổ chức`)
    }
  })

  useEffect(() => {
    if (isUpdateMode && organizationId) {
      userApi
        .getOrganizationById(organizationId)
        .then((response) => {
          if (response?.data) {
            const org = response.data
            form.setValue('name', org.name || '')
            form.setValue('description', org.description || '')
            form.setValue('industry', org.industry || '')
            form.setValue('size', org.size?.toString() || '')
            form.setValue('website', org.website || '')

            if (org.address) {
              form.setValue('street', org.address.street || '')
              form.setValue('city', org.address.city || '')
              form.setValue('state', org.address.state || '')
              form.setValue('postalCode', org.address.postalCode || '')
              form.setValue('country', org.address.country || '')
              form.setValue('latitude', org.address.latitude || '')
              form.setValue('longitude', org.address.longitude || '')
            }

            // Contact
            if (org.contact) {
              form.setValue('email', org.contact.email || '')
              form.setValue('phone', org.contact.phone || '')
              form.setValue('fax', org.contact.fax || '')
            }

            // Social Media
            if (org.socialMedia) {
              form.setValue('facebook', org.socialMedia.facebook || '')
              form.setValue('twitter', org.socialMedia.twitter || '')
              form.setValue('linkedin', org.socialMedia.linkedin || '')
              form.setValue('instagram', org.socialMedia.instagram || '')
            }

            // Settings
            if (org.settings) {
              if (org.settings.branding?.colors) {
                form.setValue('primaryColor', org.settings.branding.colors.primary || '')
                form.setValue('secondaryColor', org.settings.branding.colors.secondary || '')
                form.setValue('accentColor', org.settings.branding.colors.accent || '')
              }
              form.setValue('customDomain', org.settings.branding?.customDomain || '')

              if (org.settings.security) {
                form.setValue('ssoEnabled', org.settings.security.ssoEnabled || false)
                if (org.settings.security.passwordPolicy) {
                  form.setValue('minPasswordLength', org.settings.security.passwordPolicy.minLength || 8)
                  form.setValue('requireSpecialChar', org.settings.security.passwordPolicy.requireSpecialChar || false)
                  form.setValue('requireNumber', org.settings.security.passwordPolicy.requireNumber || false)
                  form.setValue('requireUppercase', org.settings.security.passwordPolicy.requireUppercase || false)
                  form.setValue('passwordExpirationDays', org.settings.security.passwordPolicy.expirationDays || 90)
                }
              }
            }

            // Subscription
            if (org.subscription) {
              form.setValue('plan', org.subscription.plan || '')
            }

            // Logo
            if (org.logo) {
              setLogoPreview(org.logo)
            }

            toast.success('Đã tải dữ liệu tổ chức')
          }
        })
        .catch((error) => {
          console.error('Error fetching organization:', error)
          toast.error('Không thể tải dữ liệu tổ chức')
        })
    } else {
      // Restore draft data from URL for create mode
      const idParam = searchParams.get('id')
      if (idParam) {
        const orgId = getIdFromNameId(idParam)
        if (orgId && orgId !== savedOrganizationId) {
          setSavedOrganizationId(orgId)
          // Fetch organization data and populate form
          organizationApi
            .getOrganizationById(orgId)
            .then((response) => {
              if (response?.data) {
                const org = response.data
                // Populate form with organization data
                form.setValue('name', org.name || '')
                form.setValue('description', org.description || '')
                form.setValue('industry', org.industry || '')
                form.setValue('size', org.size?.toString() || '')
                form.setValue('website', org.website || '')

                // Address
                if (org.address) {
                  form.setValue('street', org.address.street || '')
                  form.setValue('city', org.address.city || '')
                  form.setValue('state', org.address.state || '')
                  form.setValue('postalCode', org.address.postalCode || '')
                  form.setValue('country', org.address.country || '')
                  form.setValue('latitude', org.address.latitude || '')
                  form.setValue('longitude', org.address.longitude || '')
                }

                // Contact
                if (org.contact) {
                  form.setValue('email', org.contact.email || '')
                  form.setValue('phone', org.contact.phone || '')
                  form.setValue('fax', org.contact.fax || '')
                }

                // Social Media
                if (org.socialMedia) {
                  form.setValue('facebook', org.socialMedia.facebook || '')
                  form.setValue('twitter', org.socialMedia.twitter || '')
                  form.setValue('linkedin', org.socialMedia.linkedin || '')
                  form.setValue('instagram', org.socialMedia.instagram || '')
                }

                // Settings
                if (org.settings) {
                  if (org.settings.branding?.colors) {
                    form.setValue('primaryColor', org.settings.branding.colors.primary || '')
                    form.setValue('secondaryColor', org.settings.branding.colors.secondary || '')
                    form.setValue('accentColor', org.settings.branding.colors.accent || '')
                  }
                  form.setValue('customDomain', org.settings.branding?.customDomain || '')

                  if (org.settings.security) {
                    form.setValue('ssoEnabled', org.settings.security.ssoEnabled || false)
                    if (org.settings.security.passwordPolicy) {
                      form.setValue('minPasswordLength', org.settings.security.passwordPolicy.minLength || 8)
                      form.setValue(
                        'requireSpecialChar',
                        org.settings.security.passwordPolicy.requireSpecialChar || false
                      )
                      form.setValue('requireNumber', org.settings.security.passwordPolicy.requireNumber || false)
                      form.setValue('requireUppercase', org.settings.security.passwordPolicy.requireUppercase || false)
                      form.setValue('passwordExpirationDays', org.settings.security.passwordPolicy.expirationDays || 90)
                    }
                  }
                }

                // Subscription
                if (org.subscription) {
                  form.setValue('plan', org.subscription.plan || '')
                }

                // Logo
                if (org.logo) {
                  setLogoPreview(org.logo)
                }

                toast.success('Đã khôi phục dữ liệu tổ chức')
              }
            })
            .catch((error) => {
              console.error('Error fetching organization:', error)
              toast.error('Không thể khôi phục dữ liệu tổ chức')
            })
        }
      }
    }
  }, [searchParams, form, savedOrganizationId, isUpdateMode, organizationId])

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

  const onSave = async (data: FormData) => {
    try {
      let logoUrl = logoPreview

      if (logoFile) {
        await uploadLogoMutation.mutateAsync(logoFile, {
          onSuccess: (data) => {
            logoUrl = (data?.data as any) || ('' as string)
          },
          onError: () => {
            toast.error('Cập nhật ảnh tổ chức thất bại')
          }
        })
      }

      // Check if we have a saved organization ID from URL (for updating existing draft)
      const idParam = searchParams.get('id')
      const existingOrgId = idParam ? getIdFromNameId(idParam) : savedOrganizationId

      const organizationData = {
        id: existingOrgId || '', // Include ID if updating existing draft
        name: data.name,
        description: data.description,
        industry: data.industry,
        size: data.size,
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
        subscription: {
          plan: data.plan || 'free',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'trial' as const
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

      await saveOrganizationMutation.mutateAsync(organizationData)
    } catch (error) {
      console.error('Save error:', error)
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
    onSave,
    createOrganizationMutation,
    saveOrganizationMutation,
    uploadLogoMutation,
    savedOrganizationId
  }
}

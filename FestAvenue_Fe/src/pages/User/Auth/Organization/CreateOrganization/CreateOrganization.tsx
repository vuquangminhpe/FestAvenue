/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { gsap } from 'gsap'
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Camera,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  Loader2,
  MessageCircle,
  AlertTriangle,
  Settings
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import userApi from '@/apis/user.api'
import path from '@/constants/path'
import { cn } from '@/lib/utils'
import { useUsersStore } from '@/contexts/app.context'
import ChatSystem from '@/components/custom/ChatSystem'
import LeafletMap from '@/components/custom/MapLeaflet'
import { SubDescriptionStatus, type OrganizationType } from '@/types/user.types'

// Schema validation
const organizationSchema = z.object({
  name: z.string().min(2, 'Tên tổ chức phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  industry: z.string().min(1, 'Vui lòng chọn ngành nghề'),
  size: z.string().min(1, 'Vui lòng chọn quy mô công ty'),
  website: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  logo: z.string().optional(),

  // Address
  street: z.string().min(1, 'Địa chỉ là bắt buộc'),
  city: z.string().min(1, 'Thành phố là bắt buộc'),
  state: z.string().min(1, 'Tỉnh/Bang là bắt buộc'),
  postalCode: z.string().min(1, 'Mã bưu điện là bắt buộc'),
  country: z.string().min(1, 'Quốc gia là bắt buộc'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),

  // Contact
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  fax: z.string().optional(),

  // Social Media
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),

  // Subscription
  plan: z.string().min(1, 'Vui lòng chọn gói dịch vụ'),

  // Organization Settings - Branding
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  customDomain: z.string().optional(),

  // Organization Settings - Security
  ssoEnabled: z.boolean().optional(),
  minPasswordLength: z.number().min(6).optional(),
  requireSpecialChar: z.boolean().optional(),
  requireNumber: z.boolean().optional(),
  requireUppercase: z.boolean().optional(),
  passwordExpirationDays: z.number().min(0).optional()
})

type FormData = z.infer<typeof organizationSchema>

const industries = [
  'Công nghệ thông tin',
  'Giáo dục',
  'Y tế',
  'Tài chính',
  'Bán lẻ',
  'Sản xuất',
  'Dịch vụ',
  'Du lịch',
  'Bất động sản',
  'Khác'
]

const companySizes = ['10', '50', '200', '500', '1000']

const subscriptionPlans = [
  { value: 'basic', label: 'Cơ bản', price: 'Miễn phí' },
  { value: 'pro', label: 'Chuyên nghiệp', price: '299,000 VNĐ/tháng' },
  { value: 'enterprise', label: 'Doanh nghiệp', price: '999,000 VNĐ/tháng' }
]

function CreateOrganization() {
  const [currentStep, setCurrentStep] = useState(1)
  const [mapCenter, setMapCenter] = useState({ lat: 21.0285, lng: 105.8542 })
  const [mapZoom] = useState(11)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')

  const [isCheckingName] = useState(false)
  const [existingOrganization, setExistingOrganization] = useState<OrganizationType>()
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [showChatSystem, setShowChatSystem] = useState(false)
  const [chatConfig, setChatConfig] = useState<{
    groupChatId: string
    requestType: 'request_admin' | 'request_user' | 'dispute'
  } | null>(null)
  const [isLocationChecked, setIsLocationChecked] = useState(false)
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)
  const checkExitsLocationMutation = useMutation({
    mutationFn: userApi.checkOrganizationExists
  })
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userProfile = useUsersStore((state) => state.isProfile)

  const form = useForm<FormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      description: '',
      industry: '',
      size: '1',
      website: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Việt Nam',
      email: '',
      phone: '',
      fax: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      plan: 'basic',
      primaryColor: '#06b6d4',
      secondaryColor: '#3b82f6',
      accentColor: '#8b5cf6',
      customDomain: '',
      ssoEnabled: false,
      minPasswordLength: 8,
      requireSpecialChar: false,
      requireNumber: false,
      requireUppercase: false,
      passwordExpirationDays: 90
    }
  })

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    }
  }, [])

  useEffect(() => {
    const currentStepElement = stepRefs.current[currentStep - 1]
    if (currentStepElement) {
      gsap.fromTo(currentStepElement, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' })
    }
  }, [currentStep])

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadsStorage(file)
  })
  const createdGroupChatOrganizationMutation = useMutation({
    mutationFn: userApi.createdGroupChatOrganization
  })
  const createOrganizationMutation = useMutation({
    mutationFn: userApi.createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getMyProfile'] })
      toast.success('Tạo tổ chức thành công!')
      navigate(path.home)
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo tổ chức')
    }
  })

  const handleCheckLocation = async () => {
    const currentName = form.getValues('name')
    const latitude = form.getValues('latitude')
    const longitude = form.getValues('longitude')

    if (!currentName || currentName.length < 2) {
      toast.error('Vui lòng nhập tên tổ chức trước khi kiểm tra vị trí')
      return
    }

    if (!latitude || !longitude) {
      toast.error('Vui lòng nhập tọa độ hoặc chọn vị trí trên bản đồ')
      return
    }

    setIsCheckingLocation(true)

    const body = {
      name: currentName,
      latitude,
      longitude
    }
    checkExitsLocationMutation.mutateAsync(body, {
      onSuccess: (data) => {
        setExistingOrganization(data?.data as any)

        setShowConflictDialog(data?.data !== null ? true : false)
        data?.data !== null && form.setError('latitude', { message: 'Tổ chức đã tồn tại tại vị trí này' })
        data?.data !== null && form.setError('longitude', { message: 'Tổ chức đã tồn tại tại vị trí này' })
        setIsLocationChecked(data?.data !== null ? false : true)
        setIsCheckingLocation(data?.data !== null ? false : true)
      },
      onError: () => {
        form.clearErrors(['latitude', 'longitude'])
        setExistingOrganization(null as any)
        setShowConflictDialog(false)
        setIsLocationChecked(true)
        setIsCheckingLocation(false)
        toast.success('Vị trí hợp lệ! Bạn có thể tiếp tục.')
      }
    })
  }

  const handleConflictResolution = (type: 'request_admin' | 'request_user' | 'dispute') => {
    const groupChatName = `${type}_${existingOrganization?.name}_${Date.now()}`

    const groupChatData = {
      organizationId: existingOrganization?.id || '',
      groupChatName,
      userIds: [userProfile?.id || '', existingOrganization?.id || ''],
      avatar: existingOrganization?.logo || ''
    }

    createdGroupChatOrganizationMutation.mutate(groupChatData, {
      onSuccess: (response) => {
        const groupChatId = response.data as any

        setChatConfig({
          groupChatId,
          requestType: type
        })
        setShowChatSystem(true)
        setShowConflictDialog(false)
        toast.success('Tạo group chat thành công!')
      },
      onError: (error: any) => {
        toast.error(error?.data?.message || 'Không thể tạo group chat')
      }
    })
  }

  // Close chat system
  const closeChatSystem = () => {
    setShowChatSystem(false)
    setChatConfig(null)
    // Reset location check status if conflict was resolved
    setIsLocationChecked(false)
    setIsCheckingLocation(false)
  }

  // Handle logo upload
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

  // Handle map click
  const handleMapClick = ({ lat, lng }: { lat: number; lng: number }) => {
    setMapCenter({ lat, lng })
    form.setValue('latitude', lat.toString())
    form.setValue('longitude', lng.toString())

    // Reset location check status when coordinates change
    setIsLocationChecked(false)
    setIsCheckingLocation(false)
    form.clearErrors(['latitude', 'longitude'])
  }

  // Go to next step
  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fieldsToValidate)

    // Check if we need to validate location on step 2
    if (currentStep === 2) {
      const latitude = form.getValues('latitude')
      const longitude = form.getValues('longitude')

      // If coordinates are provided, require location check
      if ((latitude || longitude) && !isLocationChecked) {
        toast.error('Vui lòng kiểm tra vị trí trước khi tiếp tục')
        return
      }
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 6))
    }
  }

  // Go to previous step
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Get fields to validate for each step
  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ['name', 'description', 'industry', 'size']
      case 2:
        return ['street', 'city', 'state', 'postalCode', 'country', 'email', 'phone']
      case 3:
        return ['website']
      case 4:
        return [] // Branding - optional fields
      case 5:
        return [] // Security - optional fields
      case 6:
        return ['plan']
      default:
        return []
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

  const steps = [
    {
      title: 'Thông tin cơ bản',
      description: 'Tên và mô tả tổ chức',
      icon: Building
    },
    {
      title: 'Địa chỉ & Liên hệ',
      description: 'Thông tin liên hệ và địa điểm',
      icon: MapPin
    },
    {
      title: 'Mạng xã hội',
      description: 'Website và các kênh truyền thông',
      icon: Globe
    },
    {
      title: 'Thương hiệu',
      description: 'Màu sắc và tên miền',
      icon: Settings
    },
    {
      title: 'Bảo mật',
      description: 'Chính sách bảo mật',
      icon: Settings
    },
    {
      title: 'Hoàn tất',
      description: 'Chọn gói dịch vụ và xác nhận',
      icon: Check
    }
  ]

  // Format time
  // const formatTime = (date: Date) => {
  //   return new Intl.DateTimeFormat('vi-VN', {
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   }).format(date)
  // }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-8'>
      <Helmet>
        <title>Tạo tổ chức - FestAvenue</title>
        <meta name='description' content='Tạo tổ chức mới để quản lý sự kiện chuyên nghiệp' />
      </Helmet>

      <div className='max-w-4xl mx-auto px-4'>
        {/* Header */}
        <div className='mb-8'>
          <Button variant='ghost' onClick={() => navigate(path.home)} className='mb-4 cursor-pointer hover:bg-white/50'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Quay lại
          </Button>

          <div className='text-center'>
            <h1 className='text-3xl font-bold text-slate-800 mb-2'>Tạo tổ chức của bạn</h1>
            <p className='text-slate-600'>Thiết lập tổ chức để bắt đầu tạo và quản lý sự kiện</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className='mb-8'>
          <div className='relative'>
            {/* Progress Line Background */}
            <div className='absolute top-6 left-0 right-0 h-0.5 bg-slate-200 hidden md:block' />

            {/* Progress Line Active */}
            <div
              className='absolute top-6 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-300 transition-all duration-500 ease-out hidden md:block'
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
              }}
            />

            {/* Steps Container */}
            <div className='relative flex items-start justify-between'>
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index + 1 === currentStep
                const isCompleted = index + 1 < currentStep

                return (
                  <div key={index} className='flex flex-col items-center flex-1'>
                    {/* Step Circle */}
                    <div
                      className={cn(
                        'relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 bg-white',
                        isActive
                          ? 'border-cyan-400 shadow-lg shadow-cyan-400/25 scale-110'
                          : isCompleted
                          ? 'border-green-500 bg-green-500'
                          : 'border-slate-300'
                      )}
                    >
                      {/* Inner Circle for Active Step */}
                      {isActive && (
                        <div className='w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-300 flex items-center justify-center'>
                          <StepIcon className='w-4 h-4 text-white' />
                        </div>
                      )}

                      {/* Completed Step */}
                      {isCompleted && <Check className='w-5 h-5 text-white' />}

                      {/* Inactive Step */}
                      {!isActive && !isCompleted && <StepIcon className='w-5 h-5 text-slate-400' />}
                    </div>

                    {/* Step Content */}
                    <div className='mt-3 text-center max-w-[140px]'>
                      <div
                        className={cn(
                          'text-sm font-medium leading-tight mb-1',
                          isActive ? 'text-cyan-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                        )}
                      >
                        {step.title}
                      </div>
                      <div className='text-xs text-slate-500 leading-relaxed'>{step.description}</div>

                      {/* Step Number for Mobile */}
                      <div className='md:hidden mt-2'>
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                            isActive
                              ? 'bg-cyan-100 text-cyan-600'
                              : isCompleted
                              ? 'bg-green-100 text-green-600'
                              : 'bg-slate-100 text-slate-400'
                          )}
                        >
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile Progress Dots */}
            <div className='flex justify-center mt-4 md:hidden'>
              <div className='flex space-x-2'>
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      index + 1 <= currentStep ? 'bg-gradient-to-r from-cyan-400 to-blue-300' : 'bg-slate-300'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <Card ref={cardRef} className='bg-white/80 backdrop-blur-sm shadow-xl border-0'>
          <CardHeader className='text-center pb-6'>
            <CardTitle className='text-xl font-semibold text-slate-800'>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription className='text-slate-600'>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[0] = el
                    }}
                    className='space-y-6'
                  >
                    {/* Logo Upload */}
                    <div className='flex justify-center'>
                      <div className='relative'>
                        <div className='w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden'>
                          {logoPreview ? (
                            <img src={logoPreview} alt='Logo preview' className='w-full h-full object-cover' />
                          ) : (
                            <Camera className='w-8 h-8 text-cyan-600' />
                          )}
                        </div>
                        <label className='absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-400 to-blue-300 text-white p-2 rounded-full cursor-pointer hover:shadow-lg transition-all'>
                          <Camera className='w-4 h-4' />
                          <input type='file' accept='image/*' onChange={handleLogoUpload} className='hidden' />
                        </label>
                      </div>
                    </div>

                    <div className='grid md:grid-cols-2 gap-6'>
                      <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem className='md:col-span-2'>
                            <FormLabel className='text-slate-700 font-medium'>Tên tổ chức *</FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Input
                                  {...field}
                                  placeholder='VD: Công ty TNHH ABC'
                                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                                  onChange={(e) => {
                                    field.onChange(e)
                                    // Reset location check status and clear errors when name changes
                                    setIsLocationChecked(false)
                                    setIsCheckingLocation(false)
                                    form.clearErrors(['latitude', 'longitude'])
                                    setShowConflictDialog(false)
                                    setExistingOrganization(null as any)
                                  }}
                                />
                                {isCheckingName && (
                                  <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-cyan-600' />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='industry'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-slate-700 font-medium'>Ngành nghề *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className='h-12 bg-white border-slate-200 focus:border-cyan-400'>
                                  <SelectValue placeholder='Chọn ngành nghề' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry} value={industry}>
                                    {industry}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='size'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-slate-700 font-medium'>Quy mô *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className='h-12 bg-white border-slate-200 focus:border-cyan-400'>
                                  <SelectValue placeholder='Chọn quy mô' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {companySizes.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='description'
                        render={({ field }) => (
                          <FormItem className='md:col-span-2'>
                            <FormLabel className='text-slate-700 font-medium'>Mô tả tổ chức</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder='Mô tả ngắn về tổ chức của bạn...'
                                className='min-h-[100px] bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200 resize-none'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Address & Contact */}
                {currentStep === 2 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[1] = el
                    }}
                    className='space-y-6'
                  >
                    {/* Contact Info */}
                    <div className='grid md:grid-cols-2 gap-6'>
                      <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-slate-700 font-medium flex items-center gap-2'>
                              <Mail className='w-4 h-4' />
                              Email liên hệ *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type='email'
                                placeholder='contact@company.com'
                                className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-slate-700 font-medium flex items-center gap-2'>
                              <Phone className='w-4 h-4' />
                              Số điện thoại *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='0123456789'
                                className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='fax'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-slate-700 font-medium'>Fax (tùy chọn)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='0123456789'
                                className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address */}
                    <div className='space-y-4'>
                      <h3 className='text-lg font-semibold text-slate-800 flex items-center gap-2'>
                        <MapPin className='w-5 h-5' />
                        Địa chỉ
                      </h3>

                      <div className='grid md:grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name='street'
                          render={({ field }) => (
                            <FormItem className='md:col-span-2'>
                              <FormLabel className='text-slate-700 font-medium'>Địa chỉ *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='123 Đường ABC, Phường XYZ'
                                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name='city'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-slate-700 font-medium'>Thành phố *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='Hà Nội'
                                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name='state'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-slate-700 font-medium'>Tỉnh/Bang *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='Hà Nội'
                                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name='postalCode'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-slate-700 font-medium'>Mã bưu điện *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='100000'
                                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name='country'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-slate-700 font-medium'>Quốc gia *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='Việt Nam'
                                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Map */}
                      <div className='mt-6'>
                        <label className='text-sm font-medium text-slate-700 mb-3 block'>
                          Chọn vị trí trên bản đồ (tùy chọn)
                        </label>

                        {/* Coordinate Inputs */}
                        <div className='grid md:grid-cols-2 gap-4 mb-4'>
                          <FormField
                            control={form.control}
                            name='latitude'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-slate-700 font-medium'>Vĩ độ (Latitude)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder='21.0285'
                                    className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                                    onChange={(e) => {
                                      field.onChange(e)
                                      const lat = parseFloat(e.target.value)
                                      const lng = parseFloat(form.getValues('longitude') || '0')
                                      if (!isNaN(lat) && !isNaN(lng)) {
                                        setMapCenter({ lat, lng })
                                      }
                                      // Reset location check status when coordinates change
                                      setIsLocationChecked(false)
                                      setIsCheckingLocation(false)
                                      form.clearErrors(['latitude', 'longitude'])
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='longitude'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-slate-700 font-medium'>Kinh độ (Longitude)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder='105.8542'
                                    className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                                    onChange={(e) => {
                                      field.onChange(e)
                                      const lng = parseFloat(e.target.value)
                                      const lat = parseFloat(form.getValues('latitude') || '0')
                                      if (!isNaN(lat) && !isNaN(lng)) {
                                        setMapCenter({ lat, lng })
                                      }
                                      // Reset location check status when coordinates change
                                      setIsLocationChecked(false)
                                      setIsCheckingLocation(false)
                                      form.clearErrors(['latitude', 'longitude'])
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Location Check Button */}
                        <div className='flex items-center gap-4 mb-4'>
                          <Button
                            type='button'
                            onClick={handleCheckLocation}
                            disabled={isCheckingLocation}
                            variant={isLocationChecked ? 'default' : 'outline'}
                            className={cn(
                              'flex items-center gap-2',
                              isLocationChecked
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                : 'border-cyan-400 text-cyan-600 hover:bg-cyan-50'
                            )}
                          >
                            {isCheckingLocation ? (
                              <>
                                <Loader2 className='w-4 h-4 animate-spin' />
                                Đang kiểm tra...
                              </>
                            ) : isLocationChecked ? (
                              <>
                                <Check className='w-4 h-4' />
                                Vị trí đã được kiểm tra
                              </>
                            ) : (
                              <>
                                <MapPin className='w-4 h-4' />
                                Kiểm tra vị trí
                              </>
                            )}
                          </Button>

                          {isLocationChecked && (
                            <div className='text-sm text-green-600 flex items-center gap-2'>
                              <Check className='w-4 h-4' />
                              Vị trí hợp lệ, bạn có thể tiếp tục
                            </div>
                          )}
                        </div>

                        <div className='h-[300px] rounded-lg overflow-hidden border border-slate-200 shadow-sm'>
                          <LeafletMap
                            center={mapCenter}
                            zoom={mapZoom}
                            onMapClick={handleMapClick}
                            markerPosition={
                              form.watch('latitude') && form.watch('longitude')
                                ? {
                                    lat: parseFloat(form.watch('latitude') || '0'),
                                    lng: parseFloat(form.watch('longitude') || '0')
                                  }
                                : undefined
                            }
                          />
                        </div>
                        <p className='text-sm text-slate-500 mt-2'>
                          Nhấp vào bản đồ để chọn vị trí chính xác của tổ chức hoặc nhập tọa độ trực tiếp. Sau khi nhập
                          tọa độ, vui lòng bấm "Kiểm tra vị trí" để xác nhận.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Social Media & Website */}
                {currentStep === 3 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[2] = el
                    }}
                    className='space-y-6'
                  >
                    <div className='grid md:grid-cols-2 gap-6'>
                      <FormField
                        control={form.control}
                        name='website'
                        render={({ field }) => (
                          <FormItem className='md:col-span-2'>
                            <FormLabel className='text-slate-700 font-medium flex items-center gap-2'>
                              <Globe className='w-4 h-4' />
                              Website
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='https://company.com'
                                className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='facebook'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-slate-700 font-medium'>Facebook</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='https://facebook.com/company'
                                className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='twitter'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-slate-700 font-medium'>Twitter</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='https://twitter.com/company'
                                className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='linkedin'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-slate-700 font-medium'>LinkedIn</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='https://linkedin.com/company/company'
                                className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='instagram'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-slate-700 font-medium'>Instagram</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='https://instagram.com/company'
                                className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Branding Settings */}
                {currentStep === 4 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[3] = el
                    }}
                    className='space-y-6'
                  >
                    <div className='text-center mb-6'>
                      <h3 className='text-xl font-semibold text-slate-800 mb-2'>Thương hiệu</h3>
                      <p className='text-slate-600'>Tùy chỉnh màu sắc và tên miền cho tổ chức</p>
                    </div>

                    {/* Branding Settings */}
                    <div className='bg-gradient-to-br from-cyan-50/50 to-blue-50/30 p-6 rounded-xl border border-cyan-100'>
                      <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-300 rounded-lg flex items-center justify-center'>
                          <div className='w-5 h-5 bg-white rounded-full'></div>
                        </div>
                        <div>
                          <h4 className='text-lg font-semibold text-slate-800'>Thương hiệu</h4>
                          <p className='text-sm text-slate-600'>Tùy chỉnh màu sắc và tên miền cho tổ chức</p>
                        </div>
                      </div>

                      <div className='space-y-6'>
                        <div>
                          <h5 className='text-sm font-semibold text-slate-700 mb-3'>Bảng màu thương hiệu</h5>
                          <div className='grid md:grid-cols-3 gap-4'>
                            <FormField
                              control={form.control}
                              name='primaryColor'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-slate-700 font-medium text-sm'>Màu chính</FormLabel>
                                  <FormControl>
                                    <div className='relative'>
                                      <Input
                                        {...field}
                                        type='color'
                                        className='h-12 bg-white border-slate-200 cursor-pointer rounded-lg shadow-sm hover:shadow-md transition-shadow'
                                      />
                                      <div className='absolute inset-0 rounded-lg ring-2 ring-slate-200 pointer-events-none'></div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name='secondaryColor'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-slate-700 font-medium text-sm'>Màu phụ</FormLabel>
                                  <FormControl>
                                    <div className='relative'>
                                      <Input
                                        {...field}
                                        type='color'
                                        className='h-12 bg-white border-slate-200 cursor-pointer rounded-lg shadow-sm hover:shadow-md transition-shadow'
                                      />
                                      <div className='absolute inset-0 rounded-lg ring-2 ring-slate-200 pointer-events-none'></div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name='accentColor'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-slate-700 font-medium text-sm'>Màu nhấn</FormLabel>
                                  <FormControl>
                                    <div className='relative'>
                                      <Input
                                        {...field}
                                        type='color'
                                        className='h-12 bg-white border-slate-200 cursor-pointer rounded-lg shadow-sm hover:shadow-md transition-shadow'
                                      />
                                      <div className='absolute inset-0 rounded-lg ring-2 ring-slate-200 pointer-events-none'></div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name='customDomain'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-slate-700 font-medium flex items-center gap-2'>
                                <Globe className='w-4 h-4' />
                                Tên miền tùy chỉnh
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder='company.festavenue.com'
                                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200 rounded-lg shadow-sm'
                                />
                              </FormControl>
                              <p className='text-xs text-slate-500 mt-1'>Tên miền con cho trang web tổ chức của bạn</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Security Settings */}
                {currentStep === 5 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[4] = el
                    }}
                    className='space-y-6'
                  >
                    <div className='text-center mb-6'>
                      <h3 className='text-xl font-semibold text-slate-800 mb-2'>Bảo mật</h3>
                      <p className='text-slate-600'>Cấu hình chính sách bảo mật cho tổ chức</p>
                    </div>

                    {/* Security Settings */}
                    <div className='bg-gradient-to-br from-orange-50/50 to-red-50/30 p-6 rounded-xl border border-orange-100'>
                      <div className='flex items-center gap-3 mb-6'>
                        <div className='w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-300 rounded-lg flex items-center justify-center'>
                          <svg className='w-5 h-5 text-white' fill='currentColor' viewBox='0 0 20 20'>
                            <path
                              fillRule='evenodd'
                              d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className='text-lg font-semibold text-slate-800'>Bảo mật</h4>
                          <p className='text-sm text-slate-600'>Cấu hình chính sách bảo mật cho tổ chức</p>
                        </div>
                      </div>

                      <div className='space-y-6'>
                        {/* SSO Toggle */}
                        <FormField
                          control={form.control}
                          name='ssoEnabled'
                          render={({ field }) => (
                            <FormItem>
                              <div className='flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm'>
                                <div className='space-y-0.5'>
                                  <FormLabel className='text-base font-medium text-slate-800 flex items-center gap-2'>
                                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                    Đăng nhập một lần (SSO)
                                  </FormLabel>
                                  <div className='text-sm text-slate-600'>
                                    Cho phép nhân viên đăng nhập bằng tài khoản doanh nghiệp
                                  </div>
                                </div>
                                <FormControl>
                                  <button
                                    type='button'
                                    onClick={() => field.onChange(!field.value)}
                                    className={cn(
                                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2',
                                      field.value ? 'bg-cyan-600' : 'bg-gray-200'
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                        field.value ? 'translate-x-6' : 'translate-x-1'
                                      )}
                                    />
                                  </button>
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />

                        {/* Password Policy */}
                        <div className='space-y-4'>
                          <h5 className='text-sm font-semibold text-slate-700'>Chính sách mật khẩu</h5>

                          <div className='grid md:grid-cols-2 gap-4'>
                            <FormField
                              control={form.control}
                              name='minPasswordLength'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-slate-700 font-medium text-sm'>Độ dài tối thiểu</FormLabel>
                                  <FormControl>
                                    <div className='relative'>
                                      <Input
                                        {...field}
                                        type='number'
                                        min='6'
                                        max='50'
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200 rounded-lg shadow-sm'
                                      />
                                      <div className='absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500'>
                                        ký tự
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='passwordExpirationDays'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-slate-700 font-medium text-sm'>Hết hạn sau</FormLabel>
                                  <FormControl>
                                    <div className='relative'>
                                      <Input
                                        {...field}
                                        type='number'
                                        min='0'
                                        max='365'
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200 rounded-lg shadow-sm'
                                      />
                                      <div className='absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500'>
                                        ngày
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className='space-y-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm'>
                            <h6 className='text-sm font-medium text-slate-700'>Yêu cầu mật khẩu phức tạp</h6>
                            <div className='space-y-3'>
                              <FormField
                                control={form.control}
                                name='requireSpecialChar'
                                render={({ field }) => (
                                  <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                                    <FormControl>
                                      <button
                                        type='button'
                                        onClick={() => field.onChange(!field.value)}
                                        className={cn(
                                          'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                                          field.value
                                            ? 'bg-cyan-600 border-cyan-600 text-white'
                                            : 'bg-white border-slate-300'
                                        )}
                                      >
                                        {field.value && (
                                          <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                            <path
                                              fillRule='evenodd'
                                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                              clipRule='evenodd'
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    </FormControl>
                                    <FormLabel
                                      className='text-sm font-medium text-slate-700 cursor-pointer'
                                      onClick={() => field.onChange(!field.value)}
                                    >
                                      Ký tự đặc biệt (@, #, $, %)
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name='requireNumber'
                                render={({ field }) => (
                                  <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                                    <FormControl>
                                      <button
                                        type='button'
                                        onClick={() => field.onChange(!field.value)}
                                        className={cn(
                                          'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                                          field.value
                                            ? 'bg-cyan-600 border-cyan-600 text-white'
                                            : 'bg-white border-slate-300'
                                        )}
                                      >
                                        {field.value && (
                                          <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                            <path
                                              fillRule='evenodd'
                                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                              clipRule='evenodd'
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    </FormControl>
                                    <FormLabel
                                      className='text-sm font-medium text-slate-700 cursor-pointer'
                                      onClick={() => field.onChange(!field.value)}
                                    >
                                      Chữ số (0-9)
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name='requireUppercase'
                                render={({ field }) => (
                                  <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                                    <FormControl>
                                      <button
                                        type='button'
                                        onClick={() => field.onChange(!field.value)}
                                        className={cn(
                                          'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                                          field.value
                                            ? 'bg-cyan-600 border-cyan-600 text-white'
                                            : 'bg-white border-slate-300'
                                        )}
                                      >
                                        {field.value && (
                                          <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                                            <path
                                              fillRule='evenodd'
                                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                              clipRule='evenodd'
                                            />
                                          </svg>
                                        )}
                                      </button>
                                    </FormControl>
                                    <FormLabel
                                      className='text-sm font-medium text-slate-700 cursor-pointer'
                                      onClick={() => field.onChange(!field.value)}
                                    >
                                      Chữ hoa (A-Z)
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Subscription & Final */}
                {currentStep === 6 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[5] = el
                    }}
                    className='space-y-6'
                  >
                    <div className='text-center mb-6'>
                      <h3 className='text-xl font-semibold text-slate-800 mb-2'>Chọn gói dịch vụ</h3>
                      <p className='text-slate-600'>Chọn gói dịch vụ phù hợp với nhu cầu của tổ chức</p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-6'>
                      {subscriptionPlans.map((plan) => (
                        <div
                          key={plan.value}
                          className={cn(
                            'relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg',
                            form.watch('plan') === plan.value
                              ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg scale-105'
                              : 'border-slate-200 bg-white hover:border-cyan-300'
                          )}
                          onClick={() => form.setValue('plan', plan.value)}
                        >
                          {plan.value === 'pro' && (
                            <Badge className='absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-300 text-white'>
                              Phổ biến
                            </Badge>
                          )}

                          <div className='text-center'>
                            <h4 className='text-lg font-semibold text-slate-800 mb-2'>{plan.label}</h4>
                            <div className='text-2xl font-bold text-cyan-600 mb-4'>{plan.price}</div>

                            <div className='text-sm text-slate-600 space-y-2'>
                              {plan.value === 'basic' && (
                                <div className='space-y-1'>
                                  <div>✓ Tối đa 5 sự kiện/tháng</div>
                                  <div>✓ Hỗ trợ cơ bản</div>
                                </div>
                              )}
                              {plan.value === 'pro' && (
                                <div className='space-y-1'>
                                  <div>✓ Không giới hạn sự kiện</div>
                                  <div>✓ Báo cáo chi tiết</div>
                                  <div>✓ Hỗ trợ ưu tiên</div>
                                </div>
                              )}
                              {plan.value === 'enterprise' && (
                                <div className='space-y-1'>
                                  <div>✓ Tất cả tính năng Pro</div>
                                  <div>✓ Không giới hạn người tham gia</div>
                                  <div>✓ Hỗ trợ 24/7</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <FormField control={form.control} name='plan' render={() => <FormMessage />} />

                    {/* Summary */}
                    <div className='mt-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200'>
                      <h4 className='text-lg font-semibold text-slate-800 mb-4'>Tóm tắt thông tin</h4>
                      <div className='grid md:grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='font-medium text-slate-700'>Tên tổ chức:</span>
                          <span className='ml-2 text-slate-600'>{form.watch('name') || 'Chưa nhập'}</span>
                        </div>
                        <div>
                          <span className='font-medium text-slate-700'>Ngành nghề:</span>
                          <span className='ml-2 text-slate-600'>{form.watch('industry') || 'Chưa chọn'}</span>
                        </div>
                        <div>
                          <span className='font-medium text-slate-700'>Email:</span>
                          <span className='ml-2 text-slate-600'>{form.watch('email') || 'Chưa nhập'}</span>
                        </div>
                        <div>
                          <span className='font-medium text-slate-700'>Gói dịch vụ:</span>
                          <span className='ml-2 text-slate-600'>
                            {subscriptionPlans.find((p) => p.value === form.watch('plan'))?.label || 'Chưa chọn'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className='flex justify-between pt-6 border-t border-slate-200'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className='flex items-center gap-2'
                  >
                    <ChevronLeft className='w-4 h-4' />
                    Quay lại
                  </Button>

                  {currentStep < 6 ? (
                    <Button
                      type='button'
                      onClick={nextStep}
                      className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white flex items-center gap-2'
                    >
                      Tiếp theo
                      <ChevronRight className='w-4 h-4' />
                    </Button>
                  ) : (
                    <Button
                      type='submit'
                      disabled={createOrganizationMutation.isPending || uploadLogoMutation.isPending}
                      className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2'
                    >
                      {createOrganizationMutation.isPending || uploadLogoMutation.isPending ? (
                        <>
                          <Loader2 className='w-4 h-4 animate-spin' />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Check className='w-4 h-4' />
                          Tạo tổ chức
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Conflict Resolution Dialog */}
        <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
          <AlertDialogContent style={{ width: '700px', maxWidth: '700px' }} className=''>
            <AlertDialogHeader>
              <AlertDialogTitle className='flex items-center gap-2'>
                <Building className='w-5 h-5 text-orange-500' />
                Tổ chức đã tồn tại
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className='space-y-4'>
                  <p>
                    Tổ chức "<strong>{existingOrganization?.name}</strong>" đã tồn tại trong hệ thống. Vui lòng chọn một
                    trong các hành động sau:
                  </p>

                  {existingOrganization && (
                    <div className='p-4 bg-slate-50 rounded-lg border'>
                      <div className='flex items-center gap-3 mb-2'>
                        <Avatar className='w-10 h-10'>
                          <AvatarImage src={existingOrganization?.logo} />
                          <AvatarFallback>
                            <Building className='w-5 h-5' />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className='font-semibold text-slate-800'>{existingOrganization?.name}</h4>
                          <p className='text-sm text-slate-600'>{existingOrganization?.industry}</p>
                        </div>
                      </div>
                      <p className='text-sm text-slate-500'>
                        Địa chỉ: {existingOrganization?.address?.street}, {existingOrganization?.address?.city}
                      </p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex-col space-y-2 sm:flex-col sm:space-x-0'>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-2 w-full'>
                <Button
                  variant='outline'
                  onClick={() => handleConflictResolution('request_admin')}
                  className='w-full text-blue-600 border-blue-200 hover:bg-blue-50'
                >
                  <Users className='w-4 h-4 mr-2' />
                  Yêu cầu quyền Admin
                </Button>
                <Button
                  variant='outline'
                  onClick={() => handleConflictResolution('request_user')}
                  className='w-full text-green-600 border-green-200 hover:bg-green-50'
                >
                  <MessageCircle className='w-4 h-4 mr-2' />
                  Yêu cầu tham gia
                </Button>
                <Button
                  variant='outline'
                  onClick={() => handleConflictResolution('dispute')}
                  className='w-full text-red-600 border-red-200 hover:bg-red-50'
                >
                  <AlertTriangle className='w-4 h-4 mr-2' />
                  Tranh chấp
                </Button>
              </div>
              <div className='flex gap-2 w-full'>
                <AlertDialogCancel className='flex-1'>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    form.setValue('name', '')
                    setShowConflictDialog(false)
                    setExistingOrganization(null as any)
                  }}
                  className='flex-1'
                >
                  Đổi tên khác
                </AlertDialogAction>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {showChatSystem && chatConfig && (
          <ChatSystem
            groupChatId={chatConfig.groupChatId}
            organizationName={form.watch('name') || 'Tổ chức'}
            isVisible={showChatSystem}
            onClose={closeChatSystem}
            requestType={chatConfig.requestType}
          />
        )}
      </div>
    </div>
  )
}

export default CreateOrganization

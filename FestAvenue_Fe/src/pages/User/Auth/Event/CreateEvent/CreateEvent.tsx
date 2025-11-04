import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Helmet } from 'react-helmet-async'
import { gsap } from 'gsap'
import { ChevronLeft, ChevronRight, Check, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getIdFromNameId } from '@/utils/utils'
import eventApis from '@/apis/event.api'
import AIApis from '@/apis/AI.api'
import type { resModerateContent } from '@/types/API.types'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import path from '@/constants/path'

import { createEventSchema, updateEventSchema, type EventFormData } from './types'
import { steps, getFieldsForStep, defaultFormValues } from './constants'
import { useCreateEvent, useAIDetection } from './hooks'
import {
  BasicInfo,
  EventDetails,
  MediaUpload,
  LocationInfo,
  ContactInfo,
  OrganizationInfo,
  HashtagsInput,
  FinalReview,
  ProgressSteps
} from './components'

function CreateEvent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showModerateDialog, setShowModerateDialog] = useState(false)
  const [moderateResult, setModerateResult] = useState<resModerateContent | null>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { nameId } = useParams<{ nameId: string }>()

  const isUpdateMode = !!nameId
  const eventId = nameId ? getIdFromNameId(nameId) : undefined

  // Use different schema based on mode
  const validationSchema = isUpdateMode ? updateEventSchema : createEventSchema

  const form = useForm<EventFormData, any, EventFormData>({
    resolver: zodResolver(validationSchema) as any,
    defaultValues: defaultFormValues,
    mode: 'onChange'
  })

  // Fetch event data if in update mode
  const { data: eventData, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventApis.getEventByEventCode(eventId!),
    enabled: !!eventId
  })

  useEffect(() => {
    if (eventData?.data) {
      const event = eventData.data

      const formData: EventFormData = {
        ...defaultFormValues,
        name: event.eventName ?? '',
        description: event.description ?? '',
        shortDescription: event.shortDescription ?? '',
        categoryId: event.categoryId ?? '',
        visibility: event.visibility ?? defaultFormValues.visibility,
        capacity: event.capacity ?? defaultFormValues.capacity,
        startEventLifecycleTime: event.startEventLifecycleTime ?? '',
        endEventLifecycleTime: event.endEventLifecycleTime ?? '',
        startTicketSaleTime: event.startTicketSaleTime ?? event.startEventLifecycleTime ?? '',
        endTicketSaleTime: event.endTicketSaleTime ?? event.endEventLifecycleTime ?? '',
        startTimeEventTime: event.startTimeEventTime ?? '',
        endTimeEventTime: event.endTimeEventTime ?? '',
        logoUrl: event.logoUrl ?? '',
        bannerUrl: event.bannerUrl ?? '',
        trailerUrl: event.trailerUrl ?? '',
        website: event.website ?? '',
        publicContactEmail: event.publicContactEmail ?? '',
        publicContactPhone: event.publicContactPhone ?? '',
        location: {
          ...defaultFormValues.location,
          ...event.location,
          address: {
            ...defaultFormValues.location.address,
            ...(event.location?.address ?? {})
          },
          coordinates: {
            ...defaultFormValues.location.coordinates,
            ...(event.location?.coordinates ?? {})
          }
        },
        hashtags: event.hashtags?.length ? event.hashtags : undefined,
        organization: {
          ...defaultFormValues.organization,
          ...event.organization,
          contact: {
            ...defaultFormValues.organization.contact,
            ...(event.organization?.contact ?? {})
          }
        }
      }

      form.reset(formData)
    }
  }, [eventData, form])

  const { onSubmit, createEventMutation, uploadFileMutation, organizationData } = useCreateEvent()

  // Fetch categories for moderate content API
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const categoryApis = await import('@/apis/categories.api')
      return categoryApis.default.getCategoryActive()
    }
  })

  const categories = categoriesData?.data || []

  const {
    logoDetection,
    bannerDetection,
    trailerDetection,
    setLogoFile,
    setBannerFile,
    setTrailerFile,
    detectLogo,
    detectBanner,
    detectTrailer,
    canProceed,
    isDetecting,
    hasUncheckedFiles,
    resetDetection
  } = useAIDetection()

  // Moderate content mutation
  const moderateContentMutation = useMutation({
    mutationFn: AIApis.moderateContentInEvent,
    onSuccess: (response) => {
      if (response?.data?.is_valid) {
        // Content is valid, proceed with creating event
        const formData = form.getValues()
        onSubmit(formData)
      } else {
        // Content is invalid, show dialog with reasons
        setModerateResult(response?.data || null)
        setShowModerateDialog(true)
      }
    },
    onError: () => {
      toast.error('Lỗi khi kiểm tra nội dung', {
        description: 'Vui lòng thử lại sau'
      })
    }
  })

  // GSAP Animations
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

  // Navigation
  const nextStep = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true

    // Special validation for media step with AI detection
    if (currentStep === 3) {
      if (isDetecting()) {
        toast.error('Vui lòng đợi kiểm tra AI hoàn tất')
        return
      }

      if (hasUncheckedFiles()) {
        toast.error('Vui lòng kiểm tra tất cả file đã tải lên bằng AI')
        return
      }

      if (!canProceed()) {
        toast.error('Vui lòng xóa các file chứa nội dung không phù hợp')
        return
      }
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 8))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const goToStep = (stepId: number) => {
    setCurrentStep(stepId)
  }

  const handleSubmit = (data: EventFormData) => {
    if (isDetecting()) {
      toast.error('Vui lòng đợi kiểm tra AI hoàn tất')
      return
    }

    if (!canProceed()) {
      toast.error('Vui lòng xóa các file chứa nội dung không phù hợp')
      return
    }

    // Get category name from categoryId
    const category = categories.find((cat: any) => cat.id === data.categoryId)
    const categoryName = category?.name || 'General'

    // Call moderate content API first
    moderateContentMutation.mutate({
      event_name: data.name,
      category: categoryName,
      short_description: data.shortDescription,
      detailed_description: data.description
    })
  }

  // Show loading state while fetching event data
  if (isLoadingEvent && eventId) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-8 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-blue-500 mx-auto mb-4' />
          <p className='text-slate-600'>Đang tải dữ liệu sự kiện...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-8'>
      <Helmet>
        <title>{isUpdateMode ? 'Cập nhật sự kiện' : 'Tạo sự kiện'} - FestAvenue</title>
        <meta name='description' content='Tạo sự kiện mới và quản lý chuyên nghiệp với FestAvenue' />
      </Helmet>

      <div className='max-w-4xl mx-auto px-4'>
        {/* Header */}
        <div className='mb-8'>
          <Button variant='ghost' onClick={() => navigate(path.home)} className='mb-4 cursor-pointer hover:bg-white/50'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Quay lại
          </Button>

          <div className='text-center'>
            <h1 className='text-3xl font-bold text-slate-800'>
              {isUpdateMode ? 'Cập nhật sự kiện' : 'Tạo sự kiện mới'}
            </h1>
            <p className='text-slate-600'>
              {isUpdateMode ? 'Cập nhật thông tin sự kiện của bạn' : 'Thiết lập sự kiện của bạn và gửi duyệt cho staff'}
            </p>
            {organizationData && (
              <p className='text-sm text-blue-600 mt-1 font-medium'>Tổ chức: {organizationData.name}</p>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} onStepClick={goToStep} />

        {/* Main Form Card */}
        <Card ref={cardRef} className='bg-white/80 backdrop-blur-sm shadow-xl border-0'>
          <CardHeader className='text-center pb-6'>
            <CardTitle className='text-xl font-semibold text-slate-800'>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription className='text-slate-600'>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[0] = el
                    }}
                  >
                    <BasicInfo form={form} />
                  </div>
                )}

                {/* Step 2: Event Details */}
                {currentStep === 2 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[1] = el
                    }}
                  >
                    <EventDetails form={form} />
                  </div>
                )}

                {/* Step 3: Media Upload with AI Detection */}
                {currentStep === 3 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[2] = el
                    }}
                  >
                    <MediaUpload
                      form={form}
                      logoDetection={logoDetection}
                      bannerDetection={bannerDetection}
                      trailerDetection={trailerDetection}
                      onLogoUpload={setLogoFile}
                      onBannerUpload={setBannerFile}
                      onTrailerUpload={setTrailerFile}
                      onDetectLogo={detectLogo}
                      onDetectBanner={detectBanner}
                      onDetectTrailer={detectTrailer}
                      onResetDetection={resetDetection}
                    />
                  </div>
                )}

                {/* Step 4: Location */}
                {currentStep === 4 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[3] = el
                    }}
                  >
                    <LocationInfo form={form} />
                  </div>
                )}

                {/* Step 5: Contact Info */}
                {currentStep === 5 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[4] = el
                    }}
                  >
                    <ContactInfo form={form} />
                  </div>
                )}

                {/* Step 6: Organization Info */}
                {currentStep === 6 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[5] = el
                    }}
                  >
                    <OrganizationInfo form={form} />
                  </div>
                )}

                {/* Step 7: Hashtags */}
                {currentStep === 7 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[6] = el
                    }}
                  >
                    <HashtagsInput form={form} />
                  </div>
                )}

                {/* Step 8: Final Review */}
                {currentStep === 8 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[7] = el
                    }}
                  >
                    <FinalReview form={form} />
                  </div>
                )}

                {/* Navigation Buttons */}
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

                  <div className='flex items-center gap-3'>
                    {currentStep < 8 ? (
                      <Button
                        type='button'
                        onClick={(e) => nextStep(e)}
                        disabled={isDetecting()}
                        className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white flex items-center gap-2'
                      >
                        {isDetecting() && currentStep === 3 ? (
                          <>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            Đang kiểm tra AI...
                          </>
                        ) : (
                          <>
                            Tiếp theo
                            <ChevronRight className='w-4 h-4' />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type='submit'
                        disabled={
                          createEventMutation.isPending ||
                          uploadFileMutation.isPending ||
                          isDetecting() ||
                          moderateContentMutation.isPending
                        }
                        className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2'
                      >
                        {moderateContentMutation.isPending ? (
                          <>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            Đang kiểm tra nội dung...
                          </>
                        ) : createEventMutation.isPending || uploadFileMutation.isPending ? (
                          <>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            {isUpdateMode ? 'Đang cập nhật sự kiện...' : 'Đang tạo sự kiện...'}
                          </>
                        ) : (
                          <>
                            <Check className='w-4 h-4' />
                            {isUpdateMode ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Moderate Content Rejection Dialog */}
        <Dialog open={showModerateDialog} onOpenChange={setShowModerateDialog}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <div className='flex items-center gap-3 mb-2'>
                <div className='p-2 bg-red-100 rounded-full'>
                  <AlertTriangle className='w-6 h-6 text-red-600' />
                </div>
                <DialogTitle className='text-xl'>Nội dung không phù hợp</DialogTitle>
              </div>
              <DialogDescription className='text-base'>
                Hệ thống AI đã phát hiện nội dung của sự kiện có thể không phù hợp. Vui lòng xem lại và chỉnh sửa.
              </DialogDescription>
            </DialogHeader>

            {moderateResult && (
              <div className='space-y-4 py-4'>
                {/* Confidence Score */}
                <div className='flex items-center justify-between p-3 bg-slate-50 rounded-lg'>
                  <span className='font-medium text-slate-700'>Điểm tin cậy:</span>
                  <Badge
                    variant='outline'
                    className={
                      moderateResult.confidence_score >= 0.7
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : 'bg-orange-100 text-orange-700 border-orange-300'
                    }
                  >
                    {(moderateResult.confidence_score * 100).toFixed(0)}%
                  </Badge>
                </div>

                {/* Reason */}
                {moderateResult.reason && (
                  <div className='space-y-2'>
                    <h4 className='font-semibold text-slate-800 flex items-center gap-2'>
                      <span className='w-2 h-2 bg-red-500 rounded-full'></span>
                      Lý do:
                    </h4>
                    <p className='text-slate-700 bg-red-50 p-3 rounded-lg border border-red-200'>
                      {moderateResult.reason}
                    </p>
                  </div>
                )}

                {/* Issues */}
                {moderateResult.issues && moderateResult.issues.length > 0 && (
                  <div className='space-y-2'>
                    <h4 className='font-semibold text-slate-800 flex items-center gap-2'>
                      <span className='w-2 h-2 bg-orange-500 rounded-full'></span>
                      Vấn đề phát hiện:
                    </h4>
                    <ul className='space-y-2'>
                      {moderateResult.issues.map((issue, index) => (
                        <li key={index} className='flex items-start gap-2 text-slate-700'>
                          <span className='text-orange-500 mt-1'>•</span>
                          <span className='flex-1'>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {moderateResult.suggestions && moderateResult.suggestions.length > 0 && (
                  <div className='space-y-2'>
                    <h4 className='font-semibold text-slate-800 flex items-center gap-2'>
                      <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                      Gợi ý cải thiện:
                    </h4>
                    <ul className='space-y-2'>
                      {moderateResult.suggestions.map((suggestion, index) => (
                        <li key={index} className='flex items-start gap-2 text-slate-700 bg-green-50 p-3 rounded-lg'>
                          <span className='text-green-600 font-bold mt-0.5'>{index + 1}.</span>
                          <span className='flex-1'>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className='gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowModerateDialog(false)}
                className='flex items-center gap-2'
              >
                Đóng
              </Button>
              <Button
                type='button'
                onClick={() => {
                  setShowModerateDialog(false)
                  setCurrentStep(1) // Go back to step 1 to edit
                }}
                className='bg-blue-600 hover:bg-blue-700 flex items-center gap-2'
              >
                Chỉnh sửa nội dung
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default CreateEvent

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Helmet } from 'react-helmet-async'
import { gsap } from 'gsap'
import { ChevronLeft, ChevronRight, Check, ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import path from '@/constants/path'

import { eventSchema, type EventFormData } from './types'
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
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const form = useForm<EventFormData, any, EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange'
  })

  const { onSubmit, createEventMutation, uploadFileMutation, organizationData } = useCreateEvent()

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

  const handleSubmit = async (data: EventFormData) => {
    if (isDetecting()) {
      toast.error('Vui lòng đợi kiểm tra AI hoàn tất')
      return
    }

    if (!canProceed()) {
      toast.error('Vui lòng xóa các file chứa nội dung không phù hợp')
      return
    }

    await onSubmit(data)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-8'>
      <Helmet>
        <title>Tạo sự kiện - FestAvenue</title>
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
            <h1 className='text-3xl font-bold text-slate-800'>Tạo sự kiện mới</h1>
            <p className='text-slate-600'>Thiết lập sự kiện của bạn và gửi duyệt cho staff</p>
            {organizationData && (
              <p className='text-sm text-blue-600 mt-1 font-medium'>Tổ chức: {organizationData.name}</p>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} />

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
                        disabled={createEventMutation.isPending || uploadFileMutation.isPending || isDetecting()}
                        className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2'
                      >
                        {createEventMutation.isPending || uploadFileMutation.isPending ? (
                          <>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            Đang tạo sự kiện...
                          </>
                        ) : (
                          <>
                            <Check className='w-4 h-4' />
                            Tạo sự kiện
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
      </div>
    </div>
  )
}

export default CreateEvent

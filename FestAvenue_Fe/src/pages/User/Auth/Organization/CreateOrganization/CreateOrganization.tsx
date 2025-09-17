/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Helmet } from 'react-helmet-async'
import { gsap } from 'gsap'
import { ChevronLeft, ChevronRight, Check, ArrowLeft, Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import path from '@/constants/path'
import ChatSystem from '@/components/custom/ChatSystem'
import packageApis from '@/apis/package.api'

// Import extracted modules
import { organizationSchema, type FormData } from './types'
import { steps, getFieldsForStep, defaultFormValues } from './constants'
import { useCreateOrganization, useLocationCheck, useChat } from './hooks'
import {
  BasicInfo,
  AddressContact,
  SocialMedia,
  BrandingSettings,
  SecuritySettings,
  SubscriptionFinal,
  ProgressSteps,
  ConflictDialog
} from './components'

function CreateOrganization() {
  const [currentStep, setCurrentStep] = useState(1)
  const [mapZoom] = useState(11)
  const [isCheckingName] = useState(false)

  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data: dataPackage } = useQuery({
    queryKey: ['dataPackage'],
    queryFn: () => packageApis.getPackageByStatus({ isPublic: true })
  })

  const form = useForm<FormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: defaultFormValues
  })

  // Use extracted hooks
  const {
    logoPreview,
    handleLogoUpload,
    onSubmit,
    onSave,
    createOrganizationMutation,
    saveOrganizationMutation,
    uploadLogoMutation
  } = useCreateOrganization(form)

  const {
    mapCenter,
    existingOrganization,
    showConflictDialog,
    setShowConflictDialog,
    isLocationChecked,
    isCheckingLocation,
    handleCheckLocation,
    handleMapClick,
    resetLocationCheck,
    setExistingOrganization
  } = useLocationCheck(form)

  const {
    showChatSystem,
    chatConfig,
    avatarPreview,
    isUploadingAvatar,
    handleAvatarSelect,
    handleRemoveAvatar,
    handleConflictResolution,
    handleAcceptRequest,
    closeChatSystem
  } = useChat()

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

  // Go to next step
  const nextStep = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true
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

  // Handle name change with location reset
  const handleNameChange = () => {
    resetLocationCheck()
  }

  // Handle conflict resolution with existing organization
  const handleConflictResolutionWithOrg = (type: 'request_admin' | 'request_user' | 'dispute') => {
    if (existingOrganization) {
      handleConflictResolution(type, existingOrganization)
      setShowConflictDialog(false)
    }
  }

  // Handle save functionality
  const handleSave = async () => {
    const formData = form.getValues()
    await onSave(formData)
  }

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
        <ProgressSteps currentStep={currentStep} />

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
                  >
                    <BasicInfo
                      form={form}
                      logoPreview={logoPreview}
                      handleLogoUpload={handleLogoUpload}
                      onNameChange={handleNameChange}
                      isCheckingName={isCheckingName}
                    />
                  </div>
                )}

                {/* Step 2: Address & Contact */}
                {currentStep === 2 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[1] = el
                    }}
                  >
                    <AddressContact
                      form={form}
                      mapCenter={mapCenter}
                      mapZoom={mapZoom}
                      onMapClick={handleMapClick}
                      onCheckLocation={handleCheckLocation}
                      isLocationChecked={isLocationChecked}
                      isCheckingLocation={isCheckingLocation}
                    />
                  </div>
                )}

                {/* Step 3: Social Media & Website */}
                {currentStep === 3 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[2] = el
                    }}
                  >
                    <SocialMedia form={form} />
                  </div>
                )}

                {/* Step 4: Branding Settings */}
                {currentStep === 4 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[3] = el
                    }}
                  >
                    <BrandingSettings form={form} />
                  </div>
                )}

                {/* Step 5: Security Settings */}
                {currentStep === 5 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[4] = el
                    }}
                  >
                    <SecuritySettings form={form} />
                  </div>
                )}

                {/* Step 6: Subscription & Final */}
                {currentStep === 6 && (
                  <div
                    ref={(el) => {
                      stepRefs.current[5] = el
                    }}
                  >
                    <SubscriptionFinal form={form} dataPackage={(dataPackage?.data as any) || []} />
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

                  <div className='flex items-center gap-3'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleSave}
                      disabled={saveOrganizationMutation.isPending}
                      className='flex items-center gap-2 bg-slate-100 hover:bg-slate-200'
                    >
                      {saveOrganizationMutation.isPending ? (
                        <>
                          <Loader2 className='w-4 h-4 animate-spin' />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className='w-4 h-4' />
                          Lưu nháp
                        </>
                      )}
                    </Button>

                    {currentStep < 6 ? (
                      <Button
                        type='button'
                        onClick={(e) => nextStep(e)}
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
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Conflict Resolution Dialog */}
        <ConflictDialog
          showConflictDialog={showConflictDialog}
          setShowConflictDialog={setShowConflictDialog}
          existingOrganization={existingOrganization}
          onConflictResolution={handleConflictResolutionWithOrg}
          form={form}
          onResetOrganization={() => setExistingOrganization(null as any)}
          avatarPreview={avatarPreview}
          isUploadingAvatar={isUploadingAvatar}
          onAvatarSelect={handleAvatarSelect}
          onRemoveAvatar={handleRemoveAvatar}
          onAcceptRequest={handleAcceptRequest}
        />

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

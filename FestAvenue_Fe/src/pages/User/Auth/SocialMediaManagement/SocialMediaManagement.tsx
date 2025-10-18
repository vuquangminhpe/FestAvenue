import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import gsap from 'gsap'
import { sampleLandingData } from '@/components/custom/landing_template/sampleData'
import type { LandingTemplateProps } from '@/components/custom/landing_template'
import TemplateSelector from './components/TemplateSelector'
import TemplatePreview from './components/TemplatePreview'
import TemplateEditor from './components/TemplateEditor'
import type { TemplateType, ViewMode } from './types'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getIdFromNameId } from '@/utils/utils'
import {
  useCheckIsEventOwner,
  useEventPackages,
  useUserPermissionsInEvent
} from '@/pages/User/Process/UserManagementInEvents/hooks/usePermissions'

export default function SocialMediaManagement() {
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventCode = getIdFromNameId(nameId)

  // Check permissions
  const { data: ownerCheckData, isLoading: isCheckingOwner } = useCheckIsEventOwner(eventCode)
  const { data: eventPackagesData } = useEventPackages(eventCode)
  const { data: permissionsData, isLoading: isLoadingPermissions } = useUserPermissionsInEvent(eventCode)

  const isEventOwner = ownerCheckData?.data || false
  const servicePackages = eventPackagesData?.data?.servicePackages || []
  const userServicePackageIds = permissionsData?.data?.servicePackageIds || []

  // Tìm service package ID cho Social Media (sử dụng exact name từ backend)
  const SOCIAL_MEDIA_PACKAGE_NAME = 'Quản lý social medias'
  const socialMediaPackage = servicePackages.find((pkg: any) => pkg.name === SOCIAL_MEDIA_PACKAGE_NAME)
  const hasSocialMediaPermission =
    isEventOwner || (socialMediaPackage && userServicePackageIds.includes(socialMediaPackage.id))

  const [viewMode, setViewMode] = useState<ViewMode>('select')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)
  const [templateData, setTemplateData] = useState<LandingTemplateProps>(sampleLandingData)
  const [isSaved, setIsSaved] = useState(false)

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('socialMediaTemplate')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setSelectedTemplate(parsed.templateType)
        setTemplateData(parsed.data)
        setIsSaved(true)
      } catch (error) {
        console.error('Failed to load saved template:', error)
      }
    }
  }, [])

  // Subtle entrance animation
  useEffect(() => {
    gsap.fromTo(
      '.social-media-container',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
  }, [viewMode])

  const handleSelectTemplate = (templateId: TemplateType) => {
    setSelectedTemplate(templateId)
    setIsSaved(false)
  }

  const handlePreview = (templateId: TemplateType) => {
    setSelectedTemplate(templateId)
    setViewMode('preview')
  }

  const handleEdit = () => {
    if (selectedTemplate) {
      setViewMode('edit')
    }
  }

  const handleSave = (data: LandingTemplateProps) => {
    setTemplateData(data)

    // Save to localStorage (mock API)
    const saveData = {
      templateType: selectedTemplate,
      data,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('socialMediaTemplate', JSON.stringify(saveData))
    setIsSaved(true)

    toast('Lưu thành công!')

    // Animate success
    gsap.fromTo(
      '.success-indicator',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out' }
    )
  }

  const handleBackToSelect = () => {
    setViewMode('select')
    setSelectedTemplate(null)
  }

  const handleBackToPreview = () => {
    setViewMode('preview')
  }

  const handleContinueEdit = () => {
    if (!selectedTemplate) {
      toast('Chưa chọn template')
      return
    }
    setViewMode('edit')
  }

  // Loading state
  if (isCheckingOwner || isLoadingPermissions) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='flex items-center gap-3'>
          <Loader2 className='w-8 h-8 animate-spin text-cyan-400' />
          <span className='text-gray-600 font-medium'>Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    )
  }

  // Permission denied
  if (!hasSocialMediaPermission) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='max-w-md text-center'>
          <div className='mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-6'>
            <Lock className='w-10 h-10 text-red-600' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-3'>Không có quyền truy cập</h2>
          <p className='text-gray-600 mb-6'>
            Bạn không có quyền quản lý social media cho sự kiện này. Vui lòng liên hệ chủ sự kiện để được cấp quyền.
          </p>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <p className='text-sm text-blue-800'>
              <strong>Gợi ý:</strong> Chủ sự kiện có thể cấp quyền cho bạn thông qua trang Quản người dùng.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='social-media-container min-h-screen'>
      {/* Success Indicator */}
      {isSaved && viewMode === 'select' && (
        <div className='fixed top-24 right-8 z-50 success-indicator'>
          <div className='bg-white rounded-lg shadow-lg border border-green-200 px-4 py-3 flex items-center gap-3'>
            <CheckCircle2 className='w-5 h-5 text-green-500' />
            <div>
              <p className='text-sm font-medium text-gray-900'>Template đã được lưu</p>
              <p className='text-xs text-gray-500'>Bạn có thể tiếp tục chỉnh sửa bất cứ lúc nào</p>
            </div>
            {selectedTemplate && (
              <Button
                size='sm'
                variant='outline'
                onClick={handleContinueEdit}
                className='ml-2 hover:bg-cyan-50 hover:text-cyan-600'
              >
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Selected Template Action Bar */}
      {selectedTemplate && !isSaved && viewMode === 'select' && (
        <div className='fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50 animate-in slide-in-from-bottom duration-300'>
          <div className='max-w-7xl mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center'>
                  <CheckCircle2 className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-900'>Đã chọn template</p>
                  <p className='text-xs text-gray-500'>Bạn có thể xem trước hoặc bắt đầu chỉnh sửa</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Button variant='outline' onClick={() => handlePreview(selectedTemplate)}>
                  Xem trước
                </Button>
                <Button
                  onClick={handleContinueEdit}
                  className='bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white'
                >
                  Tiếp tục chỉnh sửa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render based on view mode */}
      {viewMode === 'select' && (
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
          onPreview={handlePreview}
        />
      )}

      {viewMode === 'preview' && selectedTemplate && (
        <TemplatePreview
          templateType={selectedTemplate}
          templateData={templateData}
          onBack={handleBackToSelect}
          onEdit={handleEdit}
        />
      )}

      {viewMode === 'edit' && selectedTemplate && (
        <TemplateEditor
          templateType={selectedTemplate}
          templateData={templateData}
          onSave={handleSave}
          onBack={handleBackToPreview}
        />
      )}
    </div>
  )
}

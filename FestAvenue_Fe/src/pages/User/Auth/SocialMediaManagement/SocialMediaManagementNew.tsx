import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Loader2, Lock, Plus, List, FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SocialMediaForm, SocialMediaList, SocialMediaDetail } from './components'
import { getIdFromNameId } from '@/utils/utils'
import {
  useCheckIsEventOwner,
  useEventPackages,
  useUserPermissionsInEvent
} from '@/pages/User/Process/UserManagementInEvents/hooks/usePermissions'
import { useUsersStore } from '@/contexts/app.context'

type ViewType = 'list' | 'create' | 'edit' | 'detail'

export default function SocialMediaManagement() {
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventCode = getIdFromNameId(nameId)

  const { isProfile } = useUsersStore()
  const userId = isProfile?.id || ''
  const userName = isProfile ? `${isProfile.firstName} ${isProfile.lastName}` : ''
  const userAvatar = isProfile?.avatar || ''

  // Check permissions
  const { data: ownerCheckData, isLoading: isCheckingOwner } = useCheckIsEventOwner(eventCode)
  const { data: eventPackagesData } = useEventPackages(eventCode)
  const { data: permissionsData, isLoading: isLoadingPermissions } = useUserPermissionsInEvent(eventCode)

  const isEventOwner = ownerCheckData?.data || false
  const servicePackages = eventPackagesData?.data?.servicePackages || []
  const userServicePackageIds = permissionsData?.data?.servicePackageIds || []

  // Tìm service package ID cho Social Media
  const SOCIAL_MEDIA_PACKAGE_NAME = 'Quản lý social medias'
  const socialMediaPackage = servicePackages.find((pkg: any) => pkg.name === SOCIAL_MEDIA_PACKAGE_NAME)
  const hasSocialMediaPermission =
    isEventOwner || (socialMediaPackage && userServicePackageIds.includes(socialMediaPackage.id))

  // State management
  const [currentView, setCurrentView] = useState<ViewType>('list')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('list')

  // Handlers
  const handleCreate = () => {
    setCurrentView('create')
    setSelectedPostId(null)
    setActiveTab('create')
  }

  const handleEdit = (postId: string) => {
    setSelectedPostId(postId)
    setCurrentView('edit')
    setActiveTab('create')
  }

  const handleView = (postId: string) => {
    setSelectedPostId(postId)
    setCurrentView('detail')
    setActiveTab('detail')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedPostId(null)
    setActiveTab('list')
  }

  const handleFormSuccess = () => {
    handleBackToList()
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
              <strong>Gợi ý:</strong> Chủ sự kiện có thể cấp quyền cho bạn thông qua trang Quản lý người dùng.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Quản lý Social Media</h1>
          <p className='text-gray-600'>Tạo và quản lý các bài viết mạng xã hội cho sự kiện của bạn</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList className='grid w-full grid-cols-3 lg:w-[600px]'>
            <TabsTrigger value='list' className='flex items-center gap-2'>
              <List className='w-4 h-4' />
              Danh sách
            </TabsTrigger>
            <TabsTrigger value='create' className='flex items-center gap-2'>
              <Plus className='w-4 h-4' />
              {currentView === 'edit' ? 'Chỉnh sửa' : 'Tạo mới'}
            </TabsTrigger>
            <TabsTrigger value='detail' className='flex items-center gap-2' disabled={!selectedPostId}>
              <FileText className='w-4 h-4' />
              Chi tiết
            </TabsTrigger>
          </TabsList>

          {/* List Tab */}
          <TabsContent value='list'>
            <SocialMediaList eventCode={eventCode} onView={handleView} onEdit={handleEdit} onCreate={handleCreate} />
          </TabsContent>

          {/* Create/Edit Tab */}
          <TabsContent value='create'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h2 className='text-2xl font-bold mb-6'>
                {currentView === 'edit' ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
              </h2>
              <SocialMediaForm
                eventCode={eventCode}
                authorId={userId}
                authorName={userName}
                authorAvatar={userAvatar}
                initialData={null} // TODO: Load data when editing
                onSuccess={handleFormSuccess}
              />
            </div>
          </TabsContent>

          {/* Detail Tab */}
          <TabsContent value='detail'>
            {selectedPostId ? (
              <SocialMediaDetail postId={selectedPostId} onBack={handleBackToList} />
            ) : (
              <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
                <p className='text-gray-500'>Chọn một bài viết để xem chi tiết</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

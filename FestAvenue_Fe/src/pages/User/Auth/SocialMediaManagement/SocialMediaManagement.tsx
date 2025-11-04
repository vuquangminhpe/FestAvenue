import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { Loader2, Plus, List, FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SocialMediaList, SocialMediaDetail, TemplateSelector, TemplateEditor } from './components'
import { getIdFromNameId } from '@/utils/utils'
import {
  useCheckIsEventOwner,
  useEventPackages,
  useUserPermissionsInEvent
} from '@/pages/User/Process/UserManagementInEvents/hooks/usePermissions'
import { useUsersStore } from '@/contexts/app.context'
import { useSocialMediaDetail } from './hooks/useSocialMediaQueries'
import type { TemplateType } from './types'
import type { LandingTemplateProps } from '@/components/custom/landing_template'

type ViewType = 'list' | 'selectTemplate' | 'edit' | 'detail'

export default function SocialMediaManagement() {
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventCode = getIdFromNameId(nameId)

  const { isProfile } = useUsersStore()
  const userId = isProfile?.id || ''
  const userName = isProfile ? `${isProfile.firstName} ${isProfile.lastName}` : ''
  const userAvatar = isProfile?.avatar || ''

  // Check permissions - để lấy thông tin package ID cho permission guard
  const { isLoading: isCheckingOwner } = useCheckIsEventOwner(eventCode)
  const { data: eventPackagesData } = useEventPackages(eventCode)
  const { isLoading: isLoadingPermissions } = useUserPermissionsInEvent(eventCode)

  const servicePackages = eventPackagesData?.data?.servicePackages || []

  // Tìm service package ID cho Social Media
  const SOCIAL_MEDIA_PACKAGE_NAME = 'Quản lý social medias'
  const socialMediaPackage = servicePackages.find((pkg: any) => pkg.name === SOCIAL_MEDIA_PACKAGE_NAME)
  const socialMediaPackageId = socialMediaPackage?.id || ''

  // State management
  const [currentView, setCurrentView] = useState<ViewType>('list')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)
  const [editTemplateData, setEditTemplateData] = useState<LandingTemplateProps | null>(null)
  const [activeTab, setActiveTab] = useState('list')

  // Fetch post detail when editing (only when postId exists and in edit mode)
  const shouldFetchPost = !!selectedPostId && currentView === 'edit'
  const { data: postDetailData, isLoading: isLoadingPostDetail } = useSocialMediaDetail(
    shouldFetchPost ? selectedPostId : ''
  )

  // Map template number to template type
  const templateNumberToType: Record<number, TemplateType> = {
    1: 'template1',
    2: 'template2',
    3: 'template3',
    4: 'template4',
    5: 'template5',
    6: 'template6'
  }

  // Map social platform number to string
  const socialPlatformNumberToString: Record<
    number,
    'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube'
  > = {
    1: 'facebook',
    2: 'twitter',
    3: 'instagram',
    4: 'linkedin',
    5: 'tiktok',
    6: 'youtube'
  }

  // Load post data when editing
  useEffect(() => {
    if (postDetailData?.data && currentView === 'edit' && selectedPostId) {
      const post = postDetailData.data

      // Determine template type from API response
      // Assuming the API returns templateNumber in the post data
      const templateType = templateNumberToType[1] || 'template1' // Default to template1 if not found
      setSelectedTemplate(templateType)

      // Convert API data to template format
      const templateData: LandingTemplateProps = {
        bannerUrl: post.bannerUrl || '',
        title: post.title || '',
        subtitle: post.subtitle || '',
        description: post.description || '',
        authorName: post.authorName || userName,
        authorAvatar: post.authorAvatar || userAvatar,
        eventDate: '',
        eventLocation: '',
        content: post.body || '',
        images: (post.images || []).map((img) => ({
          id: img.imageInPostId || Date.now().toString(),
          url: img.url || '',
          caption: img.caption || '',
          likes: img.reactions?.length || 0,
          isExisting: !!img.imageInPostId, // Mark as existing if it has imageInPostId
          reactions:
            img.reactions?.map((_r) => ({
              type: 'like' as const,
              count: 1
            })) || [],
          comments:
            img.userCommentPosts?.map((c) => ({
              id: c.commentId,
              userId: c.userId,
              userName: c.fullName,
              userAvatar: c.avatar,
              content: c.commentText,
              createdAt: c.commentedAt
            })) || []
        })),
        relatedEvents: [],
        socialLinks: (post.socialLinks || []).map((link) => ({
          platform: socialPlatformNumberToString[link.platform] || 'facebook',
          url: link.url
        }))
      }

      setEditTemplateData(templateData)
    }
  }, [postDetailData, currentView, selectedPostId, userName, userAvatar])

  // Initial template data
  const getInitialTemplateData = (): LandingTemplateProps => ({
    bannerUrl: '',
    title: '',
    subtitle: '',
    description: '',
    authorName: userName,
    authorAvatar: userAvatar,
    eventDate: '',
    eventLocation: '',
    content: '',
    images: [],
    relatedEvents: [],
    socialLinks: []
  })

  // Handlers
  const handleCreate = () => {
    setCurrentView('selectTemplate')
    setSelectedPostId(null)
    setSelectedTemplate(null)
    setActiveTab('create')
  }

  const handleTemplateSelect = (templateType: TemplateType) => {
    setSelectedTemplate(templateType)
    setCurrentView('edit')
  }

  const handleTemplatePreview = (templateType: TemplateType) => {
    // TODO: Show preview modal
    console.log('Preview template:', templateType)
  }

  const handleEdit = (postId: string) => {
    setSelectedPostId(postId)
    setSelectedTemplate(null) // Reset template, will be set by useEffect
    setEditTemplateData(null) // Reset data
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
    setSelectedTemplate(null)
    setEditTemplateData(null)
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
            <SocialMediaList
              eventCode={eventCode}
              onView={handleView}
              onEdit={handleEdit}
              onCreate={handleCreate}
              socialMediaPackageId={socialMediaPackageId}
            />
          </TabsContent>

          {/* Create/Edit Tab */}
          <TabsContent value='create'>
            <div className='bg-white rounded-lg shadow-sm p-6'>
              {currentView === 'selectTemplate' && (
                <TemplateSelector
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleTemplateSelect}
                  onPreview={handleTemplatePreview}
                />
              )}
              {currentView === 'edit' && (
                <>
                  {isLoadingPostDetail && selectedPostId ? (
                    <div className='flex items-center justify-center py-12'>
                      <div className='flex items-center gap-3'>
                        <Loader2 className='w-8 h-8 animate-spin text-cyan-400' />
                        <span className='text-gray-600 font-medium'>Đang tải dữ liệu bài viết...</span>
                      </div>
                    </div>
                  ) : selectedTemplate ? (
                    <>
                      <h2 className='text-2xl font-bold mb-6'>
                        {selectedPostId ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                      </h2>
                      <TemplateEditor
                        templateType={selectedTemplate}
                        templateData={editTemplateData || getInitialTemplateData()}
                        eventCode={eventCode}
                        authorId={userId}
                        authorName={userName}
                        authorAvatar={userAvatar}
                        postId={selectedPostId || undefined}
                        onSave={handleFormSuccess}
                        onBack={handleBackToList}
                      />
                    </>
                  ) : (
                    <div className='flex items-center justify-center py-12'>
                      <div className='text-center text-gray-500'>
                        <p>Không thể tải template. Vui lòng thử lại.</p>
                        <button onClick={handleBackToList} className='mt-4 text-cyan-600 hover:text-cyan-700 underline'>
                          Quay lại danh sách
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
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

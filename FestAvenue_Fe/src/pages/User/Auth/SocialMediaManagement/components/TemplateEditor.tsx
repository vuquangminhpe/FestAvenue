import { useState, type ChangeEvent } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, Eye, Plus, Trash2, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { Template1, Template2, Template3, Template4, Template5, Template6 } from '@/components/custom/landing_template'
import type { LandingTemplateProps, SocialMediaImage, SocialLink } from '@/components/custom/landing_template'
import type { TemplateType } from '../types'
import serviceSocialMediaApis from '@/apis/serviceSocialMedia.api'
import mediaApis from '@/apis/media.api'
import type { BodySocialPost } from '@/types/serviceSocialMedia.types'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { templateEditorSchema, type TemplateEditorFormData } from '../validationSchema'

interface TemplateEditorProps {
  templateType: TemplateType
  templateData: LandingTemplateProps
  eventCode: string
  authorId: string
  authorName: string
  authorAvatar: string
  postId?: string // For edit mode
  onSave: () => void // Simplified callback
  onBack: () => void
}

const templateComponents = {
  template1: Template1,
  template2: Template2,
  template3: Template3,
  template4: Template4,
  template5: Template5,
  template6: Template6
}

// Map template type to number
const templateTypeToNumber: Record<TemplateType, number> = {
  template1: 1,
  template2: 2,
  template3: 3,
  template4: 4,
  template5: 5,
  template6: 6
}

// Map social platform string to number
const socialPlatformToNumber: Record<string, number> = {
  facebook: 1,
  twitter: 2,
  instagram: 3,
  linkedin: 4,
  tiktok: 5,
  youtube: 6
}

export default function TemplateEditor({
  templateType,
  templateData,
  eventCode,
  authorId,

  postId,
  onSave,
  onBack
}: TemplateEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [bannerSource, setBannerSource] = useState<'url' | 'upload'>(
    templateData.bannerUrl?.startsWith('data:') || templateData.bannerUrl?.startsWith('http') ? 'url' : 'upload'
  )
  const [avatarSource, setAvatarSource] = useState<'url' | 'upload'>(
    templateData.authorAvatar?.startsWith('data:') || templateData.authorAvatar?.startsWith('http') ? 'url' : 'upload'
  )
  const [imageSources, setImageSources] = useState<Record<string, 'url' | 'upload'>>(() => {
    const initial: Record<string, 'url' | 'upload'> = {}
    templateData.images.forEach((image) => {
      initial[image.id] = image.url.startsWith('data:') || image.url.startsWith('http') ? 'url' : 'upload'
    })
    return initial
  })

  const TemplateComponent = templateComponents[templateType]

  // Initialize form with validation
  const form = useForm<TemplateEditorFormData>({
    resolver: zodResolver(templateEditorSchema),
    mode: 'onChange',
    defaultValues: {
      title: templateData.title || '',
      subtitle: templateData.subtitle || '',
      description: templateData.description || '',
      bannerUrl: templateData.bannerUrl || '',
      authorName: templateData.authorName || '',
      authorAvatar: templateData.authorAvatar || '',
      eventDate: templateData.eventDate || '',
      eventLocation: templateData.eventLocation || '',
      content: templateData.content || '',
      images: templateData.images.length > 0 ? templateData.images : [],
      socialLinks: templateData.socialLinks && templateData.socialLinks.length > 0 ? templateData.socialLinks : []
    }
  })

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage
  } = useFieldArray({
    control: form.control,
    name: 'images'
  })

  const {
    fields: socialLinkFields,
    append: appendSocialLink,
    remove: removeSocialLink
  } = useFieldArray({
    control: form.control,
    name: 'socialLinks'
  })

  // Upload file to server and return URL
  const uploadFileToServer = async (file: File, uploadKey: string): Promise<string> => {
    setUploadingFiles((prev) => ({ ...prev, [uploadKey]: true }))
    try {
      const response = await mediaApis.uploadsStorage(file)
      if (response?.data) {
        toast.success('Tải ảnh lên thành công!')
        // Response structure: { data: string }
        return typeof response.data === 'string' ? response.data : (response.data as any).data || ''
      }
      throw new Error('Upload failed: No URL returned')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error?.message || 'Không thể tải ảnh lên')
      throw error
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [uploadKey]: false }))
    }
  }

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void,
    uploadKey: string
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 10MB')
      return
    }

    try {
      const url = await uploadFileToServer(file, uploadKey)
      onSuccess(url)
    } catch (error) {
      console.error('Failed to upload image:', error)
    }
  }

  const handleSave = async (data: TemplateEditorFormData) => {
    // Validate before saving
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Vui lòng kiểm tra và điền đầy đủ thông tin hợp lệ')
      return
    }

    setIsSaving(true)
    try {
      // Convert template data to API format
      const apiBody: BodySocialPost = {
        title: data.title,
        templateNumber: templateTypeToNumber[templateType],
        subtitle: data.subtitle || '',
        description: data.description,
        bannerUrl: data.bannerUrl,
        statusPostSocialMedia: 1, // 1 = Published
        body: data.content,
        imageInPosts: data.images.map((img) => ({
          url: img.url,
          caption: img.caption || ''
        })),
        videoUrl: '',
        audioUrl: '',
        eventCode,
        authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar || '',
        publishDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        expiryDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm:ss"), // 30 days from now
        socialLinks: (data.socialLinks || []).map((link) => ({
          platform: socialPlatformToNumber[link.platform] || 1,
          url: link.url
        }))
      }

      if (postId) {
        // Update existing post
        await serviceSocialMediaApis.updatePostSocialMedia({
          ...apiBody,
          postSocialMediaId: postId
        })
        toast.success('Cập nhật bài viết thành công!')
      } else {
        // Create new post
        await serviceSocialMediaApis.createPostSocialMedia(apiBody)
        toast.success('Tạo bài viết thành công!')
      }

      // Call parent onSave
      onSave()

      // Navigate back to list
      setTimeout(() => {
        onBack()
      }, 1000)
    } catch (error: any) {
      console.error('Error saving post:', error)
      toast.error(error?.message || 'Có lỗi xảy ra khi lưu bài viết')
    } finally {
      setIsSaving(false)
    }
  }

  const addImage = () => {
    const newImage: SocialMediaImage = {
      id: Date.now().toString(),
      url: '',
      caption: '',
      likes: 0,
      reactions: [],
      comments: []
    }
    appendImage(newImage)
    setImageSources((prev) => ({ ...prev, [newImage.id]: 'url' }))
  }

  const addSocialLink = () => {
    const newLink: SocialLink = {
      platform: 'facebook',
      url: ''
    }
    appendSocialLink(newLink)
  }

  // Get current form values for preview
  const formValues = form.watch()
  const previewData: LandingTemplateProps = {
    ...templateData,
    ...formValues
  }

  // Check if there are validation errors
  const hasErrors = Object.keys(form.formState.errors).length > 0

  if (showPreview) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'>
          <div className='max-w-7xl mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <Button variant='ghost' onClick={() => setShowPreview(false)} className='gap-2'>
                <ArrowLeft className='w-4 h-4' />
                Quay lại chỉnh sửa
              </Button>
              <Button
                onClick={() => handleSave(formValues)}
                disabled={isSaving || hasErrors}
                className='gap-2 bg-gradient-to-r from-cyan-400 to-blue-400'
              >
                {isSaving ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4' />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className='mt-6'>
          <TemplateComponent {...previewData} />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' onClick={onBack} className='gap-2 hover:bg-cyan-50 hover:text-cyan-600'>
                <ArrowLeft className='w-4 h-4' />
                Quay lại
              </Button>
              <div className='h-6 w-px bg-gray-300' />
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>Chỉnh sửa Template</h2>
                <p className='text-sm text-gray-500'>Tùy chỉnh nội dung và kiểm tra tính hợp lệ</p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Button variant='outline' onClick={() => setShowPreview(true)} className='gap-2'>
                <Eye className='w-4 h-4' />
                Xem trước
              </Button>
              <Button
                onClick={form.handleSubmit(handleSave)}
                disabled={isSaving || hasErrors}
                className='gap-2 bg-gradient-to-r from-cyan-400 to-blue-400'
              >
                {isSaving ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4' />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Errors Alert */}
      {hasErrors && (
        <div className='max-w-7xl mx-auto px-4 pt-4'>
          <Alert variant='destructive' className='border-red-200 bg-red-50'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <div className='font-medium mb-2'>Vui lòng kiểm tra các lỗi sau:</div>
              <ul className='list-disc list-inside space-y-1 text-sm'>
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {error.message as string}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Editor Content */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <form onSubmit={form.handleSubmit(handleSave)}>
          <Tabs defaultValue='basic' className='w-full'>
            <TabsList className='grid w-full grid-cols-3 max-w-2xl mx-auto mb-8'>
              <TabsTrigger value='basic'>Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value='images'>Hình ảnh ({imageFields.length})</TabsTrigger>
              <TabsTrigger value='social'>Mạng xã hội ({socialLinkFields.length})</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value='basic' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin banner</CardTitle>
                  <CardDescription>Cập nhật thông tin hiển thị chính</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='bannerUrl'>
                      URL Banner <span className='text-red-500'>*</span>
                    </Label>
                    <Tabs
                      value={bannerSource}
                      onValueChange={(value) => {
                        const nextValue = value as 'url' | 'upload'
                        setBannerSource(nextValue)
                        if (nextValue === 'url' && form.getValues('bannerUrl').startsWith('data:')) {
                          form.setValue('bannerUrl', '', { shouldValidate: true })
                        }
                      }}
                      className='space-y-3'
                    >
                      <TabsList className='grid grid-cols-2 w-full'>
                        <TabsTrigger value='url'>Sử dụng URL</TabsTrigger>
                        <TabsTrigger value='upload'>Tải từ máy</TabsTrigger>
                      </TabsList>
                      <TabsContent value='url' className='m-0 space-y-2'>
                        <Input
                          {...form.register('bannerUrl')}
                          placeholder='https://example.com/banner.jpg'
                          className={form.formState.errors.bannerUrl ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.bannerUrl && (
                          <p className='text-sm text-red-500'>{form.formState.errors.bannerUrl.message}</p>
                        )}
                      </TabsContent>
                      <TabsContent value='upload' className='m-0 space-y-2'>
                        <Input
                          type='file'
                          accept='image/*'
                          disabled={uploadingFiles['banner']}
                          onChange={(event) =>
                            void handleImageUpload(
                              event,
                              (url) => {
                                setBannerSource('upload')
                                form.setValue('bannerUrl', url, { shouldValidate: true })
                              },
                              'banner'
                            )
                          }
                        />
                        {uploadingFiles['banner'] && (
                          <div className='flex items-center gap-2 text-sm text-cyan-600'>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            <span>Đang tải ảnh lên...</span>
                          </div>
                        )}
                        <p className='text-xs text-gray-500'>Ảnh sẽ được tải lên server và lưu URL.</p>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='title'>
                      Tiêu đề <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      {...form.register('title')}
                      placeholder='Tên sự kiện'
                      className={form.formState.errors.title ? 'border-red-500' : ''}
                    />
                    {form.formState.errors.title && (
                      <p className='text-sm text-red-500'>{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='subtitle'>Phụ đề</Label>
                    <Input {...form.register('subtitle')} placeholder='Mô tả ngắn' />
                    {form.formState.errors.subtitle && (
                      <p className='text-sm text-red-500'>{form.formState.errors.subtitle.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description'>
                      Mô tả <span className='text-red-500'>*</span>
                    </Label>
                    <Textarea
                      {...form.register('description')}
                      placeholder='Mô tả chi tiết về sự kiện'
                      rows={4}
                      className={form.formState.errors.description ? 'border-red-500' : ''}
                    />
                    {form.formState.errors.description && (
                      <p className='text-sm text-red-500'>{form.formState.errors.description.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tác giả & sự kiện</CardTitle>
                  <CardDescription>Thông tin người tổ chức và chi tiết sự kiện</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='authorName'>
                      Tên tác giả <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      {...form.register('authorName')}
                      placeholder='Tên người tổ chức'
                      className={form.formState.errors.authorName ? 'border-red-500' : ''}
                    />
                    {form.formState.errors.authorName && (
                      <p className='text-sm text-red-500'>{form.formState.errors.authorName.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='authorAvatar'>URL Avatar</Label>
                    <Tabs
                      value={avatarSource}
                      onValueChange={(value) => {
                        const nextValue = value as 'url' | 'upload'
                        setAvatarSource(nextValue)
                        if (nextValue === 'url' && (form.getValues('authorAvatar') || '').startsWith('data:')) {
                          form.setValue('authorAvatar', '', { shouldValidate: true })
                        }
                      }}
                      className='space-y-3'
                    >
                      <TabsList className='grid grid-cols-2 w-full'>
                        <TabsTrigger value='url'>Sử dụng URL</TabsTrigger>
                        <TabsTrigger value='upload'>Tải từ máy</TabsTrigger>
                      </TabsList>
                      <TabsContent value='url' className='m-0 space-y-2'>
                        <Input {...form.register('authorAvatar')} placeholder='https://example.com/avatar.jpg' />
                        {form.formState.errors.authorAvatar && (
                          <p className='text-sm text-red-500'>{form.formState.errors.authorAvatar.message}</p>
                        )}
                      </TabsContent>
                      <TabsContent value='upload' className='m-0 space-y-2'>
                        <Input
                          type='file'
                          accept='image/*'
                          disabled={uploadingFiles['avatar']}
                          onChange={(event) =>
                            void handleImageUpload(
                              event,
                              (url) => {
                                setAvatarSource('upload')
                                form.setValue('authorAvatar', url, { shouldValidate: true })
                              },
                              'avatar'
                            )
                          }
                        />
                        {uploadingFiles['avatar'] && (
                          <div className='flex items-center gap-2 text-sm text-cyan-600'>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            <span>Đang tải ảnh lên...</span>
                          </div>
                        )}
                        <p className='text-xs text-gray-500'>Ảnh sẽ được tải lên server và lưu URL.</p>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* <div className='space-y-2'>
                    <Label htmlFor='eventDate'>Ngày sự kiện</Label>
                    <Input {...form.register('eventDate')} placeholder='June 15-17, 2025' />
                    {form.formState.errors.eventDate && (
                      <p className='text-sm text-red-500'>{form.formState.errors.eventDate.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='eventLocation'>Địa điểm</Label>
                    <Input {...form.register('eventLocation')} placeholder='Central Park, New York' />
                    {form.formState.errors.eventLocation && (
                      <p className='text-sm text-red-500'>{form.formState.errors.eventLocation.message}</p>
                    )}
                  </div> */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nội dung</CardTitle>
                  <CardDescription>Nội dung chi tiết của bài viết</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <Label htmlFor='content'>
                      Nội dung <span className='text-red-500'>*</span>
                    </Label>
                    <Textarea
                      {...form.register('content')}
                      placeholder='Nội dung chi tiết...'
                      rows={8}
                      className={`resize-none ${form.formState.errors.content ? 'border-red-500' : ''}`}
                    />
                    {form.formState.errors.content && (
                      <p className='text-sm text-red-500'>{form.formState.errors.content.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value='images' className='space-y-6'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle>Thư viện hình ảnh</CardTitle>
                      <CardDescription>
                        Quản lý hình ảnh hiển thị trong template (Tối thiểu 1, tối đa 20 ảnh)
                      </CardDescription>
                    </div>
                    <Button
                      type='button'
                      onClick={addImage}
                      disabled={imageFields.length >= 20}
                      className='gap-2 bg-gradient-to-r from-cyan-400 to-blue-400'
                    >
                      <Plus className='w-4 h-4' />
                      Thêm ảnh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {form.formState.errors.images && (
                    <Alert variant='destructive'>
                      <AlertCircle className='h-4 w-4' />
                      <AlertDescription>{form.formState.errors.images.message}</AlertDescription>
                    </Alert>
                  )}

                  {imageFields.map((field, index) => (
                    <Card key={field.id} className='border-2'>
                      <CardHeader>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <ImageIcon className='w-5 h-5 text-cyan-500' />
                            <CardTitle className='text-base'>Hình ảnh {index + 1}</CardTitle>
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeImage(index)}
                            className='text-red-500 hover:text-red-600 hover:bg-red-50'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                          <Label>
                            URL hình ảnh <span className='text-red-500'>*</span>
                          </Label>
                          <Tabs
                            value={imageSources[field.id] ?? 'url'}
                            onValueChange={(value) => {
                              const nextValue = value as 'url' | 'upload'
                              setImageSources((prev) => ({ ...prev, [field.id]: nextValue }))
                              if (nextValue === 'url' && field.url.startsWith('data:')) {
                                form.setValue(`images.${index}.url`, '', { shouldValidate: true })
                              }
                            }}
                            className='space-y-3'
                          >
                            <TabsList className='grid grid-cols-2 w-full'>
                              <TabsTrigger value='url'>Sử dụng URL</TabsTrigger>
                              <TabsTrigger value='upload'>Tải từ máy</TabsTrigger>
                            </TabsList>
                            <TabsContent value='url' className='m-0 space-y-2'>
                              <Input
                                {...form.register(`images.${index}.url`)}
                                placeholder='https://example.com/image.jpg'
                                className={form.formState.errors.images?.[index]?.url ? 'border-red-500' : ''}
                              />
                              {form.formState.errors.images?.[index]?.url && (
                                <p className='text-sm text-red-500'>
                                  {form.formState.errors.images[index]?.url?.message}
                                </p>
                              )}
                            </TabsContent>
                            <TabsContent value='upload' className='m-0 space-y-2'>
                              <Input
                                type='file'
                                accept='image/*'
                                disabled={uploadingFiles[`image-${field.id}`]}
                                onChange={(event) =>
                                  void handleImageUpload(
                                    event,
                                    (url) => {
                                      setImageSources((prev) => ({ ...prev, [field.id]: 'upload' }))
                                      form.setValue(`images.${index}.url`, url, { shouldValidate: true })
                                    },
                                    `image-${field.id}`
                                  )
                                }
                              />
                              {uploadingFiles[`image-${field.id}`] && (
                                <div className='flex items-center gap-2 text-sm text-cyan-600'>
                                  <Loader2 className='w-4 h-4 animate-spin' />
                                  <span>Đang tải ảnh lên...</span>
                                </div>
                              )}
                              <p className='text-xs text-gray-500'>Ảnh sẽ được tải lên server và lưu URL.</p>
                            </TabsContent>
                          </Tabs>
                        </div>

                        <div className='space-y-2'>
                          <Label>Mô tả</Label>
                          <Input {...form.register(`images.${index}.caption`)} placeholder='Mô tả hình ảnh' />
                          {form.formState.errors.images?.[index]?.caption && (
                            <p className='text-sm text-red-500'>
                              {form.formState.errors.images[index]?.caption?.message}
                            </p>
                          )}
                        </div>

                        {field.url && (
                          <div className='mt-4'>
                            <img
                              src={field.url}
                              alt={field.caption || `Image ${index + 1}`}
                              className='w-full h-48 object-cover rounded-lg'
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {imageFields.length === 0 && (
                    <div className='text-center py-12 text-gray-500'>
                      <ImageIcon className='w-12 h-12 mx-auto mb-4 opacity-50' />
                      <p>Chưa có hình ảnh nào. Nhấn "Thêm ảnh" để bắt đầu.</p>
                      <p className='text-sm text-red-500 mt-2'>Yêu cầu: Cần có ít nhất 1 hình ảnh</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Links Tab */}
            <TabsContent value='social' className='space-y-6'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle>Liên kết mạng xã hội</CardTitle>
                      <CardDescription>Thêm các tài khoản mạng xã hội (Tối đa 10 liên kết)</CardDescription>
                    </div>
                    <Button
                      type='button'
                      onClick={addSocialLink}
                      disabled={socialLinkFields.length >= 10}
                      className='gap-2 bg-gradient-to-r from-cyan-400 to-blue-400'
                    >
                      <Plus className='w-4 h-4' />
                      Thêm liên kết
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {form.formState.errors.socialLinks && (
                    <Alert variant='destructive'>
                      <AlertCircle className='h-4 w-4' />
                      <AlertDescription>{(form.formState.errors.socialLinks as any).message}</AlertDescription>
                    </Alert>
                  )}

                  {socialLinkFields.map((field, index) => (
                    <Card key={field.id} className='border-2'>
                      <CardContent className='pt-6'>
                        <div className='flex items-end gap-4'>
                          <div className='flex-1 space-y-2'>
                            <Label>Nền tảng</Label>
                            <select
                              {...form.register(`socialLinks.${index}.platform`)}
                              className='w-full h-10 px-3 rounded-md border border-gray-300 bg-white'
                            >
                              <option value='facebook'>Facebook</option>
                              <option value='instagram'>Instagram</option>
                              <option value='twitter'>Twitter</option>
                              <option value='linkedin'>LinkedIn</option>
                              <option value='tiktok'>TikTok</option>
                              <option value='youtube'>YouTube</option>
                            </select>
                            {form.formState.errors.socialLinks?.[index]?.platform && (
                              <p className='text-sm text-red-500'>
                                {form.formState.errors.socialLinks[index]?.platform?.message}
                              </p>
                            )}
                          </div>
                          <div className='flex-[2] space-y-2'>
                            <Label>
                              URL <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                              {...form.register(`socialLinks.${index}.url`)}
                              placeholder='https://facebook.com/yourpage'
                              className={form.formState.errors.socialLinks?.[index]?.url ? 'border-red-500' : ''}
                            />
                            {form.formState.errors.socialLinks?.[index]?.url && (
                              <p className='text-sm text-red-500'>
                                {form.formState.errors.socialLinks[index]?.url?.message}
                              </p>
                            )}
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeSocialLink(index)}
                            className='text-red-500 hover:text-red-600 hover:bg-red-50'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {socialLinkFields.length === 0 && (
                    <div className='text-center py-12 text-gray-500'>
                      <p>Chưa có liên kết mạng xã hội. Nhấn "Thêm liên kết" để bắt đầu.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>

      {/* Fixed Bottom Save Button */}
      <div className='fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-40'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Nhớ lưu thay đổi trước khi rời đi</p>
              {hasErrors && (
                <p className='text-sm text-red-500 font-medium'>
                  Có {Object.keys(form.formState.errors).length} lỗi cần sửa
                </p>
              )}
            </div>
            <div className='flex items-center gap-3'>
              <Button type='button' variant='outline' onClick={() => setShowPreview(true)}>
                Xem trước
              </Button>
              <Button
                type='button'
                onClick={form.handleSubmit(handleSave)}
                disabled={isSaving || hasErrors}
                className='bg-gradient-to-r from-cyan-400 to-blue-400'
              >
                {isSaving ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

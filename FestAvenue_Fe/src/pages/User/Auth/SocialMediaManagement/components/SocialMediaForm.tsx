import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { socialMediaPostSchema, type SocialMediaPostFormData } from '../constants/socialMediaValidation'
import {
  SOCIAL_MEDIA_DEFAULT_VALUES,
  POST_STATUS_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS
} from '../constants/socialMediaFormFields'
import { useCreateSocialMedia, useUpdateSocialMedia } from '../hooks/useSocialMediaQueries'
import type { SocialPostRes } from '@/types/serviceSocialMedia.types'

interface SocialMediaFormProps {
  eventCode: string
  authorId: string
  authorName: string
  authorAvatar: string
  initialData?: SocialPostRes | null
  onSuccess?: () => void
}

export default function SocialMediaForm({
  eventCode,
  authorId,
  authorName,
  authorAvatar,
  initialData,
  onSuccess
}: SocialMediaFormProps) {
  const isEditMode = !!initialData

  const createMutation = useCreateSocialMedia()
  const updateMutation = useUpdateSocialMedia()

  const form = useForm<SocialMediaPostFormData>({
    resolver: zodResolver(socialMediaPostSchema),
    defaultValues: SOCIAL_MEDIA_DEFAULT_VALUES
  })

  // Load initial data khi edit
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        description: initialData.description || '',
        bannerUrl: initialData.bannerUrl || '',
        body: initialData.body || '',
        statusPostSocialMedia: initialData.status || 0,
        imageInPosts:
          initialData.images?.map((img) => ({
            url: img.url,
            caption: img.caption
          })) || [],
        videoUrl: initialData.videoUrl || '',
        audioUrl: initialData.audioUrl || '',
        publishDate: initialData.publishDate || new Date().toISOString(),
        expiryDate: initialData.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        socialLinks: initialData.socialLinks || []
      })
    }
  }, [initialData, form])

  const onSubmit = async (data: SocialMediaPostFormData) => {
    try {
      // Transform data to match API expectations
      const payload: any = {
        title: data.title,
        subtitle: data.subtitle || '',
        description: data.description,
        bannerUrl: data.bannerUrl,
        body: data.body,
        statusPostSocialMedia: data.statusPostSocialMedia,
        imageInPosts: data.imageInPosts || [],
        videoUrl: data.videoUrl || '',
        audioUrl: data.audioUrl || '',
        publishDate: data.publishDate,
        expiryDate: data.expiryDate,
        socialLinks: data.socialLinks || [],
        eventCode,
        authorId,
        authorName,
        authorAvatar
      }

      if (isEditMode && initialData) {
        await updateMutation.mutateAsync({
          ...payload,
          postSocialMediaId: initialData.id
        })
      } else {
        await createMutation.mutateAsync(payload)
      }

      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Nhập thông tin chính của bài viết</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Title */}
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tiêu đề <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập tiêu đề bài viết' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subtitle */}
            <FormField
              control={form.control}
              name='subtitle'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phụ đề</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập phụ đề (tùy chọn)' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mô tả ngắn <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder='Nhập mô tả ngắn gọn về bài viết' rows={3} {...field} />
                  </FormControl>
                  <FormDescription>Mô tả sẽ hiển thị trong danh sách bài viết</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Banner URL */}
            <FormField
              control={form.control}
              name='bannerUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    URL Banner <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='flex gap-2'>
                      <Input placeholder='https://example.com/banner.jpg' {...field} />
                      <Button type='button' variant='outline' size='icon'>
                        <Upload className='w-4 h-4' />
                      </Button>
                    </div>
                  </FormControl>
                  {field.value && (
                    <div className='mt-2 relative w-full h-48 rounded-lg overflow-hidden border'>
                      <img
                        src={field.value}
                        alt='Banner preview'
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Invalid+Image'
                        }}
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name='statusPostSocialMedia'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Trạng thái <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn trạng thái' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {POST_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>Nội dung bài viết</CardTitle>
            <CardDescription>Nội dung chi tiết của bài viết</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='body'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nội dung <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder='Nhập nội dung chi tiết bài viết...' rows={10} {...field} />
                  </FormControl>
                  <FormDescription>Hỗ trợ Markdown và HTML</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Publish Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt xuất bản</CardTitle>
            <CardDescription>Thời gian xuất bản và hết hạn</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Publish Date */}
              <FormField
                control={form.control}
                name='publishDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ngày xuất bản <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiry Date */}
              <FormField
                control={form.control}
                name='expiryDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ngày hết hạn <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='datetime-local'
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media Card */}
        <Card>
          <CardHeader>
            <CardTitle>Media (Tùy chọn)</CardTitle>
            <CardDescription>Thêm video, audio và hình ảnh</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Video URL */}
            <FormField
              control={form.control}
              name='videoUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Video</FormLabel>
                  <FormControl>
                    <Input placeholder='https://youtube.com/watch?v=...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Audio URL */}
            <FormField
              control={form.control}
              name='audioUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Audio</FormLabel>
                  <FormControl>
                    <Input placeholder='https://example.com/audio.mp3' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Array */}
            <ImageArrayField form={form} />
          </CardContent>
        </Card>

        {/* Social Links Card */}
        <Card>
          <CardHeader>
            <CardTitle>Liên kết mạng xã hội (Tùy chọn)</CardTitle>
            <CardDescription>Thêm các liên kết đến mạng xã hội</CardDescription>
          </CardHeader>
          <CardContent>
            <SocialLinksArrayField form={form} />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => form.reset()} disabled={isSubmitting}>
            Đặt lại
          </Button>
          <Button type='submit' disabled={isSubmitting} className='min-w-[120px]'>
            {isSubmitting ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Đang lưu...
              </>
            ) : (
              <>{isEditMode ? 'Cập nhật' : 'Tạo bài viết'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

/**
 * Component quản lý mảng hình ảnh
 */
function ImageArrayField({ form }: { form: any }) {
  const images = form.watch('imageInPosts') || []

  const addImage = () => {
    const current = form.getValues('imageInPosts') || []
    form.setValue('imageInPosts', [...current, { url: '', caption: '' }])
  }

  const removeImage = (index: number) => {
    const current = form.getValues('imageInPosts') || []
    form.setValue(
      'imageInPosts',
      current.filter((_: any, i: number) => i !== index)
    )
  }

  const updateImage = (index: number, field: 'url' | 'caption', value: string) => {
    const current = form.getValues('imageInPosts') || []
    current[index][field] = value
    form.setValue('imageInPosts', [...current])
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Label>Hình ảnh trong bài viết</Label>
        <Button type='button' size='sm' variant='outline' onClick={addImage}>
          <Plus className='w-4 h-4 mr-1' />
          Thêm hình ảnh
        </Button>
      </div>

      {images.length === 0 ? (
        <div className='text-center py-8 text-gray-500 border-2 border-dashed rounded-lg'>
          Chưa có hình ảnh nào. Nhấn "Thêm hình ảnh" để bắt đầu.
        </div>
      ) : (
        <div className='space-y-3'>
          {images.map((image: any, index: number) => (
            <Card key={index}>
              <CardContent className='pt-4'>
                <div className='space-y-3'>
                  <div className='flex items-start gap-2'>
                    <div className='flex-1 space-y-2'>
                      <Input
                        placeholder='URL hình ảnh'
                        value={image.url}
                        onChange={(e) => updateImage(index, 'url', e.target.value)}
                      />
                      <Input
                        placeholder='Caption (tùy chọn)'
                        value={image.caption}
                        onChange={(e) => updateImage(index, 'caption', e.target.value)}
                      />
                    </div>
                    <Button type='button' size='icon' variant='destructive' onClick={() => removeImage(index)}>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                  {image.url && (
                    <div className='relative w-full h-32 rounded overflow-hidden border'>
                      <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Invalid+Image'
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Component quản lý mảng social links
 */
function SocialLinksArrayField({ form }: { form: any }) {
  const links = form.watch('socialLinks') || []

  const addLink = () => {
    const current = form.getValues('socialLinks') || []
    form.setValue('socialLinks', [...current, { platform: 0, url: '' }])
  }

  const removeLink = (index: number) => {
    const current = form.getValues('socialLinks') || []
    form.setValue(
      'socialLinks',
      current.filter((_: any, i: number) => i !== index)
    )
  }

  const updateLink = (index: number, field: 'platform' | 'url', value: string | number) => {
    const current = form.getValues('socialLinks') || []
    current[index][field] = value
    form.setValue('socialLinks', [...current])
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Label>Liên kết mạng xã hội</Label>
        <Button type='button' size='sm' variant='outline' onClick={addLink}>
          <Plus className='w-4 h-4 mr-1' />
          Thêm liên kết
        </Button>
      </div>

      {links.length === 0 ? (
        <div className='text-center py-8 text-gray-500 border-2 border-dashed rounded-lg'>
          Chưa có liên kết nào. Nhấn "Thêm liên kết" để bắt đầu.
        </div>
      ) : (
        <div className='space-y-3'>
          {links.map((link: any, index: number) => (
            <Card key={index}>
              <CardContent className='pt-4'>
                <div className='flex items-start gap-2'>
                  <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-2'>
                    <Select
                      value={String(link.platform)}
                      onValueChange={(value) => updateLink(index, 'platform', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn nền tảng' />
                      </SelectTrigger>
                      <SelectContent>
                        {SOCIAL_PLATFORM_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder='URL liên kết'
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                    />
                  </div>
                  <Button type='button' size='icon' variant='destructive' onClick={() => removeLink(index)}>
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

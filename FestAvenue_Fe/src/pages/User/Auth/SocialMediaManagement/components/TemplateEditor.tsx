import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Eye, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { Template1, Template2, Template3, Template4, Template5, Template6 } from '@/components/custom/landing_template'
import type {
  LandingTemplateProps,
  SocialMediaImage,
  RelatedEvent,
  SocialLink
} from '@/components/custom/landing_template'
import type { TemplateType } from '../types'

interface TemplateEditorProps {
  templateType: TemplateType
  templateData: LandingTemplateProps
  onSave: (data: LandingTemplateProps) => void
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

export default function TemplateEditor({ templateType, templateData, onSave, onBack }: TemplateEditorProps) {
  const [editedData, setEditedData] = useState<LandingTemplateProps>(templateData)
  const [showPreview, setShowPreview] = useState(false)

  const TemplateComponent = templateComponents[templateType]

  const handleSave = () => {
    onSave(editedData)
  }

  const updateField = (field: keyof LandingTemplateProps, value: any) => {
    setEditedData((prev) => ({ ...prev, [field]: value }))
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
    setEditedData((prev) => ({ ...prev, images: [...prev.images, newImage] }))
  }

  const updateImage = (index: number, field: keyof SocialMediaImage, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    }))
  }

  const removeImage = (index: number) => {
    setEditedData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addRelatedEvent = () => {
    const newEvent: RelatedEvent = {
      id: Date.now().toString(),
      title: '',
      image: '',
      date: '',
      location: '',
      url: ''
    }
    setEditedData((prev) => ({ ...prev, relatedEvents: [...prev.relatedEvents, newEvent] }))
  }

  const updateRelatedEvent = (index: number, field: keyof RelatedEvent, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      relatedEvents: prev.relatedEvents.map((event, i) => (i === index ? { ...event, [field]: value } : event))
    }))
  }

  const removeRelatedEvent = (index: number) => {
    setEditedData((prev) => ({
      ...prev,
      relatedEvents: prev.relatedEvents.filter((_, i) => i !== index)
    }))
  }

  const addSocialLink = () => {
    const newLink: SocialLink = {
      platform: 'facebook',
      url: ''
    }
    setEditedData((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, newLink] }))
  }

  const updateSocialLink = (index: number, field: keyof SocialLink, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    }))
  }

  const removeSocialLink = (index: number) => {
    setEditedData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }))
  }

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
              <Button onClick={handleSave} className='gap-2 bg-gradient-to-r from-cyan-400 to-blue-400'>
                <Save className='w-4 h-4' />
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
        <div className='mt-6'>
          <TemplateComponent {...editedData} />
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
                <p className='text-sm text-gray-500'>Tùy chỉnh nội dung theo ý muốn</p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Button variant='outline' onClick={() => setShowPreview(true)} className='gap-2'>
                <Eye className='w-4 h-4' />
                Xem trước
              </Button>
              <Button onClick={handleSave} className='gap-2 bg-gradient-to-r from-cyan-400 to-blue-400'>
                <Save className='w-4 h-4' />
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <Tabs defaultValue='basic' className='w-full'>
          <TabsList className='grid w-full grid-cols-3 max-w-2xl mx-auto mb-8'>
            <TabsTrigger value='basic'>Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value='images'>Hình ảnh</TabsTrigger>
            <TabsTrigger value='social'>Mạng xã hội</TabsTrigger>
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
                  <Label htmlFor='bannerUrl'>URL Banner</Label>
                  <Input
                    id='bannerUrl'
                    value={editedData.bannerUrl}
                    onChange={(e) => updateField('bannerUrl', e.target.value)}
                    placeholder='https://example.com/banner.jpg'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='title'>Tiêu đề</Label>
                  <Input
                    id='title'
                    value={editedData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder='Tên sự kiện'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='subtitle'>Phụ đề</Label>
                  <Input
                    id='subtitle'
                    value={editedData.subtitle || ''}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    placeholder='Mô tả ngắn'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description'>Mô tả</Label>
                  <Textarea
                    id='description'
                    value={editedData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder='Mô tả chi tiết về sự kiện'
                    rows={4}
                  />
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
                  <Label htmlFor='authorName'>Tên tác giả</Label>
                  <Input
                    id='authorName'
                    value={editedData.authorName}
                    onChange={(e) => updateField('authorName', e.target.value)}
                    placeholder='Tên người tổ chức'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='authorAvatar'>URL Avatar</Label>
                  <Input
                    id='authorAvatar'
                    value={editedData.authorAvatar || ''}
                    onChange={(e) => updateField('authorAvatar', e.target.value)}
                    placeholder='https://example.com/avatar.jpg'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='eventDate'>Ngày sự kiện</Label>
                  <Input
                    id='eventDate'
                    value={editedData.eventDate || ''}
                    onChange={(e) => updateField('eventDate', e.target.value)}
                    placeholder='June 15-17, 2025'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='eventLocation'>Địa điểm</Label>
                  <Input
                    id='eventLocation'
                    value={editedData.eventLocation || ''}
                    onChange={(e) => updateField('eventLocation', e.target.value)}
                    placeholder='Central Park, New York'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nội dung</CardTitle>
                <CardDescription>Nội dung chi tiết của bài viết</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editedData.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  placeholder='Nội dung chi tiết...'
                  rows={8}
                  className='resize-none'
                />
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
                    <CardDescription>Quản lý hình ảnh hiển thị trong template</CardDescription>
                  </div>
                  <Button onClick={addImage} className='gap-2 bg-gradient-to-r from-cyan-400 to-blue-400'>
                    <Plus className='w-4 h-4' />
                    Thêm ảnh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                {editedData.images.map((image, index) => (
                  <Card key={image.id} className='border-2'>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <ImageIcon className='w-5 h-5 text-cyan-500' />
                          <CardTitle className='text-base'>Hình ảnh {index + 1}</CardTitle>
                        </div>
                        <Button
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
                        <Label>URL hình ảnh</Label>
                        <Input
                          value={image.url}
                          onChange={(e) => updateImage(index, 'url', e.target.value)}
                          placeholder='https://example.com/image.jpg'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Mô tả</Label>
                        <Input
                          value={image.caption || ''}
                          onChange={(e) => updateImage(index, 'caption', e.target.value)}
                          placeholder='Mô tả hình ảnh'
                        />
                      </div>
                      {image.url && (
                        <div className='mt-4'>
                          <img
                            src={image.url}
                            alt={image.caption || `Image ${index + 1}`}
                            className='w-full h-48 object-cover rounded-lg'
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {editedData.images.length === 0 && (
                  <div className='text-center py-12 text-gray-500'>
                    <ImageIcon className='w-12 h-12 mx-auto mb-4 opacity-50' />
                    <p>Chưa có hình ảnh nào. Nhấn "Thêm ảnh" để bắt đầu.</p>
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
                    <CardDescription>Thêm các tài khoản mạng xã hội</CardDescription>
                  </div>
                  <Button onClick={addSocialLink} className='gap-2 bg-gradient-to-r from-cyan-400 to-blue-400'>
                    <Plus className='w-4 h-4' />
                    Thêm liên kết
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {editedData.socialLinks.map((link, index) => (
                  <Card key={index} className='border-2'>
                    <CardContent className='pt-6'>
                      <div className='flex items-end gap-4'>
                        <div className='flex-1 space-y-2'>
                          <Label>Nền tảng</Label>
                          <select
                            value={link.platform}
                            onChange={(e) =>
                              updateSocialLink(index, 'platform', e.target.value as SocialLink['platform'])
                            }
                            className='w-full h-10 px-3 rounded-md border border-gray-300 bg-white'
                          >
                            <option value='facebook'>Facebook</option>
                            <option value='instagram'>Instagram</option>
                            <option value='twitter'>Twitter</option>
                            <option value='linkedin'>LinkedIn</option>
                            <option value='tiktok'>TikTok</option>
                            <option value='youtube'>YouTube</option>
                          </select>
                        </div>
                        <div className='flex-[2] space-y-2'>
                          <Label>URL</Label>
                          <Input
                            value={link.url}
                            onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                            placeholder='https://facebook.com/yourpage'
                          />
                        </div>
                        <Button
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Bottom Save Button */}
      <div className='fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-40'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-gray-600'>Nhớ lưu thay đổi trước khi rời đi</p>
            <div className='flex items-center gap-3'>
              <Button variant='outline' onClick={() => setShowPreview(true)}>
                Xem trước
              </Button>
              <Button onClick={handleSave} className='bg-gradient-to-r from-cyan-400 to-blue-400'>
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

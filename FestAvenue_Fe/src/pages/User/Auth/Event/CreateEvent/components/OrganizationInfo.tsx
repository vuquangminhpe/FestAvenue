import { useState, useRef } from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Mail, Phone, Globe, Upload, Loader2, X, CheckCircle2 } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import { toast } from 'sonner'
import userApi from '@/apis/user.api'

interface OrganizationInfoProps {
  form: UseFormReturn<EventFormData>
}

export function OrganizationInfo({ form }: OrganizationInfoProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được lớn hơn 5MB')
      return
    }

    const preview = URL.createObjectURL(file)
    setLogoPreview(preview)
    setLogoFile(file)
    toast.info('File đã chọn. Hãy bấm "Tải lên" để upload')
  }

  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error('Vui lòng chọn file trước')
      return
    }

    try {
      setIsUploadingLogo(true)
      toast.info('Đang tải logo lên...')

      const uploadResult = await userApi.uploadsStorage(logoFile)
      const url = (uploadResult as any)?.data || ''

      if (url) {
        form.setValue('organization.logo', url, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        })
        toast.success('Tải logo lên thành công!')
      }
    } catch (error) {
      toast.error('Lỗi khi tải logo lên')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const clearLogo = () => {
    setLogoPreview('')
    setLogoFile(null)
    form.setValue('organization.logo', '')
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const currentLogoUrl = form.watch('organization.logo')

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3 pb-4 border-b border-slate-200'>
        <div className='p-2 bg-blue-100 rounded-lg'>
          <Building2 className='w-5 h-5 text-blue-600' />
        </div>
        <div>
          <h3 className='font-semibold text-slate-800'>Thông tin tổ chức</h3>
          <p className='text-sm text-slate-600'>Thông tin về tổ chức hoặc đơn vị tổ chức sự kiện</p>
        </div>
      </div>

      {/* Organization Name */}
      <FormField
        control={form.control}
        name='organization.name'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-slate-700'>
              Tên tổ chức <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder='VD: Công ty ABC, Trường đại học XYZ...'
                className='border-slate-300 focus:border-blue-500'
              />
            </FormControl>
            <FormDescription>Tên chính thức của tổ chức/đơn vị tổ chức sự kiện</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Organization Description */}
      <FormField
        control={form.control}
        name='organization.description'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-slate-700'>
              Mô tả tổ chức <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder='Giới thiệu ngắn gọn về tổ chức của bạn...'
                className='border-slate-300 focus:border-blue-500 min-h-[100px]'
              />
            </FormControl>
            <FormDescription>Mô tả về lĩnh vực hoạt động, sứ mệnh của tổ chức (tối thiểu 10 ký tự)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Organization Logo - URL or Upload */}
      <FormField
        control={form.control}
        name='organization.logo'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-slate-700'>Logo tổ chức</FormLabel>
            <Tabs defaultValue='url' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='url'>Nhập URL</TabsTrigger>
                <TabsTrigger value='upload'>Tải ảnh lên</TabsTrigger>
              </TabsList>

              {/* URL Tab */}
              <TabsContent value='url' className='space-y-2'>
                <FormControl>
                  <div className='relative'>
                    <Globe className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      type='url'
                      placeholder='https://example.com'
                      className='border-slate-300 focus:border-blue-500 pl-10'
                    />
                  </div>
                </FormControl>
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value='upload' className='space-y-4'>
                <Card className='p-4 bg-slate-50'>
                  <div className='space-y-3'>
                    <input
                      ref={logoInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleLogoFileChange}
                      className='hidden'
                    />

                    {!logoPreview && !currentLogoUrl && (
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => logoInputRef.current?.click()}
                        className='w-full border-dashed border-2 h-32 flex flex-col items-center justify-center gap-2'
                      >
                        <Upload className='w-8 h-8 text-slate-400' />
                        <div className='text-center'>
                          <p className='text-sm font-medium'>Chọn ảnh từ thiết bị</p>
                          <p className='text-xs text-slate-500'>PNG, JPG, GIF (tối đa 5MB)</p>
                        </div>
                      </Button>
                    )}

                    {(logoPreview || currentLogoUrl) && (
                      <div className='relative'>
                        <img
                          src={logoPreview || (currentLogoUrl as string)}
                          alt='Logo preview'
                          className='w-full max-h-48 object-contain rounded-lg border border-slate-200'
                        />
                        <Button
                          type='button'
                          variant='destructive'
                          size='icon'
                          onClick={clearLogo}
                          className='absolute top-2 right-2'
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    )}

                    {logoFile && !currentLogoUrl && (
                      <div className='flex gap-2'>
                        <Button
                          type='button'
                          onClick={handleUploadLogo}
                          disabled={isUploadingLogo}
                          className='flex-1 bg-blue-600 hover:bg-blue-700'
                        >
                          {isUploadingLogo ? (
                            <>
                              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                              Đang tải lên...
                            </>
                          ) : (
                            <>
                              <Upload className='w-4 h-4 mr-2' />
                              Tải lên
                            </>
                          )}
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => logoInputRef.current?.click()}
                          disabled={isUploadingLogo}
                        >
                          Chọn lại
                        </Button>
                      </div>
                    )}

                    {currentLogoUrl && logoFile && (
                      <div className='flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200'>
                        <CheckCircle2 className='w-5 h-5 text-green-600' />
                        <span className='text-sm text-green-700 font-medium'>Đã tải lên thành công!</span>
                      </div>
                    )}
                  </div>
                </Card>
                <FormDescription>Chọn ảnh từ thiết bị và tải lên</FormDescription>
              </TabsContent>
            </Tabs>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Organization Website */}
      <FormField
        control={form.control}
        name='organization.website'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-slate-700'>Website tổ chức (tùy chọn)</FormLabel>
            <FormControl>
              <div className='relative'>
                <Globe className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                <Input
                  {...field}
                  value={field.value ?? ''}
                  type='url'
                  placeholder='https://example.com'
                  className='border-slate-300 focus:border-blue-500 pl-10'
                />
              </div>
            </FormControl>
            <FormDescription>Website chính thức của tổ chức</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Organization Email */}
        <FormField
          control={form.control}
          name='organization.contact.email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700'>
                Email tổ chức <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                  <Input
                    {...field}
                    type='email'
                    placeholder='contact@example.com'
                    className='border-slate-300 focus:border-blue-500 pl-10'
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Organization Phone */}
        <FormField
          control={form.control}
          name='organization.contact.phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700'>
                Số điện thoại <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                  <Input
                    {...field}
                    type='tel'
                    placeholder='0123456789'
                    className='border-slate-300 focus:border-blue-500 pl-10'
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

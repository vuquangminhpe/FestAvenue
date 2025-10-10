import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Mail, Phone, Globe } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'

interface OrganizationInfoProps {
  form: UseFormReturn<EventFormData>
}

export function OrganizationInfo({ form }: OrganizationInfoProps) {
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

      {/* Organization Logo URL */}
      <FormField
        control={form.control}
        name='organization.logo'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-slate-700'>
              Logo tổ chức (URL) <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <div className='relative'>
                <Globe className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                <Input
                  {...field}
                  type='url'
                  placeholder='https://example.com/logo.png'
                  className='border-slate-300 focus:border-blue-500 pl-10'
                />
              </div>
            </FormControl>
            <FormDescription>URL của logo tổ chức (phải là đường dẫn hợp lệ)</FormDescription>
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

      {/* Organization Fax (Optional) */}
      <FormField
        control={form.control}
        name='organization.contact.fax'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-slate-700'>Fax (tùy chọn)</FormLabel>
            <FormControl>
              <div className='relative'>
                <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                <Input
                  {...field}
                  type='tel'
                  placeholder='02812345678'
                  className='border-slate-300 focus:border-blue-500 pl-10'
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

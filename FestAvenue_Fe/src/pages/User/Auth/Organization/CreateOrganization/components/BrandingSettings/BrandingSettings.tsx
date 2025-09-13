import type { UseFormReturn } from 'react-hook-form'
import { Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { FormData } from '../../types'

interface BrandingSettingsProps {
  form: UseFormReturn<FormData>
}

export function BrandingSettings({ form }: BrandingSettingsProps) {
  return (
    <div className='space-y-6'>
      {/* Branding Settings */}
      <div className='bg-gradient-to-br from-cyan-50/50 to-blue-50/30 p-6 rounded-xl border border-cyan-100'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-300 rounded-lg flex items-center justify-center'>
            <div className='w-5 h-5 bg-white rounded-full'></div>
          </div>
          <div>
            <h4 className='text-lg font-semibold text-slate-800'>Thương hiệu</h4>
            <p className='text-sm text-slate-600'>Tùy chỉnh màu sắc và tên miền cho tổ chức</p>
          </div>
        </div>

        <div className='space-y-6'>
          <div>
            <h5 className='text-sm font-semibold text-slate-700 mb-3'>Bảng màu thương hiệu</h5>
            <div className='grid md:grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='primaryColor'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-slate-700 font-medium text-sm'>Màu chính</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type='color'
                          className='h-12 bg-white border-slate-200 cursor-pointer rounded-lg shadow-sm hover:shadow-md transition-shadow'
                        />
                        <div className='absolute inset-0 rounded-lg ring-2 ring-slate-200 pointer-events-none'></div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='secondaryColor'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-slate-700 font-medium text-sm'>Màu phụ</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type='color'
                          className='h-12 bg-white border-slate-200 cursor-pointer rounded-lg shadow-sm hover:shadow-md transition-shadow'
                        />
                        <div className='absolute inset-0 rounded-lg ring-2 ring-slate-200 pointer-events-none'></div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='accentColor'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-slate-700 font-medium text-sm'>Màu nhấn</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type='color'
                          className='h-12 bg-white border-slate-200 cursor-pointer rounded-lg shadow-sm hover:shadow-md transition-shadow'
                        />
                        <div className='absolute inset-0 rounded-lg ring-2 ring-slate-200 pointer-events-none'></div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name='customDomain'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-slate-700 font-medium flex items-center gap-2'>
                  <Globe className='w-4 h-4' />
                  Tên miền tùy chỉnh
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='company.festavenue.com'
                    className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200 rounded-lg shadow-sm'
                  />
                </FormControl>
                <p className='text-xs text-slate-500 mt-1'>Tên miền con cho trang web tổ chức của bạn</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}

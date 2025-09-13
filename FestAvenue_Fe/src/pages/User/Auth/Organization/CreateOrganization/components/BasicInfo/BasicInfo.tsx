import React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Camera, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { industries, companySizes } from '../../constants'
import type { FormData } from '../../types'

interface BasicInfoProps {
  form: UseFormReturn<FormData>
  logoPreview: string
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onNameChange?: (value: string) => void
  isCheckingName?: boolean
}

export function BasicInfo({
  form,
  logoPreview,
  handleLogoUpload,
  onNameChange,
  isCheckingName = false
}: BasicInfoProps) {
  return (
    <div className='space-y-6'>
      {/* Logo Upload */}
      <div className='flex justify-center'>
        <div className='relative'>
          <div className='w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden'>
            {logoPreview ? (
              <img src={logoPreview} alt='Logo preview' className='w-full h-full object-cover' />
            ) : (
              <Camera className='w-8 h-8 text-cyan-600' />
            )}
          </div>
          <label className='absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-400 to-blue-300 text-white p-2 rounded-full cursor-pointer hover:shadow-lg transition-all'>
            <Camera className='w-4 h-4' />
            <input type='file' accept='image/*' onChange={handleLogoUpload} className='hidden' />
          </label>
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel className='text-slate-700 font-medium'>Tên tổ chức *</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    {...field}
                    placeholder='VD: Công ty TNHH ABC'
                    className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                    onChange={(e) => {
                      field.onChange(e)
                      onNameChange?.(e.target.value)
                    }}
                  />
                  {isCheckingName && (
                    <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-cyan-600' />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='industry'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700 font-medium'>Ngành nghề *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='h-12 bg-white border-slate-200 focus:border-cyan-400'>
                    <SelectValue placeholder='Chọn ngành nghề' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='size'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700 font-medium'>Quy mô *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='h-12 bg-white border-slate-200 focus:border-cyan-400'>
                    <SelectValue placeholder='Chọn quy mô' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel className='text-slate-700 font-medium'>Mô tả tổ chức</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='Mô tả ngắn về tổ chức của bạn...'
                  className='min-h-[100px] bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200 resize-none'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

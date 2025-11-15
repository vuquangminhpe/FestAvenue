import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'

interface ContactInfoProps {
  form: UseFormReturn<EventFormData>
}

export function ContactInfo({ form }: ContactInfoProps) {
  return (
    <div className='space-y-6'>
      <FormField
        control={form.control}
        name='website'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base font-semibold text-slate-700'>
              Website <span className='text-red-500 ml-1'>*</span>
            </FormLabel>
            <FormControl>
              <Input
                type='url'
                placeholder='https://example.com'
                {...field}
                required
                className='bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500'
              />
            </FormControl>
            <FormDescription>Website chính thức của sự kiện</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='publicContactEmail'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base font-semibold text-slate-700'>
              Email liên hệ công khai <span className='text-red-500 ml-1'>*</span>
            </FormLabel>
            <FormControl>
              <Input
                type='email'
                placeholder='contact@example.com'
                {...field}
                required
                className='bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500'
              />
            </FormControl>
            <FormDescription>Email này sẽ hiển thị công khai cho người tham gia</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='publicContactPhone'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base font-semibold text-slate-700'>
              Số điện thoại liên hệ <span className='text-red-500 ml-1'>*</span>
            </FormLabel>
            <FormControl>
              <Input
                type='tel'
                placeholder='+84 123 456 789'
                {...field}
                required
                className='bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500'
              />
            </FormControl>
            <FormDescription>Số điện thoại liên hệ cho người tham gia</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

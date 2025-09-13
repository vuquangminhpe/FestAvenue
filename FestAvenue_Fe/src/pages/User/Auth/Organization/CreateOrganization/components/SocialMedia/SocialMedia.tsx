import React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Globe } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { FormData } from '../../types'

interface SocialMediaProps {
  form: UseFormReturn<FormData>
}

export function SocialMedia({ form }: SocialMediaProps) {
  return (
    <div className='space-y-6'>
      <div className='grid md:grid-cols-2 gap-6'>
        <FormField
          control={form.control}
          name='website'
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel className='text-slate-700 font-medium flex items-center gap-2'>
                <Globe className='w-4 h-4' />
                Website
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='https://company.com'
                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='facebook'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700 font-medium'>Facebook</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='https://facebook.com/company'
                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='twitter'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700 font-medium'>Twitter</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='https://twitter.com/company'
                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='linkedin'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700 font-medium'>LinkedIn</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='https://linkedin.com/company/company'
                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='instagram'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-slate-700 font-medium'>Instagram</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder='https://instagram.com/company'
                  className='h-12 bg-white border-slate-200 focus:border-cyan-400 focus:ring-cyan-200'
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
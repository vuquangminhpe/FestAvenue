import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import { visibilityOptions } from '../constants'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface EventDetailsProps {
  form: UseFormReturn<EventFormData>
}

export function EventDetails({ form }: EventDetailsProps) {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          control={form.control}
          name='visibility'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Chế độ hiển thị <span className='text-red-500'>*</span>
              </FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                <FormControl>
                  <SelectTrigger className='bg-white border-slate-200'>
                    <SelectValue placeholder='Chọn chế độ hiển thị' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      <div>
                        <div className='font-medium'>{option.label}</div>
                        <div className='text-xs text-slate-500'>{option.description}</div>
                      </div>
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
          name='capacity'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Sức chứa <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='Nhập sức chứa...'
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className='bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500'
                />
              </FormControl>
              <FormDescription>Số lượng người tham gia tối đa</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          control={form.control}
          name='registrationStartDate'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Ngày bắt đầu mua vé <span className='text-red-500'>*</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal bg-white border-slate-200',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(new Date(field.value), 'PPP', { locale: vi }) : <span>Chọn ngày</span>}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='registrationEndDate'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Ngày kết thúc đặt vé <span className='text-red-500'>*</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal bg-white border-slate-200',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(new Date(field.value), 'PPP', { locale: vi }) : <span>Chọn ngày</span>}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
                    disabled={(date) =>
                      date < new Date(form.watch('registrationStartDate')) || date > new Date(form.watch('startDate'))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription className='text-xs'>Phải trước ngày sự kiện diễn ra</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <FormField
          control={form.control}
          name='startDate'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Ngày sự kiện diễn ra <span className='text-red-500'>*</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal bg-white border-slate-200',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(new Date(field.value), 'PPP', { locale: vi }) : <span>Chọn ngày</span>}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='endDate'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel className='text-base font-semibold text-slate-700'>
                Ngày kết thúc sự kiện <span className='text-red-500'>*</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal bg-white border-slate-200',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(new Date(field.value), 'PPP', { locale: vi }) : <span>Chọn ngày</span>}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
                    disabled={(date) => date < new Date(form.watch('startDate'))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

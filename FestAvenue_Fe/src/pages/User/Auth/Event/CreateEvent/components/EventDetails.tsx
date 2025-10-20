import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import { visibilityOptions } from '../constants'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface EventDetailsProps {
  form: UseFormReturn<EventFormData>
}

export function EventDetails({ form }: EventDetailsProps) {
  // Watch values to enable/disable dependent fields
  const lifecycleStart = form.watch('startEventLifecycleTime')
  const lifecycleEnd = form.watch('endEventLifecycleTime')
  const ticketSaleStart = form.watch('startTicketSaleTime')
  const ticketSaleEnd = form.watch('endTicketSaleTime')

  const isLifecycleComplete = lifecycleStart && lifecycleEnd
  const isTicketSaleComplete = ticketSaleStart && ticketSaleEnd

  return (
    <div className='space-y-6'>
      {/* Info Alert */}
      <Alert className='bg-blue-50 border-blue-200'>
        <AlertCircle className='w-4 h-4 text-blue-600' />
        <AlertDescription className='text-sm text-blue-800'>
          <strong>Quy trình chọn thời gian:</strong>
          <br />
          1️⃣ Vòng đời sự kiện (bao gồm tất cả)
          <br />
          2️⃣ Thời gian bán vé (trong vòng đời)
          <br />
          3️⃣ Thời gian diễn ra sự kiện (sau khi bắt đầu bán vé)
        </AlertDescription>
      </Alert>

      {/* Visibility & Capacity */}
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

      {/* SECTION 1: Event Lifecycle Time */}
      <div className='space-y-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200'>
        <h3 className='text-lg font-bold text-purple-700 flex items-center gap-2'>
          <span className='bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm'>
            1
          </span>
          Vòng đời sự kiện (Event Lifecycle)
        </h3>
        <p className='text-sm text-slate-600'>
          Khoảng thời gian tổng thể từ khi bắt đầu bán vé cho đến khi sự kiện kết thúc
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='startEventLifecycleTime'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel className='text-base font-semibold text-slate-700'>
                  Bắt đầu vòng đời <span className='text-red-500'>*</span>
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
                        {field.value ? (
                          format(new Date(field.value), 'PPP HH:mm', { locale: vi })
                        ) : (
                          <span>Chọn ngày giờ</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Set time to current time
                          const now = new Date()
                          date.setHours(now.getHours(), now.getMinutes(), 0, 0)
                          field.onChange(date.toISOString())
                        }
                      }}
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
            name='endEventLifecycleTime'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel className='text-base font-semibold text-slate-700'>
                  Kết thúc vòng đời <span className='text-red-500'>*</span>
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
                        disabled={!lifecycleStart}
                      >
                        {field.value ? (
                          format(new Date(field.value), 'PPP HH:mm', { locale: vi })
                        ) : (
                          <span>Chọn ngày giờ</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const now = new Date()
                          date.setHours(now.getHours(), now.getMinutes(), 0, 0)
                          field.onChange(date.toISOString())
                        }
                      }}
                      disabled={(date) => !lifecycleStart || date < new Date(lifecycleStart)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className='text-xs'>Phải sau thời điểm bắt đầu vòng đời</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* SECTION 2: Ticket Sale Time */}
      <div
        className={cn(
          'space-y-4 p-4 rounded-lg border-2 transition-all',
          isLifecycleComplete
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            : 'bg-gray-50 border-gray-200 opacity-60'
        )}
      >
        <h3 className='text-lg font-bold text-green-700 flex items-center gap-2'>
          <span
            className={cn(
              'rounded-full w-6 h-6 flex items-center justify-center text-sm',
              isLifecycleComplete ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
            )}
          >
            2
          </span>
          Thời gian bán vé (Ticket Sale)
        </h3>
        <p className='text-sm text-slate-600'>Khoảng thời gian người dùng có thể mua vé cho sự kiện</p>

        {!isLifecycleComplete && (
          <Alert className='bg-yellow-50 border-yellow-200'>
            <AlertCircle className='w-4 h-4 text-yellow-600' />
            <AlertDescription className='text-sm text-yellow-800'>
              Vui lòng chọn vòng đời sự kiện trước
            </AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='startTicketSaleTime'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel className='text-base font-semibold text-slate-700'>
                  Bắt đầu bán vé <span className='text-red-500'>*</span>
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
                        disabled={!isLifecycleComplete}
                      >
                        {field.value ? (
                          format(new Date(field.value), 'PPP HH:mm', { locale: vi })
                        ) : (
                          <span>Chọn ngày giờ</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const now = new Date()
                          date.setHours(now.getHours(), now.getMinutes(), 0, 0)
                          field.onChange(date.toISOString())
                        }
                      }}
                      disabled={(date) =>
                        !lifecycleStart ||
                        !lifecycleEnd ||
                        date < new Date(lifecycleStart) ||
                        date > new Date(lifecycleEnd)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className='text-xs'>Phải nằm trong vòng đời sự kiện</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='endTicketSaleTime'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel className='text-base font-semibold text-slate-700'>
                  Kết thúc bán vé <span className='text-red-500'>*</span>
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
                        disabled={!ticketSaleStart}
                      >
                        {field.value ? (
                          format(new Date(field.value), 'PPP HH:mm', { locale: vi })
                        ) : (
                          <span>Chọn ngày giờ</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const now = new Date()
                          date.setHours(now.getHours(), now.getMinutes(), 0, 0)
                          field.onChange(date.toISOString())
                        }
                      }}
                      disabled={(date) =>
                        !ticketSaleStart ||
                        !lifecycleEnd ||
                        date < new Date(ticketSaleStart) ||
                        date > new Date(lifecycleEnd)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className='text-xs'>Phải sau thời điểm bắt đầu bán vé và trong vòng đời</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* SECTION 3: Event Time */}
      <div
        className={cn(
          'space-y-4 p-4 rounded-lg border-2 transition-all',
          isTicketSaleComplete
            ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200'
            : 'bg-gray-50 border-gray-200 opacity-60'
        )}
      >
        <h3 className='text-lg font-bold text-cyan-700 flex items-center gap-2'>
          <span
            className={cn(
              'rounded-full w-6 h-6 flex items-center justify-center text-sm',
              isTicketSaleComplete ? 'bg-cyan-600 text-white' : 'bg-gray-400 text-white'
            )}
          >
            3
          </span>
          Thời gian diễn ra sự kiện (Event Time)
        </h3>
        <p className='text-sm text-slate-600'>Thời gian sự kiện thực sự diễn ra</p>

        {!isTicketSaleComplete && (
          <Alert className='bg-yellow-50 border-yellow-200'>
            <AlertCircle className='w-4 h-4 text-yellow-600' />
            <AlertDescription className='text-sm text-yellow-800'>
              Vui lòng chọn thời gian bán vé trước
            </AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='startTimeEventTime'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel className='text-base font-semibold text-slate-700'>
                  Bắt đầu sự kiện <span className='text-red-500'>*</span>
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
                        disabled={!isTicketSaleComplete}
                      >
                        {field.value ? (
                          format(new Date(field.value), 'PPP HH:mm', { locale: vi })
                        ) : (
                          <span>Chọn ngày giờ</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const now = new Date()
                          date.setHours(now.getHours(), now.getMinutes(), 0, 0)
                          field.onChange(date.toISOString())
                        }
                      }}
                      disabled={(date) =>
                        !ticketSaleStart ||
                        !lifecycleEnd ||
                        date < new Date(ticketSaleStart) ||
                        date > new Date(lifecycleEnd)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className='text-xs'>Phải sau thời điểm bắt đầu bán vé</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='endTimeEventTime'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel className='text-base font-semibold text-slate-700'>
                  Kết thúc sự kiện <span className='text-red-500'>*</span>
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
                        disabled={!form.watch('startTimeEventTime')}
                      >
                        {field.value ? (
                          format(new Date(field.value), 'PPP HH:mm', { locale: vi })
                        ) : (
                          <span>Chọn ngày giờ</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const now = new Date()
                          date.setHours(now.getHours(), now.getMinutes(), 0, 0)
                          field.onChange(date.toISOString())
                        }
                      }}
                      disabled={(date) => {
                        const eventStart = form.watch('startTimeEventTime')
                        return (
                          !eventStart || !lifecycleEnd || date < new Date(eventStart) || date > new Date(lifecycleEnd)
                        )
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className='text-xs'>Phải sau thời điểm bắt đầu sự kiện và trong vòng đời</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}

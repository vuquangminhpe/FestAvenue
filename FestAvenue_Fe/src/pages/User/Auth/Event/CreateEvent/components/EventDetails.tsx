import { useEffect } from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWatch, type UseFormReturn } from 'react-hook-form'
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
  const lifecycleStart = useWatch({ control: form.control, name: 'startEventLifecycleTime' })
  const lifecycleEnd = useWatch({ control: form.control, name: 'endEventLifecycleTime' })
  const ticketSaleStart = useWatch({ control: form.control, name: 'startTicketSaleTime' })
  const ticketSaleEnd = useWatch({ control: form.control, name: 'endTicketSaleTime' })
  const eventStart = useWatch({ control: form.control, name: 'startTimeEventTime' })
  const eventEnd = useWatch({ control: form.control, name: 'endTimeEventTime' })

  const isLifecycleComplete = lifecycleStart && lifecycleEnd
  const isTicketSaleComplete = ticketSaleStart && ticketSaleEnd

  // Re-validate dependent fields when dependencies change
  useEffect(() => {
    if (lifecycleStart) {
      // When lifecycle start changes, re-validate end lifecycle
      if (lifecycleEnd) {
        form.trigger('endEventLifecycleTime')
      }
      // Also trigger ticket sale fields if they have values
      if (ticketSaleStart) {
        form.trigger('startTicketSaleTime')
      }
    }
  }, [lifecycleStart, lifecycleEnd, ticketSaleStart, form])

  useEffect(() => {
    if (lifecycleEnd) {
      // When lifecycle end changes, re-validate all time fields that depend on it
      if (ticketSaleStart) {
        form.trigger('startTicketSaleTime')
      }
      if (ticketSaleEnd) {
        form.trigger('endTicketSaleTime')
      }
      if (eventStart) {
        form.trigger('startTimeEventTime')
      }
      if (eventEnd) {
        form.trigger('endTimeEventTime')
      }
    }
  }, [lifecycleEnd, ticketSaleStart, ticketSaleEnd, eventStart, eventEnd, form])

  useEffect(() => {
    if (ticketSaleStart) {
      // When ticket sale start changes, re-validate end ticket sale and event times
      if (ticketSaleEnd) {
        form.trigger('endTicketSaleTime')
      }
      if (eventStart) {
        form.trigger('startTimeEventTime')
      }
    }
  }, [ticketSaleStart, ticketSaleEnd, eventStart, form])

  useEffect(() => {
    if (ticketSaleEnd) {
      // When ticket sale end changes, re-validate event times
      if (eventStart) {
        form.trigger('startTimeEventTime')
      }
      if (eventEnd) {
        form.trigger('endTimeEventTime')
      }
    }
  }, [ticketSaleEnd, eventStart, eventEnd, form])

  useEffect(() => {
    if (eventStart) {
      // When event start changes, re-validate event end
      if (eventEnd) {
        form.trigger('endTimeEventTime')
      }
    }
  }, [eventStart, eventEnd, form])

  return (
    <div className='space-y-6'>
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
                          // Trigger validation for dependent fields
                          setTimeout(() => {
                            form.trigger(['endEventLifecycleTime', 'startTicketSaleTime'])
                          }, 0)
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
                          // Trigger validation for dependent fields
                          setTimeout(() => {
                            form.trigger([
                              'startTicketSaleTime',
                              'endTicketSaleTime',
                              'startTimeEventTime',
                              'endTimeEventTime'
                            ])
                          }, 0)
                        }
                      }}
                      disabled={(date) => {
                        const startDate = form.getValues('startEventLifecycleTime')
                        return !startDate || date < new Date(startDate)
                      }}
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
                          // Trigger validation for dependent fields
                          setTimeout(() => {
                            form.trigger(['endTicketSaleTime', 'startTimeEventTime'])
                          }, 0)
                        }
                      }}
                      disabled={(date) => {
                        const startLifecycle = form.getValues('startEventLifecycleTime')
                        const endLifecycle = form.getValues('endEventLifecycleTime')
                        return (
                          !startLifecycle ||
                          !endLifecycle ||
                          date < new Date(startLifecycle) ||
                          date > new Date(endLifecycle)
                        )
                      }}
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
                          // Trigger validation for dependent fields
                          setTimeout(() => {
                            form.trigger(['startTimeEventTime', 'endTimeEventTime'])
                          }, 0)
                        }
                      }}
                      disabled={(date) => {
                        const startTicket = form.getValues('startTicketSaleTime')
                        const endLifecycle = form.getValues('endEventLifecycleTime')
                        return (
                          !startTicket || !endLifecycle || date < new Date(startTicket) || date > new Date(endLifecycle)
                        )
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className='text-xs'>
                  Phải sau thời điểm bắt đầu bán vé và trong vòng đời
                </FormDescription>
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
                          // Trigger validation for dependent fields
                          setTimeout(() => {
                            form.trigger('endTimeEventTime')
                          }, 0)
                        }
                      }}
                      disabled={(date) => {
                        const startTicket = form.getValues('startTicketSaleTime')
                        const endLifecycle = form.getValues('endEventLifecycleTime')
                        return (
                          !startTicket || !endLifecycle || date < new Date(startTicket) || date > new Date(endLifecycle)
                        )
                      }}
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
                        disabled={!eventStart}
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
                        const startEvent = form.getValues('startTimeEventTime')
                        const endLifecycle = form.getValues('endEventLifecycleTime')
                        return (
                          !startEvent || !endLifecycle || date < new Date(startEvent) || date > new Date(endLifecycle)
                        )
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className='text-xs'>
                  Phải sau thời điểm bắt đầu sự kiện và trong vòng đời
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { X, AlertCircle } from 'lucide-react'
import { DateTimePicker } from '@/components/ui/DateTimePicker'
import { useCreateTicket } from '../hooks/useTicketManagement'
import type { bodyCreateTicketInEvent } from '@/types/serviceTicketManagement.types'
import { validateTicketForm, sanitizeTicketName, sanitizeDescription, type EventConstraints } from '../utils/validation'
import eventApis from '@/apis/event.api'
import { toVietnamTimeISO } from '@/utils/utils'

interface AddTicketModalProps {
  isOpen: boolean
  onClose: () => void
  eventCode: string
}

type FormState = {
  name: string
  description: string
  price: string
  quantity: string
  benefits: string[]
  isFree: boolean
  isPublic: boolean
  startSaleDate: string
  endSaleDate: string
}

const buildDefaultFormState = (): FormState => {
  const now = new Date()
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  return {
    name: '',
    description: '',
    price: '',
    quantity: '',
    benefits: [],
    isFree: false,
    isPublic: true,
    startSaleDate: now.toISOString(),
    endSaleDate: oneWeekLater.toISOString()
  }
}

const clampDateToRange = (date: Date, min?: Date, max?: Date) => {
  if (min && date < min) return min
  if (max && date > max) return max
  return date
}

export default function AddTicketModal({ isOpen, onClose, eventCode }: AddTicketModalProps) {
  const createTicketMutation = useCreateTicket()

  const [formData, setFormData] = useState<FormState>(() => buildDefaultFormState())
  const [benefitInput, setBenefitInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const { data: eventData } = useQuery({
    queryKey: ['event', eventCode],
    queryFn: async () => {
      const response = await eventApis.getEventByEventCode(eventCode)
      return response?.data
    },
    enabled: !!eventCode && isOpen
  })

  const eventConstraints: EventConstraints | undefined = useMemo(() => {
    if (!eventData) return undefined

    const saleStartRaw = (eventData as any).startTicketSaleTime ?? eventData.startEventLifecycleTime
    const saleEndRaw = (eventData as any).endTicketSaleTime ?? eventData.endEventLifecycleTime

    const saleStart = saleStartRaw ? new Date(saleStartRaw as string) : undefined
    const saleEnd = saleEndRaw ? new Date(saleEndRaw as string) : undefined

    if (!saleStart || !saleEnd) {
      return undefined
    }

    return {
      lifecycleStart: saleStart,
      lifecycleEnd: saleEnd,
      capacity: eventData.capacity || 1000000
    }
  }, [eventData])

  useEffect(() => {
    if (!eventConstraints) return

    setFormData((prev) => {
      const currentStart = new Date(prev.startSaleDate)
      const currentEnd = new Date(prev.endSaleDate)

      const clampedStart = clampDateToRange(
        currentStart,
        eventConstraints.lifecycleStart,
        eventConstraints.lifecycleEnd
      )
      const clampedEnd = clampDateToRange(currentEnd, clampedStart, eventConstraints.lifecycleEnd)

      if (clampedStart.getTime() === currentStart.getTime() && clampedEnd.getTime() === currentEnd.getTime()) {
        return prev
      }

      return {
        ...prev,
        startSaleDate: clampedStart.toISOString(),
        endSaleDate: clampedEnd.toISOString()
      }
    })
  }, [eventConstraints])

  const buildValidationPayload = useCallback(
    (data: FormState) => ({
      name: data.name,
      description: data.description,
      price: data.isFree ? '0' : data.price,
      quantity: data.quantity,
      benefits: data.benefits,
      isFree: data.isFree,
      isPublic: data.isPublic,
      startSaleDate: data.startSaleDate,
      endSaleDate: data.endSaleDate
    }),
    []
  )

  useEffect(() => {
    if (Object.keys(touched).length === 0) return

    const validationErrors = validateTicketForm(buildValidationPayload(formData), eventConstraints)
    setErrors(validationErrors)
  }, [formData, touched, eventConstraints, buildValidationPayload])

  const resetForm = useCallback(() => {
    setFormData(buildDefaultFormState())
    setBenefitInput('')
    setErrors({})
    setTouched({})
  }, [])

  const handleDialogToggle = useCallback(
    (open: boolean) => {
      if (!open) {
        resetForm()
        onClose()
      }
    },
    [onClose, resetForm]
  )

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    updateField(field, event.target.value)
  }

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const addBenefit = () => {
    const trimmed = benefitInput.trim()
    if (!trimmed) return

    if (trimmed.length > 100) {
      setErrors((prev) => ({ ...prev, benefits: 'Mỗi quyền lợi không được vượt quá 100 ký tự' }))
      return
    }

    const duplicate = formData.benefits.some((benefit) => benefit.toLowerCase() === trimmed.toLowerCase())
    if (duplicate) {
      setErrors((prev) => ({ ...prev, benefits: 'Không được có quyền lợi trùng lặp' }))
      return
    }

    setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, trimmed] }))
    setBenefitInput('')
    setTouched((prev) => ({ ...prev, benefits: true }))
    setErrors((prev) => {
      const { benefits, ...rest } = prev
      return rest
    })
  }

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }))
    setTouched((prev) => ({ ...prev, benefits: true }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setTouched({
      name: true,
      description: true,
      price: true,
      quantity: true,
      startSaleDate: true,
      endSaleDate: true,
      benefits: true
    })

    const validationErrors = validateTicketForm(buildValidationPayload(formData), eventConstraints)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const payload: bodyCreateTicketInEvent = {
      name: sanitizeTicketName(formData.name),
      description: sanitizeDescription(formData.description),
      price: formData.isFree ? 0 : Number(formData.price),
      quantity: Number(formData.quantity),
      isFree: formData.isFree,
      isPublic: formData.isPublic,
      eventCode,
      benefits: formData.benefits,
      startSaleDate: toVietnamTimeISO(new Date(formData.startSaleDate)),
      endSaleDate: toVietnamTimeISO(new Date(formData.endSaleDate))
    }

    createTicketMutation.mutate(payload, {
      onSuccess: () => {
        resetForm()
        onClose()
      }
    })
  }

  const isSubmitDisabled = createTicketMutation.isPending || Object.keys(errors).length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogToggle}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-cyan-50 to-blue-50'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent'>
            Thêm vé cho sự kiện
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6 mt-4'>
          {eventConstraints && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-1'>
              <p className='text-sm font-semibold text-blue-900'>Thời gian mở bán vé:</p>
              <p className='text-sm text-blue-700'>Từ: {eventConstraints.lifecycleStart.toLocaleString('vi-VN')}</p>
              <p className='text-sm text-blue-700'>Đến: {eventConstraints.lifecycleEnd.toLocaleString('vi-VN')}</p>
              <p className='text-sm text-blue-700'>
                Sức chứa tối đa: {eventConstraints.capacity.toLocaleString('vi-VN')}
              </p>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='create-ticket-name' className='text-sm font-semibold text-gray-700'>
              Nhập tên vé <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='create-ticket-name'
              value={formData.name}
              onChange={handleInputChange('name')}
              onBlur={() => handleBlur('name')}
              placeholder='VD: Vé VIP, Vé thường...'
              maxLength={100}
              className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 ${
                touched.name && errors.name ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            <p className='text-xs text-gray-500'>{formData.name.length}/100 ký tự</p>
            {touched.name && errors.name && (
              <p className='text-sm text-red-600 flex items-center gap-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.name}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='create-ticket-description' className='text-sm font-semibold text-gray-700'>
              Mô tả chi tiết <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='create-ticket-description'
              value={formData.description}
              onChange={handleInputChange('description')}
              onBlur={() => handleBlur('description')}
              placeholder='Mô tả thông tin chi tiết về vé...'
              maxLength={500}
              className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 ${
                touched.description && errors.description ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            <p className='text-xs text-gray-500'>{formData.description.length}/500 ký tự</p>
            {touched.description && errors.description && (
              <p className='text-sm text-red-600 flex items-center gap-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.description}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='create-ticket-free'
                checked={formData.isFree}
                onCheckedChange={(checked) => {
                  updateField('isFree', checked === true)
                  if (checked) {
                    updateField('price', '0')
                  }
                }}
              />
              <Label htmlFor='create-ticket-free' className='text-sm font-semibold text-gray-700 cursor-pointer'>
                Vé miễn phí
              </Label>
            </div>
          </div>

          {!formData.isFree && (
            <div className='space-y-2'>
              <Label htmlFor='create-ticket-price' className='text-sm font-semibold text-gray-700'>
                Giá vé <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='create-ticket-price'
                type='number'
                value={formData.price}
                onChange={handleInputChange('price')}
                onBlur={() => handleBlur('price')}
                placeholder='VD: 100000'
                min='0'
                step='1000'
                className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 ${
                  touched.price && errors.price ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              <p className='text-xs text-gray-500'>Giá vé phải là bội số của 1,000 VND</p>
              {touched.price && errors.price && (
                <p className='text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.price}
                </p>
              )}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='create-ticket-quantity' className='text-sm font-semibold text-gray-700'>
              Số lượng vé <span className='text-red-500'>*</span>
            </Label>
            <div className='flex items-center gap-2'>
              <Input
                id='create-ticket-quantity'
                type='number'
                value={formData.quantity}
                onChange={handleInputChange('quantity')}
                onBlur={() => handleBlur('quantity')}
                placeholder='100'
                min='1'
                className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 ${
                  touched.quantity && errors.quantity ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              <Button
                type='button'
                variant='outline'
                onClick={() => updateField('quantity', String(Number(formData.quantity || '0') + 1))}
                className='px-4 hover:bg-cyan-50 hover:border-cyan-300'
              >
                +
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => updateField('quantity', String(Math.max(1, Number(formData.quantity || '1') - 1)))}
                className='px-4 hover:bg-cyan-50 hover:border-cyan-300'
              >
                -
              </Button>
            </div>
            {eventConstraints && (
              <p className='text-xs text-gray-500'>
                Sức chứa sự kiện: {eventConstraints.capacity.toLocaleString('vi-VN')} người
              </p>
            )}
            {touched.quantity && errors.quantity && (
              <p className='text-sm text-red-600 flex items-center gap-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.quantity}
              </p>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-semibold text-gray-700'>
                Ngày bắt đầu bán <span className='text-red-500'>*</span>
              </Label>
              <DateTimePicker
                value={formData.startSaleDate ? new Date(formData.startSaleDate) : undefined}
                onChange={(date) => {
                  if (date) {
                    updateField('startSaleDate', date.toISOString())
                  }
                }}
                minDate={eventConstraints?.lifecycleStart}
                maxDate={eventConstraints?.lifecycleEnd}
                error={!!(touched.startSaleDate && errors.startSaleDate)}
                variant='start'
                placeholder='Chọn ngày bắt đầu bán'
              />
              {touched.startSaleDate && errors.startSaleDate && (
                <p className='text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.startSaleDate}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-semibold text-gray-700'>
                Ngày kết thúc bán <span className='text-red-500'>*</span>
              </Label>
              <DateTimePicker
                value={formData.endSaleDate ? new Date(formData.endSaleDate) : undefined}
                onChange={(date) => {
                  if (date) {
                    updateField('endSaleDate', date.toISOString())
                  }
                }}
                minDate={formData.startSaleDate ? new Date(formData.startSaleDate) : eventConstraints?.lifecycleStart}
                maxDate={eventConstraints?.lifecycleEnd}
                error={!!(touched.endSaleDate && errors.endSaleDate)}
                variant='end'
                placeholder='Chọn ngày kết thúc bán'
              />
              {touched.endSaleDate && errors.endSaleDate && (
                <p className='text-sm text-red-600 flex items-center gap-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.endSaleDate}
                </p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='create-ticket-public'
                checked={formData.isPublic}
                onCheckedChange={(checked) => updateField('isPublic', checked === true)}
              />
              <Label htmlFor='create-ticket-public' className='text-sm font-semibold text-gray-700 cursor-pointer'>
                Công khai vé
              </Label>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='create-ticket-benefit' className='text-sm font-semibold text-gray-700'>
              Quyền lợi vé
            </Label>
            <div className='flex gap-2'>
              <Input
                id='create-ticket-benefit'
                value={benefitInput}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setBenefitInput(event.target.value)}
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addBenefit()
                  }
                }}
                placeholder='VD: Đồ uống miễn phí, Ghế ngồi ưu tiên...'
                className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
                disabled={formData.benefits.length >= 10}
              />
              <Button
                type='button'
                onClick={addBenefit}
                variant='outline'
                className='hover:bg-cyan-50 hover:border-cyan-300'
                disabled={formData.benefits.length >= 10 || !benefitInput.trim()}
              >
                Thêm
              </Button>
            </div>
            {errors.benefits && (
              <p className='text-sm text-red-600 flex items-center gap-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.benefits}
              </p>
            )}
            {formData.benefits.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {formData.benefits.map((benefit, index) => (
                  <div
                    key={`${benefit}-${index}`}
                    className='flex items-center gap-1 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm'
                  >
                    {benefit}
                    <button
                      type='button'
                      onClick={() => removeBenefit(index)}
                      className='hover:bg-cyan-200 rounded-full p-0.5'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className='text-xs text-gray-500'>{formData.benefits.length}/10 quyền lợi</p>
          </div>

          <div className='flex gap-3 pt-4 border-t border-gray-200'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                resetForm()
                onClose()
              }}
              disabled={createTicketMutation.isPending}
              className='flex-1 hover:bg-gray-50'
            >
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={isSubmitDisabled}
              className='flex-1 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {createTicketMutation.isPending ? 'Đang tạo...' : 'Tạo vé'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

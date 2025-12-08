import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Calendar, AlertCircle } from 'lucide-react'
import { useUpdateTicket } from '../hooks/useTicketManagement'
import type { bodyUpdateTicketInEvent } from '@/types/serviceTicketManagement.types'
import type { Ticket } from '../types'
import { DateTimePicker } from '../../../../../components/ui/DateTimePicker'
import { validateTicketForm, sanitizeTicketName, sanitizeDescription, type EventConstraints } from '../utils/validation'
import { useQuery } from '@tanstack/react-query'
import eventApis from '@/apis/event.api'

interface UpdateTicketModalProps {
  isOpen: boolean
  ticket: Ticket | null
  eventCode: string
  onClose: () => void
}

export default function UpdateTicketModal({ isOpen, ticket, eventCode, onClose }: UpdateTicketModalProps) {
  const updateTicketMutation = useUpdateTicket()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    benefits: [] as string[],
    isFree: false,
    isPublic: true,
    startSaleDate: '',
    endSaleDate: ''
  })
  const [benefitInput, setBenefitInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Fetch event data for lifecycle and capacity validation
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
    if (ticket) {
      setFormData({
        name: ticket.name,
        description: ticket.description,
        price: String(ticket.price),
        quantity: String(ticket.quantity),
        benefits: ticket.benefits || [],
        isFree: ticket.isFree,
        isPublic: ticket.isPublic,
        startSaleDate: ticket.startSaleDate?.slice(0, 16) || '',
        endSaleDate: ticket.endSaleDate?.slice(0, 16) || ''
      })
      setErrors({})
      setTouched({})
    }
  }, [ticket])

  // Real-time validation
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const validationErrors = validateTicketForm(formData, eventConstraints)
      setErrors(validationErrors)
    }
  }, [formData, eventConstraints, touched])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!ticket) return

    // Mark all fields as touched
    setTouched({
      name: true,
      description: true,
      price: true,
      quantity: true,
      startSaleDate: true,
      endSaleDate: true,
      benefits: true
    })

    // Validate
    const validationErrors = validateTicketForm(formData, eventConstraints)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const updateData: bodyUpdateTicketInEvent = {
      id: ticket.id,
      name: sanitizeTicketName(formData.name),
      description: sanitizeDescription(formData.description),
      price: formData.isFree ? 0 : Number(formData.price),
      quantity: Number(formData.quantity),
      isFree: formData.isFree,
      isPublic: formData.isPublic,
      benefits: formData.benefits,
      startSaleDate: formData.startSaleDate,
      endSaleDate: formData.endSaleDate
    }

    updateTicketMutation.mutate(updateData, {
      onSuccess: () => {
        handleClose()
      }
    })
  }

  const handleClose = () => {
    setBenefitInput('')
    setErrors({})
    setTouched({})
    onClose()
  }

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const addBenefit = () => {
    if (benefitInput.trim()) {
      if (benefitInput.length > 100) {
        setErrors((prev) => ({ ...prev, benefits: 'Mỗi quyền lợi không được vượt quá 100 ký tự' }))
        return
      }
      setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, benefitInput.trim()] }))
      setBenefitInput('')
      setErrors((prev) => {
        const { benefits, ...rest } = prev
        return rest
      })
    }
  }

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== index) }))
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  if (!ticket) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-cyan-50 to-blue-50'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent'>
            Cập nhật vé cho sự kiện
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

          {/* Ticket Name */}
          <div className='space-y-2'>
            <Label htmlFor='update-name' className='text-sm font-semibold text-gray-700'>
              Nhập tên vé <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='update-name'
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder='VD: Vé VIP, Vé thường...'
              className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 ${
                touched.name && errors.name ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {touched.name && errors.name && (
              <p className='text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.name}
              </p>
            )}
            <p className='text-xs text-gray-500'>{formData.name.length}/100 ký tự</p>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='update-description' className='text-sm font-semibold text-gray-700'>
              Mô tả chi tiết <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='update-description'
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              placeholder='Mô tả thông tin chi tiết về vé...'
              className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 ${
                touched.description && errors.description ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {touched.description && errors.description && (
              <p className='text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.description}
              </p>
            )}
            <p className='text-xs text-gray-500'>{formData.description.length}/500 ký tự</p>
          </div>

          {/* Free Ticket Checkbox */}
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='update-isFree'
                checked={formData.isFree}
                onCheckedChange={(checked) => {
                  updateField('isFree', checked === true)
                  if (checked) {
                    updateField('price', '0')
                  }
                }}
              />
              <Label htmlFor='update-isFree' className='text-sm font-semibold text-gray-700 cursor-pointer'>
                Vé miễn phí
              </Label>
            </div>
          </div>

          {/* Price */}
          {!formData.isFree && (
            <div className='space-y-2'>
              <Label htmlFor='update-price' className='text-sm font-semibold text-gray-700'>
                Giá vé <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='update-price'
                type='number'
                value={formData.price}
                onChange={(e) => updateField('price', e.target.value)}
                onBlur={() => handleBlur('price')}
                placeholder='VD: 100000'
                min='0'
                step='1000'
                className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 ${
                  touched.price && errors.price ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {touched.price && errors.price && (
                <p className='text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.price}
                </p>
              )}
              <p className='text-xs text-gray-500'>Giá vé phải là bội số của 1,000 VND</p>
            </div>
          )}

          {/* Quantity */}
          <div className='space-y-2'>
            <Label htmlFor='update-quantity' className='text-sm font-semibold text-gray-700'>
              Số lượng vé <span className='text-red-500'>*</span>
            </Label>
            <div className='flex items-center gap-2'>
              <Input
                id='update-quantity'
                type='number'
                value={formData.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
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
                onClick={() => updateField('quantity', String(Number(formData.quantity || 0) + 1))}
                className='px-4 hover:bg-cyan-50 hover:border-cyan-300'
              >
                +
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => updateField('quantity', String(Math.max(1, Number(formData.quantity || 0) - 1)))}
                className='px-4 hover:bg-cyan-50 hover:border-cyan-300'
              >
                -
              </Button>
            </div>
            {touched.quantity && errors.quantity && (
              <p className='text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.quantity}
              </p>
            )}
            {eventConstraints && (
              <p className='text-xs text-gray-500'>
                Sức chứa sự kiện: {eventConstraints.capacity.toLocaleString('vi-VN')} người
              </p>
            )}
          </div>

          {/* Sale Dates */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                <div className='p-1.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-sm'>
                  <Calendar className='w-4 h-4 text-white' />
                </div>
                Ngày bắt đầu bán <span className='text-red-500'>*</span>
              </Label>
              <DateTimePicker
                value={formData.startSaleDate ? new Date(formData.startSaleDate) : undefined}
                onChange={(date) => {
                  if (date) {
                    updateField('startSaleDate', date.toISOString().slice(0, 16))
                  }
                }}
                minDate={eventConstraints?.lifecycleStart}
                maxDate={eventConstraints?.lifecycleEnd}
                error={!!(touched.startSaleDate && errors.startSaleDate)}
                variant='start'
                placeholder='Chọn ngày bắt đầu bán'
              />
              {touched.startSaleDate && errors.startSaleDate && (
                <p className='text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.startSaleDate}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                <div className='p-1.5 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg shadow-sm'>
                  <Calendar className='w-4 h-4 text-white' />
                </div>
                Ngày kết thúc bán <span className='text-red-500'>*</span>
              </Label>
              <DateTimePicker
                value={formData.endSaleDate ? new Date(formData.endSaleDate) : undefined}
                onChange={(date) => {
                  if (date) {
                    updateField('endSaleDate', date.toISOString().slice(0, 16))
                  }
                }}
                minDate={formData.startSaleDate ? new Date(formData.startSaleDate) : eventConstraints?.lifecycleStart}
                maxDate={eventConstraints?.lifecycleEnd}
                error={!!(touched.endSaleDate && errors.endSaleDate)}
                variant='end'
                placeholder='Chọn ngày kết thúc bán'
              />
              {touched.endSaleDate && errors.endSaleDate && (
                <p className='text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1'>
                  <AlertCircle className='w-4 h-4' />
                  {errors.endSaleDate}
                </p>
              )}
            </div>
          </div>

          {/* Public Checkbox */}
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='update-isPublic'
                checked={formData.isPublic}
                onCheckedChange={(checked) => updateField('isPublic', checked === true)}
              />
              <Label htmlFor='update-isPublic' className='text-sm font-semibold text-gray-700 cursor-pointer'>
                Công khai vé
              </Label>
            </div>
          </div>

          {/* Benefits */}
          <div className='space-y-2'>
            <Label htmlFor='update-benefits' className='text-sm font-semibold text-gray-700'>
              Quyền lợi vé
            </Label>
            <div className='flex gap-2'>
              <Input
                id='update-benefits'
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                placeholder='VD: Đồ uống miễn phí, Ghế ngồi ưu tiên...'
                className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addBenefit()
                  }
                }}
              />
              <Button
                type='button'
                onClick={addBenefit}
                variant='outline'
                className='hover:bg-cyan-50 hover:border-cyan-300'
              >
                Thêm
              </Button>
            </div>
            {errors.benefits && (
              <p className='text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.benefits}
              </p>
            )}
            {formData.benefits.length > 0 && (
              <div className='flex flex-wrap gap-2 mt-2'>
                {formData.benefits.map((benefit, index) => (
                  <div
                    key={index}
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

          {/* Actions */}
          <div className='flex gap-3 pt-4 border-t border-gray-200'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={updateTicketMutation.isPending}
              className='flex-1 hover:bg-gray-50'
            >
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={updateTicketMutation.isPending || Object.keys(errors).length > 0}
              className='flex-1 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold'
            >
              {updateTicketMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

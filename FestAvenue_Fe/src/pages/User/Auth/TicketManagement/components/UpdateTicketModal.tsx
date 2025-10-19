import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { X } from 'lucide-react'
import { useUpdateTicket } from '../hooks/useTicketManagement'
import type { bodyUpdateTicketInEvent } from '@/types/serviceTicketManagement.types'
import type { Ticket } from '../types'

interface UpdateTicketModalProps {
  isOpen: boolean
  ticket: Ticket | null
  onClose: () => void
}

export default function UpdateTicketModal({ isOpen, ticket, onClose }: UpdateTicketModalProps) {
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
    }
  }, [ticket])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!ticket) return

    const updateData: bodyUpdateTicketInEvent = {
      id: ticket.id,
      name: formData.name,
      description: formData.description,
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
    onClose()
  }

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, benefitInput.trim()] }))
      setBenefitInput('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== index) }))
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
          <div className='space-y-2'>
            <Label htmlFor='update-name' className='text-sm font-semibold text-gray-700'>
              Nhập tên vé *
            </Label>
            <Input
              id='update-name'
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder='Nhập tên vào đây'
              required
              className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='update-description' className='text-sm font-semibold text-gray-700'>
              Mô tả chi tiết *
            </Label>
            <Input
              id='update-description'
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder='Nhập mô tả thông tin vé vào đây'
              required
              className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
            />
          </div>

          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='update-isFree'
                checked={formData.isFree}
                onCheckedChange={(checked) => updateField('isFree', checked === true)}
              />
              <Label htmlFor='update-isFree' className='text-sm font-semibold text-gray-700 cursor-pointer'>
                Vé miễn phí
              </Label>
            </div>
          </div>

          {!formData.isFree && (
            <div className='space-y-2'>
              <Label htmlFor='update-price' className='text-sm font-semibold text-gray-700'>
                Giá vé *
              </Label>
              <Input
                id='update-price'
                type='number'
                value={formData.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder='Nhập giá vé vào đây'
                min='0'
                step='1000'
                required={!formData.isFree}
                className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
              />
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='update-quantity' className='text-sm font-semibold text-gray-700'>
              Số lượng vé *
            </Label>
            <div className='flex items-center gap-2'>
              <Input
                id='update-quantity'
                type='number'
                value={formData.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
                placeholder='100'
                required
                min='0'
                className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
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
                onClick={() => updateField('quantity', String(Math.max(0, Number(formData.quantity || 0) - 1)))}
                className='px-4 hover:bg-cyan-50 hover:border-cyan-300'
              >
                -
              </Button>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='update-startSaleDate' className='text-sm font-semibold text-gray-700'>
              Ngày bắt đầu bán *
            </Label>
            <Input
              id='update-startSaleDate'
              type='datetime-local'
              value={formData.startSaleDate}
              onChange={(e) => updateField('startSaleDate', e.target.value)}
              required
              className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='update-endSaleDate' className='text-sm font-semibold text-gray-700'>
              Ngày kết thúc bán *
            </Label>
            <Input
              id='update-endSaleDate'
              type='datetime-local'
              value={formData.endSaleDate}
              onChange={(e) => updateField('endSaleDate', e.target.value)}
              required
              className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
            />
          </div>

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

          <div className='space-y-2'>
            <Label htmlFor='update-benefits' className='text-sm font-semibold text-gray-700'>
              Quyền lợi vé
            </Label>
            <div className='flex gap-2'>
              <Input
                id='update-benefits'
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                placeholder='Nhập quyền lợi của vé'
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
          </div>

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
              disabled={updateTicketMutation.isPending}
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

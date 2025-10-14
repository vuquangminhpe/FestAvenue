import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import type { TicketFormData } from '../types'

interface AddTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TicketFormData) => void
}

export default function AddTicketModal({ isOpen, onClose, onSubmit }: AddTicketModalProps) {
  const [formData, setFormData] = useState<TicketFormData>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    seatInfo: '',
    benefits: '',
    isActive: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      seatInfo: '',
      benefits: '',
      isActive: true
    })
    onClose()
  }

  const updateField = (field: keyof TicketFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-cyan-50 to-blue-50'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent'>
            Thêm vé cho sự kiện
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6 mt-4'>
          {/* Left Column - Form Fields */}
          <div className='space-y-4'>
            {/* Tên vé */}
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-sm font-semibold text-gray-700'>
                Nhập tên vé *
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder='Nhập tên vào đây'
                required
                className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
              />
            </div>

            {/* Mô tả chi tiết */}
            <div className='space-y-2'>
              <Label htmlFor='description' className='text-sm font-semibold text-gray-700'>
                Mô tả chi tiết *
              </Label>
              <Input
                id='description'
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder='Nhập mô tả thông tin vé vào đây'
                required
                className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
              />
            </div>

            {/* Giá vé */}
            <div className='space-y-2'>
              <Label htmlFor='price' className='text-sm font-semibold text-gray-700'>
                Giá vé
              </Label>
              <Input
                id='price'
                type='number'
                value={formData.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder='Nhập giá vé vào đây'
                min='0'
                step='1000'
                className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
              />
            </div>

            {/* Số lượng vé */}
            <div className='space-y-2'>
              <Label htmlFor='quantity' className='text-sm font-semibold text-gray-700'>
                Số lượng vé *
              </Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='quantity'
                  type='number'
                  value={formData.quantity}
                  onChange={(e) => updateField('quantity', e.target.value)}
                  placeholder='100'
                  required
                  min='1'
                  className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => updateField('quantity', Number(formData.quantity || 0) + 1)}
                  className='px-4 hover:bg-cyan-50 hover:border-cyan-300'
                >
                  +
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => updateField('quantity', Math.max(0, Number(formData.quantity || 0) - 1))}
                  className='px-4 hover:bg-cyan-50 hover:border-cyan-300'
                >
                  -
                </Button>
              </div>
            </div>

            {/* Thông tin ghế ngồi */}
            <div className='space-y-2'>
              <Label htmlFor='seatInfo' className='text-sm font-semibold text-gray-700'>
                Thông tin ghế ngồi
              </Label>
              <Textarea
                id='seatInfo'
                value={formData.seatInfo}
                onChange={(e) => updateField('seatInfo', e.target.value)}
                placeholder='Nhập thông tin ghế ngồi'
                rows={3}
                className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 resize-none'
              />
            </div>

            {/* Công khai */}
            <div className='space-y-2'>
              <Label className='text-sm font-semibold text-gray-700'>Công khai *</Label>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='active-true'
                    checked={formData.isActive === true}
                    onCheckedChange={() => updateField('isActive', true)}
                  />
                  <Label htmlFor='active-true' className='text-sm text-gray-700 cursor-pointer'>
                    True
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='active-false'
                    checked={formData.isActive === false}
                    onCheckedChange={() => updateField('isActive', false)}
                  />
                  <Label htmlFor='active-false' className='text-sm text-gray-700 cursor-pointer'>
                    False
                  </Label>
                </div>
              </div>
            </div>

            {/* Quyền lợi vé */}
            <div className='space-y-2'>
              <Label htmlFor='benefits' className='text-sm font-semibold text-gray-700'>
                Quyền lợi vé
              </Label>
              <Input
                id='benefits'
                value={formData.benefits}
                onChange={(e) => updateField('benefits', e.target.value)}
                placeholder='Nhập quyền lợi của vé'
                className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400'
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 pt-4 border-t border-gray-200'>
            <Button
              type='submit'
              className='flex-1 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold'
            >
              Thêm
            </Button>
            <Button type='button' variant='outline' onClick={handleClose} className='flex-1 hover:bg-gray-50'>
              Trở về
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

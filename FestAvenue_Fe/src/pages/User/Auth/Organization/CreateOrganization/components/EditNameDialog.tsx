import { useState } from 'react'
import { Edit3, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { FormData } from '../types'
import type { UseFormReturn } from 'react-hook-form'

interface EditNameDialogProps {
  form: UseFormReturn<FormData>
  onNameChange?: () => void
}

export function EditNameDialog({ form, onNameChange }: EditNameDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempName, setTempName] = useState('')

  const currentName = form.watch('name')

  const handleOpen = () => {
    setTempName(currentName || '')
    setIsOpen(true)
  }

  const handleSave = () => {
    if (tempName.trim()) {
      form.setValue('name', tempName.trim())
      onNameChange?.()
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    setTempName(currentName || '')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={handleOpen}
          className='flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
        >
          <Edit3 className='w-4 h-4' />
          Sửa tên
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit3 className='w-5 h-5 text-blue-600' />
            Sửa tên tổ chức
          </DialogTitle>
          <DialogDescription>Cập nhật tên tổ chức của bạn. Tên này sẽ hiển thị ở tất cả các bước.</DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <div className='space-y-2'>
            <label htmlFor='org-name' className='text-sm font-medium text-slate-700'>
              Tên tổ chức
            </label>
            <Input
              id='org-name'
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder='Nhập tên tổ chức...'
              className='w-full'
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave()
                } else if (e.key === 'Escape') {
                  handleCancel()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className='gap-2'>
          <Button type='button' variant='outline' onClick={handleCancel} className='flex items-center gap-2'>
            <X className='w-4 h-4' />
            Hủy
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            disabled={!tempName.trim()}
            className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700'
          >
            <Save className='w-4 h-4' />
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

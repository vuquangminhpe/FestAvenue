import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface LabelEditModalProps {
  isOpen: boolean
  onClose: () => void
  labelText: string
  setLabelText: (text: string) => void
  onSave: () => void
}

export default function LabelEditModal({
  isOpen,
  onClose,
  labelText,
  setLabelText,
  onSave
}: LabelEditModalProps) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'>
      <div className='bg-slate-800 p-6 rounded-xl border border-purple-500/30 shadow-2xl w-96 animate-in zoom-in duration-200'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-bold text-white'>Sửa Tên Khu Vực</h3>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </div>
        <div className='space-y-4'>
          <div>
            <Label>Tên hiển thị</Label>
            <Input
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              className='bg-slate-700 border-slate-600 text-white'
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSave()
                }
              }}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={onSave} className='bg-purple-600 hover:bg-purple-700'>
              Lưu Thay Đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

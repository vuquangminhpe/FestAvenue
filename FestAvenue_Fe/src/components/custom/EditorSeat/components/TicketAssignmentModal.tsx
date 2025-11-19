import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'

interface TicketAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTicketId: string
  setSelectedTicketId: (id: string) => void
  onSave: () => void
  tickets: any[]
}

export default function TicketAssignmentModal({
  isOpen,
  onClose,
  selectedTicketId,
  setSelectedTicketId,
  onSave,
  tickets
}: TicketAssignmentModalProps) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'>
      <div className='bg-slate-800 p-6 rounded-xl border border-purple-500/30 shadow-2xl w-96 animate-in zoom-in duration-200'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-bold text-white'>Gán Vé Cho Ghế</h3>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </div>
        <div className='space-y-4'>
          <div>
            <Label>Chọn Loại Vé</Label>
            <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
              <SelectTrigger className='bg-slate-700 border-slate-600 text-white'>
                <SelectValue placeholder='Chọn loại vé...' />
              </SelectTrigger>
              <SelectContent>
                {tickets.map((ticket) => (
                  <SelectItem key={ticket.id} value={ticket.id}>
                    {ticket.name} - {ticket.isFree ? 'Miễn phí' : `${ticket.price.toLocaleString()} VNĐ`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

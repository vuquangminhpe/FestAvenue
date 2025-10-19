import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'
import type { Ticket } from '../types'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  ticket: Ticket | null
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export default function DeleteConfirmDialog({
  isOpen,
  ticket,
  onConfirm,
  onCancel,
  isDeleting = false
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className='bg-white'>
        <AlertDialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-12 h-12 rounded-full bg-red-100 flex items-center justify-center'>
              <AlertTriangle className='w-6 h-6 text-red-600' />
            </div>
            <AlertDialogTitle className='text-xl font-bold text-gray-900'>Xác nhận xóa vé</AlertDialogTitle>
          </div>
          <AlertDialogDescription className='text-gray-600 space-y-3'>
            <p>Bạn có chắc chắn muốn xóa vé này?</p>
            {ticket && (
              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2'>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Tên vé:</span>
                  <span className='text-gray-900'>{ticket.name}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Giá:</span>
                  <span className='text-gray-900'>
                    {ticket.isFree
                      ? 'Miễn phí'
                      : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticket.price)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Số lượng:</span>
                  <span className='text-gray-900'>{ticket.quantity} vé</span>
                </div>
              </div>
            )}
            <p className='text-red-600 font-medium'>⚠️ Hành động này không thể hoàn tác!</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className='hover:bg-gray-100'>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className='bg-red-600 hover:bg-red-700 text-white'
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa vé'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Mail, Phone, X, User } from 'lucide-react'
import type { InvitationResult } from '@/types/userManagement.types'
import { InvitationStatus } from '@/types/userManagement.types'
import { useState } from 'react'
import { useCancelInvitation } from '../hooks/useUserManagement'

interface InvitationTableProps {
  invitations: InvitationResult[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const getStatusBadge = (status: number) => {
  switch (status) {
    case InvitationStatus.Pending:
      return <Badge className='bg-yellow-100 text-yellow-700 border border-yellow-300'>Chờ phản hồi</Badge>
    case InvitationStatus.Accepted:
      return <Badge className='bg-green-100 text-green-700 border border-green-300'>Đã chấp nhận</Badge>
    case InvitationStatus.Declined:
      return <Badge className='bg-red-100 text-red-700 border border-red-300'>Đã từ chối</Badge>
    case InvitationStatus.Canceled:
      return <Badge className='bg-gray-100 text-gray-700 border border-gray-300'>Đã hủy</Badge>
    default:
      return <Badge>Không xác định</Badge>
  }
}

export default function InvitationTable({
  invitations,
  currentPage,
  totalPages,
  onPageChange
}: InvitationTableProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [invitationToCancel, setInvitationToCancel] = useState<string | null>(null)
  const cancelInvitationMutation = useCancelInvitation()

  const handleCancelClick = (invitationId: string) => {
    setInvitationToCancel(invitationId)
    setCancelDialogOpen(true)
  }

  const confirmCancel = () => {
    if (invitationToCancel) {
      cancelInvitationMutation.mutate(invitationToCancel, {
        onSuccess: () => {
          setCancelDialogOpen(false)
          setInvitationToCancel(null)
        }
      })
    }
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100'>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 transition-all duration-300'>
              <TableHead className='font-semibold text-gray-700 w-16 text-center'>STT</TableHead>
              <TableHead className='font-semibold text-gray-700 text-left'>Thông tin người được mời</TableHead>
              <TableHead className='font-semibold text-gray-700 text-center'>Trạng thái</TableHead>
              <TableHead className='font-semibold text-gray-700 text-center'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center py-8 text-gray-500'>
                  Chưa có lời mời nào được gửi
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((invitation, index) => (
                <TableRow
                  key={invitation.invitationId}
                  className='hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/50 transition-all duration-300 group animate-in fade-in slide-in-from-left-4'
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                >
                  <TableCell className='font-medium text-gray-600 text-center align-middle'>
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell className='align-middle'>
                    <div className='flex items-center space-x-3'>
                      {invitation.avatarUrl ? (
                        <img
                          src={invitation.avatarUrl}
                          alt={invitation.fullName}
                          className='w-12 h-12 rounded-full object-cover shadow-md'
                        />
                      ) : (
                        <div className='w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-white font-semibold shadow-md'>
                          <User className='w-6 h-6' />
                        </div>
                      )}
                      <div>
                        <p className='font-semibold text-gray-800'>{invitation.fullName}</p>
                        <div className='flex items-center gap-3 text-sm text-gray-500 mt-1'>
                          <div className='flex items-center gap-1'>
                            <Mail className='w-3 h-3' />
                            {invitation.email}
                          </div>
                          {invitation.phoneNumber && (
                            <div className='flex items-center gap-1'>
                              <Phone className='w-3 h-3' />
                              {invitation.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-center align-middle'>
                    {getStatusBadge(invitation.invitationStatus)}
                  </TableCell>
                  <TableCell className='align-middle'>
                    <div className='flex items-center justify-center gap-2'>
                      {/* Only show cancel button for pending invitations */}
                      {invitation.invitationStatus === InvitationStatus.Pending && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleCancelClick(invitation.invitationId)}
                          className='hover:bg-red-100 hover:text-red-600 transition-all duration-300 hover:scale-110'
                          title='Hủy lời mời'
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2 p-4 border-t border-gray-100 bg-gradient-to-r from-cyan-50/30 to-blue-50/30'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='hover:bg-gradient-to-r hover:from-cyan-100 hover:to-blue-100 transition-all duration-300'
          >
            Trước
          </Button>
          <div className='flex gap-1'>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size='sm'
                onClick={() => onPageChange(page)}
                className={
                  currentPage === page
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-300 text-white shadow-md'
                    : 'hover:bg-gradient-to-r hover:from-cyan-100 hover:to-blue-100'
                }
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='hover:bg-gradient-to-r hover:from-cyan-100 hover:to-blue-100 transition-all duration-300'
          >
            Kế tiếp
          </Button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-gray-800'>Xác nhận hủy lời mời</DialogTitle>
            <DialogDescription className='text-gray-600'>
              Bạn có chắc chắn muốn hủy lời mời này? Người dùng sẽ không thể chấp nhận lời mời nữa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2'>
            <Button
              variant='outline'
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelInvitationMutation.isPending}
            >
              Đóng
            </Button>
            <Button
              variant='destructive'
              onClick={confirmCancel}
              disabled={cancelInvitationMutation.isPending}
              className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            >
              {cancelInvitationMutation.isPending ? 'Đang hủy...' : 'Hủy lời mời'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

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
import { Edit, Eye, Trash2, Mail } from 'lucide-react'
import type { UserServicePackageResult } from '@/types/userManagement.types'
import { useState } from 'react'
import { useRemoveUserFromEvent } from '../hooks/useUserManagement'
import { PermissionGuard } from '@/components/guards/PermissionGuard'

interface UserTableProps {
  users: UserServicePackageResult[]
  eventId: string
  onView: (user: UserServicePackageResult) => void
  onEdit: (user: UserServicePackageResult) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const getPackageBadgeColor = (index: number) => {
  const colors = [
    'bg-gradient-to-r from-cyan-400 to-blue-300 text-white',
    'bg-gradient-to-r from-purple-400 to-pink-400 text-white',
    'bg-gradient-to-r from-green-400 to-teal-400 text-white',
    'bg-gradient-to-r from-orange-400 to-red-400 text-white',
    'bg-gradient-to-r from-indigo-400 to-purple-400 text-white'
  ]
  return colors[index % colors.length]
}

export default function UserTable({
  users,
  eventId,
  onView,
  onEdit,
  currentPage,
  totalPages,
  onPageChange
}: UserTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const removeUserMutation = useRemoveUserFromEvent()

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      removeUserMutation.mutate(
        { eventId, userId: userToDelete },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false)
            setUserToDelete(null)
          }
        }
      )
    }
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100'>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 transition-all duration-300'>
              <TableHead className='font-semibold text-gray-700 w-16 text-center'>STT</TableHead>
              <TableHead className='font-semibold text-gray-700 text-left'>Thông tin User</TableHead>
              <TableHead className='font-semibold text-gray-700 text-left'>Chức năng có thể dùng</TableHead>
              <TableHead className='font-semibold text-gray-700 text-center'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center py-8 text-gray-500'>
                  Chưa có thành viên nào trong sự kiện
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow
                  key={user.userId}
                  className='hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/50 transition-all duration-300 group animate-in fade-in slide-in-from-left-4'
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                >
                  <TableCell className='font-medium text-gray-600 text-center align-middle'>
                    {(currentPage - 1) * 10 + index + 1}
                  </TableCell>
                  <TableCell className='align-middle'>
                    <div className='flex items-center space-x-3'>
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className='w-12 h-12 rounded-full object-cover shadow-md'
                        />
                      ) : (
                        <div className='w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-white font-semibold shadow-md'>
                          {user.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className='font-semibold text-gray-800'>{user.fullName}</p>
                        <div className='flex items-center gap-1 text-sm text-gray-500 mt-1'>
                          <Mail className='w-3 h-3' />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-left align-middle'>
                    <div className='flex flex-wrap gap-2'>
                      {user.servicePackages.length > 0 ? (
                        user.servicePackages.map((pkg, idx) => (
                          <Badge
                            key={pkg.id}
                            className={`${getPackageBadgeColor(idx)} shadow-md px-3 py-1`}
                            title={pkg.description}
                          >
                            {pkg.name}
                          </Badge>
                        ))
                      ) : (
                        <Badge className='bg-gray-200 text-gray-600 px-3 py-1'>Không có quyền</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='align-middle'>
                    <div className='flex items-center justify-center gap-2'>
                      {/* Everyone can view */}
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onView(user)}
                        className='hover:bg-blue-100 hover:text-blue-600 transition-all duration-300 hover:scale-110'
                        title='Xem chi tiết'
                      >
                        <Eye className='w-4 h-4' />
                      </Button>

                      {/* Only Event Owner can edit and delete */}
                      <PermissionGuard requiresEventOwner>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => onEdit(user)}
                          className='hover:bg-cyan-100 hover:text-cyan-600 transition-all duration-300 hover:scale-110'
                          title='Chỉnh sửa quyền'
                        >
                          <Edit className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDeleteClick(user.userId)}
                          className='hover:bg-red-100 hover:text-red-600 transition-all duration-300 hover:scale-110'
                          title='Xóa khỏi sự kiện'
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </PermissionGuard>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold text-gray-800'>Xác nhận xóa</DialogTitle>
            <DialogDescription className='text-gray-600'>
              Bạn có chắc chắn muốn xóa thành viên này khỏi sự kiện? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)} disabled={removeUserMutation.isPending}>
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={removeUserMutation.isPending}
              className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            >
              {removeUserMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

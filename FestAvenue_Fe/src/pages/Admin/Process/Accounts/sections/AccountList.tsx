import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Eye, Loader2, ChevronLeft, ChevronRight, Pencil, Ban, CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
import { useAccountQuery, getUserStatusText, getUserStatusVariant, getRoleBadgeVariant } from '../hooks/useAccountQuery'
import type { resAdminGetAllUser } from '@/types/admin.types'

interface AccountListProps {
  onViewDetail: (user: resAdminGetAllUser) => void
}

const AccountList = ({ onViewDetail }: AccountListProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Update dialog state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<resAdminGetAllUser | null>(null)
  const [updateForm, setUpdateForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    newPassword: ''
  })

  // Ban/Active confirm dialog state
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [activeDialogOpen, setActiveDialogOpen] = useState(false)
  const [actionUser, setActionUser] = useState<resAdminGetAllUser | null>(null)

  const { useUsersQuery, updateStaffMutation, banAccountMutation, activeAccountMutation } = useAccountQuery()

  // Build filter params
  const filterParams = useMemo(() => {
    return {
      status: [0, 1],
      pagination: {
        pageIndex,
        isPaging: true,
        pageSize
      }
    }
  }, [pageIndex, pageSize])

  const { data, isLoading, isError } = useUsersQuery(filterParams)

  const users = data?.data?.result ? (Array.isArray(data.data.result) ? data.data.result : [data.data.result]) : []
  const pagination = (data?.data as any)?.pagination

  // Client-side filtering for search and role
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole =
        roleFilter === 'all' || user.roles.some((role: string) => role.toLowerCase() === roleFilter.toLowerCase())
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  // Check if user is staff
  const isStaffUser = (user: resAdminGetAllUser) => {
    return user.isStaff || user.roles.some((role: string) => role.toLowerCase() === 'staff')
  }

  const handleUpdateClick = (user: resAdminGetAllUser) => {
    setSelectedUser(user)
    setUpdateForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      newPassword: ''
    })
    setUpdateDialogOpen(true)
  }

  const handleUpdateSubmit = () => {
    if (!selectedUser) return

    updateStaffMutation.mutate(
      {
        staffId: selectedUser.id,
        firstName: updateForm.firstName,
        lastName: updateForm.lastName,
        phone: updateForm.phone,
        newPassword: updateForm.newPassword
      },
      {
        onSuccess: () => {
          setUpdateDialogOpen(false)
          setSelectedUser(null)
          setUpdateForm({ firstName: '', lastName: '', phone: '', newPassword: '' })
        }
      }
    )
  }

  const handleBanClick = (user: resAdminGetAllUser) => {
    setActionUser(user)
    setBanDialogOpen(true)
  }

  const handleActiveClick = (user: resAdminGetAllUser) => {
    setActionUser(user)
    setActiveDialogOpen(true)
  }

  const handleBanConfirm = () => {
    if (!actionUser) return
    banAccountMutation.mutate(actionUser.id, {
      onSuccess: () => {
        setBanDialogOpen(false)
        setActionUser(null)
      }
    })
  }

  const handleActiveConfirm = () => {
    if (!actionUser) return
    activeAccountMutation.mutate(actionUser.id, {
      onSuccess: () => {
        setActiveDialogOpen(false)
        setActionUser(null)
      }
    })
  }

  const isActionPending = banAccountMutation.isPending || activeAccountMutation.isPending

  if (isError) {
    return (
      <div className='text-center py-8 text-red-500'>Có lỗi xảy ra khi tải danh sách tài khoản. Vui lòng thử lại.</div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            placeholder='Tìm kiếm theo tên hoặc email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className='w-full sm:w-[180px]'>
            <SelectValue placeholder='Vai trò' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả vai trò</SelectItem>
            <SelectItem value='admin'>Admin</SelectItem>
            <SelectItem value='organizer'>Organizer</SelectItem>
            <SelectItem value='staff'>Staff</SelectItem>
            <SelectItem value='user'>User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className='text-right'>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center py-8'>
                  <Loader2 className='w-6 h-6 animate-spin mx-auto text-gray-400' />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center py-8 text-gray-500'>
                  Không tìm thấy tài khoản nào
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={`${user.firstName} ${user.lastName}`}
                        className='w-10 h-10 rounded-full object-cover'
                      />
                      <span className='font-medium'>
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {user.roles.map((role: string) => (
                        <Badge key={role} className={getRoleBadgeVariant(role)}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getUserStatusVariant(user.status)}>{getUserStatusText(user.status)}</Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      <Button variant='ghost' size='sm' onClick={() => onViewDetail(user)} title='Xem chi tiết'>
                        <Eye className='w-4 h-4' />
                      </Button>

                      {/* Chỉ hiển thị nút Update cho staff */}
                      {isStaffUser(user) && (
                        <Button variant='ghost' size='sm' onClick={() => handleUpdateClick(user)} title='Cập nhật'>
                          <Pencil className='w-4 h-4' />
                        </Button>
                      )}

                      {/* Ban/Active buttons */}
                      {user.status === 1 ? (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleBanClick(user)}
                          title='Cấm tài khoản'
                          className='text-red-600 hover:text-red-700 hover:bg-red-50'
                        >
                          <Ban className='w-4 h-4' />
                        </Button>
                      ) : (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleActiveClick(user)}
                          title='Kích hoạt tài khoản'
                          className='text-green-600 hover:text-green-700 hover:bg-green-50'
                        >
                          <CheckCircle className='w-4 h-4' />
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
      {pagination && (
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='text-sm text-gray-500'>Tổng: {pagination.total || 0} tài khoản</div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-500'>Hiển thị:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPageIndex(1)
                }}
              >
                <SelectTrigger className='w-[80px] h-8'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5</SelectItem>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => setPageIndex(1)} disabled={pageIndex === 1}>
              Đầu
            </Button>
            <Button variant='outline' size='sm' onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}>
              <ChevronLeft className='w-4 h-4' />
            </Button>

            <div className='flex items-center gap-1'>
              {(() => {
                const totalPages = pagination.totalPage || 1
                const pages: (number | string)[] = []

                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i)
                } else {
                  if (pageIndex <= 3) {
                    pages.push(1, 2, 3, 4, '...', totalPages)
                  } else if (pageIndex >= totalPages - 2) {
                    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
                  } else {
                    pages.push(1, '...', pageIndex - 1, pageIndex, pageIndex + 1, '...', totalPages)
                  }
                }

                return pages.map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className='px-2 text-gray-400'>
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={pageIndex === page ? 'default' : 'outline'}
                      size='sm'
                      className='w-8 h-8 p-0'
                      onClick={() => setPageIndex(page as number)}
                    >
                      {page}
                    </Button>
                  )
                )
              })()}
            </div>

            <Button variant='outline' size='sm' onClick={() => setPageIndex((prev) => prev + 1)}>
              <ChevronRight className='w-4 h-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPageIndex(pagination.totalPage || 1)}
              disabled={pageIndex === (pagination.totalPage || 1)}
            >
              Cuối
            </Button>
          </div>
        </div>
      )}

      {!pagination && !isLoading && (
        <div className='text-sm text-gray-500'>Hiển thị {filteredUsers.length} tài khoản</div>
      )}

      {/* Update Staff Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Cập nhật tài khoản Staff</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin tài khoản staff</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className='space-y-4'>
              <div className='p-4 bg-gray-50 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <img
                    src={selectedUser.avatar || '/default-avatar.png'}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className='w-12 h-12 rounded-full object-cover'
                  />
                  <div>
                    <p className='font-medium'>
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className='text-sm text-gray-500'>{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>Họ</Label>
                  <Input
                    id='firstName'
                    value={updateForm.firstName}
                    onChange={(e) => setUpdateForm({ ...updateForm, firstName: e.target.value })}
                    placeholder='Nhập họ'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Tên</Label>
                  <Input
                    id='lastName'
                    value={updateForm.lastName}
                    onChange={(e) => setUpdateForm({ ...updateForm, lastName: e.target.value })}
                    placeholder='Nhập tên'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Số điện thoại</Label>
                <Input
                  id='phone'
                  value={updateForm.phone}
                  onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
                  placeholder='Nhập số điện thoại'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='newPassword'>Mật khẩu mới (để trống nếu không đổi)</Label>
                <Input
                  id='newPassword'
                  type='password'
                  value={updateForm.newPassword}
                  onChange={(e) => setUpdateForm({ ...updateForm, newPassword: e.target.value })}
                  placeholder='Nhập mật khẩu mới'
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setUpdateDialogOpen(false)}
              disabled={updateStaffMutation.isPending}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateSubmit} disabled={updateStaffMutation.isPending}>
              {updateStaffMutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Account Confirm Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận cấm tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn cấm tài khoản{' '}
              <strong>
                {actionUser?.firstName} {actionUser?.lastName}
              </strong>{' '}
              ({actionUser?.email})? Người dùng sẽ không thể đăng nhập vào hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanConfirm}
              disabled={isActionPending}
              className='bg-red-600 hover:bg-red-700'
            >
              {isActionPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
              Cấm tài khoản
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Active Account Confirm Dialog */}
      <AlertDialog open={activeDialogOpen} onOpenChange={setActiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận kích hoạt tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn kích hoạt lại tài khoản{' '}
              <strong>
                {actionUser?.firstName} {actionUser?.lastName}
              </strong>{' '}
              ({actionUser?.email})? Người dùng sẽ có thể đăng nhập vào hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActiveConfirm}
              disabled={isActionPending}
              className='bg-green-600 hover:bg-green-700'
            >
              {isActionPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
              Kích hoạt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AccountList

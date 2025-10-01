import { useState } from 'react'
import { mockUsers, type User } from '@/utils/mockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Eye, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface AccountListProps {
  onViewDetail: (userId: string) => void
}

const AccountList = ({ onViewDetail }: AccountListProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newStatus, setNewStatus] = useState<User['status']>('active')
  const [reason, setReason] = useState('')

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadge = (role: User['role']) => {
    const variants: Record<User['role'], string> = {
      admin: 'bg-purple-100 text-purple-800',
      organizer: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800'
    }
    return variants[role]
  }

  const getStatusBadge = (status: User['status']) => {
    const variants: Record<User['status'], string> = {
      active: 'bg-green-100 text-green-800',
      banned: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    const labels: Record<User['status'], string> = {
      active: 'Hoạt động',
      banned: 'Đã cấm',
      pending: 'Chờ duyệt'
    }
    return { variant: variants[status], label: labels[status] }
  }

  const handleStatusClick = (user: User) => {
    setSelectedUser(user)
    setNewStatus(user.status)
    setReason('')
    setStatusDialogOpen(true)
  }

  const handleStatusUpdate = () => {
    if (!selectedUser || !reason.trim()) return

    toast.success(`Cập nhật trạng thái tài khoản thành công`)

    setStatusDialogOpen(false)
    setSelectedUser(null)
    setReason('')
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full sm:w-[180px]'>
            <SelectValue placeholder='Trạng thái' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả trạng thái</SelectItem>
            <SelectItem value='active'>Hoạt động</SelectItem>
            <SelectItem value='banned'>Đã cấm</SelectItem>
            <SelectItem value='pending'>Chờ duyệt</SelectItem>
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
            {filteredUsers.length === 0 ? (
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
                      <img src={user.avatar} alt={user.name} className='w-10 h-10 rounded-full' />
                      <span className='font-medium'>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadge(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusBadge(user.status).variant} cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => handleStatusClick(user)}
                    >
                      {getStatusBadge(user.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className='text-right'>
                    <Button variant='ghost' size='sm' onClick={() => onViewDetail(user.id)} className='gap-2'>
                      <Eye className='w-4 h-4' />
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='text-sm text-gray-500'>
        Hiển thị {filteredUsers.length} / {mockUsers.length} tài khoản
      </div>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái tài khoản</DialogTitle>
            <DialogDescription>Thay đổi trạng thái của tài khoản người dùng</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className='space-y-4'>
              <div className='p-4 bg-gray-50 border rounded-lg space-y-2'>
                <div className='flex items-center gap-3'>
                  <img src={selectedUser.avatar} alt={selectedUser.name} className='w-12 h-12 rounded-full' />
                  <div>
                    <p className='font-medium'>{selectedUser.name}</p>
                    <p className='text-sm text-gray-500'>{selectedUser.email}</p>
                  </div>
                </div>
                <div className='flex items-center justify-between pt-2 border-t'>
                  <span className='text-sm font-medium'>Trạng thái hiện tại:</span>
                  <Badge className={getStatusBadge(selectedUser.status).variant}>
                    {getStatusBadge(selectedUser.status).label}
                  </Badge>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='newStatus'>Trạng thái mới</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as User['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Hoạt động</SelectItem>
                    <SelectItem value='banned'>Đã cấm</SelectItem>
                    <SelectItem value='pending'>Chờ duyệt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='reason'>Lý do thay đổi</Label>
                <Textarea
                  id='reason'
                  placeholder='Nhập lý do thay đổi trạng thái...'
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              {newStatus === 'banned' && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
                  <AlertTriangle className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0' />
                  <div className='text-sm text-red-800'>
                    <strong>Cảnh báo:</strong> Người dùng sẽ không thể đăng nhập và sử dụng hệ thống khi bị cấm.
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant='outline' onClick={() => setStatusDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={!reason.trim() || newStatus === selectedUser?.status}
              variant={newStatus === 'banned' ? 'destructive' : 'default'}
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AccountList

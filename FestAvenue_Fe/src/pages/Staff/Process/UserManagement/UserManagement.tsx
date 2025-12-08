import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import StaffAccountList from './sections/StaffAccountList'
import StaffAccountDetail from './sections/StaffAccountDetail'
import type { resAdminGetAllUser } from '@/types/admin.types'

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<resAdminGetAllUser | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const handleViewDetail = (user: resAdminGetAllUser) => {
    setSelectedUser(user)
    setDetailDialogOpen(true)
  }

  const handleCloseDialog = (open: boolean) => {
    setDetailDialogOpen(open)
    if (!open) {
      setSelectedUser(null)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Quản lý người dùng</h1>
        <p className='text-gray-500 mt-2'>Xem và quản lý tài khoản người dùng trong hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài khoản</CardTitle>
          <CardDescription>Xem và quản lý trạng thái tài khoản người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <StaffAccountList onViewDetail={handleViewDetail} />
        </CardContent>
      </Card>

      {/* Account Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className='max-w-3xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết tài khoản</DialogTitle>
            <DialogDescription>Xem thông tin chi tiết của tài khoản</DialogDescription>
          </DialogHeader>
          <StaffAccountDetail user={selectedUser} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserManagement

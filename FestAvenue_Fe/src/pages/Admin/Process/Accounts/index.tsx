import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserPlus, Shield, List } from 'lucide-react'
import CreateAccount from './sections/CreateAccount'
import AssignRole from './sections/AssignRole'
import AccountList from './sections/AccountList'
import AccountDetail from './sections/AccountDetail'

const AccountManagement = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const handleViewDetail = (userId: string) => {
    setSelectedUserId(userId)
    setDetailDialogOpen(true)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Quản lý tài khoản</h1>
        <p className='text-gray-500 mt-2'>Quản lý người dùng, phân quyền và kiểm soát tài khoản</p>
      </div>

      <Tabs defaultValue='list' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4 lg:w-auto lg:inline-grid'>
          <TabsTrigger value='list' className='flex items-center gap-2'>
            <List className='w-4 h-4' />
            Danh sách
          </TabsTrigger>
          <TabsTrigger value='create' className='flex items-center gap-2'>
            <UserPlus className='w-4 h-4' />
            Tạo tài khoản
          </TabsTrigger>
          <TabsTrigger value='assign' className='flex items-center gap-2'>
            <Shield className='w-4 h-4' />
            Phân quyền
          </TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Danh sách tài khoản</CardTitle>
              <CardDescription>Xem và quản lý tất cả tài khoản trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountList onViewDetail={handleViewDetail} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='create' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Tạo tài khoản mới</CardTitle>
              <CardDescription>Thêm người dùng mới vào hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateAccount />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='assign' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Phân quyền tài khoản</CardTitle>
              <CardDescription>Gán vai trò và quyền hạn cho người dùng</CardDescription>
            </CardHeader>
            <CardContent>
              <AssignRole />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className='max-w-3xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Chi tiết tài khoản</DialogTitle>
            <DialogDescription>Xem thông tin chi tiết của tài khoản</DialogDescription>
          </DialogHeader>
          {selectedUserId && <AccountDetail userId={selectedUserId} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AccountManagement

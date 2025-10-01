import { mockUsers } from '@/utils/mockData'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar, Mail, Shield, Clock, User } from 'lucide-react'

interface AccountDetailProps {
  userId: string
}

const AccountDetail = ({ userId }: AccountDetailProps) => {
  const user = mockUsers.find((u) => u.id === userId)

  if (!user) {
    return (
      <div className='text-center py-8 text-gray-500'>Không tìm thấy thông tin người dùng</div>
    )
  }

  const getRoleBadge = () => {
    const variants = {
      admin: 'bg-purple-100 text-purple-800',
      organizer: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800'
    }
    return variants[user.role]
  }

  const getStatusBadge = () => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      banned: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    const labels = {
      active: 'Hoạt động',
      banned: 'Đã cấm',
      pending: 'Chờ duyệt'
    }
    return { variant: variants[user.status], label: labels[user.status] }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-start gap-6'>
        <img src={user.avatar} alt={user.name} className='w-24 h-24 rounded-full border-4 border-gray-100' />
        <div className='flex-1'>
          <h3 className='text-2xl font-bold text-gray-900'>{user.name}</h3>
          <p className='text-gray-500 mt-1'>{user.email}</p>
          <div className='flex gap-2 mt-3'>
            <Badge className={getRoleBadge()}>{user.role}</Badge>
            <Badge className={getStatusBadge().variant}>{getStatusBadge().label}</Badge>
          </div>
        </div>
      </div>

      <Separator />

      <div className='grid gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='grid gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center'>
                  <User className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>ID tài khoản</p>
                  <p className='font-medium'>{user.id}</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center'>
                  <Mail className='w-5 h-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Email</p>
                  <p className='font-medium'>{user.email}</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center'>
                  <Shield className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Vai trò</p>
                  <p className='font-medium capitalize'>{user.role}</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center'>
                  <Calendar className='w-5 h-5 text-orange-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Ngày tạo</p>
                  <p className='font-medium'>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {user.lastLogin && (
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center'>
                    <Clock className='w-5 h-5 text-teal-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Đăng nhập gần nhất</p>
                    <p className='font-medium'>{new Date(user.lastLogin).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <h4 className='font-semibold mb-4'>Hoạt động gần đây</h4>
            <div className='space-y-3'>
              <div className='flex items-center justify-between py-2'>
                <span className='text-sm text-gray-600'>Đăng nhập</span>
                <span className='text-sm text-gray-500'>2 giờ trước</span>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span className='text-sm text-gray-600'>Cập nhật thông tin</span>
                <span className='text-sm text-gray-500'>1 ngày trước</span>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span className='text-sm text-gray-600'>Thay đổi mật khẩu</span>
                <span className='text-sm text-gray-500'>3 ngày trước</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AccountDetail

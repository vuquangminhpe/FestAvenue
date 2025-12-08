import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar, Mail, Shield, Clock, User, Phone, Globe, Bell } from 'lucide-react'
import { getUserStatusText, getUserStatusVariant, getRoleBadgeVariant } from '../hooks/useAccountQuery'
import type { resAdminGetAllUser } from '@/types/admin.types'

interface AccountDetailProps {
  user: resAdminGetAllUser | null
}

const AccountDetail = ({ user }: AccountDetailProps) => {
  if (!user) {
    return <div className='text-center py-8 text-gray-500'>Không tìm thấy thông tin người dùng</div>
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim() || 'Chưa cập nhật'

  return (
    <div className='space-y-6'>
      <div className='flex items-start gap-6'>
        <img
          src={user.avatar || '/default-avatar.png'}
          alt={fullName}
          className='w-24 h-24 rounded-full border-4 border-gray-100 object-cover'
        />
        <div className='flex-1'>
          <h3 className='text-2xl font-bold text-gray-900'>{fullName}</h3>
          <p className='text-gray-500 mt-1'>{user.email}</p>
          <div className='flex flex-wrap gap-2 mt-3'>
            {user.roles.map((role) => (
              <Badge key={role} className={getRoleBadgeVariant(role)}>
                {role}
              </Badge>
            ))}
            <Badge className={getUserStatusVariant(user.status)}>{getUserStatusText(user.status)}</Badge>
            {user.isStaff && <Badge className='bg-indigo-100 text-indigo-800'>Staff</Badge>}
          </div>
        </div>
      </div>

      <Separator />

      <div className='grid gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <h4 className='font-semibold mb-4'>Thông tin cơ bản</h4>
            <div className='grid gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center'>
                  <User className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>ID tài khoản</p>
                  <p className='font-medium font-mono text-sm'>{user.id}</p>
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

              {user.phone && (
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center'>
                    <Phone className='w-5 h-5 text-cyan-600' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Số điện thoại</p>
                    <p className='font-medium'>{user.phone}</p>
                  </div>
                </div>
              )}

              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center'>
                  <Shield className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Vai trò</p>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {user.roles.map((role) => (
                      <span key={role} className='font-medium capitalize'>
                        {role}
                        {user.roles.indexOf(role) < user.roles.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
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
                    <p className='font-medium'>
                      {new Date(user.lastLogin).toLocaleString('vi-VN', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <h4 className='font-semibold mb-4'>Cài đặt & Bảo mật</h4>
            <div className='grid gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center'>
                  <Globe className='w-5 h-5 text-amber-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Ngôn ngữ / Múi giờ</p>
                  <p className='font-medium'>
                    {user.preferences?.language || 'vi'} / {user.preferences?.timezone || 'Asia/Ho_Chi_Minh'}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center'>
                  <Bell className='w-5 h-5 text-pink-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Thông báo</p>
                  <div className='flex gap-2 mt-1'>
                    {user.preferences?.notifications?.email && (
                      <Badge variant='outline' className='text-xs'>
                        Email
                      </Badge>
                    )}
                    {user.preferences?.notifications?.sms && (
                      <Badge variant='outline' className='text-xs'>
                        SMS
                      </Badge>
                    )}
                    {user.preferences?.notifications?.push && (
                      <Badge variant='outline' className='text-xs'>
                        Push
                      </Badge>
                    )}
                    {!user.preferences?.notifications?.email &&
                      !user.preferences?.notifications?.sms &&
                      !user.preferences?.notifications?.push && (
                        <span className='text-sm text-gray-500'>Chưa bật thông báo</span>
                      )}
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center'>
                  <Shield className='w-5 h-5 text-red-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Xác thực 2 yếu tố (2FA)</p>
                  <p className='font-medium'>{user.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {user.userFollows && user.userFollows.length > 0 && (
          <Card>
            <CardContent className='pt-6'>
              <h4 className='font-semibold mb-4'>Sự kiện đang theo dõi ({user.userFollows.length})</h4>
              <div className='space-y-2'>
                {user.userFollows.slice(0, 5).map((follow) => (
                  <div key={follow.eventCode} className='flex items-center justify-between py-2 border-b last:border-0'>
                    <span className='text-sm font-mono'>{follow.eventCode}</span>
                    <span className='text-sm text-gray-500'>
                      {new Date(follow.followedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
                {user.userFollows.length > 5 && (
                  <p className='text-sm text-gray-500 text-center pt-2'>
                    Và {user.userFollows.length - 5} sự kiện khác...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default AccountDetail

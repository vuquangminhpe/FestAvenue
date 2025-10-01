import { useState } from 'react'
import { mockUsers } from '@/utils/mockData'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Ban, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

const BanAccount = () => {
  const [selectedUser, setSelectedUser] = useState('')
  const [action, setAction] = useState<'ban' | 'unban'>('ban')
  const [reason, setReason] = useState('')

  const selectedUserData = mockUsers.find((u) => u.id === selectedUser)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    toast(`${action === 'ban' ? 'Cấm' : 'Mở khóa'} tài khoản thành công`)

    setSelectedUser('')
    setAction('ban')
    setReason('')
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-w-2xl'>
      <div className='grid gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='user'>Chọn người dùng</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder='Chọn người dùng' />
            </SelectTrigger>
            <SelectContent>
              {mockUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className='flex items-center gap-2'>
                    {user.name} ({user.email})
                    {user.status === 'banned' && <Badge className='bg-red-100 text-red-800 ml-2'>Đã cấm</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUserData && (
          <div className='p-4 bg-gray-50 border rounded-lg space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Trạng thái hiện tại:</span>
              <Badge
                className={
                  selectedUserData.status === 'banned'
                    ? 'bg-red-100 text-red-800'
                    : selectedUserData.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {selectedUserData.status === 'banned'
                  ? 'Đã cấm'
                  : selectedUserData.status === 'active'
                  ? 'Hoạt động'
                  : 'Chờ duyệt'}
              </Badge>
            </div>
          </div>
        )}

        <div className='space-y-2'>
          <Label htmlFor='action'>Hành động</Label>
          <Select value={action} onValueChange={(value) => setAction(value as 'ban' | 'unban')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ban'>Cấm tài khoản</SelectItem>
              <SelectItem value='unban'>Mở khóa tài khoản</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='reason'>Lý do {action === 'ban' ? 'cấm' : 'mở khóa'}</Label>
          <Textarea
            id='reason'
            placeholder={`Nhập lý do ${action === 'ban' ? 'cấm' : 'mở khóa'} tài khoản...`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            required
          />
        </div>

        {selectedUser && action === 'ban' && (
          <div className='p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
            <AlertTriangle className='w-5 h-5 text-red-600 mt-0.5' />
            <div className='text-sm text-red-800'>
              <strong>Cảnh báo:</strong> Người dùng sẽ không thể đăng nhập và sử dụng hệ thống khi bị cấm.
            </div>
          </div>
        )}
      </div>

      <Button
        type='submit'
        disabled={!selectedUser || !reason}
        variant={action === 'ban' ? 'destructive' : 'default'}
        className='gap-2'
      >
        <Ban className='w-4 h-4' />
        {action === 'ban' ? 'Cấm tài khoản' : 'Mở khóa tài khoản'}
      </Button>
    </form>
  )
}

export default BanAccount

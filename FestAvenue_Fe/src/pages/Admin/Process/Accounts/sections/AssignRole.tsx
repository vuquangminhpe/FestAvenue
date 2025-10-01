import { useState } from 'react'
import { mockUsers } from '@/utils/mockData'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield } from 'lucide-react'
import { toast } from 'sonner'

const AssignRole = () => {
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedRole, setSelectedRole] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    toast('Phân quyền thành công')

    setSelectedUser('')
    setSelectedRole('')
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
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='role'>Vai trò mới</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder='Chọn vai trò' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='user'>User</SelectItem>
              <SelectItem value='staff'>Staff</SelectItem>
              <SelectItem value='organizer'>Organizer</SelectItem>
              <SelectItem value='admin'>Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedUser && (
          <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-sm text-blue-800'>
              <strong>Lưu ý:</strong> Thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của người dùng
            </p>
          </div>
        )}
      </div>

      <Button type='submit' disabled={!selectedUser || !selectedRole} className='gap-2'>
        <Shield className='w-4 h-4' />
        Gán vai trò
      </Button>
    </form>
  )
}

export default AssignRole

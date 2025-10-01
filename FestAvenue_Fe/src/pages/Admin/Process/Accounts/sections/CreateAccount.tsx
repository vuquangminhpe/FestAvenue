import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate API call
    toast('Tạo tài khoản thành công')

    // Reset form
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user'
    })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-w-2xl'>
      <div className='grid gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Họ và tên</Label>
          <Input
            id='name'
            placeholder='Nhập họ và tên'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='Nhập email'
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Mật khẩu</Label>
          <Input
            id='password'
            type='password'
            placeholder='Nhập mật khẩu'
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='role'>Vai trò</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='user'>User</SelectItem>
              <SelectItem value='staff'>Staff</SelectItem>
              <SelectItem value='organizer'>Organizer</SelectItem>
              <SelectItem value='admin'>Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type='submit' className='gap-2'>
        <UserPlus className='w-4 h-4' />
        Tạo tài khoản
      </Button>
    </form>
  )
}

export default CreateAccount

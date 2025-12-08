import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2, Mail, AlertCircle } from 'lucide-react'
import { useAccountQuery } from '../hooks/useAccountQuery'
import { Alert, AlertDescription } from '@/components/ui/alert'

const CreateAccount = () => {
  const [email, setEmail] = useState('')
  const { createStaffMutation } = useAccountQuery()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) return

    createStaffMutation.mutate(email, {
      onSuccess: () => {
        setEmail('')
      }
    })
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-w-2xl'>
      <Alert>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          Tạo tài khoản Staff mới. Hệ thống sẽ gửi email xác nhận và mật khẩu tạm thời đến địa chỉ email được cung cấp.
        </AlertDescription>
      </Alert>

      <div className='grid gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              id='email'
              type='email'
              placeholder='Nhập email của staff'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='pl-10'
              required
              disabled={createStaffMutation.isPending}
            />
          </div>
          <p className='text-sm text-gray-500'>Email này sẽ được sử dụng để đăng nhập vào hệ thống</p>
        </div>
      </div>

      <Button
        type='submit'
        className='gap-2'
        disabled={createStaffMutation.isPending || !email.trim() || !isValidEmail(email)}
      >
        {createStaffMutation.isPending ? (
          <Loader2 className='w-4 h-4 animate-spin' />
        ) : (
          <UserPlus className='w-4 h-4' />
        )}
        {createStaffMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản Staff'}
      </Button>
    </form>
  )
}

export default CreateAccount

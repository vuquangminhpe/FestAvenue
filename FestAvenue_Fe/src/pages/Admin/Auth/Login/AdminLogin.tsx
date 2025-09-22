import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Shield, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import userApi from '@/apis/user.api'
import { useAdminStore } from '@/contexts/app.context'
import type { bodyLoginType } from '@/types/user.types'
import path from '@/constants/path'

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const setIsLogin = useAdminStore((state) => state.setIsLogin)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<bodyLoginType>()

  const loginMutation = useMutation({
    mutationFn: userApi.login_normal,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data?.data?.accessToken)
      setIsLogin(true)
      toast.success('Đăng nhập Admin thành công!')
      navigate(path.admin.process.dashboard)
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || 'Đăng nhập thất bại')
    }
  })

  const onSubmit = (data: bodyLoginType) => {
    loginMutation.mutate(data)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md shadow-2xl border-slate-700'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='bg-red-100 p-3 rounded-full'>
              <Shield className='w-8 h-8 text-red-600' />
            </div>
          </div>
          <CardTitle className='text-2xl font-bold text-gray-800'>Admin Login</CardTitle>
          <p className='text-gray-600'>Đăng nhập vào hệ thống quản trị</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Email */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Email</label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  type='email'
                  placeholder='admin@festavenue.site'
                  className={`pl-10 ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                  {...register('email', {
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ'
                    }
                  })}
                />
              </div>
              {errors.email && <p className='text-sm text-red-500'>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Mật khẩu</label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Nhập mật khẩu'
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : 'border-slate-300'}`}
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự'
                    }
                  })}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
              {errors.password && <p className='text-sm text-red-500'>{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <Button type='submit' className='w-full bg-red-600 hover:bg-red-700' disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Đang đăng nhập...
                </div>
              ) : (
                'Đăng nhập Admin'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className='mt-6 text-center text-sm text-gray-500'>
            <p>Chỉ dành cho quản trị viên hệ thống</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLogin

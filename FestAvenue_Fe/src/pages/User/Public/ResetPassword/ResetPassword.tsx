/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, KeyIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import userApi from '@/apis/user.api'
import path from '@/constants/path'
import LOGO_IMG from '../../../../../public/Images/Fest.png'

interface FormErrors {
  token: string
  newPassword: string
}

const ResetPassword = () => {
  const [email, setEmail] = useState('')
  const location = useLocation()
  const token = location?.search.split('=')[1]
  const [data, setData] = useState<FormErrors>({ token, newPassword: '' })

  const resetPasswordMutation = useMutation({
    mutationFn: () => userApi.resetPassword(data),
    onSuccess: (data) => {
      toast.success(data?.message || 'Đổi mật khẩu thành công')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    }
  })

  const validateForm = (): boolean => {
    const newData: FormErrors = {
      token: '',
      newPassword: ''
    }

    if (!email) {
      newData.token = 'Token là bắt buộc'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newData.newPassword = 'Mật khẩu mới không hợp lệ'
    }

    setData(newData)
    return Object.keys(newData).length === 0
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      resetPasswordMutation.mutate()
    }
  }

  return (
    <div className='min-h-[700px] bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'>
        <div className=' p-6 pb-0 text-center'>
          <img src={LOGO_IMG} alt='FestAvenue Logo' className='h-[250px] w-[250px] mx-auto rounded-full' />
        </div>

        <div className='p-8 pt-0'>
          <form onSubmit={handleEmailSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
                Mật khẩu mới
              </Label>
              <div className='relative'>
                <Input
                  id='email'
                  type='email'
                  placeholder='Nhập mật khẩu của bạn'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-11 h-12 border-2 transition-all duration-200 ${
                    data.newPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 '
                  }`}
                />
                <KeyIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
              </div>
              {data.newPassword && (
                <p className='text-sm text-red-600 flex items-center mt-1'>
                  <span className='w-1 h-1 bg-red-600 rounded-full mr-2'></span>
                  {data.newPassword}
                </p>
              )}
            </div>

            <div className='space-y-4'>
              <Button
                type='submit'
                disabled={resetPasswordMutation.isPending}
                className='w-full h-12 bg-gradient-to-r cursor-pointer from-cyan-400 to-blue-300 hover:from-cyan-300  hover:to-blue-300 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
              >
                {resetPasswordMutation.isPending ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2  border-white border-t-transparent rounded-full animate-spin'></div>
                    Đang đổi mật khẩu...
                  </div>
                ) : (
                  'Đổi mật khẩu'
                )}
              </Button>

              <div className='text-center'>
                <Link
                  to={path.auth.login}
                  className='inline-flex items-center gap-2 text-sm text-black hover:text-gray-600 font-semibold  transition-colors duration-200'
                >
                  <ArrowLeft size={16} />
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default ResetPassword

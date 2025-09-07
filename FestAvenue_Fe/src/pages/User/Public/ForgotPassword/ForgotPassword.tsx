/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import userApi from '@/apis/user.api'
import path from '@/constants/path'
import LOGO_IMG from '../../../../../public/Images/Fest.png'

interface FormErrors {
  email?: string
}

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const forgotPasswordMutation = useMutation({
    mutationFn: () => userApi.ForgotPassword(email),
    onSuccess: (data) => {
      setIsSubmitted(true)
      toast.success(data?.message || 'Đã gửi email khôi phục mật khẩu thành công')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    }
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      forgotPasswordMutation.mutate()
    }
  }

  if (isSubmitted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4'>
        <div className='w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center'>
          <div className='mb-6'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Mail className='w-8 h-8 text-cyan-400' />
            </div>
            <h1 className='text-2xl font-bold text-gray-800 mb-2'>Email đã được gửi!</h1>
            <p className='text-gray-600'>Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email của bạn.</p>
          </div>

          <div className='space-y-4'>
            <p className='text-sm text-gray-500'>
              Không nhận được email? Kiểm tra thư mục spam hoặc thử lại sau ít phút.
            </p>

            <div className='flex flex-col gap-3'>
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                }}
                variant='outline'
                className='w-full'
              >
                Gửi lại email
              </Button>

              <Link to={path.auth.login}>
                <Button variant='ghost' className='w-full flex items-center gap-2'>
                  <ArrowLeft size={16} />
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-[700px] bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'>
        <div className=' p-6 pb-0 text-center'>
          <img src={LOGO_IMG} alt='FestAvenue Logo' className='h-[250px] w-[250px] mx-auto rounded-full' />
          <h1 className='text-2xl font-bold text-white mb-1'>Quên mật khẩu?</h1>
          <p className='text-black font-semibold text-sm -translate-y-20'>
            Đừng lo lắng, chúng tôi sẽ giúp bạn khôi phục mật khẩu
          </p>
        </div>

        <div className='p-8 pt-0'>
          <form onSubmit={handleEmailSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
                Địa chỉ Email
              </Label>
              <div className='relative'>
                <Input
                  id='email'
                  type='email'
                  placeholder='Nhập email của bạn'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-11 h-12 border-2 transition-all duration-200 ${
                    errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-cyan-400 '
                  }`}
                />
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
              </div>
              {errors.email && (
                <p className='text-sm text-red-600 flex items-center mt-1'>
                  <span className='w-1 h-1 bg-red-600 rounded-full mr-2'></span>
                  {errors.email}
                </p>
              )}
            </div>

            <div className='space-y-4'>
              <Button
                type='submit'
                disabled={forgotPasswordMutation.isPending}
                className='w-full h-12 bg-gradient-to-r cursor-pointer from-cyan-400 to-blue-300 hover:from-cyan-300  hover:to-blue-300 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
              >
                {forgotPasswordMutation.isPending ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2  border-white border-t-transparent rounded-full animate-spin'></div>
                    Đang gửi...
                  </div>
                ) : (
                  'Gửi email khôi phục'
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
export default ForgotPassword

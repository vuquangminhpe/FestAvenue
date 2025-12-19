'use client'

import { useState, type ChangeEvent } from 'react'
import { Eye, EyeOff, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import { Link, useNavigate } from 'react-router'
import path from '@/constants/path'
import { useMutation } from '@tanstack/react-query'
import userApi from '@/apis/user.api'
import { toast } from 'sonner'
import { saveAccessTokenToLS } from '@/utils/auth'
import LOGO_IMG from '../../../../../public/Images/Fest.png'
import { useUsersStore } from '@/contexts/app.context'
import SmartSEO from '@/components/SEO/SmartSEO'
import { pageSEO } from '@/components/SEO/SEO'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const setIsAuth = useUsersStore((data) => data.setIsAuth)
  const setUserStore = useUsersStore((data) => data.setIsProfile)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const loginMutation = useMutation({
    mutationFn: () => userApi.login_normal({ email: formData.email, password: formData.password }),
    onSuccess: (data) => {
      setIsAuth(true)
      saveAccessTokenToLS(data?.data?.accessToken)
      setUserStore((data?.data as any)?.user)
      navigate(path.home)
      toast.success('Đăng nhập thành công')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Đăng nhập thất bại')
    }
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không được bỏ trống'
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải lớn hơn 6 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return
    loginMutation.mutateAsync()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const getGoogleAuthUrl = () => {
    const url = 'https://accounts.google.com/o/oauth2/auth'
    const query = {
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' '),
      prompt: 'consent',
      access_type: 'offline'
    }
    const queryString = new URLSearchParams(query).toString()
    return `${url}?${queryString}`
  }

  const googleOAuthUrl = getGoogleAuthUrl()

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword)
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    handleInputChange('email', e.target.value)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    handleInputChange('password', e.target.value)
  }

  const handleForgotPassword = (): void => {
    navigate(path.auth.forgotPassword)
  }

  const handleTermsClick = (): void => {
    console.log('Terms of Service clicked')
  }

  const handlePrivacyClick = (): void => {
    console.log('Privacy Policy clicked')
  }

  return (
    <>
      <SmartSEO {...pageSEO.login} />
      <div className='rounded-xl  flex items-center justify-center py-10 px-12'>
        {/* Background decoration */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse'></div>
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000'></div>
        </div>

        <div className='relative w-full'>
          {/* Logo */}
          <div className='text-center flex justify-center w-full'>
            <img src={LOGO_IMG} alt='ITEM_LOGO' className='size-[240px] translate-y-[60px]' />
          </div>

          {/* Main Card */}
          <div className='bg-white/80 backdrop-blur-md rounded-3xl shadow-md border border-white/20 p-8'>
            <div className='text-center mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>Chào mừng trở lại!</h2>
              <p className='text-gray-600'>Đăng nhập vào tài khoản của bạn để tiếp tục</p>
            </div>

            <div className='space-y-6'>
              {/* Email Input */}
              <div>
                <Label htmlFor='email'>Địa chỉ email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Hãy nhập địa chỉ email'
                  value={formData.email}
                  onChange={handleEmailChange}
                  className={errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                />
                {errors.email && (
                  <p className='mt-2 text-sm text-red-600 flex items-center'>
                    <span className='w-1 h-1 bg-red-600 rounded-full mr-2'></span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor='password'>Mật khẩu</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Hãy nhập mật khẩu'
                    value={formData.password}
                    onChange={handlePasswordChange}
                    className={errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                  />
                  <button
                    type='button'
                    onClick={togglePasswordVisibility}
                    className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                  >
                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
                {errors.password && (
                  <p className='mt-2 text-sm text-red-600 flex items-center'>
                    <span className='w-1 h-1 bg-red-600 rounded-full mr-2'></span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className='text-right'>
                <button
                  type='button'
                  onClick={handleForgotPassword}
                  className='text-sm text-black hover:text-gray-600 cursor-pointer font-medium transition-colors'
                >
                  Bạn đã quên mật khẩu?
                </button>
              </div>

              {/* Submit Button */}
              <Button onClick={handleSubmit} className='w-full cursor-pointer' size='lg' disabled={isLoading}>
                {isLoading ? (
                  <div className='flex items-center'>
                    <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2'></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className='my-8 flex items-center'>
              <div className='flex-1 border-t border-gray-200'></div>
              <span className='px-4 text-gray-500 text-sm font-medium'>or</span>
              <div className='flex-1 border-t border-gray-200'></div>
            </div>

            {/* Social Login */}
            <div className='space-y-3'>
              <Button
                variant='outline'
                size='lg'
                className='w-full cursor-pointer'
                onClick={() => (window.location.href = googleOAuthUrl)}
              >
                <Chrome className='w-5 h-5 mr-3' />
                Đăng nhập với google
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className='mt-8 text-center'>
              <span className='text-gray-600'>Bạn chưa có tài khoản? </span>
              <Link to={path.auth.signup} className='text-black hover:text-gray-600 font-semibold transition-colors'>
                Đăng ký
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-8 text-center'>
            <p className='text-sm text-gray-500'>
              Bằng cách đăng nhập, bạn đồng ý với{' '}
              <button
                onClick={handleTermsClick}
                className='text-black hover:text-gray-600 font-semibold transition-colors cursor-pointer'
              >
                Điều khoản dịch vụ
              </button>{' '}
              và{' '}
              <button
                onClick={handlePrivacyClick}
                className='text-black hover:text-gray-600 font-semibold transition-colors cursor-pointer'
              >
                Chính sách bảo mật
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login

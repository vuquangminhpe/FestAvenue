import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import path from '@/constants/path'
import { Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import userApi from '@/apis/user.api'
import { toast } from 'sonner'

interface FormData {
  email: string
  firstName: string
  lastName: string
  phone: string
  password: string
  acceptTerms: boolean
}

interface FormErrors {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  password?: string
  acceptTerms?: string
}

interface FormFieldProps {
  label: string
  error?: string
  children: React.ReactNode
  htmlFor?: string
}

const FormField = ({ label, error, children, htmlFor }: FormFieldProps) => {
  return (
    <div className='space-y-2'>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p className='text-sm text-red-600 flex items-center'>
          <span className='w-1 h-1 bg-red-600 rounded-full mr-2'></span>
          {error}
        </p>
      )}
    </div>
  )
}

const SignUp = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    acceptTerms: false
  })

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const registerMutation = useMutation({
    mutationFn: async () =>
      (userApi as any).register?.({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        password: formData.password
      }),
    onSuccess: (res: any) => {
      toast.success(res?.message || 'Tạo tài khoản thành công')
      navigate(path.auth.login)
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.status?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Đăng ký thất bại'
      toast.error(msg)
    }
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9]{9,11}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms & Conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return
    if (registerMutation.isPending) return
    registerMutation.mutate()
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean): void => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword)
  }

  return (
    <div className='flex flex-col justify-center'>
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000'></div>
      </div>

      {/* Logo Section */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg'>
          <span className='text-white font-bold text-xl'>FA</span>
        </div>
        <h1 className='text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2'>
          FestAvenue
        </h1>
      </div>

      <div className='bg-white/80 backdrop-blur-md rounded-3xl shadow-md border border-white/20 px-8 py-2'>
        {/* Welcome Section */}
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-3'>Create an Account</h2>
          <p className='text-gray-600 text-lg'>Join us to discover amazing events</p>
        </div>

        {/* Form Section */}
        <div className='w-full max-w-md mx-auto space-y-6'>
          {/* Email Field */}
          <FormField label='Email Address' error={errors.email} htmlFor='email'>
            <Input
              id='email'
              type='email'
              placeholder='Enter your email'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            />
          </FormField>

          {/* Name Fields Row */}
          <div className='grid grid-cols-2 gap-4'>
            <FormField label='First Name' error={errors.firstName} htmlFor='firstName'>
              <Input
                id='firstName'
                type='text'
                placeholder='First Name'
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
              />
            </FormField>

            <FormField label='Last Name' error={errors.lastName} htmlFor='lastName'>
              <Input
                id='lastName'
                type='text'
                placeholder='Last Name'
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
              />
            </FormField>
          </div>

          {/* Phone Field */}
          <FormField label='Phone Number' error={errors.phone} htmlFor='phone'>
            <Input
              id='phone'
              type='tel'
              placeholder='Enter your phone number'
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            />
          </FormField>

          {/* Password Field */}
          <FormField label='Create Password' error={errors.password} htmlFor='password'>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Create your password'
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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
          </FormField>

          {/* Terms & Conditions */}
          <div className='space-y-2'>
            <div className='flex items-start space-x-3'>
              <Checkbox
                id='acceptTerms'
                checked={formData.acceptTerms}
                onCheckedChange={(v) => handleInputChange('acceptTerms', Boolean(v))}
                className={errors.acceptTerms ? 'border-red-500' : ''}
              />
              <label htmlFor='acceptTerms' className='text-sm text-gray-600 leading-relaxed'>
                I accept the{' '}
                <button
                  type='button'
                  className='text-indigo-600 hover:text-indigo-700 font-medium transition-colors'
                  onClick={() => console.log('Terms clicked')}
                >
                  Terms & Conditions
                </button>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className='text-sm text-red-600 flex items-center ml-7'>
                <span className='w-1 h-1 bg-red-600 rounded-full mr-2'></span>
                {errors.acceptTerms}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} className='w-full' size='lg' disabled={registerMutation.isPending}>
            {registerMutation.isPending ? (
              <div className='flex items-center'>
                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2'></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className='my-8 flex items-center max-w-md mx-auto w-full'>
          <div className='flex-1 border-t border-gray-300'></div>
          <span className='px-4 text-gray-500 text-sm font-medium'>or</span>
          <div className='flex-1 border-t border-gray-300'></div>
        </div>

        {/* Login Link */}
        <div className='mt-8 text-center'>
          <span className='text-gray-600'>Already have an account? </span>
          <Link
            to={path.auth.login}
            className='text-indigo-600 cursor-pointer hover:text-indigo-700 font-semibold transition-colors'
          >
            Sign in
          </Link>
        </div>

        {/* Footer */}
        <div className='mt-8 text-center w-full mx-auto'>
          <p className='text-sm text-gray-500'>
            By creating an account, you agree to our{' '}
            <button
              onClick={() => console.log('Terms clicked')}
              className='text-indigo-600 hover:text-indigo-700 transition-colors'
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              onClick={() => console.log('Privacy clicked')}
              className='text-indigo-600 hover:text-indigo-700 transition-colors'
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp

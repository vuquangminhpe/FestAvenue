import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useRef } from 'react'
import { UserPlus, Loader2, AlertCircle } from 'lucide-react'
import gsap from 'gsap'
import { useSendInvitation } from '../hooks/useUserManagement'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
}

export default function AddUserModal({ isOpen, onClose, eventId }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const contentRef = useRef<HTMLDivElement>(null)
  const sendInvitationMutation = useSendInvitation()

  useEffect(() => {
    if (isOpen && contentRef.current) {
      gsap.from(contentRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out'
      })
    }
  }, [isOpen])

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name là bắt buộc'
        if (value.trim().length < 2) return 'First name phải có ít nhất 2 ký tự'
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) return 'First name chỉ được chứa chữ cái'
        break
      case 'lastName':
        if (!value.trim()) return 'Last name là bắt buộc'
        if (value.trim().length < 2) return 'Last name phải có ít nhất 2 ký tự'
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) return 'Last name chỉ được chứa chữ cái'
        break
      case 'email':
        if (!value.trim()) return 'Email là bắt buộc'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Email không hợp lệ'
        break
      case 'phoneNumber':
        if (value && !/^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) {
          return 'Số điện thoại phải có 10-11 chữ số'
        }
        break
    }
    return undefined
  }

  const handleFieldChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors({ ...errors, [name]: error })
    }
  }

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true })
    const error = validateField(name, formData[name as keyof typeof formData])
    setErrors({ ...errors, [name]: error })
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    newErrors.firstName = validateField('firstName', formData.firstName)
    newErrors.lastName = validateField('lastName', formData.lastName)
    newErrors.email = validateField('email', formData.email)
    newErrors.phoneNumber = validateField('phoneNumber', formData.phoneNumber)

    // Filter out undefined errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, v]) => v !== undefined)
    ) as FormErrors

    setErrors(filteredErrors)
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true
    })

    return Object.keys(filteredErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    sendInvitationMutation.mutate(
      {
        eventCode: eventId,
        servicePackageIds: [],
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim()
      },
      {
        onSuccess: () => {
          handleClose()
        }
      }
    )
  }

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: ''
    })
    setErrors({})
    setTouched({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-cyan-100'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent flex items-center gap-2'>
            <UserPlus className='w-6 h-6 text-cyan-400' />
            Gửi lời mời tham gia sự kiện
          </DialogTitle>
          <p className='text-sm text-gray-600 mt-2'>
            Người dùng sẽ nhận được email lời mời. Sau khi họ chấp nhận, bạn có thể cấp quyền sử dụng các chức năng.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6 mt-4'>
          <div ref={contentRef} className='space-y-6'>
            {/* Name Fields */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName' className='text-gray-700 font-medium'>
                  First Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='firstName'
                  placeholder='Nhập first name'
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  onBlur={() => handleBlur('firstName')}
                  className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg ${
                    errors.firstName && touched.firstName ? 'border-red-500' : ''
                  }`}
                />
                {errors.firstName && touched.firstName && (
                  <div className='flex items-center gap-1 text-red-500 text-sm mt-1'>
                    <AlertCircle className='w-4 h-4' />
                    <span>{errors.firstName}</span>
                  </div>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName' className='text-gray-700 font-medium'>
                  Last Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='lastName'
                  placeholder='Nhập last name'
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  onBlur={() => handleBlur('lastName')}
                  className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg ${
                    errors.lastName && touched.lastName ? 'border-red-500' : ''
                  }`}
                />
                {errors.lastName && touched.lastName && (
                  <div className='flex items-center gap-1 text-red-500 text-sm mt-1'>
                    <AlertCircle className='w-4 h-4' />
                    <span>{errors.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-gray-700 font-medium'>
                  Email <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='example@email.com'
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg ${
                    errors.email && touched.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && touched.email && (
                  <div className='flex items-center gap-1 text-red-500 text-sm mt-1'>
                    <AlertCircle className='w-4 h-4' />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phoneNumber' className='text-gray-700 font-medium'>
                  Phone Number
                </Label>
                <Input
                  id='phoneNumber'
                  placeholder='0123456789'
                  value={formData.phoneNumber}
                  onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                  onBlur={() => handleBlur('phoneNumber')}
                  className={`border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg ${
                    errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''
                  }`}
                />
                {errors.phoneNumber && touched.phoneNumber && (
                  <div className='flex items-center gap-1 text-red-500 text-sm mt-1'>
                    <AlertCircle className='w-4 h-4' />
                    <span>{errors.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={sendInvitationMutation.isPending}
              className='hover:bg-gray-100 transition-all duration-300'
            >
              Hủy
            </Button>
            <Button
              type='submit'
              disabled={sendInvitationMutation.isPending}
              className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white shadow-md hover:shadow-lg transition-all duration-300'
            >
              {sendInvitationMutation.isPending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Đang gửi...
                </>
              ) : (
                'Gửi lời mời'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

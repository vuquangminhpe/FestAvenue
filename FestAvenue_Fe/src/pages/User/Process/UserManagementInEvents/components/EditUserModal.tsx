import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useEffect, useRef } from 'react'
import { Edit } from 'lucide-react'
import type { EventUser } from '@/types/userManagement.types'
import { roleOptions, permissionOptions } from '@/mocks/userManagement.mock'
import gsap from 'gsap'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: EventUser | null
  onUpdate: (user: EventUser) => void
}

export default function EditUserModal({ isOpen, onClose, user, onUpdate }: EditUserModalProps) {
  const [formData, setFormData] = useState<EventUser | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      setFormData({ ...user })
    }
  }, [user])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      onUpdate(formData)
      onClose()
    }
  }

  const handlePermissionToggle = (permission: string) => {
    if (!formData) return
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            permissions: prev.permissions.includes(permission)
              ? prev.permissions.filter((p) => p !== permission)
              : [...prev.permissions, permission]
          }
        : null
    )
  }

  if (!formData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-cyan-100'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2'>
            <Edit className='w-6 h-6 text-cyan-500' />
            Update chức năng, cho mới thành viên
          </DialogTitle>
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
                  placeholder='Nhập vào đây'
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phoneNumber' className='text-gray-700 font-medium'>
                  Phone number
                </Label>
                <Input
                  id='phoneNumber'
                  placeholder='Nhập vào đây'
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='lastName' className='text-gray-700 font-medium'>
                  Last Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='lastName'
                  placeholder='Nhập vào đây'
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email' className='text-gray-700 font-medium'>
                  Nhập email <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Nhập email vào đây'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg'
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className='space-y-2'>
              <Label htmlFor='role' className='text-gray-700 font-medium'>
                Chức năng có thể dùng
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                <SelectTrigger className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-white rounded-lg shadow-lg'>
                  {roleOptions.filter((opt) => opt.value !== 'all').map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className='hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50'
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Join Date */}
            <div className='space-y-2'>
              <Label htmlFor='joinDate' className='text-gray-700 font-medium'>
                Thời gian hết hạn
              </Label>
              <Input
                id='joinDate'
                type='date'
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className='border-gray-300 focus:border-cyan-400 focus:ring-cyan-400 rounded-lg'
              />
            </div>

            {/* Permissions */}
            <div className='space-y-3'>
              <Label className='text-gray-700 font-medium'>Quyền truy cập</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white rounded-lg border border-gray-200'>
                {permissionOptions.map((permission) => (
                  <div key={permission.value} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`edit-${permission.value}`}
                      checked={formData.permissions.includes(permission.value)}
                      onCheckedChange={() => handlePermissionToggle(permission.value)}
                      className='border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-500'
                    />
                    <Label htmlFor={`edit-${permission.value}`} className='text-sm text-gray-600 cursor-pointer'>
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='hover:bg-gray-100 transition-all duration-300'
            >
              Hủy
            </Button>
            <Button
              type='submit'
              className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300'
            >
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Shield } from 'lucide-react'
import type { UserServicePackageResult } from '@/types/userManagement.types'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface ViewUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserServicePackageResult | null
}

const getPackageBadgeColor = (index: number) => {
  const colors = [
    'bg-gradient-to-r from-cyan-400 to-blue-300 text-white',
    'bg-gradient-to-r from-purple-400 to-pink-400 text-white',
    'bg-gradient-to-r from-green-400 to-teal-400 text-white',
    'bg-gradient-to-r from-orange-400 to-red-400 text-white'
  ]
  return colors[index % colors.length]
}

export default function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && contentRef.current) {
      gsap.from(contentRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out'
      })
    }
  }, [isOpen, user])

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-lg bg-white border-2 border-cyan-100'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent'>
            Xem thông tin chi tiết thành viên
          </DialogTitle>
        </DialogHeader>

        <div ref={contentRef} className='space-y-6 mt-4'>
          {/* User Avatar and Name */}
          <div className='flex items-center gap-4 p-6 bg-white rounded-xl shadow-md border border-gray-100'>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className='w-20 h-20 rounded-full object-cover shadow-lg' />
            ) : (
              <div className='w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg'>
                {user.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <div className='flex-1'>
              <h3 className='text-2xl font-bold text-gray-800'>{user.fullName}</h3>
              <p className='text-sm text-gray-500 mt-1'>ID: {user.userId}</p>
            </div>
          </div>

          {/* User Details */}
          <div className='space-y-4 p-6 bg-white rounded-xl shadow-md border border-gray-100'>
            <div className='flex items-start gap-3'>
              <Mail className='w-5 h-5 text-cyan-400 mt-0.5' />
              <div>
                <p className='text-sm text-gray-500 font-medium'>Email:</p>
                <p className='text-gray-800'>{user.email}</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Shield className='w-5 h-5 text-cyan-400 mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm text-gray-500 font-medium mb-2'>Chức năng có thể dùng:</p>
                <div className='flex flex-wrap gap-2'>
                  {user.servicePackages.length > 0 ? (
                    user.servicePackages
                      .filter((pkg) => pkg.isActive)
                      .map((pkg, index) => (
                        <Badge key={pkg.id} className={`${getPackageBadgeColor(index)} shadow-md px-3 py-1`}>
                          {pkg.name}
                        </Badge>
                      ))
                  ) : (
                    <Badge className='bg-gray-200 text-gray-600 px-3 py-1'>Không có quyền</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Service Package Details */}
            {user.servicePackages.length > 0 && (
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <p className='text-sm text-gray-500 font-medium mb-2'>Chi tiết packages:</p>
                <div className='space-y-2'>
                  {user.servicePackages.map((pkg) => (
                    <div key={pkg.id} className='text-sm p-2 bg-gray-50 rounded'>
                      <p className='font-medium text-gray-700'>
                        {pkg.name}
                        {!pkg.isActive && <span className='ml-2 text-xs text-red-500'>(Không khả dụng)</span>}
                      </p>
                      {pkg.description && <p className='text-xs text-gray-500 mt-1'>{pkg.description}</p>}
                      <p className='text-xs text-gray-400 mt-1'>Giá: {pkg.price.toLocaleString()} VND</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className='flex justify-center pt-4'>
            <Button
              onClick={onClose}
              className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white shadow-md hover:shadow-lg transition-all duration-300 px-8'
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

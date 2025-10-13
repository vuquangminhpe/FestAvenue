import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Calendar, Shield } from 'lucide-react'
import type { EventUser } from '@/types/userManagement.types'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface ViewUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: EventUser | null
}

const getRoleBadgeColor = (role: string) => {
  const colors: Record<string, string> = {
    'Ticket manager': 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white',
    'Task manager': 'bg-gradient-to-r from-purple-400 to-pink-400 text-white',
    'Social manager': 'bg-gradient-to-r from-green-400 to-teal-400 text-white',
    'Schedule manager': 'bg-gradient-to-r from-orange-400 to-red-400 text-white',
    None: 'bg-gray-200 text-gray-600'
  }
  return colors[role] || 'bg-gray-200 text-gray-600'
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
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent'>
            Xem thông tin chi tiết thành viên
          </DialogTitle>
        </DialogHeader>

        <div ref={contentRef} className='space-y-6 mt-4'>
          {/* User Avatar and Name */}
          <div className='flex items-center gap-4 p-6 bg-white rounded-xl shadow-md border border-gray-100'>
            <div className='w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg'>
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </div>
            <div className='flex-1'>
              <h3 className='text-2xl font-bold text-gray-800'>
                {user.firstName} {user.lastName}
              </h3>
              <Badge className={`${getRoleBadgeColor(user.role)} shadow-md mt-2 px-3 py-1`}>{user.role}</Badge>
            </div>
          </div>

          {/* User Details */}
          <div className='space-y-4 p-6 bg-white rounded-xl shadow-md border border-gray-100'>
            <div className='flex items-start gap-3'>
              <Mail className='w-5 h-5 text-cyan-500 mt-0.5' />
              <div>
                <p className='text-sm text-gray-500 font-medium'>Nhập email:</p>
                <p className='text-gray-800'>{user.email}</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Phone className='w-5 h-5 text-cyan-500 mt-0.5' />
              <div>
                <p className='text-sm text-gray-500 font-medium'>Phone number:</p>
                <p className='text-gray-800'>{user.phoneNumber || 'Chưa có'}</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Calendar className='w-5 h-5 text-cyan-500 mt-0.5' />
              <div>
                <p className='text-sm text-gray-500 font-medium'>Thời gian hết hạn:</p>
                <p className='text-gray-800'>{user.joinDate === 'none' ? 'none' : user.joinDate}</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Shield className='w-5 h-5 text-cyan-500 mt-0.5' />
              <div className='flex-1'>
                <p className='text-sm text-gray-500 font-medium mb-2'>Chức năng có thể dùng:</p>
                <Badge className={`${getRoleBadgeColor(user.role)} shadow-md`}>{user.role}</Badge>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className='flex justify-center pt-4'>
            <Button
              onClick={onClose}
              className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-8'
            >
              Ok
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

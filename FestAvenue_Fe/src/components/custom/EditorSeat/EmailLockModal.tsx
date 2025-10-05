import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, X } from 'lucide-react'

interface EmailLockModalProps {
  seatId: string
  seatLabel: string
  currentEmail?: string
  onConfirm: (email: string) => void
  onCancel: () => void
}

export default function EmailLockModal({ seatId, seatLabel, currentEmail, onConfirm, onCancel }: EmailLockModalProps) {
  const [email, setEmail] = useState(currentEmail || '')
  const [error, setError] = useState('')
  console.log(seatId)

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email')
      return
    }
    if (!validateEmail(email)) {
      setError('Email không hợp lệ')
      return
    }
    onConfirm(email)
  }

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]'>
      <div className='bg-white border border-blue-300 rounded-lg p-6 min-w-[400px] shadow-2xl'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
            <Lock className='w-5 h-5 text-blue-500' />
            Khóa Ghế {seatLabel}
          </h3>
          <button onClick={onCancel} className='text-gray-400 hover:text-gray-600'>
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='space-y-4'>
          <div>
            <Label htmlFor='email-input' className='text-sm text-gray-700 flex items-center gap-1'>
              <Mail className='w-4 h-4 text-blue-500' />
              Email người ngồi
            </Label>
            <Input
              id='email-input'
              type='email'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder='example@email.com'
              className='mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              autoFocus
            />
            {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
          </div>

          <div className='bg-blue-50 p-3 rounded-lg border border-blue-200'>
            <p className='text-xs text-gray-600'>
              💡 <strong>Lưu ý:</strong> Ghế này sẽ được khóa và gán cho email đã nhập. Người dùng khác không thể đặt
              ghế này.
            </p>
          </div>

          <div className='flex gap-2 justify-end'>
            <Button variant='outline' onClick={onCancel} size='sm' className='border-gray-300 text-gray-700'>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              size='sm'
              className='bg-gradient-to-r from-cyan-400 to-blue-300 hover:from-cyan-500 hover:to-blue-400 text-white'
            >
              <Lock className='w-4 h-4 mr-1' />
              Khóa Ghế
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

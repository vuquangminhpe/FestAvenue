import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users } from 'lucide-react'
import type { StaffMember } from '@/types/admin.types'

interface EmployeeAnalyticsProps {
  data: StaffMember[]
}

const EmployeeAnalytics = ({ data }: EmployeeAnalyticsProps) => {
  const [showStaffList, setShowStaffList] = useState(false)

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4 pt-4'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-indigo-600'>{data.length}</p>
          <p className='text-sm text-gray-500'>Tổng nhân viên</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-green-600'>
            {new Set(data.map((s) => s.roleName)).size}
          </p>
          <p className='text-sm text-gray-500'>Số vai trò</p>
        </div>
      </div>

      <Button variant='outline' className='w-full gap-2' onClick={() => setShowStaffList(true)}>
        <Users className='w-4 h-4' />
        Xem danh sách nhân viên
      </Button>

      {/* Staff List Dialog */}
      <Dialog open={showStaffList} onOpenChange={setShowStaffList}>
        <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Danh sách nhân viên</DialogTitle>
            <DialogDescription>{data.length} nhân viên trong hệ thống</DialogDescription>
          </DialogHeader>

          <div className='space-y-2'>
            {data.map((staff) => (
              <div key={staff.id} className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50'>
                <div className='flex items-center gap-3'>
                  <img
                    src={staff.avatar || '/default-avatar.png'}
                    alt={staff.name}
                    className='w-10 h-10 rounded-full object-cover'
                  />
                  <div>
                    <p className='font-medium text-gray-900'>{staff.name}</p>
                    <p className='text-sm text-gray-500'>{staff.email}</p>
                  </div>
                </div>
                <Badge className='bg-indigo-100 text-indigo-700'>{staff.roleName}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployeeAnalytics

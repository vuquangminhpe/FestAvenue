import { useState } from 'react'
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { mockEmployeeData, mockStaffMembers } from '@/utils/mockData'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Circle } from 'lucide-react'

const EmployeeAnalytics = () => {
  const [showOnlineStaff, setShowOnlineStaff] = useState(false)

  const transformedData = mockEmployeeData.map((item, index) => {
    const onlineCount = 18 + index * 2
    return {
      date: item.date,
      total: item.value,
      online: onlineCount
    }
  })

  const onlineStaff = mockStaffMembers.filter((staff) => staff.isOnline)
  const offlineStaff = mockStaffMembers.filter((staff) => !staff.isOnline)

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diffMinutes < 1) return 'Vừa xong'
    if (diffMinutes < 60) return `${diffMinutes} phút trước`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className='space-y-4'>
      <ResponsiveContainer width='100%' height={300}>
        <ComposedChart data={transformedData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey='total' fill='#6366f1' name='Tổng nhân viên' radius={[8, 8, 0, 0]} />
          <Line
            type='monotone'
            dataKey='online'
            stroke='#10b981'
            strokeWidth={2}
            name='Đang online'
            dot={{ fill: '#10b981', r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className='grid grid-cols-3 gap-4 pt-4'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-indigo-600'>{mockStaffMembers.length}</p>
          <p className='text-sm text-gray-500'>Tổng nhân viên</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-green-600'>{onlineStaff.length}</p>
          <p className='text-sm text-gray-500'>Đang online</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-blue-600'>
            {Math.round((onlineStaff.length / mockStaffMembers.length) * 100)}%
          </p>
          <p className='text-sm text-gray-500'>Tỷ lệ online</p>
        </div>
      </div>

      <Button variant='outline' className='w-full gap-2' onClick={() => setShowOnlineStaff(true)}>
        <Users className='w-4 h-4' />
        Xem danh sách nhân viên online
      </Button>

      {/* Online Staff Dialog */}
      <Dialog open={showOnlineStaff} onOpenChange={setShowOnlineStaff}>
        <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Danh sách nhân viên</DialogTitle>
            <DialogDescription>
              {onlineStaff.length} nhân viên đang online, {offlineStaff.length} nhân viên offline
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Online Staff */}
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Circle className='w-3 h-3 fill-green-500 text-green-500' />
                <h4 className='font-semibold text-green-700'>Online ({onlineStaff.length})</h4>
              </div>
              <div className='space-y-2'>
                {onlineStaff.map((staff) => (
                  <div key={staff.id} className='flex items-center justify-between p-3 border rounded-lg bg-green-50'>
                    <div className='flex items-center gap-3'>
                      <img src={staff.avatar} alt={staff.name} className='w-10 h-10 rounded-full' />
                      <div>
                        <p className='font-medium text-gray-900'>{staff.name}</p>
                        <p className='text-sm text-gray-500'>{staff.email}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <Badge className='bg-green-100 text-green-700'>{staff.role}</Badge>
                      <p className='text-xs text-gray-500 mt-1'>Hoạt động: {formatLastActive(staff.lastActive)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Staff */}
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <Circle className='w-3 h-3 fill-gray-400 text-gray-400' />
                <h4 className='font-semibold text-gray-700'>Offline ({offlineStaff.length})</h4>
              </div>
              <div className='space-y-2'>
                {offlineStaff.map((staff) => (
                  <div key={staff.id} className='flex items-center justify-between p-3 border rounded-lg bg-gray-50'>
                    <div className='flex items-center gap-3'>
                      <img src={staff.avatar} alt={staff.name} className='w-10 h-10 rounded-full grayscale' />
                      <div>
                        <p className='font-medium text-gray-900'>{staff.name}</p>
                        <p className='text-sm text-gray-500'>{staff.email}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <Badge className='bg-gray-100 text-gray-700'>{staff.role}</Badge>
                      <p className='text-xs text-gray-500 mt-1'>Hoạt động: {formatLastActive(staff.lastActive)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployeeAnalytics

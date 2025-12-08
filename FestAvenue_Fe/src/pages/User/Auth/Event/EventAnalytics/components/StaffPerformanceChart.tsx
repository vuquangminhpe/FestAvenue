import { Trophy } from 'lucide-react'

export default function StaffPerformanceChart() {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <Trophy className='w-5 h-5 text-amber-500' />
            Top 5 nhân viên xuất sắc nhất
          </h3>
          <p className='text-sm text-gray-600 mt-1'>Biểu đồ radar so sánh hiệu suất tổng thể</p>
        </div>
      </div>
    </div>
  )
}

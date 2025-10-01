import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { mockRevenueData } from '@/utils/mockData'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const RevenueAnalytics = () => {
  const [timeRange, setTimeRange] = useState('all')

  const filteredData = mockRevenueData.filter((item) => {
    if (timeRange === 'all') return true
    if (timeRange === '3months') return mockRevenueData.indexOf(item) >= mockRevenueData.length - 3
    if (timeRange === '6months') return mockRevenueData.indexOf(item) >= mockRevenueData.length - 6
    return true
  })

  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(0)}M`
  }

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.value, 0)
  const avgRevenue = Math.round(totalRevenue / filteredData.length)

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả</SelectItem>
            <SelectItem value='6months'>6 tháng gần nhất</SelectItem>
            <SelectItem value='3months'>3 tháng gần nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={filteredData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(1)}M VNĐ`} />
          <Legend />
          <Bar dataKey='value' fill='#10b981' name='Doanh thu' radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className='grid grid-cols-3 gap-4 pt-4'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-green-600'>{formatCurrency(totalRevenue)} VNĐ</p>
          <p className='text-sm text-gray-500'>Tổng doanh thu</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-blue-600'>{formatCurrency(avgRevenue)} VNĐ</p>
          <p className='text-sm text-gray-500'>Trung bình/tháng</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-purple-600'>
            {formatCurrency(filteredData[filteredData.length - 1]?.value || 0)} VNĐ
          </p>
          <p className='text-sm text-gray-500'>Tháng hiện tại</p>
        </div>
      </div>
    </div>
  )
}

export default RevenueAnalytics

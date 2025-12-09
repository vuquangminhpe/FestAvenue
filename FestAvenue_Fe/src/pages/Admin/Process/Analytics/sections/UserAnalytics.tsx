import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { RegisteredUser } from '@/types/admin.types'

interface UserAnalyticsProps {
  data: RegisteredUser[]
}

const UserAnalytics = ({ data }: UserAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('all')

  // Transform data to match chart format
  const transformedData = data.map((item) => ({
    date: item.date,
    value: item.total
  }))

  const filteredData = transformedData.filter((item) => {
    if (timeRange === 'all') return true
    if (timeRange === '3months') return transformedData.indexOf(item) >= transformedData.length - 3
    if (timeRange === '6months') return transformedData.indexOf(item) >= transformedData.length - 6
    return true
  })

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
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type='monotone'
            dataKey='value'
            stroke='#8b5cf6'
            strokeWidth={2}
            name='Người dùng'
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className='grid grid-cols-3 gap-4 pt-4'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-purple-600'>{filteredData[filteredData.length - 1]?.value || 0}</p>
          <p className='text-sm text-gray-500'>Hiện tại</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-blue-600'>
            +{(filteredData[filteredData.length - 1]?.value || 0) - (filteredData[0]?.value || 0)}
          </p>
          <p className='text-sm text-gray-500'>Tăng trưởng</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-green-600'>
            {filteredData[0]?.value
              ? Math.round(
                  (((filteredData[filteredData.length - 1]?.value || 0) - filteredData[0]?.value) /
                    filteredData[0]?.value) *
                    100
                )
              : 0}
            %
          </p>
          <p className='text-sm text-gray-500'>% Tăng</p>
        </div>
      </div>
    </div>
  )
}

export default UserAnalytics

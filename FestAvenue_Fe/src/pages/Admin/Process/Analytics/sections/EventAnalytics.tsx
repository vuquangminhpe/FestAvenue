import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockEventsData, mockTicketSales } from '@/utils/mockData'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const EventAnalytics = () => {
  const [metric, setMetric] = useState<'events' | 'tickets'>('events')
  const [timeRange, setTimeRange] = useState('all')

  const data = metric === 'events' ? mockEventsData : mockTicketSales

  const filteredData = data.filter((item) => {
    if (timeRange === 'all') return true
    if (timeRange === '3months') return data.indexOf(item) >= data.length - 3
    if (timeRange === '6months') return data.indexOf(item) >= data.length - 6
    return true
  })

  return (
    <div className='space-y-4'>
      <div className='flex gap-2 justify-end'>
        <Select value={metric} onValueChange={(value) => setMetric(value as 'events' | 'tickets')}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='events'>Sự kiện</SelectItem>
            <SelectItem value='tickets'>Vé bán</SelectItem>
          </SelectContent>
        </Select>
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
        <AreaChart data={filteredData}>
          <defs>
            <linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis />
          <Tooltip />
          <Area
            type='monotone'
            dataKey='value'
            stroke='#3b82f6'
            strokeWidth={2}
            fillOpacity={1}
            fill='url(#colorValue)'
            name={metric === 'events' ? 'Sự kiện' : 'Vé'}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className='grid grid-cols-2 gap-4 pt-4'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-blue-600'>{filteredData[filteredData.length - 1]?.value || 0}</p>
          <p className='text-sm text-gray-500'>{metric === 'events' ? 'Tổng sự kiện' : 'Tổng vé bán'}</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-green-600'>
            +{filteredData[filteredData.length - 1]?.value - filteredData[0]?.value || 0}
          </p>
          <p className='text-sm text-gray-500'>Tăng trưởng</p>
        </div>
      </div>
    </div>
  )
}

export default EventAnalytics

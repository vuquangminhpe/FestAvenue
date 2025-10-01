import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Mock data for event types over time
const mockEventTypeOverTime = [
  {
    date: '2024-01',
    'Âm nhạc': 5,
    'Hội thảo': 4,
    'Triển lãm': 3,
    'Thể thao': 2,
    Khác: 1
  },
  {
    date: '2024-02',
    'Âm nhạc': 7,
    'Hội thảo': 6,
    'Triển lãm': 4,
    'Thể thao': 3,
    Khác: 1
  },
  {
    date: '2024-03',
    'Âm nhạc': 9,
    'Hội thảo': 7,
    'Triển lãm': 5,
    'Thể thao': 3,
    Khác: 2
  },
  {
    date: '2024-04',
    'Âm nhạc': 11,
    'Hội thảo': 9,
    'Triển lãm': 6,
    'Thể thao': 4,
    Khác: 2
  },
  {
    date: '2024-05',
    'Âm nhạc': 13,
    'Hội thảo': 11,
    'Triển lãm': 7,
    'Thể thao': 5,
    Khác: 2
  },
  {
    date: '2024-06',
    'Âm nhạc': 16,
    'Hội thảo': 13,
    'Triển lãm': 8,
    'Thể thao': 6,
    Khác: 3
  },
  {
    date: '2024-07',
    'Âm nhạc': 18,
    'Hội thảo': 15,
    'Triển lãm': 10,
    'Thể thao': 7,
    Khác: 3
  },
  {
    date: '2024-08',
    'Âm nhạc': 21,
    'Hội thảo': 17,
    'Triển lãm': 11,
    'Thể thao': 8,
    Khác: 4
  },
  {
    date: '2024-09',
    'Âm nhạc': 23,
    'Hội thảo': 19,
    'Triển lãm': 13,
    'Thể thao': 9,
    Khác: 4
  },
  {
    date: '2024-10',
    'Âm nhạc': 25,
    'Hội thảo': 21,
    'Triển lãm': 14,
    'Thể thao': 10,
    Khác: 5
  }
]

const COLORS = {
  'Âm nhạc': '#8b5cf6',
  'Hội thảo': '#3b82f6',
  'Triển lãm': '#10b981',
  'Thể thao': '#f59e0b',
  Khác: '#ef4444'
}

const EventTypeOverTimeAnalytics = () => {
  const [timeRange, setTimeRange] = useState('all')

  const filteredData = mockEventTypeOverTime.filter((item) => {
    if (timeRange === 'all') return true
    if (timeRange === '3months')
      return mockEventTypeOverTime.indexOf(item) >= mockEventTypeOverTime.length - 3
    if (timeRange === '6months')
      return mockEventTypeOverTime.indexOf(item) >= mockEventTypeOverTime.length - 6
    return true
  })

  // Calculate totals for current period
  const latestData = filteredData[filteredData.length - 1]
  const totalEvents = latestData
    ? Object.keys(latestData)
        .filter((key) => key !== 'date')
        .reduce((sum, key) => sum + (latestData[key as keyof typeof latestData] as number), 0)
    : 0

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

      <ResponsiveContainer width='100%' height={350}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(COLORS).map((eventType) => (
            <Line
              key={eventType}
              type='monotone'
              dataKey={eventType}
              stroke={COLORS[eventType as keyof typeof COLORS]}
              strokeWidth={2}
              dot={{ fill: COLORS[eventType as keyof typeof COLORS], r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className='grid grid-cols-5 gap-2 pt-4'>
        {Object.entries(COLORS).map(([type, color]) => (
          <div key={type} className='text-center p-2 border rounded-lg'>
            <div className='w-3 h-3 rounded-full mx-auto mb-1' style={{ backgroundColor: color }} />
            <p className='text-xs text-gray-500'>{type}</p>
            <p className='text-lg font-bold' style={{ color }}>
              {latestData ? (latestData[type as keyof typeof latestData] as number) : 0}
            </p>
          </div>
        ))}
      </div>

      <div className='text-center pt-2'>
        <p className='text-2xl font-bold text-gray-900'>{totalEvents}</p>
        <p className='text-sm text-gray-500'>Tổng sự kiện trong kỳ</p>
      </div>
    </div>
  )
}

export default EventTypeOverTimeAnalytics

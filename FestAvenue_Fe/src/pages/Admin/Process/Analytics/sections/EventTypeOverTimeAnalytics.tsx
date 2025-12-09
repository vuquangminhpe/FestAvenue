import { useState, useMemo } from 'react'
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
import type { EventCategoryByMonth } from '@/types/admin.types'

const COLORS: Record<string, string> = {
  'Âm nhạc': '#8b5cf6',
  'Hội thảo': '#3b82f6',
  'Triển lãm': '#10b981',
  'Thể thao': '#f59e0b',
  Khác: '#ef4444'
}

const DEFAULT_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16']

interface EventTypeOverTimeAnalyticsProps {
  data: EventCategoryByMonth[]
}

const EventTypeOverTimeAnalytics = ({ data }: EventTypeOverTimeAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('all')

  // Get all unique categories from data
  const categories = useMemo(() => {
    const allCategories = new Set<string>()
    data.forEach((item) => {
      Object.keys(item.categoryCounts).forEach((cat) => allCategories.add(cat))
    })
    return Array.from(allCategories)
  }, [data])

  // Transform data to flat format for recharts
  const transformedData = useMemo(() => {
    return data.map((item) => ({
      date: item.date,
      ...item.categoryCounts
    }))
  }, [data])

  const filteredData = transformedData.filter((item) => {
    if (timeRange === 'all') return true
    if (timeRange === '3months') return transformedData.indexOf(item) >= transformedData.length - 3
    if (timeRange === '6months') return transformedData.indexOf(item) >= transformedData.length - 6
    return true
  })

  // Calculate totals for current period
  const latestData = filteredData[filteredData.length - 1]
  const totalEvents = latestData
    ? Object.keys(latestData)
        .filter((key) => key !== 'date')
        .reduce((sum, key) => sum + ((latestData as Record<string, number | string>)[key] as number || 0), 0)
    : 0

  // Get color for category
  const getColor = (category: string, index: number) => {
    return COLORS[category] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }

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
          {categories.map((category, index) => (
            <Line
              key={category}
              type='monotone'
              dataKey={category}
              stroke={getColor(category, index)}
              strokeWidth={2}
              dot={{ fill: getColor(category, index), r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className='grid grid-cols-5 gap-2 pt-4'>
        {categories.slice(0, 5).map((category, index) => (
          <div key={category} className='text-center p-2 border rounded-lg'>
            <div className='w-3 h-3 rounded-full mx-auto mb-1' style={{ backgroundColor: getColor(category, index) }} />
            <p className='text-xs text-gray-500 truncate'>{category}</p>
            <p className='text-lg font-bold' style={{ color: getColor(category, index) }}>
              {latestData ? ((latestData as Record<string, number | string>)[category] as number || 0) : 0}
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

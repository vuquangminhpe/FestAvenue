import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Search } from 'lucide-react'

// Mock data for keyword searches with trends
const mockKeywordSearchData = [
  { keyword: 'âm nhạc', count: 2500, trend: '+15%', change: 'up' },
  { keyword: 'hội thảo', count: 1800, trend: '+8%', change: 'up' },
  { keyword: 'festival', count: 1500, trend: '+22%', change: 'up' },
  { keyword: 'concert', count: 1200, trend: '-5%', change: 'down' },
  { keyword: 'triển lãm', count: 950, trend: '+12%', change: 'up' },
  { keyword: 'workshop', count: 800, trend: '+18%', change: 'up' },
  { keyword: 'thể thao', count: 650, trend: '-3%', change: 'down' },
  { keyword: 'food festival', count: 500, trend: '+25%', change: 'up' },
  { keyword: 'art exhibition', count: 420, trend: '+10%', change: 'up' },
  { keyword: 'tech conference', count: 380, trend: '+30%', change: 'up' }
]

const COLORS = [
  '#8b5cf6',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#84cc16'
]

const KeywordSearchAnalytics = () => {
  const [topN, setTopN] = useState('10')

  const displayData = mockKeywordSearchData.slice(0, parseInt(topN))

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <Search className='w-5 h-5 text-gray-500' />
          <h4 className='font-semibold'>Từ khóa tìm kiếm phổ biến</h4>
        </div>
        <Select value={topN} onValueChange={setTopN}>
          <SelectTrigger className='w-[150px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='5'>Top 5</SelectItem>
            <SelectItem value='10'>Top 10</SelectItem>
            <SelectItem value='15'>Top 15</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width='100%' height={350}>
        <BarChart data={displayData} layout='vertical'>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis type='number' />
          <YAxis dataKey='keyword' type='category' width={120} />
          <Tooltip />
          <Bar dataKey='count' radius={[0, 4, 4, 0]}>
            {displayData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className='space-y-2 max-h-[300px] overflow-y-auto'>
        {displayData.map((item, index) => (
          <div
            key={item.keyword}
            className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors'
          >
            <div className='flex items-center gap-3'>
              <Badge
                className='w-8 h-8 flex items-center justify-center'
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              >
                {index + 1}
              </Badge>
              <div>
                <p className='font-medium text-gray-900'>{item.keyword}</p>
                <p className='text-sm text-gray-500'>{item.count.toLocaleString()} lượt tìm kiếm</p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Badge
                className={
                  item.change === 'up'
                    ? 'bg-green-100 text-green-700 flex items-center gap-1'
                    : 'bg-red-100 text-red-700 flex items-center gap-1'
                }
              >
                <TrendingUp className={`w-3 h-3 ${item.change === 'down' ? 'rotate-180' : ''}`} />
                {item.trend}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-3 gap-4 pt-4 border-t'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-purple-600'>
            {displayData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </p>
          <p className='text-sm text-gray-500'>Tổng lượt tìm</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-blue-600'>{displayData.length}</p>
          <p className='text-sm text-gray-500'>Từ khóa</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-green-600'>{displayData[0]?.keyword || 'N/A'}</p>
          <p className='text-sm text-gray-500'>Hot nhất</p>
        </div>
      </div>
    </div>
  )
}

export default KeywordSearchAnalytics

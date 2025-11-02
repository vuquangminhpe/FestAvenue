import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import type { KeywordSearchAnalysis } from '../../../../../../types/eventAnalytics.types'
import { Search, TrendingUp, MousePointerClick } from 'lucide-react'

interface KeywordSearchChartProps {
  data: KeywordSearchAnalysis[]
}

export default function KeywordSearchChart({ data }: KeywordSearchChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-semibold text-gray-900 mb-2'>{data.keyword}</p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Lượt tìm kiếm:</span> {data.searchCount.toLocaleString()}
          </p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Clicks:</span> {data.clickCount.toLocaleString()}
          </p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Tỷ lệ chuyển đổi:</span> {data.conversionRate.toFixed(1)}%
          </p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Vị trí TB:</span> #{data.avgPosition.toFixed(1)}
          </p>
        </div>
      )
    }
    return null
  }

  const radarData = data.map((item) => ({
    keyword: item.keyword.length > 20 ? item.keyword.substring(0, 20) + '...' : item.keyword,
    'Tìm kiếm': item.searchCount,
    Clicks: item.clickCount,
    'Tỷ lệ chuyển đổi': item.conversionRate
  }))

  const totalSearches = data.reduce((sum, item) => sum + item.searchCount, 0)
  const totalClicks = data.reduce((sum, item) => sum + item.clickCount, 0)
  const avgConversion = data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
          <Search className='w-5 h-5 text-blue-600' />
          Top từ khóa tìm kiếm dẫn đến sự kiện
        </h3>
        <p className='text-sm text-gray-600 mt-1'>Phân tích các từ khóa phổ biến nhất tìm kiếm sự kiện của bạn</p>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg'>
        <div className='text-center'>
          <p className='text-xs text-gray-600 mb-1'>Tổng lượt tìm</p>
          <p className='text-2xl font-bold text-gray-900'>{totalSearches.toLocaleString()}</p>
        </div>
        <div className='text-center'>
          <p className='text-xs text-gray-600 mb-1'>Tổng clicks</p>
          <p className='text-2xl font-bold text-cyan-600'>{totalClicks.toLocaleString()}</p>
        </div>
        <div className='text-center'>
          <p className='text-xs text-gray-600 mb-1'>TB chuyển đổi</p>
          <p className='text-2xl font-bold text-green-600'>{avgConversion.toFixed(1)}%</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Bar Chart */}
        <div>
          <p className='text-sm font-medium text-gray-700 mb-3'>Lượt tìm kiếm & Clicks</p>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={data} layout='vertical'>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis type='number' stroke='#9ca3af' style={{ fontSize: '12px' }} />
              <YAxis type='category' dataKey='keyword' stroke='#9ca3af' style={{ fontSize: '11px' }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    searchCount: 'Lượt tìm kiếm',
                    clickCount: 'Clicks'
                  }
                  return labels[value] || value
                }}
              />
              <Bar dataKey='searchCount' fill='#3b82f6' radius={[0, 4, 4, 0]} />
              <Bar dataKey='clickCount' fill='#22d3ee' radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div>
          <p className='text-sm font-medium text-gray-700 mb-3'>Tỷ lệ chuyển đổi</p>
          <ResponsiveContainer width='100%' height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke='#e5e7eb' />
              <PolarAngleAxis dataKey='keyword' tick={{ fill: '#6b7280', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Radar
                name='Tỷ lệ chuyển đổi (%)'
                dataKey='Tỷ lệ chuyển đổi'
                stroke='#10b981'
                fill='#10b981'
                fillOpacity={0.6}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Keyword Cards */}
      <div className='mt-6 pt-6 border-t border-gray-100'>
        <p className='text-sm font-medium text-gray-700 mb-4'>Chi tiết từng từ khóa</p>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {data.map((item, index) => (
            <div key={item.keyword} className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <div
                    className='w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm'
                    style={{ backgroundColor: item.color }}
                  >
                    #{index + 1}
                  </div>
                  <Search className='w-4 h-4 text-gray-400' />
                </div>
                <span className='text-xs px-2 py-1 bg-gray-100 rounded-full font-medium text-gray-700'>
                  Pos #{item.avgPosition.toFixed(1)}
                </span>
              </div>

              <p className='font-semibold text-gray-900 mb-3 text-sm line-clamp-2'>{item.keyword}</p>

              <div className='space-y-2'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-gray-600 flex items-center gap-1'>
                    <Search className='w-3 h-3' />
                    Tìm kiếm
                  </span>
                  <span className='font-semibold text-gray-900'>{item.searchCount.toLocaleString()}</span>
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-gray-600 flex items-center gap-1'>
                    <MousePointerClick className='w-3 h-3' />
                    Clicks
                  </span>
                  <span className='font-semibold text-cyan-600'>{item.clickCount.toLocaleString()}</span>
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-gray-600 flex items-center gap-1'>
                    <TrendingUp className='w-3 h-3' />
                    Chuyển đổi
                  </span>
                  <span className='font-semibold text-green-600'>{item.conversionRate.toFixed(1)}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className='mt-3 pt-3 border-t border-gray-100'>
                <div className='flex items-center justify-between text-xs mb-1'>
                  <span className='text-gray-600'>CTR</span>
                  <span className='font-medium text-gray-900'>
                    {((item.clickCount / item.searchCount) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
                  <div
                    className='h-full transition-all duration-500 rounded-full'
                    style={{
                      width: `${(item.clickCount / item.searchCount) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

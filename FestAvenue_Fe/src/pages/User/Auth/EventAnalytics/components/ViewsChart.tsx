import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ViewAnalysis } from '../../../../../types/eventAnalytics.types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ViewsChartProps {
  data: ViewAnalysis[]
}

export default function ViewsChart({ data }: ViewsChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), 'dd/MM', { locale: vi })
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-semibold text-gray-900 mb-2'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className='text-sm' style={{ color: entry.color }}>
              <span className='font-medium'>{entry.name}:</span> {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-bold text-gray-900'>Phân tích lượt xem sự kiện</h3>
        <p className='text-sm text-gray-600 mt-1'>Theo dõi lượt xem trang sự kiện theo thời gian</p>
      </div>

      <ResponsiveContainer width='100%' height={350}>
        <LineChart data={formattedData}>
          <defs>
            <linearGradient id='colorViews' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#93c5fd' stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id='colorUniqueViews' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#22d3ee' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#67e8f9' stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis dataKey='date' stroke='#9ca3af' style={{ fontSize: '12px' }} />
          <YAxis stroke='#9ca3af' style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                views: 'Tổng lượt xem',
                uniqueViews: 'Lượt xem duy nhất'
              }
              return labels[value] || value
            }}
          />
          <Line
            type='monotone'
            dataKey='views'
            stroke='#3b82f6'
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type='monotone'
            dataKey='uniqueViews'
            stroke='#22d3ee'
            strokeWidth={3}
            dot={{ fill: '#22d3ee', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

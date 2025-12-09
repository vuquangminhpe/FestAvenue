import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { RevenueAnalysisType } from '@/types/eventDashboard.types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface RevenueChartProps {
  data: RevenueAnalysisType[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' VNĐ'
  }

  const formatYAxis = (value: number) => {
    return value.toLocaleString('vi-VN')
  }

  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), 'dd/MM', { locale: vi }),
    revenue: item.revenue
  }))

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-medium text-gray-900 mb-1'>{label}</p>
          <p className='text-sm text-emerald-600'>{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h3 className='text-lg font-bold text-gray-900'>Doanh thu theo ngày</h3>
          <p className='text-sm text-gray-500 mt-1'>Theo dõi doanh thu sự kiện</p>
        </div>
        <div className='text-right'>
          <p className='text-xl font-bold text-emerald-600'>{formatCurrency(totalRevenue)}</p>
          <p className='text-xs text-gray-500'>Tổng doanh thu</p>
        </div>
      </div>

      <ResponsiveContainer width='100%' height={280}>
        <BarChart data={formattedData}>
          <defs>
            <linearGradient id='revenueBarGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#10b981' stopOpacity={0.9} />
              <stop offset='95%' stopColor='#6ee7b7' stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' vertical={false} />
          <XAxis dataKey='date' stroke='#9ca3af' fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke='#9ca3af' fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatYAxis} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey='revenue' fill='url(#revenueBarGradient)' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

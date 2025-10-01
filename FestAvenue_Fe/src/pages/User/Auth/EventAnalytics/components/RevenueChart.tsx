import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { RevenueAnalysis } from '../../../../../types/eventAnalytics.types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface RevenueChartProps {
  data: RevenueAnalysis[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), 'dd/MM', { locale: vi }),
    revenue: item.revenue / 1000000, // Convert to millions
    expenses: item.expenses ? item.expenses / 1000000 : 0,
    profit: item.profit ? item.profit / 1000000 : 0
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-semibold text-gray-900 mb-2'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className='text-sm' style={{ color: entry.color }}>
              <span className='font-medium'>{entry.name}:</span> {(entry.value * 1000000).toLocaleString()} VND
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
        <h3 className='text-lg font-bold text-gray-900'>Phân tích doanh thu sự kiện</h3>
        <p className='text-sm text-gray-600 mt-1'>
          Theo dõi doanh thu, chi phí và lợi nhuận theo thời gian (đơn vị: triệu VND)
        </p>
      </div>

      <ResponsiveContainer width='100%' height={350}>
        <BarChart data={formattedData}>
          <defs>
            <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#22d3ee' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#93c5fd' stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id='colorExpenses' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#f87171' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#fca5a5' stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id='colorProfit' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#6ee7b7' stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis dataKey='date' stroke='#9ca3af' style={{ fontSize: '12px' }} />
          <YAxis stroke='#9ca3af' style={{ fontSize: '12px' }} tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                revenue: 'Doanh thu',
                expenses: 'Chi phí',
                profit: 'Lợi nhuận'
              }
              return labels[value] || value
            }}
          />
          <Bar dataKey='revenue' fill='url(#colorRevenue)' radius={[8, 8, 0, 0]} />
          <Bar dataKey='expenses' fill='url(#colorExpenses)' radius={[8, 8, 0, 0]} />
          <Bar dataKey='profit' fill='url(#colorProfit)' radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

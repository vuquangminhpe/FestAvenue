import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { TicketSalesAnalysis } from '../../../../../../types/eventDashboard.types'

interface TicketSalesChartProps {
  data: TicketSalesAnalysis[]
}

// Mảng màu cho từng loại vé
const COLORS = ['#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function TicketSalesChart({ data }: TicketSalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  const totalSold = data.reduce((sum, item) => sum + item.sold, 0)
  const dataWithTotal = data.map((item) => ({
    ...item,
    total: totalSold
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-semibold text-gray-900 mb-2'>{item.ticketType}</p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Đã bán:</span> {item.sold.toLocaleString()} vé
          </p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Doanh thu:</span> {formatCurrency(item.revenue)}
          </p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Tỷ lệ:</span> {((item.sold / totalSold) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-bold text-gray-900'>Phân tích bán vé theo loại</h3>
        <p className='text-sm text-gray-600 mt-1'>Tổng: {totalSold.toLocaleString()} vé</p>
      </div>

      <ResponsiveContainer width='100%' height={350}>
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={({ ticketType, sold }: any) => {
              const percent = ((sold / totalSold) * 100).toFixed(1)
              return `${ticketType}: ${percent}%`
            }}
            outerRadius={110}
            fill='#8884d8'
            dataKey='sold'
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign='bottom'
            height={36}
            formatter={(value) => {
              const item = data.find((d) => d.ticketType === value)
              return item ? `${value} (${item.sold.toLocaleString()} vé)` : value
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100'>
        {data.map((item, index) => (
          <div key={item.ticketType} className='text-center'>
            <div
              className='w-3 h-3 rounded-full mx-auto mb-2'
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <p className='text-xs text-gray-600 mb-1'>{item.ticketType}</p>
            <p className='text-sm font-bold text-gray-900'>{formatCurrency(item.revenue)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

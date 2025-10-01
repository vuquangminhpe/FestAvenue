import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import type { TicketSalesAnalysis } from '../../../../../types/eventAnalytics.types'

interface TicketSalesChartProps {
  data: TicketSalesAnalysis[]
}

export default function TicketSalesChart({ data }: TicketSalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-semibold text-gray-900 mb-2'>{data.ticketType}</p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Đã bán:</span> {data.sold.toLocaleString()} vé
          </p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Doanh thu:</span> {formatCurrency(data.revenue)}
          </p>
          <p className='text-sm text-gray-600'>
            <span className='font-medium'>Tỷ lệ:</span> {((data.sold / data.total) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  const totalSold = data.reduce((sum, item) => sum + item.sold, 0)
  const dataWithTotal = data.map((item) => ({
    ...item,
    total: totalSold
  }))

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
            label={({ ticketType, sold, total }: any) => {
              const percent = ((sold / total) * 100).toFixed(1)
              return `${ticketType}: ${percent}%`
            }}
            outerRadius={110}
            fill='#8884d8'
            dataKey='sold'
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign='bottom'
            height={36}
            formatter={(value) => {
              const item = data.find((d) => d.ticketType === value)
              if (item) {
                return `${value} (${item.sold.toLocaleString()} vé)`
              }
              return value
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100'>
        {data.map((item) => (
          <div key={item.ticketType} className='text-center'>
            <div className='w-3 h-3 rounded-full mx-auto mb-2' style={{ backgroundColor: item.color }} />
            <p className='text-xs text-gray-600 mb-1'>{item.ticketType}</p>
            <p className='text-sm font-bold text-gray-900'>{formatCurrency(item.revenue)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

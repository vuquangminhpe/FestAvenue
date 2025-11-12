import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import type { ParticipantAnalysis } from '../../../../../../types/eventDashboard.types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ParticipantsChartProps {
  data: ParticipantAnalysis[]
}

export default function ParticipantsChart({ data }: ParticipantsChartProps) {
  // Format date và map sang key total cho chart
  const formattedData = data.map(item => ({
    date: format(new Date(item.date), 'dd/MM', { locale: vi }),
    total: item.totalTicket
  }))

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-bold text-gray-900'>Phân tích số lượng vé bán theo ngày</h3>
        <p className='text-sm text-gray-600 mt-1'>Theo dõi xu hướng mua vé theo ngày</p>
      </div>

      <ResponsiveContainer width='100%' height={350}>
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id='colorTotal' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#22d3ee' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#93c5fd' stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis dataKey='date' stroke='#9ca3af' style={{ fontSize: '12px' }} />
          <YAxis stroke='#9ca3af' style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: number) => value.toLocaleString()}
          />
          <Area
            type='monotone'
            dataKey='total'
            stroke='#22d3ee'
            fillOpacity={1}
            fill='url(#colorTotal)'
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

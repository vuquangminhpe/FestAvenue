import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { CheckInAnalysis } from '../../../../../../types/eventAnalytics.types'

interface CheckInChartProps {
  data: CheckInAnalysis[]
}

export default function CheckInChart({ data }: CheckInChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-semibold text-gray-900 mb-2'>{data.ticketType}</p>
          <p className='text-sm text-green-600'>
            <span className='font-medium'>Đã check-in:</span> {data.checkedIn.toLocaleString()} ({data.checkInRate}%)
          </p>
          <p className='text-sm text-red-600'>
            <span className='font-medium'>Chưa check-in:</span> {data.notCheckedIn.toLocaleString()}
          </p>
          <p className='text-sm text-gray-600 mt-1'>
            <span className='font-medium'>Tổng:</span> {data.total.toLocaleString()} vé
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='mb-6'>
        <h3 className='text-lg font-bold text-gray-900'>Phân tích check-in theo loại vé</h3>
        <p className='text-sm text-gray-600 mt-1'>Theo dõi tỷ lệ check-in của từng loại vé</p>
      </div>

      <ResponsiveContainer width='100%' height={350}>
        <BarChart data={data} layout='vertical' margin={{ left: 20 }}>
          <defs>
            <linearGradient id='colorCheckedIn' x1='0' y1='0' x2='1' y2='0'>
              <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#6ee7b7' stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id='colorNotCheckedIn' x1='0' y1='0' x2='1' y2='0'>
              <stop offset='5%' stopColor='#f87171' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#fca5a5' stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis type='number' stroke='#9ca3af' style={{ fontSize: '12px' }} />
          <YAxis type='category' dataKey='ticketType' stroke='#9ca3af' style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                checkedIn: 'Đã check-in',
                notCheckedIn: 'Chưa check-in'
              }
              return labels[value] || value
            }}
          />
          <Bar dataKey='checkedIn' fill='url(#colorCheckedIn)' stackId='a' radius={[0, 4, 4, 0]} />
          <Bar dataKey='notCheckedIn' fill='url(#colorNotCheckedIn)' stackId='a' radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Check-in Rate Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100'>
        {data.map((item) => (
          <div key={item.ticketType} className='text-center'>
            <p className='text-xs text-gray-600 mb-2'>{item.ticketType}</p>
            <div className='relative w-16 h-16 mx-auto mb-2'>
              <svg className='w-full h-full transform -rotate-90'>
                <circle cx='32' cy='32' r='28' stroke='#e5e7eb' strokeWidth='8' fill='none' />
                <circle
                  cx='32'
                  cy='32'
                  r='28'
                  stroke='#10b981'
                  strokeWidth='8'
                  fill='none'
                  strokeDasharray={`${item.checkInRate * 1.76} 176`}
                  strokeLinecap='round'
                />
              </svg>
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-sm font-bold text-gray-900'>{item.checkInRate}%</span>
              </div>
            </div>
            <p className='text-xs text-gray-600'>
              {item.checkedIn}/{item.total} vé
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

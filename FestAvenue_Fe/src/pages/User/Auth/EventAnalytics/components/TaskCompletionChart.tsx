import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import type { TaskStatusAnalysis } from '../../../../../types/eventAnalytics.types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ListChecks } from 'lucide-react'

interface TaskCompletionChartProps {
  data: TaskStatusAnalysis[]
}

export default function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.date), 'dd/MM', { locale: vi }),
    'Hoàn thành': item.completed,
    'Trễ hạn': item.late,
    'Đang làm': item.inProgress,
    'Chờ xử lý': item.pending
  }))

  const totalCompleted = data[data.length - 1]?.completed || 0
  const totalLate = data[data.length - 1]?.late || 0
  const totalPending = data[data.length - 1]?.pending || 0
  const totalInProgress = data[data.length - 1]?.inProgress || 0
  const totalTasks = totalCompleted + totalLate + totalPending + totalInProgress

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <ListChecks className='w-5 h-5 text-blue-600' />
            Tiến độ hoàn thành task
          </h3>
          <p className='text-sm text-gray-600 mt-1'>Theo dõi trạng thái task theo thời gian</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-4 gap-3 mb-6'>
        <div className='bg-green-50 rounded-lg p-3'>
          <p className='text-xs text-green-700 font-medium'>Hoàn thành</p>
          <p className='text-lg font-bold text-green-900'>{totalCompleted}</p>
          <p className='text-xs text-green-600'>{((totalCompleted / totalTasks) * 100).toFixed(1)}%</p>
        </div>
        <div className='bg-red-50 rounded-lg p-3'>
          <p className='text-xs text-red-700 font-medium'>Trễ hạn</p>
          <p className='text-lg font-bold text-red-900'>{totalLate}</p>
          <p className='text-xs text-red-600'>{((totalLate / totalTasks) * 100).toFixed(1)}%</p>
        </div>
        <div className='bg-blue-50 rounded-lg p-3'>
          <p className='text-xs text-blue-700 font-medium'>Đang làm</p>
          <p className='text-lg font-bold text-blue-900'>{totalInProgress}</p>
          <p className='text-xs text-blue-600'>{((totalInProgress / totalTasks) * 100).toFixed(1)}%</p>
        </div>
        <div className='bg-amber-50 rounded-lg p-3'>
          <p className='text-xs text-amber-700 font-medium'>Chờ xử lý</p>
          <p className='text-lg font-bold text-amber-900'>{totalPending}</p>
          <p className='text-xs text-amber-600'>{((totalPending / totalTasks) * 100).toFixed(1)}%</p>
        </div>
      </div>

      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id='colorCompleted' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
              <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorLate' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#ef4444' stopOpacity={0.3} />
              <stop offset='95%' stopColor='#ef4444' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorInProgress' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
              <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorPending' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.3} />
              <stop offset='95%' stopColor='#f59e0b' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
          <XAxis dataKey='date' tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType='circle'
            formatter={(value) => <span className='text-sm text-gray-700'>{value}</span>}
          />
          <Area
            type='monotone'
            dataKey='Hoàn thành'
            stroke='#10b981'
            strokeWidth={2}
            fillOpacity={1}
            fill='url(#colorCompleted)'
          />
          <Area
            type='monotone'
            dataKey='Trễ hạn'
            stroke='#ef4444'
            strokeWidth={2}
            fillOpacity={1}
            fill='url(#colorLate)'
          />
          <Area
            type='monotone'
            dataKey='Đang làm'
            stroke='#3b82f6'
            strokeWidth={2}
            fillOpacity={1}
            fill='url(#colorInProgress)'
          />
          <Area
            type='monotone'
            dataKey='Chờ xử lý'
            stroke='#f59e0b'
            strokeWidth={2}
            fillOpacity={1}
            fill='url(#colorPending)'
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

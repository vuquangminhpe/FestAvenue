import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { EventByCategory } from '@/types/admin.types'

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16']

interface EventTypeAnalyticsProps {
  data: EventByCategory[]
}

const EventTypeAnalytics = ({ data }: EventTypeAnalyticsProps) => {
  return (
    <div className='space-y-4'>
      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie
            data={data as any}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={({ type, percentage }) => `${type}: ${percentage}%`}
            outerRadius={80}
            fill='#8884d8'
            dataKey='count'
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className='space-y-2'>
        {data.map((item, index) => (
          <div key={item.type} className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full' style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className='text-sm font-medium'>{item.type}</span>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-sm text-gray-500'>{item.count} sự kiện</span>
              <span className='text-sm font-semibold' style={{ color: COLORS[index % COLORS.length] }}>
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventTypeAnalytics

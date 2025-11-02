import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'
import type { StaffPerformance } from '../../../../../../types/eventAnalytics.types'
import { Trophy } from 'lucide-react'

interface StaffPerformanceChartProps {
  data: StaffPerformance[]
}

export default function StaffPerformanceChart({ data }: StaffPerformanceChartProps) {
  // Get top 5 staff by performance score
  const topStaff = [...data].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5)

  // Transform data for radar chart
  const chartData = [
    {
      metric: 'Tỷ lệ hoàn thành',
      ...topStaff.reduce(
        (acc, staff) => ({
          ...acc,
          [staff.staffName]: staff.completionRate
        }),
        {}
      )
    },
    {
      metric: 'Điểm hiệu suất',
      ...topStaff.reduce(
        (acc, staff) => ({
          ...acc,
          [staff.staffName]: staff.performanceScore
        }),
        {}
      )
    },
    {
      metric: 'Đúng hạn (%)',
      ...topStaff.reduce(
        (acc, staff) => ({
          ...acc,
          [staff.staffName]: (staff.onTimeTasks / staff.totalTasks) * 100
        }),
        {}
      )
    },
    {
      metric: 'Số task hoàn thành',
      ...topStaff.reduce(
        (acc, staff) => ({
          ...acc,
          // Normalize to 0-100 scale
          [staff.staffName]: (staff.completedTasks / Math.max(...topStaff.map((s) => s.completedTasks))) * 100
        }),
        {}
      )
    },
    {
      metric: 'Tốc độ (ngược)',
      ...topStaff.reduce(
        (acc, staff) => ({
          ...acc,
          // Invert so lower time = higher score
          [staff.staffName]: Math.max(0, 100 - (staff.avgCompletionTime / 30) * 100)
        }),
        {}
      )
    }
  ]

  const colors = ['#3b82f6', '#22d3ee', '#10b981', '#f59e0b', '#8b5cf6']

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <Trophy className='w-5 h-5 text-amber-500' />
            Top 5 nhân viên xuất sắc nhất
          </h3>
          <p className='text-sm text-gray-600 mt-1'>Biểu đồ radar so sánh hiệu suất tổng thể</p>
        </div>
      </div>

      <ResponsiveContainer width='100%' height={400}>
        <RadarChart data={chartData}>
          <PolarGrid stroke='#e5e7eb' />
          <PolarAngleAxis dataKey='metric' tick={{ fill: '#6b7280', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
          {topStaff.map((staff, index) => (
            <Radar
              key={staff.staffId}
              name={staff.staffName}
              dataKey={staff.staffName}
              stroke={colors[index]}
              fill={colors[index]}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType='circle'
            formatter={(value) => <span className='text-sm text-gray-700'>{value}</span>}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Top 5 Staff Cards */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-3 mt-6'>
        {topStaff.map((staff, index) => (
          <div key={staff.staffId} className='flex flex-col items-center p-3 bg-gray-50 rounded-lg'>
            <div className='relative'>
              <img src={staff.avatar} alt={staff.staffName} className='w-12 h-12 rounded-full object-cover' />
              <div
                className='absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white'
                style={{ backgroundColor: colors[index] }}
              >
                {index + 1}
              </div>
            </div>
            <p className='text-xs font-medium text-gray-900 mt-2 text-center'>{staff.staffName}</p>
            <p className='text-xs text-gray-600'>{staff.performanceScore}đ</p>
          </div>
        ))}
      </div>
    </div>
  )
}

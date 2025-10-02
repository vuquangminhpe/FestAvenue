import type { StaffRanking } from '../../../../../types/eventAnalytics.types'
import { Trophy, TrendingUp, TrendingDown, Minus, Award } from 'lucide-react'

interface StaffRankingTableProps {
  data: StaffRanking[]
}

export default function StaffRankingTable({ data }: StaffRankingTableProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900'
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className='w-4 h-4' />
    }
    return null
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return (
        <div className='flex items-center gap-1 text-green-600'>
          <TrendingUp className='w-4 h-4' />
          <span className='text-xs font-medium'>+{change}</span>
        </div>
      )
    } else if (change < 0) {
      return (
        <div className='flex items-center gap-1 text-red-600'>
          <TrendingDown className='w-4 h-4' />
          <span className='text-xs font-medium'>{change}</span>
        </div>
      )
    } else {
      return (
        <div className='flex items-center gap-1 text-gray-400'>
          <Minus className='w-4 h-4' />
          <span className='text-xs font-medium'>0</span>
        </div>
      )
    }
  }

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <Award className='w-5 h-5 text-purple-600' />
            Bảng xếp hạng nhân viên
          </h3>
          <p className='text-sm text-gray-600 mt-1'>Top performers và thống kê hiệu suất</p>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-200'>
              <th className='text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase'>Hạng</th>
              <th className='text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase'>Nhân viên</th>
              <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase'>Tổng task</th>
              <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase'>Hoàn thành</th>
              <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase'>Trễ hạn</th>
              <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase'>Tỷ lệ</th>
              <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase'>Điểm</th>
              <th className='text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase'>Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((ranking) => (
              <tr key={ranking.staff.staffId} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                <td className='py-4 px-4'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(ranking.rank)}`}
                  >
                    {getRankIcon(ranking.rank) || ranking.rank}
                  </div>
                </td>
                <td className='py-4 px-4'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={ranking.staff.avatar}
                      alt={ranking.staff.staffName}
                      className='w-10 h-10 rounded-full object-cover'
                    />
                    <div>
                      <p className='font-medium text-gray-900'>{ranking.staff.staffName}</p>
                      <p className='text-xs text-gray-500'>{ranking.staff.staffId}</p>
                    </div>
                  </div>
                </td>
                <td className='py-4 px-4 text-center'>
                  <span className='text-sm font-medium text-gray-900'>{ranking.staff.totalTasks}</span>
                </td>
                <td className='py-4 px-4 text-center'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                    {ranking.staff.completedTasks}
                  </span>
                </td>
                <td className='py-4 px-4 text-center'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ranking.staff.lateTasks === 0
                        ? 'bg-green-100 text-green-800'
                        : ranking.staff.lateTasks <= 2
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ranking.staff.lateTasks}
                  </span>
                </td>
                <td className='py-4 px-4 text-center'>
                  <div className='flex flex-col items-center'>
                    <span className='text-sm font-semibold text-gray-900'>{ranking.staff.completionRate.toFixed(1)}%</span>
                    <div className='w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full'
                        style={{ width: `${ranking.staff.completionRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className='py-4 px-4 text-center'>
                  <div className='flex flex-col items-center'>
                    <span className='text-lg font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text'>
                      {ranking.staff.performanceScore}
                    </span>
                    <span className='text-xs text-gray-500'>điểm</span>
                  </div>
                </td>
                <td className='py-4 px-4 text-center'>{getChangeIcon(ranking.change)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Additional Stats */}
      <div className='mt-6 pt-6 border-t border-gray-200'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Trophy className='w-5 h-5 text-amber-600' />
              <p className='text-sm font-medium text-amber-900'>Nhân viên xuất sắc nhất</p>
            </div>
            <p className='text-lg font-bold text-amber-900'>{data[0]?.staff.staffName}</p>
            <p className='text-xs text-amber-700 mt-1'>{data[0]?.staff.performanceScore} điểm hiệu suất</p>
          </div>
          <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingDown className='w-5 h-5 text-red-600' />
              <p className='text-sm font-medium text-red-900'>Cần cải thiện</p>
            </div>
            <p className='text-lg font-bold text-red-900'>
              {data.reduce((sum, r) => sum + r.staff.lateTasks, 0)} task trễ
            </p>
            <p className='text-xs text-red-700 mt-1'>Toàn bộ đội ngũ</p>
          </div>
          <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='w-5 h-5 text-green-600' />
              <p className='text-sm font-medium text-green-900'>Tỷ lệ hoàn thành TB</p>
            </div>
            <p className='text-lg font-bold text-green-900'>
              {(data.reduce((sum, r) => sum + r.staff.completionRate, 0) / data.length).toFixed(1)}%
            </p>
            <p className='text-xs text-green-700 mt-1'>Toàn bộ đội ngũ</p>
          </div>
        </div>
      </div>
    </div>
  )
}

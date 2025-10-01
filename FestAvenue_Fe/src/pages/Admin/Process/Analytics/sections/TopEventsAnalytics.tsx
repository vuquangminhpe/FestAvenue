import { mockTopEvents } from '@/utils/mockData'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Eye, Ticket, DollarSign } from 'lucide-react'

const TopEventsAnalytics = () => {
  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(0)}M VNĐ`
  }

  return (
    <div className='space-y-4'>
      {mockTopEvents.map((event, index) => (
        <div
          key={event.id}
          className='p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer'
        >
          <div className='flex items-start justify-between mb-3'>
            <div className='flex items-start gap-3'>
              <Badge
                className={
                  index === 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : index === 1
                      ? 'bg-gray-200 text-gray-700'
                      : index === 2
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                }
              >
                #{index + 1}
              </Badge>
              <div>
                <h4 className='font-semibold text-gray-900'>{event.name}</h4>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4 mt-3'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center'>
                <Eye className='w-4 h-4 text-purple-600' />
              </div>
              <div>
                <p className='text-xs text-gray-500'>Lượt xem</p>
                <p className='font-semibold text-sm'>{event.views.toLocaleString()}</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center'>
                <Ticket className='w-4 h-4 text-blue-600' />
              </div>
              <div>
                <p className='text-xs text-gray-500'>Vé bán</p>
                <p className='font-semibold text-sm'>{event.tickets.toLocaleString()}</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center'>
                <DollarSign className='w-4 h-4 text-green-600' />
              </div>
              <div>
                <p className='text-xs text-gray-500'>Doanh thu</p>
                <p className='font-semibold text-sm'>{formatCurrency(event.revenue)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className='pt-4 border-t'>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <TrendingUp className='w-4 h-4' />
          <span>Dữ liệu được cập nhật real-time</span>
        </div>
      </div>
    </div>
  )
}

export default TopEventsAnalytics

import { useQuery } from '@tanstack/react-query'
import { Users, Calendar, Ticket, DollarSign, Loader2 } from 'lucide-react'
import adminApi from '@/apis/admin.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  const { data: statisticsData, isLoading } = useQuery({
    queryKey: ['adminStatistics'],
    queryFn: () => adminApi.getAdminStatistics(),
    staleTime: 60000 // 1 minute
  })

  const statistics = statisticsData?.data?.general

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value)
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Tổng người dùng',
      value: formatNumber(statistics?.totalUsers || 0),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Tổng sự kiện',
      value: formatNumber(statistics?.totalEvents || 0),
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Vé đã bán',
      value: formatNumber(statistics?.totalTicketsSold || 0),
      icon: Ticket,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(statistics?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ]

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

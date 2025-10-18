import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Share2,
  CheckCircle,
  Calendar,
  Download,
  Search,
  UserCheck,
  Clock,
  AlertCircle,
  Lock
} from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import StatCard from './components/StatCard'
import ParticipantsChart from './components/ParticipantsChart'
import TicketSalesChart from './components/TicketSalesChart'
import RevenueChart from './components/RevenueChart'
import CheckInChart from './components/CheckInChart'
import ViewsChart from './components/ViewsChart'
import KeywordSearchChart from './components/KeywordSearchChart'
import { SocialMediaPostsChart } from './components/SocialMediaPostsChart'
import StaffPerformanceChart from './components/StaffPerformanceChart'
import TaskCompletionChart from './components/TaskCompletionChart'
import StaffRankingTable from './components/StaffRankingTable'
import { eventAnalyticsService } from '../../../../services/eventAnalytics.service'
import type { EventAnalytics } from '../../../../types/eventAnalytics.types'
import { getIdFromNameId } from '@/utils/utils'
import { useCheckIsEventOwner } from '@/pages/User/Process/UserManagementInEvents/hooks/usePermissions'

type TabType =
  | 'overview'
  | 'participants'
  | 'tickets'
  | 'revenue'
  | 'checkin'
  | 'views'
  | 'social'
  | 'keywords'
  | 'staff'

export default function EventAnalyticsDashboard() {
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventCode = getIdFromNameId(nameId)

  // Check if user is event owner (only event owners can see analytics)
  const { data: ownerCheckData, isLoading: isCheckingOwner } = useCheckIsEventOwner(eventCode)
  const isEventOwner = ownerCheckData?.data?.data || false

  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const data = await eventAnalyticsService.getEventAnalytics('evt_001')
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value)
  }

  // Check owner permission first
  if (isCheckingOwner) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  // Permission denied - Analytics chỉ dành cho event owner
  if (!isEventOwner) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center'>
        <div className='max-w-md text-center'>
          <div className='mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-6'>
            <Lock className='w-10 h-10 text-red-600' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-3'>Chỉ dành cho chủ sự kiện</h2>
          <p className='text-gray-600 mb-6'>
            Trang phân tích chỉ dành cho chủ sự kiện. Bạn không có quyền xem thông tin này.
          </p>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <p className='text-sm text-blue-800'>
              <strong>Lưu ý:</strong> Chỉ người tạo sự kiện mới có quyền xem báo cáo phân tích và thống kê.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600'>Không có dữ liệu phân tích</p>
        </div>
      </div>
    )
  }

  const { summary } = analytics

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
    { id: 'staff', label: 'Nhân sự', icon: UserCheck },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'keywords', label: 'Từ khóa', icon: Search }
  ] as const

  return (
    <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3'>
              <TrendingUp className='w-8 h-8 text-cyan-600' />
              Phân tích sự kiện
            </h1>
            <p className='text-gray-600 mt-2 flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              {summary.eventName}
            </p>
          </div>
          <Button className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 gap-2'>
            <Download className='w-4 h-4' />
            Xuất báo cáo
          </Button>
        </div>

        {/* Tabs Navigation */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-2'>
          <div className='flex flex-wrap gap-2'>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className='space-y-6'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <StatCard
                  title='Tổng người tham gia'
                  value={summary.totalParticipants}
                  change={12.5}
                  icon={Users}
                  iconColor='#22d3ee'
                  iconBg='#ecfeff'
                  trend='up'
                />
                <StatCard
                  title='Doanh thu'
                  value={formatCurrency(summary.totalRevenue)}
                  change={23.8}
                  icon={DollarSign}
                  iconColor='#10b981'
                  iconBg='#d1fae5'
                  trend='up'
                />
                <StatCard
                  title='Lượt xem sự kiện'
                  value={summary.totalViews.toLocaleString()}
                  change={18.2}
                  icon={Eye}
                  iconColor='#3b82f6'
                  iconBg='#dbeafe'
                  trend='up'
                />
                <StatCard
                  title='Lượt tìm kiếm'
                  value={summary.totalSearches.toLocaleString()}
                  change={42.3}
                  icon={Share2}
                  iconColor='#8b5cf6'
                  iconBg='#ede9fe'
                  trend='up'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <StatCard
                  title='Tỷ lệ check-in'
                  value={summary.checkInRate}
                  icon={CheckCircle}
                  iconColor='#10b981'
                  iconBg='#d1fae5'
                  suffix='%'
                />
                <StatCard
                  title='Lợi nhuận'
                  value={formatCurrency(summary.profit)}
                  icon={TrendingUp}
                  iconColor='#f59e0b'
                  iconBg='#fef3c7'
                />
                <StatCard
                  title='Loại vé phổ biến nhất'
                  value={summary.popularTicketType}
                  icon={Users}
                  iconColor='#ec4899'
                  iconBg='#fce7f3'
                />
                <StatCard
                  title='Bài đăng social media'
                  value={summary.totalSocialPosts}
                  icon={Share2}
                  iconColor='#06b6d4'
                  iconBg='#cffafe'
                />
              </div>
              {/* Event Summary */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>Tổng quan sự kiện</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Ngày diễn ra</p>
                    <p className='text-base font-semibold text-gray-900'>
                      {new Date(summary.eventDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Ngày bán vé cao nhất</p>
                    <p className='text-base font-semibold text-gray-900'>
                      {new Date(summary.peakSalesDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Tổng chi phí</p>
                    <p className='text-base font-semibold text-gray-900'>{formatCurrency(summary.totalExpenses)}</p>
                  </div>
                </div>
              </div>
              {/* Người tham gia + Bán vé (Flex) */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <ParticipantsChart data={analytics.participants} />
                <TicketSalesChart data={analytics.ticketSales} />
              </div>

              {/* Check-in (Full width) */}
              <CheckInChart data={analytics.checkIn} />

              {/* Doanh thu + Lượt xem (Flex) */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <RevenueChart data={analytics.revenue} />
                <ViewsChart data={analytics.eventViews} />
              </div>
            </>
          )}

          {/* Participants Tab */}
          {activeTab === 'participants' && <ParticipantsChart data={analytics.participants} />}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && <TicketSalesChart data={analytics.ticketSales} />}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && <RevenueChart data={analytics.revenue} />}

          {/* Check-in Tab */}
          {activeTab === 'checkin' && <CheckInChart data={analytics.checkIn} />}

          {/* Views Tab */}
          {activeTab === 'views' && <ViewsChart data={analytics.eventViews} />}

          {/* Social Media Tab */}
          {activeTab === 'social' && <SocialMediaPostsChart data={analytics.socialMediaPosts} />}

          {/* Keywords Tab */}
          {activeTab === 'keywords' && <KeywordSearchChart data={analytics.keywordSearch} />}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <>
              {/* Staff Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <StatCard
                  title='Tổng nhân viên'
                  value={summary.totalStaff}
                  icon={UserCheck}
                  iconColor='#3b82f6'
                  iconBg='#dbeafe'
                />
                <StatCard
                  title='Task hoàn thành'
                  value={summary.completedTasks}
                  change={15.3}
                  icon={CheckCircle}
                  iconColor='#10b981'
                  iconBg='#d1fae5'
                  trend='up'
                />
                <StatCard
                  title='Task trễ hạn'
                  value={summary.lateTasks}
                  change={-8.2}
                  icon={AlertCircle}
                  iconColor='#ef4444'
                  iconBg='#fee2e2'
                  trend='down'
                />
                <StatCard
                  title='Tỷ lệ hoàn thành TB'
                  value={summary.avgTaskCompletionRate}
                  change={5.7}
                  icon={Clock}
                  iconColor='#8b5cf6'
                  iconBg='#ede9fe'
                  suffix='%'
                  trend='up'
                />
              </div>

              {/* Task Completion Chart */}
              <TaskCompletionChart data={analytics.taskStatus} />

              {/* Staff Performance + Ranking */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <StaffPerformanceChart data={analytics.staffPerformance} />
                <div className='space-y-6'>
                  <StaffRankingTable data={analytics.staffRanking} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

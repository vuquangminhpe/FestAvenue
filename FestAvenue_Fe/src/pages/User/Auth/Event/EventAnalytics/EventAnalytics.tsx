import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Share2,
  CheckCircle,
  Calendar,
  UserCheck,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '../../../../../components/ui/button'
import StatCard from './components/StatCard'
import ParticipantsChart from './components/ParticipantsChart'
import TicketSalesChart from './components/TicketSalesChart'
import ViewsChart from './components/ViewsChart'
import RevenueChart from './components/RevenueChart'
import { SocialMediaPostsChart } from './components/SocialMediaPostsChart'
import TaskCompletionChart from './components/TaskCompletionChart'
import { getIdFromNameId } from '@/utils/utils'
import {
  useGetDashboardEventGeneral,
  useGetStaffStatistics,
  useGetSocialMediaPostStatistics
} from './hooks/useEventAnalytics'
import { PermissionGuard } from '@/components/guards'
import path from '@/constants/path'

type TabType = 'overview' | 'staff' | 'social'

export default function EventAnalyticsDashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nameId = Array.from(searchParams.keys())[0] || ''
  const eventCode = getIdFromNameId(nameId)

  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Fetch data from APIs using TanStack Query
  const { data: dataDashboardEventGeneral, isLoading } = useGetDashboardEventGeneral(eventCode)
  const { data: dataStaffStatistics, isLoading: isLoadingStaff } = useGetStaffStatistics(eventCode)
  const { data: dataSocialMediaStatistics, isLoading: isLoadingSocial } = useGetSocialMediaPostStatistics(eventCode)

  const participants = dataDashboardEventGeneral?.participantAnalysis ?? []
  const ticketSalesAnalysis = dataDashboardEventGeneral?.ticketSalesAnalysis ?? []
  const viewAnalysis = dataDashboardEventGeneral?.viewAnalysis ?? []
  const revenueAnalysis = dataDashboardEventGeneral?.revenueAnalysis ?? []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value)
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

  if (!dataDashboardEventGeneral) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600'>Không có dữ liệu phân tích</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
    { id: 'staff', label: 'Nhân sự', icon: UserCheck },
    { id: 'social', label: 'Bài đăng truyền thông', icon: Share2 }
  ] as const

  return (
    <PermissionGuard
      action='Thống kê'
      fallback={
        <div className='min-h-screen bg-gradient-to-br md:-translate-y-[200px] from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center p-6'>
          <div className='max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center'>
            <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <AlertCircle className='w-10 h-10 text-red-600' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-3'>Không có quyền truy cập</h2>
            <p className='text-gray-600 mb-6'>
              Bạn không có quyền xem phân tích thống kê của sự kiện này. Vui lòng liên hệ quản trị viên để được cấp
              quyền.
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <Button
                variant='outline'
                onClick={() => window.history.back()}
                className='border-gray-300 hover:bg-gray-50'
              >
                Quay lại
              </Button>
              <Button
                className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                onClick={() => navigate(path.user.event.root)}
              >
                Về trang sự kiện
              </Button>
            </div>
          </div>
        </div>
      }
    >
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
                Thống kê tổng quan
              </p>
            </div>
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
                <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4'>
                  <StatCard
                    title='Tổng người tham gia'
                    value={dataDashboardEventGeneral?.eventSummary?.totalParticipants ?? 0}
                    icon={Users}
                    iconColor='#22d3ee'
                    iconBg='#ecfeff'
                    trend='up'
                  />
                  <StatCard
                    title='Doanh thu'
                    value={formatCurrency(dataDashboardEventGeneral?.eventSummary?.totalRevenue ?? 0)}
                    icon={DollarSign}
                    iconColor='#10b981'
                    iconBg='#d1fae5'
                    trend='up'
                  />
                  <StatCard
                    title='Lượt xem sự kiện'
                    value={dataDashboardEventGeneral?.eventSummary?.totalViews ?? 0}
                    icon={Eye}
                    iconColor='#3b82f6'
                    iconBg='#dbeafe'
                    trend='up'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4'>
                  <StatCard
                    title='Tỷ lệ check-in'
                    value={dataDashboardEventGeneral?.eventSummary?.checkInRate ?? 0}
                    icon={CheckCircle}
                    iconColor='#10b981'
                    iconBg='#d1fae5'
                    suffix='%'
                  />
                  <StatCard
                    title='Loại vé phổ biến nhất'
                    value={dataDashboardEventGeneral?.eventSummary?.popularTicketType ?? '-'}
                    icon={Users}
                    iconColor='#ec4899'
                    iconBg='#fce7f3'
                  />
                  <StatCard
                    title='Bài đăng social media'
                    value={dataDashboardEventGeneral?.eventSummary?.totalSocialPosts ?? 0}
                    icon={Share2}
                    iconColor='#06b6d4'
                    iconBg='#cffafe'
                  />
                </div>

                {/* Người tham gia + Bán vé (Flex) */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <ParticipantsChart data={participants} />
                  <TicketSalesChart data={ticketSalesAnalysis} />
                </div>

                {/* Doanh thu + Lượt xem */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <RevenueChart data={revenueAnalysis} />
                  <ViewsChart data={viewAnalysis} />
                </div>
              </>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <>
                {isLoadingSocial ? (
                  <div className='text-center py-12'>
                    <div className='w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
                    <p className='text-gray-600'>Đang tải dữ liệu social media...</p>
                  </div>
                ) : dataSocialMediaStatistics ? (
                  <SocialMediaPostsChart
                    data={
                      Array.isArray(dataSocialMediaStatistics)
                        ? dataSocialMediaStatistics.map((post) => ({
                            postId: post.postId,
                            title: post.title,
                            content: post.content,
                            bannerUrl: post.bannerUrl,
                            postedDate: post.postedDate,
                            views: post.views,
                            likes: post.likes,
                            shares: 0, // API không có shares
                            comments: post.comments,
                            clicks: post.viewCount, // Map viewCount -> clicks
                            clickRate: post.viewRate, // Map viewRate -> clickRate
                            color: post.color
                          }))
                        : [
                            {
                              postId: dataSocialMediaStatistics.postId,
                              title: dataSocialMediaStatistics.title,
                              content: dataSocialMediaStatistics.content,
                              bannerUrl: dataSocialMediaStatistics.bannerUrl,
                              postedDate: dataSocialMediaStatistics.postedDate,
                              views: dataSocialMediaStatistics.views,
                              likes: dataSocialMediaStatistics.likes,
                              shares: 0,
                              comments: dataSocialMediaStatistics.comments,
                              clicks: dataSocialMediaStatistics.viewCount,
                              clickRate: dataSocialMediaStatistics.viewRate,
                              color: dataSocialMediaStatistics.color
                            }
                          ]
                    }
                  />
                ) : (
                  <div className='text-center py-12'>
                    <p className='text-gray-600'>Không có dữ liệu social media</p>
                  </div>
                )}
              </>
            )}

            {/* Staff Tab */}
            {activeTab === 'staff' && (
              <>
                {isLoadingStaff ? (
                  <div className='text-center py-12'>
                    <div className='w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
                    <p className='text-gray-600'>Đang tải dữ liệu nhân sự...</p>
                  </div>
                ) : dataStaffStatistics ? (
                  <>
                    {/* Staff Stats Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                      <StatCard
                        title='Tổng nhân viên'
                        value={dataStaffStatistics.taskSummary.totalStaff}
                        icon={UserCheck}
                        iconColor='#3b82f6'
                        iconBg='#dbeafe'
                      />
                      <StatCard
                        title='Task hoàn thành'
                        value={dataStaffStatistics.taskSummary.completedTasks}
                        change={15.3}
                        icon={CheckCircle}
                        iconColor='#10b981'
                        iconBg='#d1fae5'
                        trend='up'
                      />
                      <StatCard
                        title='Task trễ hạn'
                        value={dataStaffStatistics.taskSummary.lateTasks}
                        change={-8.2}
                        icon={AlertCircle}
                        iconColor='#ef4444'
                        iconBg='#fee2e2'
                        trend='down'
                      />
                      <StatCard
                        title='Tỷ lệ hoàn thành TB'
                        value={dataStaffStatistics.taskSummary.avgTaskCompletionRate}
                        change={5.7}
                        icon={Clock}
                        iconColor='#8b5cf6'
                        iconBg='#ede9fe'
                        suffix='%'
                        trend='up'
                      />
                    </div>

                    {/* Task Completion Chart */}
                    <TaskCompletionChart
                      data={dataStaffStatistics.taskStatusAnalysis.map((item) => ({
                        ...item,
                        pending: 0 // API không trả về pending, set mặc định = 0
                      }))}
                    />

                    {/* Staff Performance */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                      <div className='space-y-6'></div>
                    </div>
                  </>
                ) : (
                  <div className='text-center py-12'>
                    <p className='text-gray-600'>Không có dữ liệu thống kê nhân sự</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  )
}

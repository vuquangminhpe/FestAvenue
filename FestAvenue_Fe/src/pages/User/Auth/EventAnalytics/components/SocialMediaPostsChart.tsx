import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import type { SocialMediaPost } from '@/types/eventAnalytics.types'
import { TrendingUp, Eye, Heart, Share2, MessageCircle, MousePointerClick } from 'lucide-react'

interface SocialMediaPostsChartProps {
  data: SocialMediaPost[]
}

export function SocialMediaPostsChart({ data }: SocialMediaPostsChartProps) {
  // Sort posts by clicks descending
  const sortedByClicks = [...data].sort((a, b) => b.clicks - a.clicks)
  const topPost = sortedByClicks[0]

  // Calculate total engagement
  const totalEngagement = data.reduce((sum, post) => sum + post.views + post.likes + post.shares + post.comments, 0)

  // Prepare data for click rate pie chart
  const pieData = data.map((post) => ({
    name: post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title,
    value: post.clicks,
    color: post.color
  }))

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold text-gray-900'>Social Media Posts Performance</h3>
          <p className='text-sm text-gray-500 mt-1'>Phân tích hiệu suất bài đăng quảng bá sự kiện</p>
        </div>
        <div className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200'>
          <TrendingUp className='w-5 h-5 text-cyan-600' />
          <div className='text-sm'>
            <div className='font-semibold text-gray-900'>{totalEngagement.toLocaleString()}</div>
            <div className='text-gray-500'>Total Engagement</div>
          </div>
        </div>
      </div>

      {/* Top Performing Post Card */}
      {topPost && (
        <div className='bg-gradient-to-br from-cyan-400 via-cyan-300 to-blue-300 rounded-xl p-6 text-white shadow-lg'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex-1'>
              <div className='text-sm font-medium opacity-90 mb-1'>🏆 Top Performing Post</div>
              <h4 className='text-lg font-bold mb-2'>{topPost.title}</h4>
              <p className='text-sm opacity-90 line-clamp-2'>{topPost.content}</p>
            </div>
          </div>
          <div className='grid grid-cols-5 gap-4 mt-4'>
            <div className='bg-white/20 backdrop-blur-sm rounded-lg p-3'>
              <Eye className='w-4 h-4 mb-1' />
              <div className='text-xs opacity-90'>Views</div>
              <div className='text-lg font-bold'>{topPost.views.toLocaleString()}</div>
            </div>
            <div className='bg-white/20 backdrop-blur-sm rounded-lg p-3'>
              <Heart className='w-4 h-4 mb-1' />
              <div className='text-xs opacity-90'>Likes</div>
              <div className='text-lg font-bold'>{topPost.likes.toLocaleString()}</div>
            </div>
            <div className='bg-white/20 backdrop-blur-sm rounded-lg p-3'>
              <Share2 className='w-4 h-4 mb-1' />
              <div className='text-xs opacity-90'>Shares</div>
              <div className='text-lg font-bold'>{topPost.shares.toLocaleString()}</div>
            </div>
            <div className='bg-white/20 backdrop-blur-sm rounded-lg p-3'>
              <MessageCircle className='w-4 h-4 mb-1' />
              <div className='text-xs opacity-90'>Comments</div>
              <div className='text-lg font-bold'>{topPost.comments.toLocaleString()}</div>
            </div>
            <div className='bg-white/20 backdrop-blur-sm rounded-lg p-3'>
              <MousePointerClick className='w-4 h-4 mb-1' />
              <div className='text-xs opacity-90'>Clicks</div>
              <div className='text-lg font-bold'>{topPost.clicks.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Bar Chart - Clicks by Post */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
          <h4 className='text-sm font-semibold text-gray-700 mb-4'>Clicks by Post</h4>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={sortedByClicks}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='postId' tick={{ fontSize: 12 }} stroke='#9ca3af' />
              <YAxis tick={{ fontSize: 12 }} stroke='#9ca3af' />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
              <Bar dataKey='clicks' radius={[8, 8, 0, 0]}>
                {sortedByClicks.map((post, index) => (
                  <Cell key={`cell-${index}`} fill={post.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Click Distribution */}
        <div className='bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
          <h4 className='text-sm font-semibold text-gray-700 mb-4'>Click Distribution</h4>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={100}
                fill='#8884d8'
                dataKey='value'
                label={({ percent }) => `${((percent as number) * 100).toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Post Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {sortedByClicks.map((post) => (
          <div
            key={post.postId}
            className='bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='flex items-start gap-3 mb-3'>
              <div
                className='w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm'
                style={{ backgroundColor: post.color }}
              >
                {post.postId.split('_')[1]}
              </div>
              <div className='flex-1 min-w-0'>
                <h5 className='text-sm font-semibold text-gray-900 line-clamp-2 leading-tight'>{post.title}</h5>
                <p className='text-xs text-gray-500 mt-0.5'>{post.postedDate}</p>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-gray-500 flex items-center gap-1'>
                  <Eye className='w-3 h-3' /> Views
                </span>
                <span className='font-semibold text-gray-900'>{post.views.toLocaleString()}</span>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-gray-500 flex items-center gap-1'>
                  <MousePointerClick className='w-3 h-3' /> Clicks
                </span>
                <span className='font-semibold text-gray-900'>{post.clicks.toLocaleString()}</span>
              </div>
              <div className='pt-2 border-t border-gray-100'>
                <div className='flex items-center justify-between text-xs mb-1'>
                  <span className='text-gray-500'>Click Rate</span>
                  <span className='font-semibold text-cyan-600'>{post.clickRate.toFixed(1)}%</span>
                </div>
                <div className='w-full bg-gray-100 rounded-full h-1.5'>
                  <div
                    className='h-1.5 rounded-full transition-all'
                    style={{
                      width: `${post.clickRate}%`,
                      background: `linear-gradient(to right, ${post.color}, ${post.color}dd)`
                    }}
                  />
                </div>
              </div>
              <div className='grid grid-cols-3 gap-1 pt-2 border-t border-gray-100'>
                <div className='text-center'>
                  <div className='text-xs text-gray-500 flex items-center justify-center gap-0.5'>
                    <Heart className='w-3 h-3' />
                  </div>
                  <div className='text-xs font-semibold text-gray-900'>{post.likes}</div>
                </div>
                <div className='text-center'>
                  <div className='text-xs text-gray-500 flex items-center justify-center gap-0.5'>
                    <Share2 className='w-3 h-3' />
                  </div>
                  <div className='text-xs font-semibold text-gray-900'>{post.shares}</div>
                </div>
                <div className='text-center'>
                  <div className='text-xs text-gray-500 flex items-center justify-center gap-0.5'>
                    <MessageCircle className='w-3 h-3' />
                  </div>
                  <div className='text-xs font-semibold text-gray-900'>{post.comments}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

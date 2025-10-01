import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  TrendingUp,
  Users,
  Ticket,
  DollarSign,
  RefreshCw,
  Download,
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import UserAnalytics from './sections/UserAnalytics'
import EventAnalytics from './sections/EventAnalytics'
import RevenueAnalytics from './sections/RevenueAnalytics'
import EmployeeAnalytics from './sections/EmployeeAnalytics'
import EventTypeAnalytics from './sections/EventTypeAnalytics'
import EventTypeOverTimeAnalytics from './sections/EventTypeOverTimeAnalytics'
import KeywordSearchAnalytics from './sections/KeywordSearchAnalytics'
import TopEventsAnalytics from './sections/TopEventsAnalytics'
import { toast } from 'sonner'

const Analytics = () => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date()
  })
  const [timePreset, setTimePreset] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast('Đã làm mới dữ liệu')
    }, 1000)
  }

  const handleExport = () => {
    toast('Đang xuất dữ liệu')
  }

  const handleTimePresetChange = (value: string) => {
    setTimePreset(value)
    const today = new Date()

    switch (value) {
      case '7days':
        setDateRange({
          from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          to: today
        })
        break
      case '30days':
        setDateRange({
          from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          to: today
        })
        break
      case '3months':
        setDateRange({
          from: new Date(today.getFullYear(), today.getMonth() - 3, 1),
          to: today
        })
        break
      case '6months':
        setDateRange({
          from: new Date(today.getFullYear(), today.getMonth() - 6, 1),
          to: today
        })
        break
      case 'year':
        setDateRange({
          from: new Date(today.getFullYear(), 0, 1),
          to: today
        })
        break
      case 'all':
        setDateRange({
          from: new Date(2024, 0, 1),
          to: today
        })
        break
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Phân tích dữ liệu hệ thống</h1>
          <p className='text-gray-500 mt-2'>Theo dõi và phân tích các chỉ số quan trọng của hệ thống</p>
        </div>
      </div>

      {/* Filter Section */}
      <Card className='border-blue-200 bg-blue-50/30'>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex items-center gap-2'>
              <Filter className='w-5 h-5 text-gray-500' />
              <span className='font-semibold text-gray-700'>Bộ lọc dữ liệu</span>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
              {/* Time Preset Filter */}
              <Select value={timePreset} onValueChange={handleTimePresetChange}>
                <SelectTrigger className='w-full sm:w-[180px] bg-white'>
                  <SelectValue placeholder='Chọn khoảng thời gian' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7days'>7 ngày qua</SelectItem>
                  <SelectItem value='30days'>30 ngày qua</SelectItem>
                  <SelectItem value='3months'>3 tháng qua</SelectItem>
                  <SelectItem value='6months'>6 tháng qua</SelectItem>
                  <SelectItem value='year'>Năm nay</SelectItem>
                  <SelectItem value='all'>Tất cả</SelectItem>
                  <SelectItem value='custom'>Tùy chỉnh</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' className='w-full sm:w-[280px] justify-start text-left bg-white'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'dd MMM yyyy', { locale: vi })} -{' '}
                          {format(dateRange.to, 'dd MMM yyyy', { locale: vi })}
                        </>
                      ) : (
                        format(dateRange.from, 'dd MMM yyyy', { locale: vi })
                      )
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='end'>
                  <Calendar
                    initialFocus
                    mode='range'
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range: { from?: Date; to?: Date } | undefined) => {
                      setDateRange({ from: range?.from, to: range?.to })
                      setTimePreset('custom')
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {/* Action Buttons */}
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className='bg-white'
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant='default' onClick={handleExport} className='gap-2'>
                  <Download className='h-4 w-4' />
                  <span className='hidden sm:inline'>Xuất Excel</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Applied Filters Display */}
          {dateRange.from && dateRange.to && (
            <div className='mt-4 pt-4 border-t border-blue-200'>
              <p className='text-sm text-gray-600'>
                <span className='font-medium'>Khoảng thời gian hiển thị:</span>{' '}
                {format(dateRange.from, 'dd/MM/yyyy', { locale: vi })} -{' '}
                {format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng người dùng</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,500</div>
            <p className='text-xs text-muted-foreground'>+20% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Sự kiện</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>140</div>
            <p className='text-xs text-muted-foreground'>+12% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Vé đã bán</CardTitle>
            <Ticket className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>3,200</div>
            <p className='text-xs text-muted-foreground'>+15% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Doanh thu</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>320M VNĐ</div>
            <p className='text-xs text-muted-foreground'>+18% so với tháng trước</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue='users' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4 lg:w-auto lg:inline-grid'>
          <TabsTrigger value='users'>Người dùng & Nhân viên</TabsTrigger>
          <TabsTrigger value='events'>Sự kiện & Loại hình</TabsTrigger>
          <TabsTrigger value='revenue'>Doanh thu & Top sự kiện</TabsTrigger>
          <TabsTrigger value='keywords'>Từ khóa tìm kiếm</TabsTrigger>
        </TabsList>

        <TabsContent value='users' className='space-y-4'>
          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Người dùng đăng ký</CardTitle>
                <CardDescription>Số lượng người dùng mới theo thời gian</CardDescription>
              </CardHeader>
              <CardContent>
                <UserAnalytics />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nhân viên hệ thống</CardTitle>
                <CardDescription>Tổng số và nhân viên online</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeAnalytics />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='events' className='space-y-4'>
          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Sự kiện theo thời gian</CardTitle>
                <CardDescription>Số lượng sự kiện được tạo</CardDescription>
              </CardHeader>
              <CardContent>
                <EventAnalytics />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loại sự kiện</CardTitle>
                <CardDescription>Phân bổ theo thể loại</CardDescription>
              </CardHeader>
              <CardContent>
                <EventTypeAnalytics />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loại sự kiện theo thời gian</CardTitle>
              <CardDescription>Phân tích xu hướng các loại sự kiện qua các tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <EventTypeOverTimeAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='revenue' className='space-y-4'>
          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu tổng</CardTitle>
                <CardDescription>Doanh thu theo tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueAnalytics />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 sự kiện</CardTitle>
                <CardDescription>Sự kiện có lượt xem và bán vé cao nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <TopEventsAnalytics />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='keywords' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Từ khóa tìm kiếm phổ biến</CardTitle>
              <CardDescription>Phân tích các từ khóa hot trend khi người dùng tìm kiếm sự kiện</CardDescription>
            </CardHeader>
            <CardContent>
              <KeywordSearchAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Analytics

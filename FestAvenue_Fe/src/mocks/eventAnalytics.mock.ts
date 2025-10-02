import type { EventAnalytics } from '../types/eventAnalytics.types'

export const mockEventAnalytics: EventAnalytics = {
  summary: {
    eventId: 'evt_001',
    eventName: 'FestAvenue Music Festival 2025',
    eventDate: '2025-12-15',
    totalParticipants: 2450,
    totalRevenue: 487500000, // VND
    totalExpenses: 285000000,
    profit: 202500000,
    totalViews: 45680,
    totalSearches: 18750,
    totalSocialPosts: 8,
    totalSocialEngagement: 45680,
    checkInRate: 87.3,
    popularTicketType: 'VIP',
    peakSalesDate: '2025-11-25',
    // Staff statistics
    totalStaff: 15,
    totalTasks: 156,
    completedTasks: 132,
    lateTasks: 18,
    avgTaskCompletionRate: 84.6
  },

  participants: [
    { date: '2025-10-01', total: 45, checkedIn: 40, notCheckedIn: 5 },
    { date: '2025-10-05', total: 123, checkedIn: 108, notCheckedIn: 15 },
    { date: '2025-10-10', total: 289, checkedIn: 253, notCheckedIn: 36 },
    { date: '2025-10-15', total: 445, checkedIn: 392, notCheckedIn: 53 },
    { date: '2025-10-20', total: 678, checkedIn: 596, notCheckedIn: 82 },
    { date: '2025-10-25', total: 956, checkedIn: 841, notCheckedIn: 115 },
    { date: '2025-11-01', total: 1234, checkedIn: 1086, notCheckedIn: 148 },
    { date: '2025-11-05', total: 1489, checkedIn: 1310, notCheckedIn: 179 },
    { date: '2025-11-10', total: 1723, checkedIn: 1516, notCheckedIn: 207 },
    { date: '2025-11-15', total: 1945, checkedIn: 1711, notCheckedIn: 234 },
    { date: '2025-11-20', total: 2134, checkedIn: 1878, notCheckedIn: 256 },
    { date: '2025-11-25', total: 2356, checkedIn: 2073, notCheckedIn: 283 },
    { date: '2025-11-30', total: 2450, checkedIn: 2156, notCheckedIn: 294 }
  ],

  ticketSales: [
    {
      ticketType: 'Early Bird',
      sold: 450,
      revenue: 67500000,
      color: '#10b981'
    },
    {
      ticketType: 'Standard',
      sold: 1200,
      revenue: 240000000,
      color: '#3b82f6'
    },
    {
      ticketType: 'VIP',
      sold: 600,
      revenue: 150000000,
      color: '#8b5cf6'
    },
    {
      ticketType: 'SVIP',
      sold: 200,
      revenue: 30000000,
      color: '#f59e0b'
    }
  ],

  revenue: [
    { date: '2025-10-01', revenue: 6750000, expenses: 2500000, profit: 4250000 },
    { date: '2025-10-05', revenue: 18450000, expenses: 5000000, profit: 13450000 },
    { date: '2025-10-10', revenue: 43350000, expenses: 12000000, profit: 31350000 },
    { date: '2025-10-15', revenue: 66750000, expenses: 18000000, profit: 48750000 },
    { date: '2025-10-20', revenue: 101700000, expenses: 28000000, profit: 73700000 },
    { date: '2025-10-25', revenue: 143400000, expenses: 42000000, profit: 101400000 },
    { date: '2025-11-01', revenue: 185100000, expenses: 58000000, profit: 127100000 },
    { date: '2025-11-05', revenue: 223350000, expenses: 75000000, profit: 148350000 },
    { date: '2025-11-10', revenue: 258450000, expenses: 95000000, profit: 163450000 },
    { date: '2025-11-15', revenue: 291750000, expenses: 118000000, profit: 173750000 },
    { date: '2025-11-20', revenue: 320100000, expenses: 145000000, profit: 175100000 },
    { date: '2025-11-25', revenue: 353400000, expenses: 178000000, profit: 175400000 },
    { date: '2025-11-30', revenue: 487500000, expenses: 285000000, profit: 202500000 }
  ],

  checkIn: [
    {
      ticketType: 'Early Bird',
      total: 450,
      checkedIn: 423,
      notCheckedIn: 27,
      checkInRate: 94.0
    },
    {
      ticketType: 'Standard',
      total: 1200,
      checkedIn: 1032,
      notCheckedIn: 168,
      checkInRate: 86.0
    },
    {
      ticketType: 'VIP',
      total: 600,
      checkedIn: 537,
      notCheckedIn: 63,
      checkInRate: 89.5
    },
    {
      ticketType: 'SVIP',
      total: 200,
      checkedIn: 164,
      notCheckedIn: 36,
      checkInRate: 82.0
    }
  ],

  eventViews: [
    { date: '2025-09-01', views: 1250, uniqueViews: 980 },
    { date: '2025-09-05', views: 2340, uniqueViews: 1850 },
    { date: '2025-09-10', views: 3450, uniqueViews: 2680 },
    { date: '2025-09-15', views: 4890, uniqueViews: 3720 },
    { date: '2025-09-20', views: 6230, uniqueViews: 4680 },
    { date: '2025-09-25', views: 7560, uniqueViews: 5590 },
    { date: '2025-10-01', views: 9120, uniqueViews: 6720 },
    { date: '2025-10-05', views: 11450, uniqueViews: 8340 },
    { date: '2025-10-10', views: 14230, uniqueViews: 10280 },
    { date: '2025-10-15', views: 17890, uniqueViews: 12850 },
    { date: '2025-10-20', views: 22340, uniqueViews: 15920 },
    { date: '2025-10-25', views: 27560, uniqueViews: 19480 },
    { date: '2025-11-01', views: 33450, uniqueViews: 23560 },
    { date: '2025-11-05', views: 38920, uniqueViews: 27340 },
    { date: '2025-11-10', views: 42780, uniqueViews: 30120 },
    { date: '2025-11-15', views: 45680, uniqueViews: 32450 }
  ],

  keywordSearch: [
    {
      keyword: 'music festival vietnam',
      searchCount: 4850,
      clickCount: 3625,
      conversionRate: 74.7,
      avgPosition: 2.3,
      color: '#3b82f6'
    },
    {
      keyword: 'festavenue 2025',
      searchCount: 3920,
      clickCount: 3450,
      conversionRate: 88.0,
      avgPosition: 1.2,
      color: '#22d3ee'
    },
    {
      keyword: 'lễ hội âm nhạc',
      searchCount: 3250,
      clickCount: 2275,
      conversionRate: 70.0,
      avgPosition: 3.5,
      color: '#10b981'
    },
    {
      keyword: 'concert vietnam',
      searchCount: 2780,
      clickCount: 1945,
      conversionRate: 69.9,
      avgPosition: 4.1,
      color: '#8b5cf6'
    },
    {
      keyword: 'sự kiện âm nhạc',
      searchCount: 2150,
      clickCount: 1505,
      conversionRate: 70.0,
      avgPosition: 3.8,
      color: '#f59e0b'
    },
    {
      keyword: 'festival hà nội',
      searchCount: 1800,
      clickCount: 1260,
      conversionRate: 70.0,
      avgPosition: 5.2,
      color: '#ec4899'
    }
  ],

  socialMediaPosts: [
    {
      postId: 'post_001',
      title: 'Early Bird - Giảm 30% cho 100 vé đầu tiên!',
      content: 'Đừng bỏ lỡ cơ hội sở hữu vé Early Bird với mức giá ưu đãi đặc biệt. Chỉ còn 20 vé cuối cùng!',
      bannerUrl: 'https://example.com/banner1.jpg',
      postedDate: '2025-09-15',
      views: 8920,
      likes: 1245,
      shares: 567,
      comments: 234,
      clicks: 6690,
      clickRate: 75.0,
      color: '#3b82f6'
    },
    {
      postId: 'post_002',
      title: 'Line-up chính thức: 15 nghệ sĩ hàng đầu Việt Nam',
      content: 'Đêm nhạc hoành tráng với sự góp mặt của Sơn Tùng M-TP, Hoàng Thùy Linh, Đen Vâu và nhiều nghệ sĩ khác',
      bannerUrl: 'https://example.com/banner2.jpg',
      postedDate: '2025-10-01',
      views: 12450,
      likes: 2890,
      shares: 1234,
      comments: 567,
      clicks: 9960,
      clickRate: 80.0,
      color: '#22d3ee'
    },
    {
      postId: 'post_003',
      title: 'VIP Experience - Trải nghiệm đẳng cấp',
      content: 'Khu vực VIP sang trọng, dịch vụ bar riêng, view sân khấu tuyệt đẹp. Chỉ 50 vé có sẵn!',
      bannerUrl: 'https://example.com/banner3.jpg',
      postedDate: '2025-10-10',
      views: 6780,
      likes: 1567,
      shares: 432,
      comments: 189,
      clicks: 4746,
      clickRate: 70.0,
      color: '#8b5cf6'
    },
    {
      postId: 'post_004',
      title: 'Flash Sale 24h - Giảm 20% toàn bộ loại vé',
      content: 'Ưu đãi có một không hai! Flash sale chỉ trong 24 giờ. Mua ngay kẻo lỡ!',
      bannerUrl: 'https://example.com/banner4.jpg',
      postedDate: '2025-10-20',
      views: 15600,
      likes: 3456,
      shares: 1890,
      comments: 789,
      clicks: 12480,
      clickRate: 80.0,
      color: '#f59e0b'
    },
    {
      postId: 'post_005',
      title: 'Behind the scenes - Hậu trường chuẩn bị sự kiện',
      content: 'Khám phá hậu trường setup sân khấu hoành tráng cho đêm nhạc. Video độc quyền!',
      bannerUrl: 'https://example.com/banner5.jpg',
      postedDate: '2025-11-01',
      views: 5430,
      likes: 1123,
      shares: 345,
      comments: 156,
      clicks: 3801,
      clickRate: 70.0,
      color: '#10b981'
    },
    {
      postId: 'post_006',
      title: 'Countdown 1 tháng - Đã bán hết 80% vé',
      content: 'Chỉ còn 1 tháng nữa! 80% vé đã được bán hết. Nhanh tay đặt vé ngay!',
      bannerUrl: 'https://example.com/banner6.jpg',
      postedDate: '2025-11-15',
      views: 9870,
      likes: 2234,
      shares: 876,
      comments: 345,
      clicks: 7896,
      clickRate: 80.0,
      color: '#ec4899'
    },
    {
      postId: 'post_007',
      title: 'Food & Beverage - Khu ẩm thực đa dạng',
      content: '20+ gian hàng ẩm thực từ khắp nơi. Thưởng thức món ngon trong khi xem show!',
      bannerUrl: 'https://example.com/banner7.jpg',
      postedDate: '2025-11-25',
      views: 4560,
      likes: 890,
      shares: 234,
      comments: 89,
      clicks: 2736,
      clickRate: 60.0,
      color: '#ef4444'
    },
    {
      postId: 'post_008',
      title: 'Last Call - Chỉ còn 48h để mua vé!',
      content: 'Đây là cơ hội cuối cùng! Chỉ còn vài trăm vé. Đặt ngay trước khi hết!',
      bannerUrl: 'https://example.com/banner8.jpg',
      postedDate: '2025-12-01',
      views: 11200,
      likes: 2890,
      shares: 1456,
      comments: 678,
      clicks: 8960,
      clickRate: 80.0,
      color: '#f43f5e'
    }
  ],

  staffPerformance: [
    {
      staffId: 'staff_001',
      staffName: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?img=1',
      totalTasks: 28,
      completedTasks: 26,
      lateTasks: 1,
      onTimeTasks: 25,
      completionRate: 92.9,
      avgCompletionTime: 18.5,
      performanceScore: 95
    },
    {
      staffId: 'staff_002',
      staffName: 'Trần Thị B',
      avatar: 'https://i.pravatar.cc/150?img=2',
      totalTasks: 24,
      completedTasks: 22,
      lateTasks: 2,
      onTimeTasks: 20,
      completionRate: 91.7,
      avgCompletionTime: 20.3,
      performanceScore: 92
    },
    {
      staffId: 'staff_003',
      staffName: 'Lê Văn C',
      avatar: 'https://i.pravatar.cc/150?img=3',
      totalTasks: 22,
      completedTasks: 21,
      lateTasks: 0,
      onTimeTasks: 21,
      completionRate: 95.5,
      avgCompletionTime: 16.2,
      performanceScore: 98
    },
    {
      staffId: 'staff_004',
      staffName: 'Phạm Thị D',
      avatar: 'https://i.pravatar.cc/150?img=4',
      totalTasks: 20,
      completedTasks: 19,
      lateTasks: 1,
      onTimeTasks: 18,
      completionRate: 95.0,
      avgCompletionTime: 17.8,
      performanceScore: 94
    },
    {
      staffId: 'staff_005',
      staffName: 'Hoàng Văn E',
      avatar: 'https://i.pravatar.cc/150?img=5',
      totalTasks: 18,
      completedTasks: 17,
      lateTasks: 1,
      onTimeTasks: 16,
      completionRate: 94.4,
      avgCompletionTime: 19.1,
      performanceScore: 93
    },
    {
      staffId: 'staff_006',
      staffName: 'Võ Thị F',
      avatar: 'https://i.pravatar.cc/150?img=6',
      totalTasks: 16,
      completedTasks: 14,
      lateTasks: 2,
      onTimeTasks: 12,
      completionRate: 87.5,
      avgCompletionTime: 22.4,
      performanceScore: 85
    },
    {
      staffId: 'staff_007',
      staffName: 'Đặng Văn G',
      avatar: 'https://i.pravatar.cc/150?img=7',
      totalTasks: 15,
      completedTasks: 13,
      lateTasks: 3,
      onTimeTasks: 10,
      completionRate: 86.7,
      avgCompletionTime: 24.6,
      performanceScore: 82
    },
    {
      staffId: 'staff_008',
      staffName: 'Bùi Thị H',
      avatar: 'https://i.pravatar.cc/150?img=8',
      totalTasks: 12,
      completedTasks: 11,
      lateTasks: 1,
      onTimeTasks: 10,
      completionRate: 91.7,
      avgCompletionTime: 19.8,
      performanceScore: 90
    },
    {
      staffId: 'staff_009',
      staffName: 'Dương Văn I',
      avatar: 'https://i.pravatar.cc/150?img=9',
      totalTasks: 10,
      completedTasks: 8,
      lateTasks: 2,
      onTimeTasks: 6,
      completionRate: 80.0,
      avgCompletionTime: 26.3,
      performanceScore: 75
    },
    {
      staffId: 'staff_010',
      staffName: 'Phan Thị K',
      avatar: 'https://i.pravatar.cc/150?img=10',
      totalTasks: 8,
      completedTasks: 7,
      lateTasks: 1,
      onTimeTasks: 6,
      completionRate: 87.5,
      avgCompletionTime: 21.5,
      performanceScore: 86
    },
    {
      staffId: 'staff_011',
      staffName: 'Lý Văn L',
      avatar: 'https://i.pravatar.cc/150?img=11',
      totalTasks: 9,
      completedTasks: 7,
      lateTasks: 2,
      onTimeTasks: 5,
      completionRate: 77.8,
      avgCompletionTime: 27.8,
      performanceScore: 72
    },
    {
      staffId: 'staff_012',
      staffName: 'Trương Thị M',
      avatar: 'https://i.pravatar.cc/150?img=12',
      totalTasks: 7,
      completedTasks: 6,
      lateTasks: 1,
      onTimeTasks: 5,
      completionRate: 85.7,
      avgCompletionTime: 23.2,
      performanceScore: 83
    },
    {
      staffId: 'staff_013',
      staffName: 'Vũ Văn N',
      avatar: 'https://i.pravatar.cc/150?img=13',
      totalTasks: 6,
      completedTasks: 5,
      lateTasks: 1,
      onTimeTasks: 4,
      completionRate: 83.3,
      avgCompletionTime: 24.1,
      performanceScore: 81
    },
    {
      staffId: 'staff_014',
      staffName: 'Hồ Thị O',
      avatar: 'https://i.pravatar.cc/150?img=14',
      totalTasks: 5,
      completedTasks: 4,
      lateTasks: 1,
      onTimeTasks: 3,
      completionRate: 80.0,
      avgCompletionTime: 25.6,
      performanceScore: 78
    },
    {
      staffId: 'staff_015',
      staffName: 'Mai Văn P',
      avatar: 'https://i.pravatar.cc/150?img=15',
      totalTasks: 6,
      completedTasks: 4,
      lateTasks: 2,
      onTimeTasks: 2,
      completionRate: 66.7,
      avgCompletionTime: 30.2,
      performanceScore: 65
    }
  ],

  taskStatus: [
    { date: '2025-11-01', completed: 8, late: 1, pending: 5, inProgress: 3 },
    { date: '2025-11-05', completed: 15, late: 2, pending: 8, inProgress: 6 },
    { date: '2025-11-10', completed: 28, late: 3, pending: 12, inProgress: 8 },
    { date: '2025-11-15', completed: 45, late: 5, pending: 15, inProgress: 10 },
    { date: '2025-11-20', completed: 67, late: 8, pending: 18, inProgress: 12 },
    { date: '2025-11-25', completed: 92, late: 12, pending: 20, inProgress: 14 },
    { date: '2025-11-30', completed: 118, late: 15, pending: 22, inProgress: 8 },
    { date: '2025-12-05', completed: 132, late: 18, pending: 20, inProgress: 6 }
  ],

  staffRanking: [
    {
      rank: 1,
      staff: {
        staffId: 'staff_003',
        staffName: 'Lê Văn C',
        avatar: 'https://i.pravatar.cc/150?img=3',
        totalTasks: 22,
        completedTasks: 21,
        lateTasks: 0,
        onTimeTasks: 21,
        completionRate: 95.5,
        avgCompletionTime: 16.2,
        performanceScore: 98
      },
      change: 0 // No change
    },
    {
      rank: 2,
      staff: {
        staffId: 'staff_001',
        staffName: 'Nguyễn Văn A',
        avatar: 'https://i.pravatar.cc/150?img=1',
        totalTasks: 28,
        completedTasks: 26,
        lateTasks: 1,
        onTimeTasks: 25,
        completionRate: 92.9,
        avgCompletionTime: 18.5,
        performanceScore: 95
      },
      change: 1 // Up 1 position
    },
    {
      rank: 3,
      staff: {
        staffId: 'staff_004',
        staffName: 'Phạm Thị D',
        avatar: 'https://i.pravatar.cc/150?img=4',
        totalTasks: 20,
        completedTasks: 19,
        lateTasks: 1,
        onTimeTasks: 18,
        completionRate: 95.0,
        avgCompletionTime: 17.8,
        performanceScore: 94
      },
      change: -1 // Down 1 position
    },
    {
      rank: 4,
      staff: {
        staffId: 'staff_005',
        staffName: 'Hoàng Văn E',
        avatar: 'https://i.pravatar.cc/150?img=5',
        totalTasks: 18,
        completedTasks: 17,
        lateTasks: 1,
        onTimeTasks: 16,
        completionRate: 94.4,
        avgCompletionTime: 19.1,
        performanceScore: 93
      },
      change: 2 // Up 2 positions
    },
    {
      rank: 5,
      staff: {
        staffId: 'staff_002',
        staffName: 'Trần Thị B',
        avatar: 'https://i.pravatar.cc/150?img=2',
        totalTasks: 24,
        completedTasks: 22,
        lateTasks: 2,
        onTimeTasks: 20,
        completionRate: 91.7,
        avgCompletionTime: 20.3,
        performanceScore: 92
      },
      change: -1 // Down 1 position
    }
  ]
}

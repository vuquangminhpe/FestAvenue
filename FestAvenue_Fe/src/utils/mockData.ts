// Mock data for admin analytics and account management

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'organizer' | 'staff' | 'user'
  status: 'active' | 'banned' | 'pending'
  createdAt: string
  lastLogin?: string
  avatar?: string
}

export interface AnalyticsData {
  date: string
  value: number
  label?: string
}

export interface EventTypeData {
  type: string
  count: number
  percentage: number
}

export interface TopEventData {
  id: string
  name: string
  views: number
  tickets: number
  revenue: number
}

export interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  isOnline: boolean
  lastActive: string
  avatar?: string
}

// Mock users data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'organizer',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-03-20',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-10',
    lastLogin: '2024-03-21',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
  },
  {
    id: '3',
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    role: 'staff',
    status: 'banned',
    createdAt: '2024-01-20',
    lastLogin: '2024-03-10',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3'
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-03-01',
    lastLogin: '2024-03-22',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4'
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    role: 'organizer',
    status: 'pending',
    createdAt: '2024-03-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5'
  }
]

// Mock registered users over time
export const mockRegisteredUsers: AnalyticsData[] = [
  { date: '2024-01', value: 120 },
  { date: '2024-02', value: 250 },
  { date: '2024-03', value: 380 },
  { date: '2024-04', value: 520 },
  { date: '2024-05', value: 680 },
  { date: '2024-06', value: 850 },
  { date: '2024-07', value: 1020 },
  { date: '2024-08', value: 1200 },
  { date: '2024-09', value: 1350 },
  { date: '2024-10', value: 1500 }
]

// Mock events created over time
export const mockEventsData: AnalyticsData[] = [
  { date: '2024-01', value: 15 },
  { date: '2024-02', value: 28 },
  { date: '2024-03', value: 42 },
  { date: '2024-04', value: 55 },
  { date: '2024-05', value: 68 },
  { date: '2024-06', value: 82 },
  { date: '2024-07', value: 95 },
  { date: '2024-08', value: 110 },
  { date: '2024-09', value: 125 },
  { date: '2024-10', value: 140 }
]

// Mock ticket sales
export const mockTicketSales: AnalyticsData[] = [
  { date: '2024-01', value: 450 },
  { date: '2024-02', value: 680 },
  { date: '2024-03', value: 920 },
  { date: '2024-04', value: 1200 },
  { date: '2024-05', value: 1550 },
  { date: '2024-06', value: 1800 },
  { date: '2024-07', value: 2100 },
  { date: '2024-08', value: 2450 },
  { date: '2024-09', value: 2800 },
  { date: '2024-10', value: 3200 }
]

// Mock revenue data
export const mockRevenueData: AnalyticsData[] = [
  { date: '2024-01', value: 45000000 },
  { date: '2024-02', value: 68000000 },
  { date: '2024-03', value: 92000000 },
  { date: '2024-04', value: 120000000 },
  { date: '2024-05', value: 155000000 },
  { date: '2024-06', value: 180000000 },
  { date: '2024-07', value: 210000000 },
  { date: '2024-08', value: 245000000 },
  { date: '2024-09', value: 280000000 },
  { date: '2024-10', value: 320000000 }
]

// Mock employee data
export const mockEmployeeData: AnalyticsData[] = [
  { date: '2024-01', value: 25, label: 'Total: 25, Online: 18' },
  { date: '2024-02', value: 28, label: 'Total: 28, Online: 20' },
  { date: '2024-03', value: 32, label: 'Total: 32, Online: 24' },
  { date: '2024-04', value: 35, label: 'Total: 35, Online: 27' },
  { date: '2024-05', value: 38, label: 'Total: 38, Online: 30' },
  { date: '2024-06', value: 42, label: 'Total: 42, Online: 33' },
  { date: '2024-07', value: 45, label: 'Total: 45, Online: 36' },
  { date: '2024-08', value: 48, label: 'Total: 48, Online: 38' },
  { date: '2024-09', value: 50, label: 'Total: 50, Online: 40' },
  { date: '2024-10', value: 52, label: 'Total: 52, Online: 42' }
]

// Mock event types
export const mockEventTypes: EventTypeData[] = [
  { type: 'Âm nhạc', count: 45, percentage: 32 },
  { type: 'Hội thảo', count: 38, percentage: 27 },
  { type: 'Triển lãm', count: 28, percentage: 20 },
  { type: 'Thể thao', count: 18, percentage: 13 },
  { type: 'Khác', count: 11, percentage: 8 }
]

// Mock top events
export const mockTopEvents: TopEventData[] = [
  {
    id: '1',
    name: 'Summer Music Festival 2024',
    views: 15420,
    tickets: 3200,
    revenue: 320000000
  },
  {
    id: '2',
    name: 'Tech Conference Vietnam',
    views: 12800,
    tickets: 2850,
    revenue: 285000000
  },
  {
    id: '3',
    name: 'Art Exhibition Hanoi',
    views: 10500,
    tickets: 2100,
    revenue: 210000000
  },
  {
    id: '4',
    name: 'Food & Wine Festival',
    views: 9800,
    tickets: 1950,
    revenue: 195000000
  },
  {
    id: '5',
    name: 'Marathon Saigon 2024',
    views: 8500,
    tickets: 1700,
    revenue: 170000000
  }
]

// Mock keyword search data
export const mockKeywordSearch: AnalyticsData[] = [
  { date: 'âm nhạc', value: 2500 },
  { date: 'hội thảo', value: 1800 },
  { date: 'festival', value: 1500 },
  { date: 'concert', value: 1200 },
  { date: 'triển lãm', value: 950 },
  { date: 'workshop', value: 800 },
  { date: 'thể thao', value: 650 },
  { date: 'food', value: 500 }
]

// Mock staff members data
export const mockStaffMembers: StaffMember[] = [
  {
    id: 's1',
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@staff.com',
    role: 'Staff',
    isOnline: true,
    lastActive: '2024-10-01T10:30:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=s1'
  },
  {
    id: 's2',
    name: 'Trần Thị Bình',
    email: 'tranthibinh@staff.com',
    role: 'Staff',
    isOnline: true,
    lastActive: '2024-10-01T10:25:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=s2'
  },
  {
    id: 's3',
    name: 'Lê Văn Cường',
    email: 'levancuong@staff.com',
    role: 'Staff',
    isOnline: false,
    lastActive: '2024-10-01T09:00:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=s3'
  },
  {
    id: 's4',
    name: 'Phạm Thị Dung',
    email: 'phamthidung@staff.com',
    role: 'Staff',
    isOnline: true,
    lastActive: '2024-10-01T10:28:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=s4'
  },
  {
    id: 's5',
    name: 'Hoàng Văn Em',
    email: 'hoangvanem@staff.com',
    role: 'Staff',
    isOnline: true,
    lastActive: '2024-10-01T10:20:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=s5'
  },
  {
    id: 's6',
    name: 'Vũ Thị Phương',
    email: 'vuthiphuong@staff.com',
    role: 'Staff',
    isOnline: false,
    lastActive: '2024-10-01T08:45:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=s6'
  },
  {
    id: 's7',
    name: 'Đỗ Văn Giang',
    email: 'dovangiang@staff.com',
    role: 'Staff',
    isOnline: true,
    lastActive: '2024-10-01T10:32:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=s7'
  },
  {
    id: 's8',
    name: 'Bùi Thị Hà',
    email: 'buithiha@staff.com',
    role: 'Staff',
    isOnline: false,
    lastActive: '2024-10-01T07:30:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=s8'
  },
  {
    id: 's9',
    name: 'Ngô Văn Hùng',
    email: 'ngovanhung@staff.com',
    role: 'Staff',
    isOnline: true,
    lastActive: '2024-10-01T10:15:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=s9'
  },
  {
    id: 's10',
    name: 'Đinh Thị Lan',
    email: 'dinhthilan@staff.com',
    role: 'Staff',
    isOnline: true,
    lastActive: '2024-10-01T10:22:00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=s10'
  }
]

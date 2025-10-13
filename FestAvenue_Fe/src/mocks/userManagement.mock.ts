import type { EventUser, RoleOption, PermissionOption } from '@/types/userManagement.types'

export type { EventUser } from '@/types/userManagement.types'

export const mockEventUsers: EventUser[] = [
  {
    id: '1',
    firstName: 'Hùng',
    lastName: 'Trần',
    email: 'tranhung@gmail.com',
    phoneNumber: '0973447743',
    role: 'Social manager',
    joinDate: '2024-01-15',
    status: 'active',
    permissions: ['manage_social_media', 'view_analytics']
  },
  {
    id: '2',
    firstName: 'Mai',
    lastName: 'Nguyễn',
    email: 'mainguyen@gmail.com',
    phoneNumber: '0912345678',
    role: 'Ticket manager',
    joinDate: '2024-02-20',
    status: 'active',
    permissions: ['manage_tickets', 'view_sales']
  },
  {
    id: '3',
    firstName: 'Tuấn',
    lastName: 'Lê',
    email: 'tuanle@gmail.com',
    phoneNumber: '0923456789',
    role: 'Task manager',
    joinDate: '2024-03-10',
    status: 'active',
    permissions: ['manage_tasks', 'assign_staff']
  },
  {
    id: '4',
    firstName: 'Linh',
    lastName: 'Phạm',
    email: 'linhpham@gmail.com',
    phoneNumber: '0934567890',
    role: 'Schedule manager',
    joinDate: '2024-03-25',
    status: 'active',
    permissions: ['manage_schedule', 'view_calendar']
  },
  {
    id: '5',
    firstName: 'Minh',
    lastName: 'Hoàng',
    email: 'minhhoang@gmail.com',
    phoneNumber: '0945678901',
    role: 'None',
    joinDate: '2024-04-05',
    status: 'active',
    permissions: ['view_event']
  },
  {
    id: '6',
    firstName: 'Anh',
    lastName: 'Vũ',
    email: 'anhvu@gmail.com',
    phoneNumber: '0956789012',
    role: 'None',
    joinDate: '2024-04-12',
    status: 'inactive',
    permissions: ['view_event']
  }
]

export const roleOptions: RoleOption[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'None', label: 'None' },
  { value: 'Ticket manager', label: 'Ticket manager' },
  { value: 'Task manager', label: 'Task manager' },
  { value: 'Social manager', label: 'Social manager' },
  { value: 'Schedule manager', label: 'Schedule manager' }
]

export const permissionOptions: PermissionOption[] = [
  { value: 'manage_social_media', label: 'Quản lý mạng xã hội' },
  { value: 'view_analytics', label: 'Xem thống kê' },
  { value: 'manage_tickets', label: 'Quản lý vé' },
  { value: 'view_sales', label: 'Xem doanh thu' },
  { value: 'manage_tasks', label: 'Quản lý công việc' },
  { value: 'assign_staff', label: 'Phân công nhân viên' },
  { value: 'manage_schedule', label: 'Quản lý lịch trình' },
  { value: 'view_calendar', label: 'Xem lịch' },
  { value: 'view_event', label: 'Xem sự kiện' }
]

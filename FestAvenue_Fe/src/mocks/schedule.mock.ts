import type { Schedule } from '../types/schedule.types'

export const mockSchedules: Schedule[] = [
  {
    id: '1',
    title: 'Họp kick-off dự án FestAvenue',
    description: 'Cuộc họp đầu tiên để bàn về kế hoạch phát triển và phân công nhiệm vụ',
    startDate: '2025-10-05T09:00:00',
    endDate: '2025-10-05T11:00:00',
    color: '#3b82f6',
    isNotified: false,
    subTasks: [
      {
        id: 'st1',
        title: 'Chuẩn bị tài liệu requirements',
        description: 'Thu thập và tổng hợp yêu cầu từ stakeholders',
        isCompleted: true,
        assigneeId: 'user_1',
        assigneeName: 'Nguyễn Văn A',
        startDate: '2025-10-03T08:00:00',
        endDate: '2025-10-04T18:00:00',
        dailyTimeSlots: [
          { date: '2025-10-03', startTime: '08:00', endTime: '12:00' },
          { date: '2025-10-04', startTime: '13:00', endTime: '18:00' }
        ],
        completedAt: '2025-09-30T14:30:00',
        createdAt: '2025-09-28T10:00:00',
        updatedAt: '2025-09-30T14:30:00'
      },
      {
        id: 'st2',
        title: 'Chuẩn bị slides thuyết trình',
        description: 'Làm slide giới thiệu về dự án và timeline',
        isCompleted: false,
        assigneeId: 'user_2',
        assigneeName: 'Trần Thị B',
        startDate: '2025-10-04T08:00:00',
        endDate: '2025-10-05T11:00:00',
        dailyTimeSlots: [
          { date: '2025-10-04', startTime: '14:00', endTime: '18:00' },
          { date: '2025-10-05', startTime: '08:00', endTime: '11:00' }
        ],
        createdAt: '2025-09-28T10:00:00',
        updatedAt: '2025-09-28T10:00:00'
      },
      {
        id: 'st3',
        title: 'Book phòng họp',
        description: 'Đặt phòng họp cho 15 người',
        isCompleted: true,
        assigneeId: 'user_3',
        assigneeName: 'Lê Văn C',
        startDate: '2025-10-05T09:00:00',
        endDate: '2025-10-05T11:00:00',
        completedAt: '2025-09-29T16:00:00',
        createdAt: '2025-09-28T10:00:00',
        updatedAt: '2025-09-29T16:00:00'
      }
    ],
    createdAt: '2025-09-28T10:00:00',
    updatedAt: '2025-09-30T14:30:00'
  },
  {
    id: '2',
    title: 'Hôm nay hoàn thành UI Dashboard',
    description: 'Deadline cuối cùng cho phần giao diện dashboard admin',
    startDate: '2025-10-01T08:00:00',
    endDate: '2025-10-01T18:00:00',
    color: '#ef4444',
    isNotified: true,
    subTasks: [
      {
        id: 'st4',
        title: 'Design responsive layout',
        isCompleted: true,
        createdAt: '2025-09-25T09:00:00',
        updatedAt: '2025-09-27T11:00:00'
      },
      {
        id: 'st5',
        title: 'Implement charts với recharts',
        isCompleted: true,
        createdAt: '2025-09-25T09:00:00',
        updatedAt: '2025-09-28T15:00:00'
      },
      {
        id: 'st6',
        title: 'Testing và fix bugs',
        isCompleted: false,
        createdAt: '2025-09-25T09:00:00',
        updatedAt: '2025-09-25T09:00:00'
      }
    ],
    createdAt: '2025-09-25T09:00:00',
    updatedAt: '2025-09-28T15:00:00'
  },
  {
    id: '3',
    title: 'Review code Sprint 3',
    description: 'Code review cho các features hoàn thành trong sprint 3',
    startDate: '2025-10-08T14:00:00',
    endDate: '2025-10-08T16:00:00',
    color: '#8b5cf6',
    isNotified: false,
    subTasks: [
      {
        id: 'st7',
        title: 'Review authentication module',
        isCompleted: false,
        createdAt: '2025-10-01T10:00:00',
        updatedAt: '2025-10-01T10:00:00'
      },
      {
        id: 'st8',
        title: 'Review payment integration',
        isCompleted: false,
        createdAt: '2025-10-01T10:00:00',
        updatedAt: '2025-10-01T10:00:00'
      }
    ],
    createdAt: '2025-10-01T10:00:00',
    updatedAt: '2025-10-01T10:00:00'
  },
  {
    id: '4',
    title: 'Workshop: GSAP Animation',
    description: 'Buổi training về GSAP cho team frontend',
    startDate: '2025-10-15T13:00:00',
    endDate: '2025-10-15T17:00:00',
    color: '#10b981',
    isNotified: false,
    subTasks: [
      {
        id: 'st9',
        title: 'Chuẩn bị demo examples',
        isCompleted: false,
        createdAt: '2025-10-01T11:00:00',
        updatedAt: '2025-10-01T11:00:00'
      },
      {
        id: 'st10',
        title: 'Setup môi trường cho attendees',
        isCompleted: false,
        createdAt: '2025-10-01T11:00:00',
        updatedAt: '2025-10-01T11:00:00'
      },
      {
        id: 'st11',
        title: 'Chuẩn bị tài liệu tham khảo',
        isCompleted: false,
        createdAt: '2025-10-01T11:00:00',
        updatedAt: '2025-10-01T11:00:00'
      }
    ],
    createdAt: '2025-10-01T11:00:00',
    updatedAt: '2025-10-01T11:00:00'
  },
  {
    id: '5',
    title: 'Deploy Production v2.0',
    description: 'Release version 2.0 lên production',
    startDate: '2025-10-20T22:00:00',
    endDate: '2025-10-21T02:00:00',
    color: '#f59e0b',
    isNotified: false,
    subTasks: [
      {
        id: 'st12',
        title: 'Backup database',
        isCompleted: false,
        createdAt: '2025-10-01T12:00:00',
        updatedAt: '2025-10-01T12:00:00'
      },
      {
        id: 'st13',
        title: 'Run migration scripts',
        isCompleted: false,
        createdAt: '2025-10-01T12:00:00',
        updatedAt: '2025-10-01T12:00:00'
      },
      {
        id: 'st14',
        title: 'Deploy frontend',
        isCompleted: false,
        createdAt: '2025-10-01T12:00:00',
        updatedAt: '2025-10-01T12:00:00'
      },
      {
        id: 'st15',
        title: 'Deploy backend',
        isCompleted: false,
        createdAt: '2025-10-01T12:00:00',
        updatedAt: '2025-10-01T12:00:00'
      },
      {
        id: 'st16',
        title: 'Smoke testing',
        isCompleted: false,
        createdAt: '2025-10-01T12:00:00',
        updatedAt: '2025-10-01T12:00:00'
      }
    ],
    createdAt: '2025-10-01T12:00:00',
    updatedAt: '2025-10-01T12:00:00'
  },
  {
    id: '6',
    title: 'Hôm nay meeting với client',
    description: 'Demo features mới cho client và thu thập feedback',
    startDate: '2025-10-01T10:00:00',
    endDate: '2025-10-01T11:30:00',
    color: '#ec4899',
    isNotified: true,
    subTasks: [
      {
        id: 'st17',
        title: 'Chuẩn bị demo environment',
        isCompleted: true,
        createdAt: '2025-09-30T14:00:00',
        updatedAt: '2025-09-30T16:00:00'
      },
      {
        id: 'st18',
        title: 'Test các features sẽ demo',
        isCompleted: true,
        createdAt: '2025-09-30T14:00:00',
        updatedAt: '2025-09-30T17:30:00'
      }
    ],
    createdAt: '2025-09-30T14:00:00',
    updatedAt: '2025-09-30T17:30:00'
  },
  {
    id: '7',
    title: 'Sprint Planning Meeting',
    description: 'Lên kế hoạch cho Sprint 4',
    startDate: '2025-10-07T09:00:00',
    endDate: '2025-10-07T12:00:00',
    color: '#06b6d4',
    isNotified: false,
    subTasks: [
      {
        id: 'st19',
        title: 'Review backlog',
        isCompleted: false,
        createdAt: '2025-10-01T13:00:00',
        updatedAt: '2025-10-01T13:00:00'
      },
      {
        id: 'st20',
        title: 'Estimate story points',
        isCompleted: false,
        createdAt: '2025-10-01T13:00:00',
        updatedAt: '2025-10-01T13:00:00'
      },
      {
        id: 'st21',
        title: 'Assign tasks',
        isCompleted: false,
        createdAt: '2025-10-01T13:00:00',
        updatedAt: '2025-10-01T13:00:00'
      }
    ],
    createdAt: '2025-10-01T13:00:00',
    updatedAt: '2025-10-01T13:00:00'
  },
  {
    id: '8',
    title: 'Tối nay code review với team',
    description: 'Review các PR đang pending',
    startDate: '2025-10-01T19:00:00',
    endDate: '2025-10-01T20:30:00',
    color: '#6366f1',
    isNotified: true,
    subTasks: [
      {
        id: 'st22',
        title: 'Review PR #123 - Schedule feature',
        isCompleted: false,
        createdAt: '2025-10-01T14:00:00',
        updatedAt: '2025-10-01T14:00:00'
      },
      {
        id: 'st23',
        title: 'Review PR #124 - Payment integration',
        isCompleted: false,
        createdAt: '2025-10-01T14:00:00',
        updatedAt: '2025-10-01T14:00:00'
      }
    ],
    createdAt: '2025-10-01T14:00:00',
    updatedAt: '2025-10-01T14:00:00'
  }
]

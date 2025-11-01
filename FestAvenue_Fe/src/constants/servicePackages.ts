/**
 * Service Package Names
 * Sử dụng exact name để tránh conflict khi backend thay đổi tên package
 */
export const SERVICE_PACKAGE_NAMES = {
  SOCIAL_MEDIA: 'Quản lý social medias',
  USER_MANAGEMENT: 'Quản lý thành viên',
  TICKET: 'Quản lý vé',
  ANALYTICS: 'Thống kê',
  EVENT_MANAGEMENT: 'Quản lý sự kiện',
  SCHEDULE: 'Quản lý lịch trình'
} as const

export type ServicePackageName = (typeof SERVICE_PACKAGE_NAMES)[keyof typeof SERVICE_PACKAGE_NAMES]

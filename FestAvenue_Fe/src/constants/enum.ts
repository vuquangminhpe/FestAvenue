export const SubDescriptionStatus = {
  Active: 1,
  Inactive: 0,
  Paymented: 2,
  Draft: 3
} as const

export type SubDescriptionStatus = (typeof SubDescriptionStatus)[keyof typeof SubDescriptionStatus]
// EventType
export const EventType = {
  Normal: 0,
  Hybrid: 1
} as const

export type EventType = (typeof EventType)[keyof typeof EventType]

// EventStatus
export const EventStatus = {
  /** Sự kiện khi save */
  Draft: 0,
  /** Sự kiện có thể tạo thành công hoặc đã thanh toán cho sự kiện này rồi */
  Active: 1,
  /** Sự kiện có vấn đề cần đánh dấu ngừng hoạt động */
  Inactive: 2,
  /** Sự kiện đã kết thúc */
  Ended: 3,
  /** Sự kiện đã hủy */
  Canceled: 4,
  /** Sự kiện phát hiện 1 số vấn đề, cần chuyển sang chờ duyệt */
  Pending: 5,
  /** Sự kiện đã bị từ chối */
  Rejected: 6,
  /** Sự kiện đang chờ thanh toán */
  WaitingForPayment: 7
} as const

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]

// EventVisibility
export const EventVisibility = {
  Public: 0,
  Private: 1
} as const

export type EventVisibility = (typeof EventVisibility)[keyof typeof EventVisibility]

// VirtualPlatformType
export const VirtualPlatformType = {
  Custom: 0,
  Zoom: 1,
  MicrosoftTeams: 2,
  GoogleMeet: 3
} as const

export type VirtualPlatformType = (typeof VirtualPlatformType)[keyof typeof VirtualPlatformType]

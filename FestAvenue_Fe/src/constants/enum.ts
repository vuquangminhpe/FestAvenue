export const SubDescriptionStatus = {
  Active: 1,
  Inactive: 0,
  Paymented: 2,
  Draft: 3
} as const

export type SubDescriptionStatus = (typeof SubDescriptionStatus)[keyof typeof SubDescriptionStatus]

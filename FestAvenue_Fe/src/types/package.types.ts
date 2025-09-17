export interface getPackageByStatusRes {
  name: string
  type: string
  price: number
  durationMonth: number
  features: string[]
  isActive: false
  id: string
  createdAt: string
  updatedAt: string
}
export interface bodyCreatePackage {
  name: string
  type: string
  price: number
  durationMonth: number
  features: string[]
  isActive: boolean
}
export interface bodyUpdatePackage {
  id: string
  isActive: boolean
}

export interface Service {
  id: string | null
  index: number
  name: string
  description: string
  icon: string
  price: number
  isActive: boolean
}

export interface Module {
  id: string
  name: string
  description: string
  icon: string
  totalPrice: number
  isActive: boolean
  isModuleDefault: boolean
  services: Service[]
  createdAt: string
  updatedAt: string | null
}

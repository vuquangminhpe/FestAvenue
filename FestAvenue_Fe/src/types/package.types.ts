export interface ServicePackage {
  id: string
  name: string
  description: string | null
  icon: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}
export interface Package {
  id: string
  name: string
  description: string | null
  totalPrice: number
  isActive: boolean
  priority: number
  servicePackages: ServicePackage[]
}
export interface PackageCreateOrUpdate {
  id?: string
  name: string
  description: string
  totalPrice: number
  isActive: boolean
  priority: number
  servicePackageIds: string[]
}
export interface bodyUpdateStatusPackage {
  isActive: boolean
  id: string
}
export interface bodyCreateServicesPackage {
  name: string
  description: string
  icon: string
  price: number
  isActive: boolean
}

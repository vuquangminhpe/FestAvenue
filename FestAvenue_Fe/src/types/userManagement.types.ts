export interface EventUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: 'None' | 'Ticket manager' | 'Task manager' | 'Social manager' | 'Schedule manager'
  joinDate: string
  status: 'active' | 'inactive'
  avatar?: string
  permissions: string[]
}

export interface RoleOption {
  value: string
  label: string
}

export interface PermissionOption {
  value: string
  label: string
}

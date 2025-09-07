export interface responseUser {
  name: string
}

export interface bodyLoginType {
  email: string
  password: string
}
export interface loginResponse {
  accessToken: string
}

export interface bodyRegisterType {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

export interface registerResponse {
  messages: string
}
export interface updateBodyProfile {
  profileImage?: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
}
export interface updatePasswordBody {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}
export interface bodyResetPassword {
  token: string
  newPassword: string
}
export interface userRes {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  roles: [string]
  avatar: string
  status: number
  lastLogin: string
  twoFactorEnabled: boolean
  organization: string
  preferences: {
    language: string
    timezone: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  createdBy: string
}

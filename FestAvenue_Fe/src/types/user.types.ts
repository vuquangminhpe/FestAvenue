export interface responseUser {
  name: string
}
export interface UserProfileResponse {
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
}
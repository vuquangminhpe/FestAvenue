import type { APIResponse } from '@/types/API.types'
import type { bodyLoginType, loginResponse, bodyRegisterType, registerResponse } from '@/types/user.types'
import http from '@/utils/http'

const userApi = {
  login_normal: async (body: bodyLoginType) => {
    const data = await http.post<APIResponse<loginResponse>>('/login/login-normal', body)
    return data?.data
  },
  register: async (body: bodyRegisterType) => {
    const data = await http.post<APIResponse<registerResponse>>('/register/register-account', body)
    return data?.data
  },
  register_verify: async (token: string) => {
    const data = await http.get<APIResponse<registerResponse>>(`/register/verify-account?token=${token}`)
    return data?.data
  }
}
export default userApi

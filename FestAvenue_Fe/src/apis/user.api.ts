import type { APIResponse } from '@/types/API.types'
import type { bodyLoginType, loginResponse } from '@/types/user.types'
import http from '@/utils/http'

const userApi = {
  login_normal: async (body: bodyLoginType) => {
    const data = await http.post<APIResponse<loginResponse>>('/login/login-normal', body)
    return data?.data
  }
}
export default userApi

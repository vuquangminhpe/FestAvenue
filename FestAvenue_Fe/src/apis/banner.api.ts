import type { APIResponse } from '@/types/API.types'
import type { Banner } from '@/types/banner.types'
import http from '@/utils/http'

const bannerApis = {
  getBannerSliderHomeActive: async () => {
    const data = await http.get<APIResponse<Banner[]>>('/banner-slider-home/active')
    return data?.data
  }
}
export default bannerApis

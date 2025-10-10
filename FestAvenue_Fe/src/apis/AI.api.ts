import type { AIDetectRes } from '@/types/AI.types'
import type { APIResponse } from '@/types/API.types'
import http from '@/utils/http'

const AIApis = {
  detectImageWithAI: async (file: File) => {
    const formdata = new FormData()
    formdata.append('file', file)
    const data = await http.post<APIResponse<AIDetectRes>>(
      'https://haiss123-kfvideodt.hf.space/detect/image',
      formdata,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return data?.data
  },
  detectVideoWithAI: async (file: File) => {
    const formdata = new FormData()
    formdata.append('file', file)
    const data = await http.post<APIResponse<AIDetectRes>>(
      'https://haiss123-kfvideodt.hf.space/detect/video',
      formdata,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return data?.data
  }
}
export default AIApis

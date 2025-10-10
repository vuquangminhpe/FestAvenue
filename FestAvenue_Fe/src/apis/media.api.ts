import type { APIResponse } from '@/types/API.types'
import type { MediaTypeUploadVideoRes } from '@/types/media.types'
import http from '@/utils/http'

const mediaApis = {
  uploadVideo720P: async (file: File) => {
    const formdata = new FormData()
    formdata.append('file', file)
    const data = await http.post<APIResponse<MediaTypeUploadVideoRes>>('/storage/upload-video-720p', formdata, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  }
}
export default mediaApis

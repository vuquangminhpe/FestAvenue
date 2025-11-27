import type { AIDetectRes } from '@/types/AI.types'
import type {
  APIResponse,
  bodyEventChatBot,
  bodyGenerateTags,
  bodyModerateContent,
  resChatBot,
  resChatBotHistory,
  resGenerateTags,
  resModerateContent
} from '@/types/API.types'
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
  },
  generateTagsInEvent: async (body: bodyGenerateTags) => {
    const data = await http.post<resGenerateTags>(
      'https://minh9972t12-autoGenerateTags.hf.space/generate-hashtags',
      body
    )
    return data?.data
  },
  moderateContentInEvent: async (body: bodyModerateContent) => {
    const data = await http.post<resModerateContent>(
      'https://minh9972t12-ModerateContent.hf.space/validate-content',
      body
    )
    return data
  },
  eventChatBot: async (body: bodyEventChatBot) => {
    const data = await http.post<resChatBot>('https://minhvtt-ChatbotRAG.hf.space/chat', body)
    return data
  },
  getHistoryChatBySessionId: async (session_id: string) => {
    const data = await http.get<resChatBotHistory>(`https://minhvtt-ChatbotRAG.hf.space/chat/history/${session_id}`)
    return data
  },
  deleteHistoryChatBySessionId: async (session_id: string) => {
    const data = await http.get<APIResponse<{ message: string }>>(
      `https://minhvtt-ChatbotRAG.hf.space/chat/clear-session?session_id=${session_id}`
    )
    return data
  }
}
export default AIApis

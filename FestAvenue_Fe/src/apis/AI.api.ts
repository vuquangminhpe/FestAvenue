import type { AIDetectRes } from '@/types/AI.types'
import type {
  APIResponse,
  bodyEventChatBot,
  bodyGenerateTags,
  bodyModerateContent,
  resChatBot,
  resChatBotHistory,
  resGenerateTags,
  resModerateContent,
  ScenariosResponse,
  StartScenarioBody,
  StartScenarioResponse,
  SessionInfo,
  SessionsListResponse
} from '@/types/API.types'
import http from '@/utils/http'

const CHATBOT_BASE_URL = 'https://minhvtt-ChatbotRAG.hf.space'

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

  // ========== Chat APIs ==========

  // Regular chat (non-streaming)
  eventChatBot: async (body: bodyEventChatBot) => {
    const data = await http.post<resChatBot>(`${CHATBOT_BASE_URL}/chat`, body)
    return data
  },

  // Streaming chat with SSE - returns ReadableStream
  eventChatBotStream: async (body: bodyEventChatBot): Promise<Response> => {
    const response = await fetch(`${CHATBOT_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    return response
  },

  // ========== Session Management ==========

  getHistoryChatBySessionId: async (session_id: string, include_metadata = true) => {
    const data = await http.get<resChatBotHistory>(
      `${CHATBOT_BASE_URL}/chat/history/${session_id}?include_metadata=${include_metadata}`
    )
    return data
  },

  deleteHistoryChatBySessionId: async (session_id: string) => {
    const data = await http.post<APIResponse<{ success: boolean; message: string }>>(
      `${CHATBOT_BASE_URL}/chat/clear-session?session_id=${session_id}`,
      {}
    )
    return data
  },

  getSessionInfo: async (session_id: string) => {
    const data = await http.get<SessionInfo>(`${CHATBOT_BASE_URL}/chat/session/${session_id}`)
    return data
  },

  getAllSessions: async (params?: {
    user_id?: string
    limit?: number
    skip?: number
    sort_by?: 'created_at' | 'updated_at'
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.user_id) queryParams.append('user_id', params.user_id)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)

    const data = await http.get<SessionsListResponse>(`${CHATBOT_BASE_URL}/chat/sessions?${queryParams.toString()}`)
    return data
  },

  // ========== Scenario APIs ==========

  getScenarios: async () => {
    const data = await http.get<ScenariosResponse>(`${CHATBOT_BASE_URL}/scenarios`)
    return data
  },

  startScenario: async (scenario_id: string, body?: StartScenarioBody) => {
    const data = await http.post<StartScenarioResponse>(
      `${CHATBOT_BASE_URL}/scenarios/${scenario_id}/start`,
      body || {}
    )
    return data
  }
}

export default AIApis

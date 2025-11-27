export interface IPagination {
  totalRecordCount: number
  totalPageCount: number
  startPage: number
  total: number
  endPage: number
  limitStart: number
  existPrevPage: boolean
  existNextPage: boolean
}
export interface APIResponse<T> {
  status: string
  message: string
  data: T
  pagination?: IPagination
}

export interface LoginEmailPasswordBody {
  email: string
  password: string
}

export interface ResponseLoginEmailPassword {
  accessToken: string
}
export interface bodyGenerateTags {
  event_name: string
  category: string
  short_description: string
  detailed_description: string
  max_tags: number
  language: 'vi'
}
export interface resGenerateTags {
  event_name: string
  generated_tags: string[]
  hashtags: string[]
  target_audience: string[]
}
export interface bodyModerateContent {
  event_name: string
  category: string
  short_description: string
  detailed_description: string
}
export interface resModerateContent {
  is_valid: boolean
  confidence_score: number //max là 1
  reason: string
  issues: string[]
  suggestions: string[]
}
export interface bodyEventChatBot {
  message: string
  use_rag: true // mặc định
  use_advanced_rag: true // mặc định
  use_query_expansion: true // mặc định
  use_reranking: false // mặc định
  top_k: 6 // mặc định
  temperature: 0.5 // mặc định
  session_id?: string // dùng để check xem user có muốn tiếp tục chat phần chat đó không
}

export interface EventAddress {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface EventCoordinates {
  latitude: number
  longitude: number
}

export interface EventLocation {
  address: EventAddress
  coordinates: EventCoordinates
}

export interface EventContact {
  email: string
  phone: string
  website: string
}

export interface EventDetails {
  success: boolean
  event_code: string
  event_name: string
  event_url: string
  description: string
  short_description: string
  start_time: string
  end_time: string
  start_sale: string
  end_sale: string
  location: EventLocation
  contact: EventContact
  capacity: number
  hashtags: string[]
}

export interface ContextMetadata {
  texts: string[]
  text_count: number
  image_count: number
  image_filenames: string[]
  id_use: string
  id_user: string | null
  original_id: string
}

export interface ContextUsed {
  id: string
  confidence: number
  metadata: ContextMetadata
}

export interface RagStats {
  original_query: string
  expanded_queries: string[]
  initial_results: number
  after_rerank: number
  after_compression: number
  used_cross_encoder: boolean
  used_llm_expansion: boolean
}

export interface ToolCall {
  function: string
  arguments: Record<string, any>
  result: EventDetails
}

export interface resChatBot {
  response: string
  context_used: ContextUsed[]
  timestamp: string
  rag_stats: RagStats
  session_id: string
  tool_calls: ToolCall[]
}
export interface resChatBotHistory {
  session_id: string
  message_count: number
  messages: messagesChatBotRole[]
  created_at: string
  updated_at: string
}
export interface messagesChatBotRole {
  role: 'user' | 'assistant' //mặc định chỉ có 2 role này để phân biệt
  content: string
}

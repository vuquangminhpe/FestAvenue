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
  session_id?: string // dùng để check xem user có muốn tiếp tục chat phần chat đó không
  user_id?: string
  use_rag?: boolean // default: true
  enable_tools?: boolean // default: true
  top_k?: number // default: 3
  score_threshold?: number // default: 0.5
  temperature?: number // default: 0.7
  system_message?: string // optional custom system message
}

// Scenario Types
export interface Scenario {
  scenario_id: string
  name: string
  description: string
  triggers: string[]
  category: string
  priority: 'high' | 'normal' | 'low'
  estimated_duration: string
}

export interface ScenariosResponse {
  total: number
  scenarios: Scenario[]
}

export interface StartScenarioBody {
  initial_data?: Record<string, any>
  session_id?: string
  user_id?: string
}

export interface StartScenarioResponse {
  session_id: string
  scenario_id: string
  message: string
  scenario_active: boolean
  proactive: boolean
}

// Session Types
export interface SessionInfo {
  session_id: string
  created_at: string
  updated_at: string
  message_count: number
  user_id?: string
  metadata?: Record<string, any>
}

export interface SessionsListResponse {
  total: number
  limit: number
  skip: number
  sessions: SessionInfo[]
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
  session_id: string
  mode: 'scenario' | 'rag' // scenario hoặc rag mode
  scenario_active: boolean
  timestamp: string
  context_used?: ContextUsed[]
  rag_stats?: RagStats
  tool_calls?: ToolCall[]
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

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

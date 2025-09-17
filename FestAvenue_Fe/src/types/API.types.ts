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

/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, type AxiosInstance, HttpStatusCode } from 'axios'
import configBase from '../constants/config'
import { clearLocalStorage, getAccessTokenFromLS, saveAccessTokenToLS } from './auth'
import path from '@/constants/path'
import { toast } from 'sonner'

const ADMIN_URL_PREFIX = '/admin'
class Http {
  instance: AxiosInstance
  private accessToken: string

  constructor() {
    this.accessToken = getAccessTokenFromLS() ? `Bearer ${getAccessTokenFromLS()}` : ''

    this.instance = axios.create({
      baseURL: configBase.baseURL,
      timeout: 1000000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      maxRedirects: 5,
      validateStatus: (status) => {
        return status <= 200 || status > 500
      }
    })

    this.instance.interceptors.request.use(
      (config) => {
        const location = window.location
        const currPathname = location.pathname

        const userToken = localStorage.getItem('access_token')
        if (userToken && currPathname && !currPathname.startsWith(ADMIN_URL_PREFIX)) {
          config.headers.Authorization = `Bearer ${userToken}`
        }

        const adminToken = localStorage.getItem('admin_token')
        if (adminToken && currPathname && currPathname.startsWith(ADMIN_URL_PREFIX)) {
          config.headers.Authorization = `Bearer ${adminToken}`
        }

        return config
      },
      (error) => {
        console.error('Request Error:', error)
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response) => {
        if (response.status === HttpStatusCode.Unauthorized) {
          const hasUserToken = Boolean(getAccessTokenFromLS())
          const hasAdminToken = Boolean(localStorage.getItem('admin_token'))
          const currentPath = location.pathname

          toast.warning('Hãy đăng nhập để có thể sử dụng đầy đủ các tính năng nhé')

          if (currentPath && currentPath.startsWith(ADMIN_URL_PREFIX) && hasAdminToken) {
            this.accessToken = ''
            clearLocalStorage()
            window.location.href = path.admin.auth.login
          } else if (hasUserToken) {
            this.accessToken = ''
            clearLocalStorage()
            window.location.href = path.auth.login
          }
        }
        const { url } = response.config

        if (url === path.auth.signup || url === path.auth.login || url === path.auth.signup) {
          try {
            const data = response.data
            if (data?.data?.token) {
              this.accessToken = data.data.token
              saveAccessTokenToLS(this.accessToken)
            }
          } catch (error) {
            console.error('Error processing auth response:', error)
          }
        } else if (url === '/logout') {
          this.accessToken = ''
          clearLocalStorage()
        }
        return response
      },
      (error: AxiosError) => {
        if (error.response) {
          if (error.response.status === 401) {
            const requestUrl = error.config?.url
            const isAdminRequest = Boolean(requestUrl && requestUrl.startsWith(ADMIN_URL_PREFIX))
            const hasAdminToken = Boolean(localStorage.getItem('admin_token'))
            const hasUserToken = Boolean(getAccessTokenFromLS())

            toast.warning('Hãy đăng nhập để có thể sử dụng đầy đủ các tính năng nhé')

            if (isAdminRequest && hasAdminToken) {
              this.accessToken = ''
              clearLocalStorage()
              window.location.href = path.admin.auth.login
            } else if (!isAdminRequest && hasUserToken) {
              this.accessToken = ''
              clearLocalStorage()
              window.location.href = path.auth.login
            }
          }
          return Promise.reject(error)
        }

        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance
export default http

export const localStorageEventTarget = new EventTarget()
export const saveAccessTokenToLS = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}
export const saveRefreshTokenToLS = (refresh_token: string) => {
  localStorage.setItem('refresh_token', refresh_token)
}

export const clearLocalStorage = () => {
  localStorage.removeItem('access_token')
  const clearLSEvent = new Event('clearLocalStorage')
  localStorageEventTarget.dispatchEvent(clearLSEvent)
}

export const getAccessTokenFromLS = () => localStorage.getItem('access_token') || null
export const getRefreshTokenFromLS = () => localStorage.getItem('refresh_token') || null
export const getAdminTokenFromLS = () => localStorage.getItem('access_token') || null

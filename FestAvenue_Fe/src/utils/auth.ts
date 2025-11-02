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

// Decode JWT token to get payload
export const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

// Get current user ID from JWT token
export const getCurrentUserIdFromToken = (): string | null => {
  const token = getAccessTokenFromLS()
  if (!token) return null

  const payload = decodeJWT(token)
  // Common JWT payload fields for user ID: sub, userId, user_id, id
  return payload?.sub || payload?.userId || payload?.user_id || payload?.id || null
}

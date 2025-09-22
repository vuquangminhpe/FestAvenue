import { useState, useEffect } from 'react'

/**
 * Hook để detect xem component có đang chạy ở client hay không
 * Hữu ích cho React 19 SSR để tránh hydration mismatch
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook để safely access window object
 * Trả về undefined ở server-side
 */
export function useWindow() {
  const isClient = useIsClient()
  return isClient ? window : undefined
}

/**
 * Hook để safely access document object
 * Trả về undefined ở server-side
 */
export function useDocument() {
  const isClient = useIsClient()
  return isClient ? document : undefined
}

/**
 * Hook để safely access localStorage
 * Trả về null ở server-side
 */
export function useLocalStorage() {
  const isClient = useIsClient()
  return isClient && typeof localStorage !== 'undefined' ? localStorage : null
}

/**
 * Hook để safely get viewport dimensions
 * Trả về default values ở server-side
 */
export function useViewport() {
  const [viewport, setViewport] = useState({ width: 1024, height: 768 })
  const isClient = useIsClient()

  useEffect(() => {
    if (!isClient) return

    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)

    return () => window.removeEventListener('resize', updateViewport)
  }, [isClient])

  return viewport
}

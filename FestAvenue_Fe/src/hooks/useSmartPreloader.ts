/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from 'react'

interface PreloaderOptions {
  delay?: number
  prefetch?: boolean
}

export const useSmartPreloader = () => {
  const preloadedModules = useRef<Set<string>>(new Set())
  const preloadTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const preloadComponent = useCallback(
    (componentPath: string, importFn: () => Promise<any>, options: PreloaderOptions = {}) => {
      const { delay = 100, prefetch = true } = options

      // Nếu đã preload rồi thì skip
      if (preloadedModules.current.has(componentPath)) {
        return Promise.resolve()
      }

      // Clear timeout cũ nếu có
      const existingTimeout = preloadTimeouts.current.get(componentPath)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      return new Promise<void>((resolve) => {
        const timeout = setTimeout(async () => {
          try {
            await importFn()
            preloadedModules.current.add(componentPath)

            // Prefetch related modules if needed
            if (prefetch) {
              // Prefetch related dependencies
              if (componentPath.includes('organization')) {
                // Preload organization-related dependencies
                import('google-map-react').catch(() => {})
                import('gsap').catch(() => {})
                import('@microsoft/signalr').catch(() => {})
              }
            }

            resolve()
          } catch (error) {
            console.warn(`Failed to preload ${componentPath}:`, error)
            resolve()
          } finally {
            preloadTimeouts.current.delete(componentPath)
          }
        }, delay)

        preloadTimeouts.current.set(componentPath, timeout)
      })
    },
    []
  )

  const cancelPreload = useCallback((componentPath: string) => {
    const timeout = preloadTimeouts.current.get(componentPath)
    if (timeout) {
      clearTimeout(timeout)
      preloadTimeouts.current.delete(componentPath)
    }
  }, [])

  const isPreloaded = useCallback((componentPath: string) => {
    return preloadedModules.current.has(componentPath)
  }, [])

  return { preloadComponent, cancelPreload, isPreloaded }
}

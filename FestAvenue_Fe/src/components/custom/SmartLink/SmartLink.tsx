/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, type LinkProps } from 'react-router-dom'
import { useSmartPreloader } from '@/hooks/useSmartPreloader'
import { useCallback } from 'react'

interface SmartLinkProps extends LinkProps {
  preloadTarget?: {
    path: string
    importFn: () => Promise<any>
    delay?: number
  }
  children: React.ReactNode
}

export const SmartLink = ({ preloadTarget, children, onMouseEnter, onFocus, ...linkProps }: SmartLinkProps) => {
  const { preloadComponent, cancelPreload, isPreloaded } = useSmartPreloader()

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (preloadTarget && !isPreloaded(preloadTarget.path)) {
        preloadComponent(preloadTarget.path, preloadTarget.importFn, { delay: preloadTarget.delay || 50 })
      }
      onMouseEnter?.(e)
    },
    [preloadTarget, preloadComponent, isPreloaded, onMouseEnter]
  )

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLAnchorElement>) => {
      if (preloadTarget && !isPreloaded(preloadTarget.path)) {
        preloadComponent(
          preloadTarget.path,
          preloadTarget.importFn,
          { delay: 0 } // Immediate load on focus
        )
      }
      onFocus?.(e)
    },
    [preloadTarget, preloadComponent, isPreloaded, onFocus]
  )

  const handleMouseLeave = useCallback(() => {
    if (preloadTarget && !isPreloaded(preloadTarget.path)) {
      // Cancel preload if mouse leaves quickly (< 200ms)
      setTimeout(() => {
        cancelPreload(preloadTarget.path)
      }, 200)
    }
  }, [preloadTarget, cancelPreload, isPreloaded])

  return (
    <Link {...linkProps} onMouseEnter={handleMouseEnter} onFocus={handleFocus} onMouseLeave={handleMouseLeave}>
      {children}
    </Link>
  )
}

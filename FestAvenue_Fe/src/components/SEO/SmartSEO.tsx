'use client'

import { lazy, Suspense } from 'react'
import { useIsClient } from '@/hooks/useSSR'
import ServerSEO from './ServerSEO'

// Lazy load client SEO component
const ClientSEO = lazy(() => import('./SEO'))

interface SmartSEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
  nofollow?: boolean
  canonicalUrl?: string
}

/**
 * Smart SEO component that chooses between server and client rendering
 * For React 19 SSR applications
 */
export function SmartSEO(props: SmartSEOProps) {
  const isClient = useIsClient()

  // Server-side: Use ServerSEO
  if (!isClient) {
    return <ServerSEO {...props} />
  }

  // Client-side: Use ClientSEO with Suspense
  return (
    <Suspense fallback={<ServerSEO {...props} />}>
      <ClientSEO {...props} />
    </Suspense>
  )
}

export default SmartSEO

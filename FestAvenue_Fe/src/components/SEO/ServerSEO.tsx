// Server-side SEO component for SSR
import { Helmet } from 'react-helmet-async'

interface ServerSEOProps {
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

const defaultSEO = {
  title: 'FestAvenue - Your Ultimate Event Management Platform',
  description:
    'Discover, create, and manage amazing events with FestAvenue. The premier platform for event organizers and attendees to connect and create memorable experiences.',
  image: '/Images/Fest.png',
  url: 'https://festavenue.site',
  type: 'website' as const,
  keywords: ['events', 'festival', 'event management', 'tickets', 'venue', 'organization'],
  author: 'FestAvenue Team'
}

export function ServerSEO({
  title,
  description = defaultSEO.description,
  image = defaultSEO.image,
  url = defaultSEO.url,
  type = defaultSEO.type,
  keywords = defaultSEO.keywords,
  author = defaultSEO.author,
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
  canonicalUrl
}: ServerSEOProps) {
  const fullTitle = title ? `${title} | FestAvenue` : defaultSEO.title
  const fullImage = image.startsWith('http') ? image : `${url}${image}`
  const keywordsString = keywords.join(', ')

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywordsString} />
      <meta name='author' content={author} />

      {/* Robots Meta */}
      {(noindex || nofollow) && (
        <meta name='robots' content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} />
      )}

      {/* Canonical URL */}
      {canonicalUrl && <link rel='canonical' href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property='og:type' content={type} />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:image' content={fullImage} />
      <meta property='og:url' content={url} />
      <meta property='og:site_name' content='FestAvenue' />
      <meta property='og:locale' content='en_US' />

      {/* Article specific Open Graph tags */}
      {type === 'article' && publishedTime && <meta property='article:published_time' content={publishedTime} />}
      {type === 'article' && modifiedTime && <meta property='article:modified_time' content={modifiedTime} />}
      {type === 'article' && author && <meta property='article:author' content={author} />}

      {/* Twitter Card */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={fullImage} />
      <meta name='twitter:site' content='@festavenue' />
      <meta name='twitter:creator' content='@festavenue' />

      {/* Additional SEO Meta Tags */}
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />
      <meta name='language' content='English' />
      <meta name='revisit-after' content='7 days' />

      {/* Structured Data for Organization */}
      <script type='application/ld+json'>
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'FestAvenue',
          description: description,
          url: url,
          logo: fullImage,
          sameAs: [
            'https://facebook.com/festavenue',
            'https://twitter.com/festavenue',
            'https://instagram.com/festavenue'
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: 'support@festavenue.com'
          }
        })}
      </script>
    </Helmet>
  )
}

export default ServerSEO

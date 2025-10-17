'use client'

import { Helmet } from 'react-helmet-async'

interface SEOProps {
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

export function SEO({
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
}: SEOProps) {
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
            email: 'support@festavenue.site'
          }
        })}
      </script>
    </Helmet>
  )
}

// Predefined SEO configs for common pages
export const pageSEO = {
  home: {
    title: 'Home',
    description:
      'Welcome to FestAvenue - Your Ultimate Event Management Platform. Discover amazing events, connect with organizers, and create unforgettable experiences.',
    keywords: ['events', 'festival', 'event management', 'home', 'discover events'],
    url: 'https://festavenue.site/'
  },
  login: {
    title: 'Login',
    description:
      'Sign in to your FestAvenue account to manage your events, connect with organizers, and access exclusive features.',
    keywords: ['login', 'sign in', 'account', 'authentication'],
    url: 'https://festavenue.site/auth/login',
    noindex: true
  },
  signup: {
    title: 'Sign Up',
    description:
      'Join FestAvenue today! Create your account to start organizing events, discover amazing festivals, and connect with the event community.',
    keywords: ['signup', 'register', 'join', 'create account'],
    url: 'https://festavenue.site/auth/signup'
  },
  forgotPassword: {
    title: 'Forgot Password',
    description: 'Reset your FestAvenue password securely. Enter your email to receive password reset instructions.',
    keywords: ['forgot password', 'reset password', 'account recovery'],
    url: 'https://festavenue.site/auth/forgot-password',
    noindex: true
  },
  verifyEmail: {
    title: 'Verify Email',
    description: 'Verify your email address to complete your FestAvenue account setup and access all features.',
    keywords: ['verify email', 'email verification', 'account activation'],
    url: 'https://festavenue.site/auth/verify-email',
    noindex: true
  }
}

export default SEO

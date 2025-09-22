// Utility to generate sitemap.xml dynamically
// This can be used in a build script or server-side

export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export function generateSitemap(urls: SitemapUrl[]): string {
  const urlElements = urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`
}

// Default sitemap URLs for FestAvenue
export const defaultSitemapUrls: SitemapUrl[] = [
  {
    loc: 'https://festavenue.site/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0
  },
  {
    loc: 'https://festavenue.site/home',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0
  },
  {
    loc: 'https://festavenue.site/auth/login',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    loc: 'https://festavenue.site/auth/signup',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    loc: 'https://festavenue.site/auth/verify-email',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.5
  },
  {
    loc: 'https://festavenue.site/auth/forgot-password',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.5
  }
]

// Function to extract routes from your routing configuration
export function extractRoutesFromConfig(routes: any[]): string[] {
  const publicRoutes: string[] = []

  function traverseRoutes(routeArray: any[], basePath = '') {
    for (const route of routeArray) {
      if (route.path && !route.path.includes(':') && !route.path.includes('*')) {
        const fullPath = basePath + route.path

        // Exclude private/admin routes
        if (!fullPath.includes('/admin/') && !fullPath.includes('/staff/') && !fullPath.includes('/user/my/')) {
          publicRoutes.push(fullPath)
        }
      }

      if (route.children) {
        traverseRoutes(route.children, basePath + (route.path || ''))
      }
    }
  }

  traverseRoutes(routes)
  return publicRoutes
}

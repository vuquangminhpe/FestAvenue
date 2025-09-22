// Export all SEO components for easy import
export { default as SEO, pageSEO } from './SEO'
export { default as ServerSEO } from './ServerSEO'
export { default as SmartSEO } from './SmartSEO'

// Re-export pageSEO for convenience
export type { pageSEO as PageSEOConfig } from './SEO'

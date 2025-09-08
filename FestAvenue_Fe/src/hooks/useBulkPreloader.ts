import { useEffect } from 'react'
import { componentRegistry, getDependencies } from '@/utils/componentRegistry'

export const useBulkPreloader = (components: string[], trigger: 'immediate' | 'idle' | 'intersection' = 'idle') => {
  useEffect(() => {
    const preloadComponents = async () => {
      for (const componentPath of components) {
        try {
          // Preload main component
          const importFn = componentRegistry[componentPath as keyof typeof componentRegistry]
          if (importFn) {
            await importFn()
          }

          // Preload dependencies
          const deps = getDependencies(componentPath)
          await Promise.all(deps.map((dep) => dep().catch(() => {})))
        } catch (error) {
          console.warn(`Failed to preload ${componentPath}:`, error)
        }
      }
    }

    if (trigger === 'immediate') {
      preloadComponents()
    } else if (trigger === 'idle') {
      // Preload when browser is idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => preloadComponents(), { timeout: 5000 })
      } else {
        setTimeout(preloadComponents, 2000)
      }
    }
  }, [components, trigger])
}

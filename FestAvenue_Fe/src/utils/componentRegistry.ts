export const componentRegistry = {
  'user-profile': () => import('@/pages/User/Auth/My/MyProfile/UserProfile')
}

export const getDependencies = (componentPath: string) => {
  const deps = {
    'create-organization': [
      () => import('google-map-react'),
      () => import('gsap'),
      () => import('@microsoft/signalr'),
      () => import('zod'),
      () => import('@hookform/resolvers/zod')
    ],
    'user-profile': [() => import('react-hook-form'), () => import('zod')],
    'credit-page': []
  }

  return deps[componentPath as keyof typeof deps] || []
}

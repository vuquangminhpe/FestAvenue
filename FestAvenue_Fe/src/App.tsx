'use client'
import { useEffect } from 'react'
import './App.css'
import useRouteElement from './useRouteElement'
import { useLocation } from 'react-router'
import { getAccessTokenFromLS, saveAccessTokenToLS } from './utils/auth'
import { useUsersStore } from './contexts/app.context'
import { useQuery } from '@tanstack/react-query'
import userApi from './apis/user.api'
function App() {
  const location = useLocation()
  const check_accessToken = location.search.includes('accessToken')
  const userStore = useUsersStore((set) => set.setIsProfile)
  const setIsAuth = useUsersStore((set) => set.setIsAuth)
  const { data } = useQuery({
    queryKey: ['getMyProfile'],
    queryFn: () => userApi.getMyProfile(),
    enabled: !!getAccessTokenFromLS()
  })
  userStore(data?.data)
  useEffect(() => {
    if (check_accessToken) {
      const accessToken = location.search.split('=')[1]
      saveAccessTokenToLS(accessToken)
      setIsAuth(true)
    }
  }, [check_accessToken, location.search])

  const routeElement = useRouteElement()
  return <>{routeElement}</>
}

export default App

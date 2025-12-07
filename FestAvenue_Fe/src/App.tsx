'use client'
import { useEffect } from 'react'
import './App.css'
import useRouteElement from './useRouteElement'
import { useLocation } from 'react-router'
import { getAccessTokenFromLS, saveAccessTokenToLS } from './utils/auth'
import { useUsersStore } from './contexts/app.context'
import { useQuery } from '@tanstack/react-query'
import userApi from './apis/user.api'
import ChatSystem from './components/ChatSystem/ChatSystem'
import ChatBot from './components/ChatBot/ChatBot'
import ChatStaff from './components/ChatStaff/ChatStaff'
function App() {
  const location = useLocation()
  const check_accessToken = location.search.includes('accessToken')
  const userStore = useUsersStore((set) => set.setIsProfile)
  const setIsAuth = useUsersStore((set) => set.setIsAuth)
  const { data, refetch } = useQuery({
    queryKey: ['getMyProfile'],
    queryFn: () => userApi.getMyProfile(),
    enabled: !!getAccessTokenFromLS()
  })

  // Cập nhật userStore khi data thay đổi
  useEffect(() => {
    if (data?.data) {
      userStore(data.data)
    }
  }, [data, userStore])

  useEffect(() => {
    if (check_accessToken) {
      const accessToken = location.search.split('=')[1]
      saveAccessTokenToLS(accessToken)
      setIsAuth(true)
      // Refetch profile sau khi lưu token
      refetch()
    }
  }, [check_accessToken, location.search, setIsAuth, refetch])

  const routeElement = useRouteElement()
  const isAuthenticated = !!getAccessTokenFromLS()

  return (
    <>
      {routeElement}
      {isAuthenticated && <ChatSystem />}
      {isAuthenticated && <ChatBot />}
      {isAuthenticated && <ChatStaff />}
    </>
  )
}

export default App

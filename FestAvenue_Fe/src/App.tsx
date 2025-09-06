'use client'
import { useEffect } from 'react'
import './App.css'
import useRouteElement from './useRouteElement'
import { useLocation } from 'react-router'
import { saveAccessTokenToLS } from './utils/auth'
function App() {
  const location = useLocation()
  const check_accessToken = location.search.includes('accessToken')
  console.log(location)

  useEffect(() => {
    if (check_accessToken) {
      const accessToken = location.search.split('=')[2]
      saveAccessTokenToLS(accessToken)
    }
  }, [check_accessToken, location.search])

  const routeElement = useRouteElement()
  return <>{routeElement}</>
}

export default App

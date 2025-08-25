import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import userApi from '@/apis/user.api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      userApi
        .register_verify(token)
        .then(() => {})
        .catch(() => {})
    }
  }, [token])

  return null
}
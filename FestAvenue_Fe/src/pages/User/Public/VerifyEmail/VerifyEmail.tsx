'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import userApi from '@/apis/user.api'
import SmartSEO from '@/components/SEO/SmartSEO'
import { pageSEO } from '@/components/SEO/SEO'

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

  return (
    <>
      <SmartSEO {...pageSEO.verifyEmail} />
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-4'>Verifying your email...</h1>
          <p className='text-gray-600'>Please wait while we verify your email address.</p>
        </div>
      </div>
    </>
  )
}

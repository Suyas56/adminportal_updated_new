'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Loading from './loading'

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
    
    window.addEventListener('offline', () => {
      alert('Your system is offline please connect to internet.')
    })
    window.addEventListener('online', () => {
      alert('Your system is online.')
    })
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <SessionProvider>{children}</SessionProvider>
  )
} 
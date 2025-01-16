'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'

export function AuthProvider({ children }) {
  useEffect(() => {
    window.addEventListener('offline', () => {
      alert('Your system is offline please connect to internet.')
    })
    window.addEventListener('online', () => {
      alert('Your system is online.')
    })
  }, [])

  return (
    <SessionProvider>{children}</SessionProvider>
  )
} 
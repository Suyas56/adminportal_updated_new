'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function useRefreshData(shouldRefresh = true) {
  const router = useRouter()
  
  return useCallback(() => {
    if (shouldRefresh) {
      router.refresh()
    }
  }, [router, shouldRefresh])
} 
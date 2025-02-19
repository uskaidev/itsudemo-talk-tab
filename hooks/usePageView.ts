'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer?: Object[]
    gtag?: (...args: any[]) => void
  }
}

export const usePageView = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      const url = pathname + searchParams.toString()
      window.gtag('config', 'G-9LW79Y77SC', {
        page_path: url,
      })
    }
  }, [pathname, searchParams])
}

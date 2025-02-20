import { Zen_Maru_Gothic } from "next/font/google"
import "./globals.css"
import type React from "react"
import { ClientSidebar } from "@/components/client-sidebar"
import type { Metadata } from 'next'
import StreamingAvatarScript from "@/components/streaming-avatar-script"
import { GoogleAnalytics } from '@next/third-parties/google'
import { FullScreenHandler } from '@/components/full-screen-handler'

export const metadata: Metadata = {
  title: 'いつでもトーク',
  description: 'みなさんとお話したり、運動や脳トレ、外出を楽しむサポートをします',
}

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-zen-maru-gothic",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#FFFFFF" />
      </head>
      <body className={`${zenMaruGothic.variable} font-sans font-zen-maru-gothic`}>
        <FullScreenHandler />
        <StreamingAvatarScript />
        <div className="flex min-h-screen">
          <ClientSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
        <GoogleAnalytics gaId="G-9LW79Y77SC" />
      </body>
    </html>
  )
}

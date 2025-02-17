import { Zen_Maru_Gothic } from "next/font/google"
import "./globals.css"
import type React from "react"
import { ClientSidebar } from "@/components/client-sidebar"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'いつでもトーク',
  description: 'みなさんとお話したり、自由にアクティビティを行うサポートをします',
}

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-zen-maru-gothic",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${zenMaruGothic.variable} font-sans bg-[#FAFFD4] font-zen-maru-gothic`}>
        <div className="flex min-h-screen">
          <ClientSidebar />
          <main className="flex-1 overflow-y-auto w-[70%]">{children}</main> {/* 幅を70%に戻す */}
        </div>
      </body>
    </html>
  )
}

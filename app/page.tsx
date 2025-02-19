'use client'

import Image from "next/image"
import { MainButton } from "@/components/main-button"
import { TodayVideoButton } from "@/components/today-video-button"
import { PageViewTracker } from "@/components/page-view-tracker"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFFD4] flex items-center justify-center">
      <Suspense>
        <PageViewTracker />
      </Suspense>
      <div className="w-full max-w-[1080px] flex flex-col items-center justify-center gap-12 p-8">
        {/* ヘッダー部分 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative w-[280px] h-[80px]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-IEK9jkEGKcIyrpkGkwd5uDSoSbj9lf.svg"
                alt="いつでもトーク"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="text-3xl font-medium font-zen-maru-gothic">は、</p>
          </div>

          {/* 説明文 */}
          <p className="text-3xl font-medium leading-relaxed font-zen-maru-gothic">
            みなさんとお話したり、
            <br />
            自由にアクティビティを行うサポートをします
          </p>
        </div>

        {/* メインボタン */}
        <div className="w-full max-w-[720px]">
          <MainButton />
        </div>

        {/* フッター説明文 */}
        <div className="text-center">
          <p className="text-3xl font-medium leading-relaxed font-zen-maru-gothic">
            まずは「アシスタントと話す」ボタンを
            <br />
            タッチして、お話してみましょう！
          </p>
        </div>
      </div>
      <TodayVideoButton />
    </div>
  )
}

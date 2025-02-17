"use client"

import { useState } from 'react'
import { VideoModal } from './video-modal'
import { DAILY_VIDEOS } from '@/constants/daily-videos'

export function TodayVideoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 現在の日付を "MM-DD" 形式で取得
  const getTodayKey = () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${month}-${day}`
  }

  const todayKey = getTodayKey()
  const todayVideo = DAILY_VIDEOS[todayKey] || {
    videoId: "dQw4w9WgXcQ",
    title: "今日の動画は準備中です"
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-48 h-48 text-white text-3xl font-bold transition-all flex flex-col items-center justify-center p-4 text-center z-50 animate-float leading-tight"
        style={{
          backgroundImage: 'url(/today_base.svg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        今日は
        <br />
        何の日？
      </button>

      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoTitle={todayVideo.title}
        videoSrc={`https://www.youtube.com/embed/${todayVideo.videoId}?autoplay=1`}
      />
    </>
  )
}

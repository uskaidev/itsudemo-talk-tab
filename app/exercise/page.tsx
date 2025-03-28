"use client"

import { useState } from "react"
import { VideoCard } from "@/components/video-card"
import { VideoModal } from "@/components/video-modal"
import { PageViewTracker } from "@/components/page-view-tracker"
import { Suspense } from "react"

const exerciseVideos = [
  {
    id: 1,
    title: "スローエアロビック",
    duration: "所要時間10分",
    thumbnailUrl: "https://img.youtube.com/vi/d2EDVVBj7qE/0.jpg",
    videoSrc: "https://www.youtube.com/embed/d2EDVVBj7qE",
  },
  {
    id: 2,
    title: "スポーツ体操",
    duration: "所要時間5分",
    thumbnailUrl: "https://img.youtube.com/vi/mHzN0IEsUcs/0.jpg",
    videoSrc: "https://www.youtube.com/embed/mHzN0IEsUcs",
  },
  {
    id: 3,
    title: "うた体操〜スキーの歌〜",
    duration: "所要時間10分",
    thumbnailUrl: "https://img.youtube.com/vi/R2PsFGPN6-k/0.jpg",
    videoSrc: "https://www.youtube.com/embed/R2PsFGPN6-k",
  },
]

export default function ExercisePage() {
  const [selectedVideo, setSelectedVideo] = useState<(typeof exerciseVideos)[0] | null>(null)

  return (
    <div className="h-full w-full p-8 flex flex-col scroll-container">
      <Suspense>
        <PageViewTracker />
      </Suspense>
      <h1 className="text-3xl font-bold mb-2 font-zen-maru-gothic text-center">運動する</h1>
      <h2 className="text-lg mb-6 font-zen-maru-gothic text-center">画像をタッチすると動画が自動的に再生されます。</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
        {exerciseVideos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            duration={video.duration}
            thumbnailUrl={video.thumbnailUrl}
            onClick={() => setSelectedVideo(video)}
          />
        ))}
      </div>

      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoTitle={selectedVideo.title}
          videoSrc={selectedVideo.videoSrc}
        />
      )}
    </div>
  )
}

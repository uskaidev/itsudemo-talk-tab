"use client"

import { useState } from "react"
import { VideoCard } from "@/components/video-card"
import { VideoModal } from "@/components/video-modal"

const exerciseVideos = [
  {
    id: 1,
    title: "スローエアロビクス",
    duration: "10分",
    thumbnailUrl: "https://img.youtube.com/vi/d2EDVVBj7qE/0.jpg",
    videoSrc: "https://www.youtube.com/embed/d2EDVVBj7qE",
  },
  {
    id: 2,
    title: "スポーツ体操",
    duration: "5分",
    thumbnailUrl: "https://img.youtube.com/vi/mHzN0IEsUcs/0.jpg",
    videoSrc: "https://www.youtube.com/embed/mHzN0IEsUcs",
  },
  {
    id: 3,
    title: "うた体操〜スキーの歌〜",
    duration: "10分",
    thumbnailUrl: "https://img.youtube.com/vi/R2PsFGPN6-k/0.jpg",
    videoSrc: "https://www.youtube.com/embed/R2PsFGPN6-k",
  },
]

export default function ExercisePage() {
  const [selectedVideo, setSelectedVideo] = useState<(typeof exerciseVideos)[0] | null>(null)

  return (
    <div className="h-full w-full p-8 flex flex-col scroll-container">
      <h1 className="text-3xl font-bold mb-6 font-zen-maru-gothic text-center">運動する</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
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


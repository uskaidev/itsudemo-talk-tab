"use client"

import { useState } from "react"
import { VideoCard } from "@/components/video-card"
import { VideoModal } from "@/components/video-modal"

const games = [
  {
    id: 1,
    title: "色読みクイズ",
    duration: "7分",
    thumbnailUrl: "https://img.youtube.com/vi/3FDLWRf7DBU/0.jpg",
    videoSrc: "https://www.youtube.com/embed/3FDLWRf7DBU",
  },
  {
    id: 2,
    title: "旗揚げゲーム",
    duration: "10分",
    thumbnailUrl: "https://img.youtube.com/vi/QvOMIN5a_w4/0.jpg",
    videoSrc: "https://www.youtube.com/embed/QvOMIN5a_w4",
  },
  {
    id: 3,
    title: "メロディクイズ",
    duration: "15分",
    thumbnailUrl: "https://img.youtube.com/vi/sKUf48AVj5o/0.jpg",
    videoSrc: "https://www.youtube.com/embed/sKUf48AVj5o",
  },
]

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(null)

  return (
    <div className="h-full w-full p-8 flex flex-col scroll-container">
      <h1 className="text-3xl font-bold mb-6 font-zen-maru-gothic text-center">ゲーム/脳トレをする</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
        {games.map((game) => (
          <VideoCard
            key={game.id}
            title={game.title}
            duration={game.duration}
            thumbnailUrl={game.thumbnailUrl}
            onClick={() => setSelectedGame(game)}
          />
        ))}
      </div>

      {selectedGame && (
        <VideoModal
          isOpen={!!selectedGame}
          onClose={() => setSelectedGame(null)}
          videoTitle={selectedGame.title}
          videoSrc={selectedGame.videoSrc}
        />
      )}
    </div>
  )
}


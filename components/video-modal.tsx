"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoTitle: string
  videoSrc: string
}

export function VideoModal({ isOpen, onClose, videoTitle, videoSrc }: VideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-4 flex flex-col">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 bg-[#276204] rounded-md p-2 hover:bg-[#1E4A03] transition-colors z-10"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>

        {/* 動画コンテナ - 利用可能な高さの70%を使用 */}
        <div className="h-[70vh] w-full">
          <iframe
            className="w-full h-full"
            src={videoSrc}
            title={videoTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* タイトルと閉じるボタン - 残りの高さを使用 */}
        <div className="mt-2 flex flex-col">
          <DialogTitle className="text-xl font-bold mb-2 line-clamp-1">{videoTitle}</DialogTitle>
          <button
            className="w-full bg-[#276204] hover:bg-[#1E4A03] text-white py-3 rounded-xl text-lg font-bold transition-colors"
            onClick={onClose}
          >
            動画を閉じる
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

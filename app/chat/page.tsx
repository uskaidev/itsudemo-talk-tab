"use client"

import { useEffect, useRef } from "react"

export default function ChatPage() {
  const avatarContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadHeygenAvatar = () => {
      const host = "https://labs.heygen.com"
      const url =
        host +
        "/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJXYXluZV8yMDI0MDcxMSIsInByZXZpZXdJ%0D%0AbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzL2EzZmRiMGM2NTIwMjRmNzk5%0D%0AODRhYWVjMTFlYmYyNjk0XzM0MzUwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJuZWVkUmVtb3ZlQmFj%0D%0Aa2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6Ijk3YWMzYzdkY2I1NzQyY2RiZTU3MmFi%0D%0AOWQ4Mzc5MzQyIiwidXNlcm5hbWUiOiI0MmM2ZGJkNjMyYjc0MGE3OGY4OWE1OTg2ZjkyNzZkMSJ9&inIFrame=1"

      const wrapDiv = document.createElement("div")
      wrapDiv.id = "heygen-streaming-embed"
      const container = document.createElement("div")
      container.id = "heygen-streaming-container"
      const stylesheet = document.createElement("style")
      stylesheet.innerHTML = `
        #heygen-streaming-embed {
          position: static !important;
          width: 100% !important;
          height: 100% !important;
          opacity: 1 !important;
          visibility: visible !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          overflow: hidden;
        }
        #heygen-streaming-container {
          width: 100% !important;
          height: 100% !important;
          aspect-ratio: 16/9;  /* アスペクト比を16:9に設定 */
        }
        #heygen-streaming-container iframe {
          width: 100% !important;
          height: 100% !important;
          border: 0;
        }
      `
      const iframe = document.createElement("iframe")
      iframe.allowFullscreen = false
      iframe.title = "Streaming Embed"
      iframe.role = "dialog"
      iframe.allow = "microphone"
      iframe.src = url

      container.appendChild(iframe)
      wrapDiv.appendChild(stylesheet)
      wrapDiv.appendChild(container)

      if (avatarContainerRef.current) {
        avatarContainerRef.current.appendChild(wrapDiv)
      }
    }

    loadHeygenAvatar()

    return () => {
      const avatarElement = document.getElementById("heygen-streaming-embed")
      if (avatarElement && avatarContainerRef.current) {
        avatarContainerRef.current.removeChild(avatarElement)
      }
    }
  }, [])

  return (
    <div className="h-full w-full p-6 flex flex-col">
      <h1 className="text-4xl font-bold mb-8 font-zen-maru-gothic text-center">アシスタントと話す</h1>

      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-5xl mx-auto mb-6">
          <div className="w-full h-0 pb-[56.25%] relative">
            <div ref={avatarContainerRef} className="absolute inset-0 bg-white rounded-lg overflow-hidden" />
          </div>
        </div>
        <div className="w-full max-w-5xl mx-auto px-6">
          <p className="text-2xl mb-4 flex items-center flex-wrap">
            <span className="mr-2">1. 中央の</span>
            <span
              className="inline-block bg-[#A600FF] text-white font-bold px-4 rounded-[6px] whitespace-nowrap"
              style={{ width: "140px", height: "40px", lineHeight: "40px" }}
            >
              Chat now
            </span>
            <span className="ml-2">をタップしてから、言語選択で「Japanese」を選択</span>
          </p>
          <p className="text-2xl mb-4 flex items-center flex-wrap">
            <span className="mr-2">2.</span>
            <span
              className="inline-block bg-[#A600FF] text-white font-bold px-4 rounded-[6px] whitespace-nowrap"
              style={{ width: "140px", height: "40px", lineHeight: "40px", fontSize: "16px" }}
            >
              Start new chat
            </span>
            <span className="ml-2">をタップしてください</span>
          </p>
          <p className="text-2xl mb-4">3. 普段お話するのと同じように、自由にお話してみてください。</p>
          <p className="text-2xl">4. 会話を終了するには、アシスタントの画面右上の×ボタンを押してください。</p>
        </div>
      </div>
    </div>
  )
}


interface VideoCardProps {
  title: string
  duration: string
  onClick?: () => void
  thumbnailUrl: string
}

export function VideoCard({ title, duration, onClick, thumbnailUrl }: VideoCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border-[3px] border-[#276204] bg-white overflow-hidden"
    >
      <div className="relative w-full aspect-video">
        <img
          src={thumbnailUrl || "/placeholder.svg"}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[20px] border-l-[#276204] border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-lg line-clamp-2 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{duration}</p>
      </div>
    </div>
  )
}


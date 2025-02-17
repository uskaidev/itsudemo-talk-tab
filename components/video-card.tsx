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
      className="group cursor-pointer rounded-lg border border-[#276204] bg-white overflow-hidden"
    >
      <div className="relative w-full aspect-video overflow-hidden">
        <img
          src={thumbnailUrl || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[16px] border-l-[#276204] border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
          </div>
        </div>
      </div>
      <div className="p-1.5">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg line-clamp-2 flex-1">{title}</h3>
          <p className="text-gray-600 text-lg ml-2 whitespace-nowrap">{duration}</p>
        </div>
      </div>
    </div>
  )
}

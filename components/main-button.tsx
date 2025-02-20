import Link from "next/link"
import Image from "next/image"

export function MainButton() {
  return (
    <Link href="/chat" className="block w-full">
      <div
        className={`
          relative w-full
          rounded-[20px] border-[3px] border-[#98996B]
          flex items-center
          transition-all duration-200
          bg-white shadow-[3px_3px_0px_rgba(0,0,0,0.25)] hover:bg-gray-50
          aspect-[3/1]
        `}
      >
        <div className="w-[35%] flex justify-center items-center">
          <div className="relative w-1/2 aspect-square">
            <Image
              src="/icons/icon_talk_dark.svg"
              alt="アシスタントアイコン"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="w-[65%] pr-4">
          <span className="text-5xl font-bold text-black font-zen-maru-gothic">アシスタントと話す</span>
        </div>
      </div>
    </Link>
  )
}

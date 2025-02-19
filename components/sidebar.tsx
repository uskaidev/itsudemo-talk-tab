import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-full h-full bg-white shadow-[0px_4px_15px_rgba(0,0,0,0.25)] z-10 overflow-hidden">
      {/* ロゴ部分 - 上部に固定 */}
      <div className="flex justify-center items-center p-4">
        <Link href="/" className="w-[90%]">
          {" "}
          {/* サイドバー幅に対する相対サイズ */}
          <div className="relative w-full aspect-[3.5/1]">
            {" "}
            {/* アスペクト比を維持 */}
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-IEK9jkEGKcIyrpkGkwd5uDSoSbj9lf.svg"
              alt="いつでもトーク"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </Link>
      </div>

      {/* ナビゲーション - 固定位置に配置 */}
      <nav className="w-full px-4 mt-4">
        <div className="space-y-6">
          <SidebarButton
            href="/chat"
            icon="/icons/icon_talk_dark.svg"
            text="アシスタントと話す"
            isActive={pathname === "/chat"}
            isLarge={true}
          />
          <SidebarButton
            href="/exercise"
            icon="/icons/icon_sport_dark.svg"
            text="運動する"
            isActive={pathname === "/exercise"}
            isLarge={false}
          />
          <SidebarButton
            href="/games"
            icon="/icons/icon_game_dark.svg"
            text="脳トレをする"
            isActive={pathname === "/games"}
            isLarge={false}
          />
          <SidebarButton
            href="/outside"
            icon="/icons/icon_outside_dark.svg"
            text="外出する"
            isActive={pathname === "/outside"}
            isLarge={false}
          />
        </div>
      </nav>
    </div>
  )
}

interface SidebarButtonProps {
  href: string
  icon: string
  text: string
  isActive: boolean
  isLarge: boolean
}

function SidebarButton({ href, icon, text, isActive, isLarge }: SidebarButtonProps) {
  const pathname = usePathname()
  
  const handleClick = (e: React.MouseEvent) => {
    if (pathname === href) {
      e.preventDefault()
      window.location.reload()
    }
  }

  return (
    <Link href={href} className="block w-full" onClick={handleClick}>
      <div
        className={`
        relative w-full
        rounded-[20px] border-[3px] border-[#98996B]
        flex items-center
        transition-all duration-200
        ${
          isActive
            ? "bg-[#F0F0E2] shadow-[inset_0_3px_6px_rgba(0,0,0,0.25)]"
            : "bg-white shadow-[3px_3px_0px_rgba(0,0,0,0.25)] hover:bg-gray-50"
        }
        ${isLarge ? "h-[160px]" : "h-[100px]"}
      `}
      >
        <div className={`w-[35%] flex justify-center items-center ${isLarge ? "pl-2" : ""}`}>
          <div className={`relative ${isLarge ? "w-24 h-24" : "w-16 h-16"}`}>
            <Image src={icon || "/placeholder.svg"} alt="" fill className="object-contain" />
          </div>
        </div>
        <div className={`${isLarge ? "w-[65%]" : "w-[65%]"} pr-4`}>
          <span
            className={`font-bold leading-tight text-black ${isLarge ? "text-4xl" : "text-3xl"} font-zen-maru-gothic`}
          >
            {text}
          </span>
        </div>
      </div>
    </Link>
  )
}

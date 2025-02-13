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
            icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon_talk-i8q3k6kkLhrKZCcpJV30aEmG92LEEF.svg"
            text="アシスタントと話す"
            isActive={pathname === "/chat"}
            isLarge={true}
          />
          <SidebarButton
            href="/exercise"
            icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon_sport-hPGCTl8opRXeHLu5FLJ2SexForfzoO.svg"
            text="運動する"
            isActive={pathname === "/exercise"}
            isLarge={false}
          />
          <SidebarButton
            href="/games"
            icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon_game-OddmG7i1RFI7BRKkCdKX7UjWjCASUP.svg"
            text="ゲーム/脳トレをする"
            isActive={pathname === "/games"}
            isLarge={false}
          />
          <SidebarButton
            href="/outside"
            icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/icon_outside-RlaVSMbEqRPd0jKaUF8Qw1JcXDk3dl.svg"
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
  return (
    <Link href={href} className="block w-full">
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


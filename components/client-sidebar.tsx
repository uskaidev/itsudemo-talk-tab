"use client"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"

export function ClientSidebar() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  if (isHomePage) {
    return null
  }

  return (
    <div className="w-[30%] h-screen sticky top-0">
      {" "}
      {/* 幅を30%に戻す */}
      <Sidebar />
    </div>
  )
}


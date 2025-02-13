import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

const activities = [
  {
    id: 1,
    title: "日常のお買い物サポート",
    duration: "1-2時間程度",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-sC3Vrru9iowWykn1SvNVidwFjxllwR.png",
    category: "日常支援",
  },
  {
    id: 2,
    title: "公園でのお散歩サポート",
    duration: "30分-1時間程度",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-FIgRAcu2OheYeLlXL5XDPtN0RNoTNf.png",
    category: "日常支援",
  },
  {
    id: 3,
    title: "美術館見学ツアー",
    duration: "2-3時間程度",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1tcvFAceTfghzxosp5dwFyCGv8Ilp0.png",
    category: "文化活動",
  },
  {
    id: 4,
    title: "季節の観光スポット巡り",
    duration: "3-4時間程度",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tcM14HUPi99Cl5JLqqK77nbaJfI2jk.png",
    category: "文化活動",
  },
]

export default function OutdoorActivities() {
  return (
    <div className="h-full w-full p-8 flex flex-col">
      <h1 className="text-4xl font-bold mb-6 font-zen-maru-gothic text-center">外出する</h1>

      <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
        {activities.map((activity) => (
          <Card key={activity.id} className="overflow-hidden bg-white shadow-lg flex flex-col">
            <div className="relative w-full" style={{ paddingTop: "40%" }}>
              <Image src={activity.image || "/placeholder.svg"} alt={activity.title} fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-white/90 px-3 py-1 rounded-full text-lg font-medium">
                {activity.category}
              </div>
            </div>

            <CardContent className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start gap-4 mb-3">
                <h2 className="text-xl font-bold font-zen-maru-gothic flex-1">{activity.title}</h2>
                <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg">{activity.duration}</span>
                </div>
              </div>

              <Link href="/outside/details" passHref legacyBehavior>
                <Button
                  className="w-full h-12 text-lg bg-[#276204] hover:bg-[#1E4A03] text-white font-zen-maru-gothic mt-auto"
                  component="a"
                >
                  詳細を見る
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function TestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">ダイアログを開く</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ダイアログのテスト</DialogTitle>
            <DialogDescription>
              shadcn/uiのダイアログコンポーネントのテストです。
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

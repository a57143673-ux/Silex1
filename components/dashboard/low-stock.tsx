"use client"

import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

const items = [
  { name: "معجون طماطم", left: 6, unit: "علبة" },
  { name: "حليب مجفف", left: 3, unit: "كيس" },
  { name: "شاي سيلاني", left: 8, unit: "علبة" },
  { name: "صابون غسيل", left: 4, unit: "قطعة" },
]

export function LowStock() {
  return (
    <Card className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">قاربت على النفاد</h2>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <span className="text-sm font-medium text-foreground">{item.name}</span>
            <span className="text-xs font-semibold text-destructive">
              {item.left} {item.unit}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

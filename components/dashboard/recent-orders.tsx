"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const orders = [
  { id: "#١٠٤٨", customer: "زينب حسن", total: "٧٥٠", type: "نقد" },
  { id: "#١٠٤٧", customer: "علي محمود", total: "١٬٢٠٠", type: "دين" },
  { id: "#١٠٤٦", customer: "نور صباح", total: "٤٣٠", type: "نقد" },
  { id: "#١٠٤٥", customer: "كرار عماد", total: "٢٬١٠٠", type: "دين" },
  { id: "#١٠٤٤", customer: "سجى وليد", total: "٩٨٠", type: "نقد" },
]

export function RecentOrders() {
  return (
    <Card className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground">آخر الفواتير</h2>
        <span className="text-xs text-muted-foreground">اليوم</span>
      </div>
      <div className="space-y-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{order.customer}</p>
              <p className="text-[11px] text-muted-foreground">{order.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={order.type === "دين" ? "outline" : "secondary"} className="text-[10px] font-normal">
                {order.type}
              </Badge>
              <span className="text-sm font-semibold text-foreground">{order.total} د.ع</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

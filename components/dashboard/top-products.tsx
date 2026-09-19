"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const products = [
  { name: "زيت الطبخ ٥ لتر", sold: 128, max: 150 },
  { name: "رز عنبر ١٠ كغم", sold: 96, max: 150 },
  { name: "سكر ناعم ١ كغم", sold: 84, max: 150 },
  { name: "شاي سيلاني", sold: 61, max: 150 },
  { name: "معجون طماطم", sold: 47, max: 150 },
]

export function TopProducts() {
  return (
    <Card className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground">المنتجات الأكثر مبيعاً</h2>
        <span className="text-xs text-muted-foreground">هذا الشهر</span>
      </div>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.name}>
            <div className="flex items-center justify-between mb-1.5 text-sm">
              <span className="font-medium text-foreground">{product.name}</span>
              <span className="text-muted-foreground">{product.sold} قطعة</span>
            </div>
            <Progress value={(product.sold / product.max) * 100} className="h-2" />
          </div>
        ))}
      </div>
    </Card>
  )
}

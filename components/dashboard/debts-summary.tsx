"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useStore, formatIQD } from "@/components/store/store-context"

export function DebtsSummary() {
  const { debtors } = useStore()
  const debts = debtors.slice(0, 4)
  return (
    <Card className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground">أحدث الديون</h2>
        <Link href="/debts" className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">
          عرض الكل <ArrowLeft className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {debts.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">لا توجد ديون مسجلة.</p> : debts.map((debt) => (
          <div key={debt.id} className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="text-xs bg-secondary">{debt.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{debt.name}</p>
              <Badge
                variant={debt.overdue ? "destructive" : "secondary"}
                className="text-[10px] mt-0.5 font-normal"
              >
                {debt.paid ? "تم التحصيل" : debt.overdue ? "متأخر" : "ضمن المدة"}
              </Badge>
            </div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">{formatIQD(debt.amount)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

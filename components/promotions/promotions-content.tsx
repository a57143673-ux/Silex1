"use client"

import { useMemo, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Megaphone, Tag, Gift, Percent, Send } from "lucide-react"
import { useStore, toArabicNumber } from "@/components/store/store-context"
import { toast } from "sonner"

const typeIcons: Record<string, typeof Tag> = {
  خصم: Percent,
  هدية: Gift,
  توصيل: Tag,
}

const templates = [
  "🎉 عرض خاص! خصم ١٥٪ على كل المشتريات لنهاية الأسبوع فقط. زوروا متجرنا!",
  "وصلتنا بضاعة جديدة! تفضلوا لمشاهدة أحدث المنتجات بأسعار مناسبة.",
  "تذكير: عرض اشترِ قطعتين واحصل على الثالثة مجاناً ينتهي غداً!",
]

export function PromotionsContent() {
  const { campaigns, toggleCampaign, addCampaign } = useStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [type, setType] = useState("خصم")

  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.active).length
    return [
      { title: "عروض نشطة", value: toArabicNumber(active), icon: Tag },
      { title: "رسائل مرسلة", value: "١٬٢٤٠", icon: Send },
      { title: "زبائن مستهدفون", value: "٣٨٦", icon: Megaphone },
    ]
  }, [campaigns])

  function handleToggle(id: string, campTitle: string, active: boolean) {
    toggleCampaign(id)
    toast.success(active ? `تم إيقاف حملة "${campTitle}"` : `تم تفعيل حملة "${campTitle}"`)
  }

  function handleAdd() {
    if (!title.trim() || !desc.trim()) {
      toast.error("يرجى إدخال عنوان ووصف الحملة")
      return
    }
    addCampaign({ title: title.trim(), desc: desc.trim(), type, active: true })
    toast.success(`تم إنشاء حملة "${title.trim()}"`)
    setTitle("")
    setDesc("")
    setType("خصم")
    setOpen(false)
  }

  return (
    <>
      <Header
        title="الترويج والعروض"
        description="أنشئ حملات ترويجية ورسائل تصل إلى زبائنك مباشرة."
        actions={
          <Button
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
          >
            + حملة جديدة
          </Button>
        }
      />

      <div className="mt-4 md:mt-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((item) => (
            <Card key={item.title} className="p-4 flex items-center gap-3 transition-all duration-300 hover:shadow-lg">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.title}</p>
                <p className="text-lg font-bold text-foreground">{item.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">الحملات</h2>
            {campaigns.map((campaign) => {
              const Icon = typeIcons[campaign.type] ?? Tag
              return (
                <Card
                  key={campaign.id}
                  className="p-4 flex items-center gap-3 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-foreground truncate">{campaign.title}</p>
                      <Badge variant="secondary" className="font-normal shrink-0">
                        {campaign.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{campaign.desc}</p>
                  </div>
                  <Switch
                    checked={campaign.active}
                    onCheckedChange={() => handleToggle(campaign.id, campaign.title, campaign.active)}
                    aria-label={`تفعيل حملة ${campaign.title}`}
                  />
                </Card>
              )
            })}
          </div>

          <Card className="p-4 h-fit">
            <h2 className="text-base font-semibold text-foreground mb-3">قوالب الرسائل الترويجية</h2>
            <div className="space-y-2.5">
              {templates.map((template, i) => (
                <div key={i} className="rounded-lg border border-border p-3 hover:border-primary/40 transition-colors">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{template}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.success("تم إرسال الرسالة إلى ٣٨٦ زبون")}
                    className="h-7 text-xs w-full hover:bg-secondary gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> إرسال للزبائن
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle>إنشاء حملة جديدة</DialogTitle>
            <DialogDescription>حدد نوع العرض وتفاصيله لإطلاق الحملة.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="camp-title">عنوان الحملة</Label>
              <Input
                id="camp-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: خصم نهاية الأسبوع"
              />
            </div>
            <div className="space-y-1.5">
              <Label>نوع العرض</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="خصم">خصم</SelectItem>
                  <SelectItem value="هدية">هدية</SelectItem>
                  <SelectItem value="توصيل">توصيل مجاني</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="camp-desc">وصف العرض</Label>
              <Textarea
                id="camp-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="مثال: خصم ١٥٪ على كل المواد الغذائية"
                className="min-h-20 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
              إلغاء
            </Button>
            <Button onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
              إطلاق الحملة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { useRef, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles, Send, Copy, Check } from "lucide-react"
import { toast } from "sonner"

const tones = ["ودّي", "رسمي", "مختصر", "اعتذار"] as const
type Tone = (typeof tones)[number]

const templates = [
  { title: "الرد على استفسار عن السعر", text: "أهلاً بك، سعر المنتج ١٢٬٠٠٠ دينار ويشمل التوصيل داخل المدينة. تحب أجهزلك الطلب؟" },
  { title: "تأكيد توفر المنتج", text: "نعم المنتج متوفر حالياً في المخزن، ونقدر نجهزه ونوصله لك اليوم إن شاء الله." },
  { title: "الاعتذار عن التأخير", text: "نعتذر منك عن التأخير، طلبك قيد التجهيز وراح يوصلك اليوم. نشكر صبرك وتفهمك." },
  { title: "متابعة دين مستحق", text: "سلام عليكم، تذكير ودّي بأن المبلغ المستحق ٣٬٢٠٠ دينار موعده هذا الأسبوع. شكراً لتعاونك." },
]

const suggestionsByTone: Record<Tone, string> = {
  "ودّي": "هلا وغلا فيك! نعم نوصلك الطلب اليوم بإذن الله، وإذا تحتاج شي ثاني إحنا بالخدمة.",
  "رسمي": "نشكر تواصلكم معنا. نؤكد لكم توفر المنتج وسيتم تجهيز الطلب وتوصيله اليوم. تحياتنا.",
  "مختصر": "نعم متوفر، ونوصله اليوم. شكراً.",
  "اعتذار": "نعتذر عن أي تأخير سابق، وسنحرص على توصيل طلبك اليوم في أسرع وقت. شكراً لتفهمك.",
}

type Message = { from: "customer" | "merchant"; text: string }

const initialConversation: Message[] = [
  { from: "customer", text: "السلام عليكم، شكد سعر الرز عنبر ٥ كيلو؟" },
  { from: "merchant", text: "وعليكم السلام، سعره ١٢٬٠٠٠ دينار ومتوفر حالياً." },
  { from: "customer", text: "زين، ممكن توصلوه اليوم؟" },
]

export function AssistantContent() {
  const [reply, setReply] = useState("")
  const [activeTone, setActiveTone] = useState<Tone>("ودّي")
  const [copied, setCopied] = useState<number | null>(null)
  const [conversation, setConversation] = useState<Message[]>(initialConversation)
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    })
  }

  function handleSend() {
    const text = reply.trim()
    if (!text) {
      toast.error("اكتب رداً قبل الإرسال")
      return
    }
    setConversation((prev) => [...prev, { from: "merchant", text }])
    setReply("")
    scrollToBottom()
    toast.success("تم إرسال الرد إلى الزبون")
  }

  function handleSuggest() {
    setReply(suggestionsByTone[activeTone])
    toast.success(`تم اقتراح رد بنبرة "${activeTone}"`)
  }

  function useTemplate(text: string) {
    setReply(text)
    toast.success("تم إدراج القالب في مربع الرد")
  }

  function copyTemplate(text: string, index: number) {
    navigator.clipboard?.writeText(text)
    setCopied(index)
    toast.success("تم نسخ القالب")
    setTimeout(() => setCopied(null), 1500)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <Header
        title="مساعد الردود على الزبائن"
        description="جهّز ردوداً سريعة ومهذبة على رسائل الزبائن بضغطة واحدة."
      />

      <div className="mt-4 md:mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">محادثة الزبون</h2>
            <Badge variant="secondary" className="gap-1 font-normal">
              <Sparkles className="w-3 h-3" /> مدعوم بالذكاء الاصطناعي
            </Badge>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 mb-4 min-h-48 max-h-80 overflow-y-auto pe-1">
            {conversation.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "merchant" ? "justify-start" : "justify-end"}`}>
                <div className="flex items-end gap-2 max-w-[80%]">
                  {msg.from === "customer" && (
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-[10px] bg-secondary">زب</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      msg.from === "merchant"
                        ? "bg-primary text-primary-foreground rounded-bs-sm"
                        : "bg-secondary text-foreground rounded-be-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-border pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">نبرة الرد:</span>
              {tones.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setActiveTone(tone)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 ${
                    activeTone === tone
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب ردك هنا أو اختر قالباً جاهزاً..."
              className="min-h-20 resize-none text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSend}
                className="flex-1 h-9 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 gap-1.5"
              >
                <Send className="w-4 h-4" /> إرسال الرد
              </Button>
              <Button onClick={handleSuggest} variant="outline" className="h-9 text-sm bg-transparent gap-1.5">
                <Sparkles className="w-4 h-4" /> اقتراح
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-base font-semibold text-foreground mb-3">قوالب جاهزة</h2>
          <div className="space-y-2.5">
            {templates.map((template, i) => (
              <div
                key={template.title}
                className="rounded-lg border border-border p-3 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-foreground">{template.title}</p>
                  <button
                    onClick={() => copyTemplate(template.text, i)}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    aria-label="نسخ القالب"
                  >
                    {copied === i ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{template.text}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => useTemplate(template.text)}
                  className="h-7 text-xs w-full hover:bg-secondary"
                >
                  استخدام القالب
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

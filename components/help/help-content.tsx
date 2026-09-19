"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, MessageCircle } from "lucide-react"

const helpCategories = [
  {
    icon: BookOpen,
    title: "دليل الاستخدام",
    description: "تصفّح الشروحات والأدلة الشاملة لإدارة متجرك",
    color: "bg-primary",
  },
  {
    icon: MessageCircle,
    title: "مجتمع التجّار",
    description: "تواصل مع تجّار آخرين واحصل على إجابات",
    color: "bg-teal-600",
  },
]

const faqs = [
  {
    question: "كيف أضيف ديناً جديداً على زبون؟",
    answer: "من صفحة دفتر الديون اضغط زر 'إضافة دين جديد' وأدخل اسم الزبون والمبلغ وتاريخ الاستحقاق.",
  },
  {
    question: "كيف أتابع المنتجات القريبة من النفاد؟",
    answer: "افتح صفحة المخازن، وستظهر لك المنتجات المنخفضة والمنتهية مع مؤشر الكمية لكل منتج.",
  },
  {
    question: "كيف أرسل عرضاً ترويجياً للزبائن؟",
    answer: "من صفحة الترويج اختر قالب رسالة جاهز أو أنشئ حملة جديدة ثم اضغط 'إرسال للزبائن'.",
  },
  {
    question: "كيف أستفيد من مساعد الردود؟",
    answer: "من صفحة مساعد الردود اختر نبرة الرد وقالباً جاهزاً، أو اطلب اقتراحاً ثم أرسل الرد للزبون.",
  },
]

export function HelpContent() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="relative">
        <Search className="w-5 h-5 absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="ابحث في المساعدة..." className="pe-10 h-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpCategories.map((category, index) => (
          <Card
            key={category.title}
            className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${category.color}`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-6">الأسئلة الشائعة</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="p-4 rounded-lg border border-border hover:bg-secondary transition-all duration-300 animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <h4 className="font-medium mb-2">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

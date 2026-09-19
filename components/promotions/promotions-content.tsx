"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Megaphone, Plus, Image as ImageIcon, Send, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const defaultForm = {
  title: "",
  template_type: "خصم",
  message_body: "",
  image_url: "",
}

export function PromotionsContent() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(defaultForm)

  const fetchCampaigns = async () => {
    const { data, error } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false })
    if (!error && data) setCampaigns(data)
  }

  useEffect(() => {
    void fetchCampaigns()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return
      setUploading(true)

      const file = e.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `campaigns/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("product-images").getPublicUrl(filePath)
      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }))
    } catch (err) {
      console.error("خطأ في رفع الصورة:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmitCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message_body.trim()) return

    try {
      setSubmitting(true)
      const { error } = await supabase.from("campaigns").insert([
        {
          title: formData.title.trim(),
          template_type: formData.template_type,
          message_body: formData.message_body.trim(),
          image_url: formData.image_url || null,
          status: "pending",
        },
      ])

      if (error) throw error

      setIsModalOpen(false)
      setFormData(defaultForm)
      await fetchCampaigns()
    } catch (err) {
      console.error("خطأ في إنشاء الحملة:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "pending")
      return {
        label: "بانتظار موافقة المدير",
        className: "bg-amber-100 text-amber-800",
        icon: Clock,
      }

    if (status === "approved" || status === "active")
      return {
        label: status === "active" ? "تم النشر / نشطة" : "تمت الموافقة",
        className: "bg-emerald-100 text-emerald-800",
        icon: CheckCircle2,
      }

    return {
      label: "مرفوضة من المدير",
      className: "bg-red-100 text-red-800",
      icon: XCircle,
    }
  }

  return (
    <div className="p-8 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الحملات والترويج</h1>
          <p className="text-sm text-gray-500">قم بإعداد طلبات البث الإعلاني وإرسالها للمدير للموافق عليها</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-800 transition"
        >
          <Plus className="h-5 w-5" /> إنشاء حملة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.length === 0 ? (
          <div className="col-span-2 bg-white p-12 rounded-xl border text-center text-gray-400">
            لا توجد حملات إعلانية حالياً. اضغط "إنشاء حملة جديدة" للبدء.
          </div>
        ) : (
          campaigns.map((item) => {
            const statusInfo = getStatusBadge(item.status)
            const Icon = statusInfo.icon
            const isActive = item.status === "active" || item.status === "approved"

            return (
              <div key={item.id} className="bg-white p-5 rounded-xl border space-y-4 shadow-sm">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img src={item.image_url} alt="صورة الإعلان" className="w-12 h-12 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
                        <Megaphone className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <span className="text-xs text-gray-400">قالب: {item.template_type}</span>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.className}`}>
                    <Icon className="h-3 w-3" />
                    {statusInfo.label}
                  </span>
                </div>

                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">{item.message_body}</p>

                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-xs text-gray-500">حالة البث:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">{isActive ? "مفعل" : "غير مفعل (يتطلب موافقة)"}</span>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-emerald-600" : "bg-gray-300"}`}>
                      <span className={`absolute start-1 h-4 w-4 rounded-full bg-white transition-[inset-inline-start,inset-inline-end] ${isActive ? "start-auto end-1" : ""}`} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="font-bold text-lg text-gray-800 border-b pb-2">إنشاء طلب حملة ترويجية جديدة</h2>

            <form onSubmit={(e) => void handleSubmitCampaign(e)} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">عنوان الحملة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خصم بداية الشهر"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">نوع القالب</label>
                <Select
                  value={formData.template_type}
                  onValueChange={(template_type) => setFormData({ ...formData, template_type })}
                >
                  <SelectTrigger className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-right text-sm shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="خصم">قالب خصومات ونسبة مئوية</SelectItem>
                    <SelectItem value="هدية">قالب اشترِ قطعة واحصل على قطعة</SelectItem>
                    <SelectItem value="منتج جديد">قالب وصول بضاعة جديدة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">نص الرسالة الترويجية</label>
                <textarea
                  required
                  rows={3}
                  placeholder="اكتب تفاصيل العرض..."
                  value={formData.message_body}
                  onChange={(e) => setFormData({ ...formData, message_body: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">صورة الإعلان (اختياري)</label>
                <div className="border border-dashed p-3 rounded-lg text-center flex flex-col items-center gap-1">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs" />
                  {uploading && <span className="text-xs text-amber-600">جاري رفع الصورة...</span>}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={uploading || submitting}
                  className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-emerald-800 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" /> {submitting ? "جارٍ الإرسال..." : "إرسال للمدير للمراجعة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

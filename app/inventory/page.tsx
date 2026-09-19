"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const emptyForm = {
  title: "",
  category: "مواد غذائية",
  price: "",
  stock: "",
}

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*")
    if (!error && data) setProducts(data)
  }

  const handleSubmit = async () => {
    const price = Number(form.price)
    const stock = Number(form.stock)

    if (!form.title.trim() || Number.isNaN(price) || Number.isNaN(stock) || price < 0 || stock < 0) {
      alert("يرجى إدخال اسم المنتج والسعر والكمية بشكل صحيح")
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.from("products").insert({
        title: form.title.trim(),
        category: form.category,
        price,
        stock,
        status: stock === 0 ? "نفاذ" : "متوفر",
      })

      if (error) throw error

      setForm(emptyForm)
      setShowForm(false)
      await fetchProducts()
    } catch (error) {
      console.error("Error adding product:", error)
      alert("تعذر إضافة المنتج")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${productId}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("product-images").getPublicUrl(filePath)

      await supabase.from("products").update({ image_url: data.publicUrl }).eq("id", productId)
      await fetchProducts()
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">قائمة المنتجات</h1>
        <button
          onClick={() => setShowForm((value) => !value)}
          className="bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {showForm ? "إغلاق" : "+ إضافة منتج"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم المنتج</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="مثال: أرز أبيض"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الصنف</label>
              <Select
                value={form.category}
                onValueChange={(category) => setForm({ ...form, category })}
              >
                <SelectTrigger className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 text-right shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="مواد غذائية">مواد غذائية</SelectItem>
                  <SelectItem value="مشروبات">مشروبات</SelectItem>
                  <SelectItem value="ألبان">ألبان</SelectItem>
                  <SelectItem value="منظفات">منظفات</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">السعر</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="1500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الكمية</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg">
              إلغاء
            </button>
            <button
              onClick={() => void handleSubmit()}
              disabled={saving}
              className="bg-emerald-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "حفظ المنتج"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">الصورة</th>
              <th className="p-4">المنتج</th>
              <th className="p-4">الصنف</th>
              <th className="p-4">المخزون</th>
              <th className="p-4">السعر</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-500">
                  لا توجد منتجات حالياً في المخزن. اضغط "+ إضافة منتج" للبدء.
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => void handleImageUpload(e, item.id)}
                      className="text-xs"
                    />
                  </td>
                  <td className="p-4 font-medium">{item.title}</td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4">{item.stock}</td>
                  <td className="p-4">{item.price} د.ع</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "استلام"
                          ? "bg-blue-100 text-blue-700"
                          : item.status === "نفاذ"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="border border-emerald-600 text-emerald-700 px-3 py-1 rounded-md text-sm hover:bg-emerald-50">
                      + استلام
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {uploading && <p className="text-sm text-gray-600">جارٍ رفع الصورة...</p>}
    </div>
  )
}

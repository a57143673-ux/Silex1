"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const emptyForm = {
  customer_name: "",
  phone: "",
  amount: "",
  due_date: "",
}

export default function DebtsPage() {
  const [debts, setDebts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    void fetchDebts()
  }, [])

  const fetchDebts = async () => {
    const { data, error } = await supabase.from("debts").select("*")
    if (!error && data) setDebts(data)
  }

  const handleSubmit = async () => {
    const amount = Number(form.amount)

    if (!form.customer_name.trim() || Number.isNaN(amount) || amount <= 0 || !form.due_date) {
      alert("يرجى إدخال اسم الزبون والمبلغ وتاريخ الاستحقاق بشكل صحيح")
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.from("debts").insert({
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim() || null,
        amount,
        due_date: form.due_date,
        status: "ضمن المدة",
      })

      if (error) throw error

      setForm(emptyForm)
      setShowForm(false)
      await fetchDebts()
    } catch (error) {
      console.error("Error adding debt:", error)
      alert("تعذر إضافة الدين")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">دفتر الديون</h1>
        <button
          onClick={() => setShowForm((value) => !value)}
          className="bg-emerald-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? "إغلاق" : "+ إضافة دين جديد"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم الزبون</label>
              <input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="مثال: حسن علي"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الهاتف</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="0770 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المبلغ</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="1500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
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
              {saving ? "جاري الحفظ..." : "حفظ الدين"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">الزبون</th>
              <th className="p-4">الهاتف</th>
              <th className="p-4">المبلغ</th>
              <th className="p-4">تاريخ الاستحقاق</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {debts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  لا توجد ديون مسجلة حالياً.
                </td>
              </tr>
            ) : (
              debts.map((debt) => (
                <tr key={debt.id} className="border-b">
                  <td className="p-4 font-medium">{debt.customer_name}</td>
                  <td className="p-4">{debt.phone}</td>
                  <td className="p-4">{debt.amount} د.ع</td>
                  <td className="p-4">{debt.due_date}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        debt.status === "متأخر" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {debt.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="border px-3 py-1 rounded-md text-sm hover:bg-gray-50">
                      تحصيل
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

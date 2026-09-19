"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"

export type Debtor = {
  id: string
  name: string
  phone: string
  amount: number
  date: string
  overdue: boolean
  paid: boolean
}

export type Product = {
  id: string
  name: string
  category: string
  stock: number
  max: number
  price: number
  imageUrl?: string | null
}

export type Campaign = {
  id: string
  title: string
  desc: string
  type: string
  active: boolean
}

export type Order = {
  id: string
  customer: string
  items: number
  total: number
  status: "مكتمل" | "قيد التجهيز" | "ملغى"
  time: string
}

type StoreContextValue = {
  debtors: Debtor[]
  products: Product[]
  campaigns: Campaign[]
  orders: Order[]
  query: string
  setQuery: (q: string) => void
  isLoading: boolean
  dataError: string | null
  addDebtor: (d: Omit<Debtor, "id" | "paid">) => Promise<void>
  collectDebt: (id: string) => Promise<void>
  addProduct: (p: Omit<Product, "id">) => Promise<void>
  restockProduct: (id: string, amount: number) => Promise<void>
  addCampaign: (c: Omit<Campaign, "id">) => void
  toggleCampaign: (id: string) => void
  addOrder: (o: Omit<Order, "id" | "time">) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

let counter = 0
const uid = () => `id-${Date.now()}-${counter++}`

const initialCampaigns: Campaign[] = [
  { id: uid(), title: "خصم نهاية الأسبوع", desc: "خصم ١٥٪ على كل المواد الغذائية", type: "خصم", active: true },
  { id: uid(), title: "اشترِ ٢ واحصل على ١", desc: "على منتجات الألبان المختارة", type: "هدية", active: true },
  { id: uid(), title: "عرض الزبائن الجدد", desc: "توصيل مجاني لأول طلب", type: "توصيل", active: false },
  { id: uid(), title: "تخفيضات العيد", desc: "خصومات تصل إلى ٣٠٪", type: "خصم", active: false },
]

const initialOrders: Order[] = [
  { id: uid(), customer: "حسن علي", items: 5, total: 24000, status: "مكتمل", time: "قبل ١٠ دقائق" },
  { id: uid(), customer: "زينب حسن", items: 2, total: 8400, status: "قيد التجهيز", time: "قبل ٢٥ دقيقة" },
  { id: uid(), customer: "مروان قاسم", items: 8, total: 41000, status: "مكتمل", time: "قبل ساعة" },
  { id: uid(), customer: "أم كرار", items: 3, total: 12500, status: "ملغى", time: "قبل ساعتين" },
]

export function StoreProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStoreData() {
      if (!supabase) {
        setDataError("تعذر الاتصال بقاعدة البيانات. تحقق من إعدادات Supabase في ملف .env.local")
        setIsLoading(false)
        return
      }

      const [{ data: productRows, error: productsError }, { data: debtRows, error: debtsError }] = await Promise.all([
        supabase.from("products").select("*").order("title"),
        supabase.from("debts").select("*").order("due_date", { ascending: true }),
      ])

      if (productsError || debtsError) {
        setDataError(productsError?.message ?? debtsError?.message ?? "تعذر تحميل بيانات المتجر")
      } else {
        setProducts(
          (productRows ?? []).map((row) => ({
            id: row.id,
            name: row.title,
            category: "مواد غذائية",
            stock: Number(row.stock),
            max: Math.max(100, Number(row.stock) * 2),
            price: Number(row.price),
            imageUrl: row.image_url,
          })),
        )
        setDebtors(
          (debtRows ?? []).map((row) => ({
            id: row.id,
            name: row.customer_name,
            phone: row.phone ?? "—",
            amount: Number(row.amount),
            date: row.due_date ?? "غير محدد",
            overdue: row.status === "متأخر",
            paid: row.status === "تم الاستلام",
          })),
        )
      }
      setIsLoading(false)
    }

    void loadStoreData()
  }, [])

  const value = useMemo<StoreContextValue>(
    () => ({
      debtors,
      products,
      campaigns,
      orders,
      query,
      setQuery,
      isLoading,
      dataError,
      addDebtor: async (d) => {
        if (!supabase) return
        const { data, error } = await supabase
          .from("debts")
          .insert({
            customer_name: d.name,
            phone: d.phone,
            amount: d.amount,
            due_date: d.date,
            status: "متأخر",
          })
          .select()
          .single()
        if (error) throw error
        setDebtors((prev) => [{ ...d, id: data.id, paid: false }, ...prev])
      },
      collectDebt: async (id) => {
        if (!supabase) return
        const { error } = await supabase.from("debts").update({ status: "تم الاستلام" }).eq("id", id)
        if (error) throw error
        setDebtors((prev) => prev.map((x) => (x.id === id ? { ...x, paid: true, overdue: false } : x)))
      },
      addProduct: async (p) => {
        if (!supabase) return
        const { data, error } = await supabase
          .from("products")
          .insert({
            title: p.name,
            price: p.price,
            stock: p.stock,
            status: p.stock === 0 ? "نفاذ" : "متوفر",
            image_url: p.imageUrl ?? null,
          })
          .select()
          .single()
        if (error) throw error
        setProducts((prev) => [{ ...p, id: data.id, max: Math.max(100, p.stock * 2) }, ...prev])
      },
      restockProduct: async (id, amount) => {
        if (!supabase) return
        const product = products.find((item) => item.id === id)
        if (!product) return
        const stock = Math.min(product.max, product.stock + amount)
        const { error } = await supabase.from("products").update({ stock, status: "متوفر" }).eq("id", id)
        if (error) throw error
        setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, stock } : x)))
      },
      addCampaign: (c) => setCampaigns((prev) => [{ ...c, id: uid() }, ...prev]),
      toggleCampaign: (id) =>
        setCampaigns((prev) => prev.map((x) => (x.id === id ? { ...x, active: !x.active } : x))),
      addOrder: (o) => setOrders((prev) => [{ ...o, id: uid(), time: "الآن" }, ...prev]),
    }),
    [debtors, products, campaigns, orders, query, isLoading, dataError],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

// Arabic-Indic digit formatting helpers
const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
export function toArabicNumber(n: number): string {
  return n
    .toLocaleString("en-US")
    .replace(/,/g, "٬")
    .replace(/\d/g, (d) => arabicDigits[Number(d)])
}
export function formatIQD(n: number): string {
  return `${toArabicNumber(n)} د.ع`
}

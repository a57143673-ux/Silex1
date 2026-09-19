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

export type StoreSettings = {
  debt_notifications: boolean
  inventory_notifications: boolean
  order_notifications: boolean
  weekly_reports: boolean
  dark_mode: boolean
}

export type NotificationItem = {
  id: string
  title: string
  message: string
  type: "debt" | "inventory" | "order" | "report"
  createdAt: string
}

type StoreContextValue = {
  debtors: Debtor[]
  products: Product[]
  campaigns: Campaign[]
  orders: Order[]
  settings: StoreSettings
  notifications: NotificationItem[]
  query: string
  setQuery: (q: string) => void
  isLoading: boolean
  dataError: string | null
  addDebtor: (d: Omit<Debtor, "id" | "paid">) => Promise<void>
  collectDebt: (id: string) => Promise<void>
  addProduct: (p: Omit<Product, "id">) => Promise<void>
  restockProduct: (id: string, amount: number) => Promise<void>
  updateSetting: (key: keyof StoreSettings, value: boolean) => Promise<void>
  addCampaign: (c: Omit<Campaign, "id">) => void
  toggleCampaign: (id: string) => void
  addOrder: (o: Omit<Order, "id" | "time">) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

let counter = 0
const uid = () => `id-${Date.now()}-${counter++}`

const defaultSettings: StoreSettings = {
  debt_notifications: true,
  inventory_notifications: true,
  order_notifications: false,
  weekly_reports: false,
  dark_mode: false,
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
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

      const [{ data: productRows, error: productsError }, { data: debtRows, error: debtsError }, { data: settingsRow, error: settingsError }] = await Promise.all([
        supabase.from("products").select("*").order("title"),
        supabase.from("debts").select("*").order("due_date", { ascending: true }),
        supabase.from("settings").select("*").maybeSingle(),
      ])

      if (productsError || debtsError) {
        setDataError(productsError?.message ?? debtsError?.message ?? "تعذر تحميل بيانات المتجر")
      } else {
        setProducts(
          (productRows ?? []).map((row) => ({
            id: row.id,
            name: row.title,
            category: row.category ?? "مواد غذائية",
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

      if (settingsError) {
        console.warn("settings query failed:", settingsError.message)
      }

      if (settingsRow) {
        setSettings({
          debt_notifications: settingsRow.debt_notifications ?? true,
          inventory_notifications: settingsRow.inventory_notifications ?? true,
          order_notifications: settingsRow.order_notifications ?? false,
          weekly_reports: settingsRow.weekly_reports ?? false,
          dark_mode: settingsRow.dark_mode ?? false,
        })
      } else {
        const { error: insertError } = await supabase.from("settings").insert(defaultSettings).select().single()
        if (!insertError) {
          setSettings(defaultSettings)
        }
      }

      setIsLoading(false)
    }

    void loadStoreData()
  }, [])

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = []

    if (settings.inventory_notifications) {
      products
        .filter((product) => product.stock > 0 && product.stock <= 10)
        .slice(0, 3)
        .forEach((product) => {
          items.push({
            id: `inventory-${product.id}`,
            title: "منتج قريب من النفاد",
            message: `${product.name} تبقى ${product.stock} وحدات فقط`,
            type: "inventory",
            createdAt: new Date().toISOString(),
          })
        })
    }

    if (settings.debt_notifications) {
      debtors
        .filter((debtor) => !debtor.paid && debtor.overdue)
        .slice(0, 3)
        .forEach((debtor) => {
          items.push({
            id: `debt-${debtor.id}`,
            title: "دين مستحق",
            message: `${debtor.name} لديه مبلغ ${debtor.amount} د.ع مستحق`,
            type: "debt",
            createdAt: new Date().toISOString(),
          })
        })
    }

    if (settings.order_notifications) {
      orders.slice(0, 2).forEach((order) => {
        items.push({
          id: `order-${order.id}`,
          title: "طلب جديد",
          message: `${order.customer} أرسل طلباً جديداً بقيمة ${order.total} د.ع`,
          type: "order",
          createdAt: new Date().toISOString(),
        })
      })
    }

    if (settings.weekly_reports) {
      items.push({
        id: "report-weekly",
        title: "تقرير الأسبوع",
        message: "ملخص المبيعات الأسبوعي جاهز للمراجعة.",
        type: "report",
        createdAt: new Date().toISOString(),
      })
    }

    return items.slice(0, 6)
  }, [debtors, orders, products, settings])

  const value = useMemo<StoreContextValue>(
    () => ({
      debtors,
      products,
      campaigns,
      orders,
      settings,
      notifications,
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
            category: p.category,
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
      updateSetting: async (key, value) => {
        if (!supabase) return
        const nextSettings = { ...settings, [key]: value }
        const { error } = await supabase.from("settings").update(nextSettings).eq("id", "1")
        if (!error) setSettings(nextSettings)
      },
      addCampaign: (c) => setCampaigns((prev) => [{ ...c, id: uid() }, ...prev]),
      toggleCampaign: (id) =>
        setCampaigns((prev) => prev.map((x) => (x.id === id ? { ...x, active: !x.active } : x))),
      addOrder: (o) => setOrders((prev) => [{ ...o, id: uid(), time: "الآن" }, ...prev]),
    }),
    [debtors, products, campaigns, orders, settings, notifications, query, isLoading, dataError],
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

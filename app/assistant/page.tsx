"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Bot, Send, Power, MessageCircle } from "lucide-react"

export default function AssistantPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [simulationMessage, setSimulationMessage] = useState("")
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationStatus, setSimulationStatus] = useState("")
  const [globalAutoReply, setGlobalAutoReply] = useState(true)

  useEffect(() => {
    void fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConv) {
      void fetchMessages(selectedConv.id)
    }
  }, [selectedConv])

  const fetchConversations = async () => {
    const { data, error } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false })
    if (!error && data) {
      setConversations(data)
      if (data.length > 0 && !selectedConv) setSelectedConv(data[0])
    }
  }

  const fetchMessages = async (convId: string) => {
    const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true })
    if (!error && data) setMessages(data)
  }

  const toggleCustomerAutoReply = async () => {
    if (!selectedConv) return
    const updatedStatus = !selectedConv.auto_reply_enabled

    const { error } = await supabase.from("conversations").update({ auto_reply_enabled: updatedStatus }).eq("id", selectedConv.id)
    if (!error) {
      setSelectedConv({ ...selectedConv, auto_reply_enabled: updatedStatus })
      await fetchConversations()
    }
  }

  const handleSendHumanMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConv) return

    const payload = {
      conversation_id: selectedConv.id,
      sender: "human",
      content: newMessage.trim(),
    }

    const { error } = await supabase.from("messages").insert([payload])
    if (!error) {
      await supabase.from("conversations").update({
        last_message: newMessage.trim(),
        updated_at: new Date().toISOString(),
      }).eq("id", selectedConv.id)

      setMessages((prev) => [
        ...prev,
        {
          sender: "human",
          content: newMessage.trim(),
          created_at: new Date().toISOString(),
        },
      ])
      setNewMessage("")
      await fetchConversations()
    }
  }

  const handleSimulateCustomerMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = simulationMessage.trim()
    if (!content || !selectedConv || isSimulating) return

    setIsSimulating(true)
    setSimulationStatus("")
    const createdAt = new Date().toISOString()
    const customerMessage = { conversation_id: selectedConv.id, sender: "customer", content }
    const { error: customerError } = await supabase.from("messages").insert([customerMessage])

    if (customerError) {
      setSimulationStatus("تعذر حفظ رسالة المحاكاة في المحادثة")
      setIsSimulating(false)
      return
    }

    setMessages((prev) => [...prev, { ...customerMessage, created_at: createdAt }])
    setSimulationMessage("")

    if (!globalAutoReply || !selectedConv.auto_reply_enabled) {
      setSimulationStatus("توقّف الرد: الأتمتة متوقفة لهذه المحادثة")
      setIsSimulating(false)
      return
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerMessage: content,
          chatHistory: messages.slice(-20).map((message) => ({
            role: message.sender === "customer" ? "user" : "model",
            content: message.content,
          })),
        }),
      })
      const result = (await response.json()) as { reply?: string; error?: string }
      if (!response.ok || !result.reply) throw new Error(result.error ?? "تعذر الحصول على رد")

      const aiMessage = { conversation_id: selectedConv.id, sender: "ai", content: result.reply }
      const { error: aiError } = await supabase.from("messages").insert([aiMessage])
      if (aiError) throw new Error("تم توليد الرد لكن تعذر حفظه")

      setMessages((prev) => [...prev, { ...aiMessage, created_at: new Date().toISOString() }])
      setSimulationStatus("تم الرد تلقائيًا حسب تخصص المساعد")
    } catch (error) {
      setSimulationStatus(error instanceof Error ? `توقّف الرد: ${error.message}` : "توقّف الرد بسبب خطأ غير متوقع")
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col gap-4" dir="rtl">
      <div className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${globalAutoReply ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">مساعد الردود الآلي (Meta Co-Pilot)</h1>
            <p className="text-xs text-gray-500">تحكم بوضع الرد التلقائي أو التدخل اليدوي</p>
          </div>
        </div>

        <button
          onClick={() => setGlobalAutoReply((value) => !value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            globalAutoReply ? "bg-emerald-700 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          <Power className="h-4 w-4" />
          {globalAutoReply ? "الأتمتة العامة: مفعلة" : "الأتمتة العامة: متوقفة"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden">
        <div className="col-span-4 bg-white rounded-xl border p-4 overflow-y-auto space-y-2">
          <h2 className="text-xs text-gray-400 font-semibold mb-3">المحادثات النشطة</h2>
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">لا توجد محادثات حية بعد.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedConv?.id === conv.id ? "border-emerald-600 bg-emerald-50/30" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm">{conv.customer_name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      conv.auto_reply_enabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {conv.auto_reply_enabled ? "رد ذكي" : "رد يدوي"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.last_message || "محادثة جديدة"}</p>
              </div>
            ))
          )}
        </div>

        <div className="col-span-8 bg-white rounded-xl border flex flex-col overflow-hidden">
          {selectedConv ? (
            <>
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="font-bold text-gray-800">{selectedConv.customer_name}</h3>
                  <span className="text-xs text-gray-500">
                    {selectedConv.customer_phone_or_id} • {selectedConv.platform}
                  </span>
                </div>
                <button
                  onClick={() => void toggleCustomerAutoReply()}
                  className={`text-xs px-3 py-1.5 rounded-md border font-medium transition ${
                    selectedConv.auto_reply_enabled
                      ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  {selectedConv.auto_reply_enabled ? "إيقاف الرد الآلي للزبون (تدخل يدوي)" : "تفعيل الرد الآلي للزبون"}
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
                {messages.map((msg, index) => (
                  <div key={`${msg.id ?? index}`} className={`flex gap-2 ${msg.sender === "customer" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[70%] p-3 rounded-xl text-sm ${
                      msg.sender === "customer"
                        ? "bg-white border text-gray-800"
                        : msg.sender === "human"
                          ? "bg-emerald-700 text-white"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    }`}>
                      <div className="text-[10px] opacity-70 mb-1 font-semibold">
                        {msg.sender === "customer" ? "الزبون" : msg.sender === "human" ? "أنت (يدوي)" : "الذكاء الاصطناعي"}
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => void handleSimulateCustomerMessage(e)} className="p-3 border-t bg-emerald-50/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <MessageCircle className="h-4 w-4" /> محاكاة رسالة من الزبون
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="مثال: هل التوصيل متاح اليوم؟"
                    value={simulationMessage}
                    onChange={(e) => setSimulationMessage(e.target.value)}
                    disabled={isSimulating}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={isSimulating || !simulationMessage.trim()}
                    className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    {isSimulating ? "جارٍ الاختبار..." : "اختبار الرد"}
                  </button>
                </div>
                {simulationStatus && <p className="text-xs text-emerald-800">{simulationStatus}</p>}
              </form>

              <form onSubmit={(e) => void handleSendHumanMessage(e)} className="p-3 border-t bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="اكتب ردك اليدوي هنا..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-600"
                />
                <button type="submit" className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1">
                  <Send className="h-4 w-4" /> إرسال
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              اختر محادثة لبدء المتابعة والرد اليدوي
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

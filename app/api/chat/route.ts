import { NextResponse } from "next/server"

type ChatMessage = {
  role: "user" | "model"
  content: string
}

type ChatRequest = {
  customerMessage?: string
  chatHistory?: ChatMessage[]
  storeInstructions?: {
    greetingMessage?: string
    deliveryInfo?: string
    workingHours?: string
  }
}

const defaultModel = "gemini-2.0-flash"

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false
  const message = value as Partial<ChatMessage>
  return (message.role === "user" || message.role === "model") && typeof message.content === "string"
}

export async function POST(request: Request) {
  let body: ChatRequest
  try {
    body = (await request.json()) as ChatRequest
  } catch {
    return NextResponse.json({ error: "بيانات الطلب غير صالحة" }, { status: 400 })
  }

  const customerMessage = body.customerMessage?.trim()
  if (!customerMessage || customerMessage.length > 4000) {
    return NextResponse.json({ error: "رسالة الزبون مطلوبة وبحد أقصى ٤٠٠٠ حرف" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "لم يتم إعداد GOOGLE_GEMINI_API_KEY على الخادم" },
      { status: 503 },
    )
  }

  const history = (body.chatHistory ?? []).filter(isChatMessage).slice(-20)
  const instructions = body.storeInstructions ?? {}
  const systemInstruction = [
    "أنت موظف خدمة عملاء في متجر عراقي.",
    "أجب بالعربية وبلهجة عراقية بسيطة ولبقة، وباختصار مفيد.",
    "لا تدّعِ معرفة معلومات غير موجودة، وإذا لم تعرف الإجابة اطلب من الزبون التواصل مع التاجر.",
    instructions.greetingMessage && `رسالة الترحيب المعتمدة: ${instructions.greetingMessage}`,
    instructions.deliveryInfo && `سياسة التوصيل: ${instructions.deliveryInfo}`,
    instructions.workingHours && `أوقات العمل: ${instructions.workingHours}`,
  ]
    .filter(Boolean)
    .join("\n")

  const contents = [
    ...history.map((message) => ({
      role: message.role,
      parts: [{ text: message.content.slice(0, 4000) }],
    })),
    {
      role: "user",
      parts: [{ text: customerMessage }],
    },
  ]

  try {
    const model = process.env.GOOGLE_GEMINI_MODEL || defaultModel
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      },
    )

    const result = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      error?: { message?: string }
    }

    if (!response.ok) {
      console.error("Gemini API error:", result.error?.message ?? response.statusText)
      return NextResponse.json({ error: "تعذر الحصول على رد من المساعد الذكي" }, { status: 502 })
    }

    const reply = result.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim()
    if (!reply) {
      return NextResponse.json({ error: "لم ينتج المساعد ردًا صالحًا" }, { status: 502 })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Gemini request failed:", error)
    return NextResponse.json({ error: "تعذر الاتصال بالمساعد الذكي" }, { status: 502 })
  }
}

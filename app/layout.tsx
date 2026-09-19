import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { StoreProvider } from "@/components/store/store-context"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" })

export const metadata: Metadata = {
  title: "متجري - لوحة تحكم التاجر",
  description: "أدر مبيعاتك وديونك ومخازنك وترويجك من مكان واحد",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="light" storageKey="mataji-theme">
          <StoreProvider>
            {children}
            <Toaster position="top-center" richColors />
          </StoreProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

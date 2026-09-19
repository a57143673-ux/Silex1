import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { HelpContent } from "@/components/help/help-content"

export default function HelpPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-6 lg:ms-64">
        <Header title="المساعدة والدعم" description="احصل على المساعدة في إدارة متجرك وإجابات للأسئلة الشائعة." />

        <div className="mt-6">
          <HelpContent />
        </div>
      </main>
    </div>
  )
}

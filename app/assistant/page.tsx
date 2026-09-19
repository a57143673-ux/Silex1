import { Sidebar } from "@/components/dashboard/sidebar"
import { AssistantContent } from "@/components/assistant/assistant-content"

export default function AssistantPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ms-64">
        <AssistantContent />
      </main>
    </div>
  )
}

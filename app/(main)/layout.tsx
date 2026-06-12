import Sidebar from "@/app/(main)/_components/sidebar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily removed auth protection to view the app directly
  return (
    <div className="h-full flex min-h-screen bg-white dark:bg-[#191919]">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

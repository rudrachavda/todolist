import Navbar from "@/app/(marketing)/_components/Navbar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily removed auth protection to view the app directly
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 sm:p-8">
        {children}
      </main>
    </div>
  )
}

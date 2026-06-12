// This navbar seems to be related to the marketing page, move it there. 
import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-bold text-xl tracking-tight">TaskFlow</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link 
              href="/dashboard" 
              className="text-sm px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Guest Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

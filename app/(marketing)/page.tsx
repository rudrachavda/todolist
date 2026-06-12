import Link from "next/link"

export default function MarketingPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900">
            <div className="text-center max-w-3xl mx-auto py-20 sm:py-32">
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
                    Organize your work, <br className="hidden sm:block" />
                    <span className="text-blue-600 dark:text-blue-500">simplify your life.</span>
                </h1>
                <p className="text-xl sm:text-2xl text-gray-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    TaskFlow is the production-ready to-do list app built to help you stay focused and achieve more every day.
                </p>
                <div className="flex justify-center">
                    <Link
                        href="/dashboard"
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
                    >
                        Enter Guest Mode
                    </Link>
                </div>
            </div>
        </div>
    )
}

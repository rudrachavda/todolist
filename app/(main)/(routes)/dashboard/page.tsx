import TodoList from "@/app/(main)/_components/TodoList"

export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col py-8">
      <header className="mb-10 pb-6 border-b border-gray-200 dark:border-zinc-800">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-zinc-400">
          Welcome to Guest Mode. Here are your tasks.
        </p>
      </header>
      
      <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sm:p-10">
        <TodoList userId="guest-user-123" />
      </div>
    </div>
  )
}

import { CheckCircle2 } from "lucide-react";

export const Logo = () => {
  return (
    <div className="hidden md:flex items-center gap-x-2 select-none">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
        <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={3} />
      </div>
      <p className="font-semibold text-xl tracking-tight font-space text-gray-900 dark:text-white">
        Reminders
      </p>
    </div>
  )
}
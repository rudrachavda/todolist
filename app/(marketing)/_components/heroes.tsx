"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  CalendarClock, 
  Inbox, 
  ListTodo,
  Clock,
  Home,
  Wifi,
  FileText,
  Download,
  Laptop
} from "lucide-react";

export const Heroes = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl mt-12 mb-20 w-full relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="w-full max-w-[900px] h-[550px] bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden flex flex-col relative z-10"
      >
        {/* Mac OS Window Header */}
        <div className="h-12 w-full bg-[#f5f5f7]/80 dark:bg-[#2c2c2e]/80 backdrop-blur-md flex items-center px-4 border-b border-black/5 dark:border-white/5">
          <div className="flex gap-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
        </div>

        {/* Main App Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-[240px] bg-[#f5f5f7]/50 dark:bg-[#1c1c1e]/50 border-r border-black/5 dark:border-white/5 flex flex-col p-4 backdrop-blur-xl">
            {/* Finder-style items as requested by user rule */}
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2 uppercase tracking-wider">Favorites</div>
            <div className="space-y-1 mb-6">
              <SidebarItem icon={<Home size={16} />} label="Home" color="text-blue-500" />
              <SidebarItem icon={<Clock size={16} />} label="Recents" color="text-blue-500" />
              <SidebarItem icon={<Wifi size={16} />} label="Airdrop" color="text-blue-500" />
              <SidebarItem icon={<FileText size={16} />} label="Documents" color="text-blue-500" />
              <SidebarItem icon={<Download size={16} />} label="Downloads" color="text-blue-500" />
            </div>

            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2 uppercase tracking-wider">Reminders Lists</div>
            <div className="space-y-1">
              <SidebarItem icon={<Inbox size={16} />} label="All" count={12} color="text-gray-500 dark:text-gray-400" bg="bg-gray-100 dark:bg-gray-800" />
              <SidebarItem icon={<CheckCircle2 size={16} />} label="Today" count={3} color="text-blue-500" bg="bg-blue-100 dark:bg-blue-500/20" />
              <SidebarItem icon={<CalendarClock size={16} />} label="Scheduled" count={5} color="text-red-500" bg="bg-red-100 dark:bg-red-500/20" />
              <SidebarItem icon={<ListTodo size={16} />} label="Completed" color="text-gray-500" bg="bg-gray-100 dark:bg-gray-800" />
            </div>
            
            <div className="mt-auto">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2 uppercase tracking-wider">Devices</div>
              <SidebarItem icon={<Laptop size={16} />} label="MacBook Pro" color="text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white dark:bg-[#000000] p-8 flex flex-col">
            <h2 className="text-3xl font-bold text-blue-500 dark:text-blue-400 mb-6 font-space tracking-tight">Today</h2>
            <div className="flex-1 overflow-y-auto space-y-4">
              <TodoItem text="Buy groceries for the week" note="Milk, eggs, bread, and fruits" time="10:00 AM" checked={true} />
              <TodoItem text="Finish landing page mockup" note="Use framer motion for animations" time="2:00 PM" checked={false} />
              <TodoItem text="Call mom" time="6:00 PM" checked={false} />
              <TodoItem text="Read Next.js documentation" note="Focus on app router" checked={false} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const SidebarItem = ({ icon, label, count, color, bg }: { icon: React.ReactNode, label: string, count?: number, color?: string, bg?: string }) => (
  <div className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors group">
    <div className="flex items-center gap-x-2">
      <div className={`flex items-center justify-center ${color} ${bg} rounded-md p-1 group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
    </div>
    {count !== undefined && (
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{count}</span>
    )}
  </div>
)

const TodoItem = ({ text, note, time, checked }: { text: string, note?: string, time?: string, checked: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex gap-x-3 items-start py-2 border-b border-gray-100 dark:border-gray-800/60 last:border-0"
  >
    <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
      {checked && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
    </div>
    <div className="flex flex-col">
      <span className={`text-[15px] font-medium ${checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}>{text}</span>
      {note && <span className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{note}</span>}
      {time && <span className="text-[12px] text-red-500 dark:text-red-400 mt-1">{time}</span>}
    </div>
  </motion.div>
)
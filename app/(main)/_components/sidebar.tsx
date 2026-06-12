"use client"

import { useState } from "react"
import {
    CalendarDays,
    CalendarClock,
    Inbox,
    Flag,
    Plus,
    Search,
    Home,
    Users,
    List,
} from "lucide-react"

export type List = {
    id: string
    name: string
    color: string
    count: number
    icon?: React.ReactNode
}

type SmartList = {
    id: string
    label: string
    icon: React.ReactNode
    count: number
    bg: string
    iconColor: string
}

const SMART_LISTS: SmartList[] = [
    {
        id: "today",
        label: "Today",
        icon: <CalendarDays className="w-5 h-5" />,
        count: 0,
        bg: "bg-blue-500",
        iconColor: "text-white",
    },
    {
        id: "scheduled",
        label: "Scheduled",
        icon: <CalendarClock className="w-5 h-5" />,
        count: 0,
        bg: "bg-red-500",
        iconColor: "text-white",
    },
    {
        id: "all",
        label: "All",
        icon: <Inbox className="w-5 h-5" />,
        count: 0,
        bg: "bg-gray-500",
        iconColor: "text-white",
    },
    {
        id: "flagged",
        label: "Flagged",
        icon: <Flag className="w-5 h-5" />,
        count: 0,
        bg: "bg-orange-500",
        iconColor: "text-white",
    },
]

const LIST_COLORS: Record<string, string> = {
    blue: "bg-blue-500",
    yellow: "bg-yellow-400",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
}

export default function Sidebar() {
    const [lists, setLists] = useState<List[]>([])
    const [activeListId, setActiveListId] = useState("today")
    
    const onSelectList = (id: string) => setActiveListId(id)
    const onAddList = () => {
        const newId = Date.now().toString()
        setLists([...lists, { id: newId, name: "New List", color: "blue", count: 0 }])
        setActiveListId(newId)
    }
    const totalCompleted = 0
    const [search, setSearch] = useState("")

    const filteredLists = search
        ? lists.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
        : lists

    return (
        <aside className="w-72 h-full flex flex-col bg-[#2c2c2e] text-white select-none shrink-0">
            {/* Search */}
            <div className="px-4 pt-6 pb-3">
                <div className="flex items-center gap-2 bg-[#3a3a3c] rounded-xl px-3 py-2">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none w-full"
                    />
                </div>
            </div>

            {/* Smart Lists Grid */}
            {!search && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                    {SMART_LISTS.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => onSelectList(s.id)}
                            className={`flex flex-col justify-between rounded-2xl p-3 h-20 transition-all ${activeListId === s.id
                                    ? "ring-2 ring-white/30 bg-[#3a3a3c]"
                                    : "bg-[#3a3a3c] hover:bg-[#48484a]"
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${s.bg}`}
                            >
                                <span className={s.iconColor}>{s.icon}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-xs font-medium text-gray-300">
                                    {s.label}
                                </span>
                                <span className="text-xl font-bold text-white leading-none">
                                    {s.count}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Divider */}
            {!search && <div className="mx-4 h-px bg-white/10 mb-4" />}

            {/* My Lists */}
            <div className="flex-1 overflow-y-auto px-2">
                {!search && (
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                        My Lists
                    </p>
                )}
                <ul className="space-y-0.5">
                    {filteredLists.map((list) => (
                        <li key={list.id}>
                            <button
                                onClick={() => onSelectList(list.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activeListId === list.id
                                        ? "bg-[#48484a]"
                                        : "hover:bg-[#3a3a3c]"
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${LIST_COLORS[list.color] ?? "bg-gray-500"
                                        }`}
                                >
                                    <List className="w-4 h-4 text-white" />
                                </div>
                                <span className="flex-1 text-sm font-medium text-gray-100 truncate">
                                    {list.name}
                                </span>
                                {list.count > 0 && (
                                    <span className="text-sm text-gray-400 font-medium">
                                        {list.count}
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Add List */}
            <div className="px-4 py-4 border-t border-white/10">
                <button
                    onClick={onAddList}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add List
                </button>
            </div>
        </aside>
    )
}
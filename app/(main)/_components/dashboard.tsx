// This seems to be related to the (main) folder, add it there.
"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { CheckCircle2, Circle, Trash2, Plus } from "lucide-react"
import { addTodo, toggleTodo, deleteTodo, getTodos } from "@/app/actions"

type Todo = {
  id: string;
  title: string;
  completed: boolean;
}

export default function TodoList({ userId }: { userId: string }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getTodos().then(setTodos)
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    const title = newTodo
    setNewTodo("")
    startTransition(async () => {
      await addTodo(title)
      const updated = await getTodos()
      setTodos(updated)
    })
  }

  const handleToggle = (id: string, completed: boolean) => {
    startTransition(async () => {
      await toggleTodo(id, !completed)
      const updated = await getTodos()
      setTodos(updated)
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteTodo(id)
      const updated = await getTodos()
      setTodos(updated)
    })
  }

  const activeTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  return (
    <div className="flex flex-col gap-8">
      {/* Input Form */}
      <form onSubmit={handleAdd} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Plus className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-32 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={isPending || !newTodo.trim()}
          className="absolute inset-y-2 right-2 px-6 bg-black dark:bg-white disabled:bg-gray-300 disabled:dark:bg-zinc-700 dark:text-black text-white rounded-xl transition-all font-medium active:scale-95 flex items-center"
        >
          Add
        </button>
      </form>

      {/* Todo List */}
      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-zinc-500">
          <div className="w-24 h-24 mb-6 rounded-full bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-gray-300 dark:text-zinc-600" />
          </div>
          <p className="text-lg font-medium">Your day is clear</p>
          <p className="text-sm mt-1">Add a task above to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-3">
            {activeTodos.map((todo) => (
              <div
                key={todo.id}
                className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    disabled={isPending}
                    className="text-gray-300 dark:text-zinc-600 hover:text-blue-500 transition-colors"
                  >
                    <Circle className="w-7 h-7" />
                  </button>
                  <span className="text-gray-800 dark:text-gray-200 text-lg">
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(todo.id)}
                  disabled={isPending}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {completedTodos.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4 px-2">
                Completed
              </h3>
              {completedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-transparent transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => handleToggle(todo.id, todo.completed)}
                      disabled={isPending}
                      className="text-green-500 transition-colors"
                    >
                      <CheckCircle2 className="w-7 h-7" />
                    </button>
                    <span className="text-gray-400 dark:text-zinc-600 text-lg line-through">
                      {todo.title}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    disabled={isPending}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

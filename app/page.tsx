'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Task = {
  id: string
  title: string
  completed: boolean
  completed_at: string | null
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const today = new Date().toISOString().split('T')[0]
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  useEffect(() => {
    checkUser()
    fetchTasks()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) router.push('/login')
  }

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .or(`completed.eq.false,completed_at.eq.${today}`)
      .order('created_at', { ascending: true })

    setTasks(data || [])
    setLoading(false)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return
    setAdding(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tasks')
      .insert({ title: newTask.trim(), user_id: user.id })
      .select()
      .single()

    if (data) setTasks(prev => [...prev, data])
    setNewTask('')
    setAdding(false)
  }

  async function toggleTask(task: Task) {
    const updates = task.completed
      ? { completed: false, completed_at: null }
      : { completed: true, completed_at: today }

    const { data } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', task.id)
      .select()
      .single()

    if (data) setTasks(prev => prev.map(t => t.id === task.id ? data : t))
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const pending = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)
  const progress = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <svg className="animate-spin w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 opacity-5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600 opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">Daytick</h1>
              <p className="text-zinc-500 text-xs mt-0.5">{dateLabel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition px-3 py-1.5 rounded-lg hover:bg-zinc-800"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Log out
          </button>
        </div>

        {/* Progress card */}
        {tasks.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-400">
                {completed.length === tasks.length
                  ? "All done for today 🎉"
                  : `${pending.length} task${pending.length !== 1 ? 's' : ''} remaining`}
              </p>
              <span className="text-sm font-semibold text-indigo-400">{progress}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Add task */}
        <form onSubmit={addTask} className="flex gap-2 mb-6">
          <input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={adding || !newTask.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-1.5"
          >
            {adding ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Add
          </button>
        </form>

        {/* Pending tasks */}
        <div className="flex flex-col gap-2 mb-6">
          {pending.length === 0 && completed.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">✨</p>
              <p className="text-zinc-400 font-medium">No tasks yet</p>
              <p className="text-zinc-600 text-sm mt-1">Add something to get started</p>
            </div>
          )}
          {pending.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-3.5 group transition"
            >
              <button
                onClick={() => toggleTask(task)}
                className="w-5 h-5 rounded-full border-2 border-zinc-600 hover:border-indigo-500 transition flex-shrink-0"
              />
              <span className="flex-1 text-sm text-zinc-100">{task.title}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-zinc-700 hover:text-red-400 transition opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-400/10"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Completed tasks */}
        {completed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <p className="text-zinc-600 text-xs uppercase tracking-widest">Completed today</p>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
            <div className="flex flex-col gap-2">
              {completed.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-4 py-3.5 group transition"
                >
                  <button
                    onClick={() => toggleTask(task)}
                    className="w-5 h-5 rounded-full border-2 border-indigo-500 bg-indigo-500 flex items-center justify-center flex-shrink-0 transition"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <span className="flex-1 text-sm text-zinc-500 line-through">{task.title}</span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-zinc-700 hover:text-red-400 transition opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-400/10"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
"use client"

import { useSession } from "@/contexts/SessionContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Settings, LogOut, Sun, Moon } from "lucide-react"
import SettingsModal from "@/components/SettingsModal"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useSession()
  const router = useRouter()
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false)

  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light"
    setTheme(savedTheme)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <h1 className="text-lg font-semibold whitespace-nowrap">
            Taskboard – Mini Trello
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Bem vindo, <span className="font-bold">{user.username}</span>
            </span>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
              title="Configurações"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
              title="Alternar tema"
            >
              {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={logout}
              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {isSettingsModalOpen && (
        <SettingsModal
          user={user}
          onClose={() => setSettingsModalOpen(false)}
        />
      )}
    </div>
  )
}

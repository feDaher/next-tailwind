// src/app/page.tsx

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { v4 as uuid } from "uuid"
import { Plus, Sun, Moon } from "lucide-react"

// --- Tipos ---
type Theme = "light" | "dark"
type Status = "todo" | "doing" | "done"

export type Task = {
  id: string
  title: string
  status: Status
  done: boolean
  createdAt: number
}

type Filter = "all" | "open" | "done"

// --- Constantes ---
const STORAGE_KEY = "taskboard:v1"

// --- Componente Principal ---
export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [theme, setTheme] = useState<Theme>("light")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")

  const dragTaskIdRef = useRef<string | null>(null)

  // Efeito para carregar tarefas do localStorage ou usar dados iniciais
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setTasks(JSON.parse(raw))
      } else {
        setTasks([
          {
            id: uuid(),
            title: "alterar ícone e metadata",
            status: "done",
            done: true,
            createdAt: Date.now(),
          },
          {
            id: uuid(),
            title: "alterar nome da primeira coluna",
            status: "done",
            done: true,
            createdAt: Date.now(),
          },
          {
            id: uuid(),
            title: "adicionar CURSOR-POINTER em todos os botoes",
            status: "done",
            done: true,
            createdAt: Date.now(),
          },
          {
            id: uuid(),
            title:
              'Condicional disable:botao "editar" quando estiver na parte de Done',
            status: "done",
            done: true,
            createdAt: Date.now(),
          },
        ])
      }
    } catch (error) {
      console.error("Falha ao carregar tarefas:", error)
    }
  }, [])

  // Efeito para salvar tarefas no localStorage sempre que forem alteradas
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  // Efeito para alternar o tema (dark/light mode)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  // Funções de manipulação de tarefas
  const addTask = (title: string, status: Status = "todo") => {
    if (!title.trim()) return
    const newTask: Task = {
      id: uuid(),
      title: title.trim(),
      status,
      done: status === "done",
      createdAt: Date.now(),
    }
    setTasks((prev) => [newTask, ...prev])
  }

  const updateTask = (id: string, patch: Partial<Omit<Task, "id">>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  // Memoização para filtrar tarefas com base na busca e no filtro
  const filteredTasks = useMemo(() => {
    const q = query.toLowerCase().trim()
    return tasks.filter((t) => {
      const matchesQuery = t.title.toLowerCase().includes(q)
      const matchesFilter =
        filter === "all" || (filter === "done" ? t.done : !t.done)
      return matchesQuery && matchesFilter
    })
  }, [tasks, query, filter])

  // Funções de Drag and Drop
  const onDragStart = (id: string) => (e: React.DragEvent) => {
    dragTaskIdRef.current = id
    e.dataTransfer.effectAllowed = "move"
  }

  const onDropColumn = (status: Status) => (e: React.DragEvent) => {
    e.preventDefault()
    const id = dragTaskIdRef.current
    if (!id) return
    updateTask(id, { status, done: status === "done" })
    dragTaskIdRef.current = null
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <h1 className="text-lg font-semibold whitespace-nowrap">
            Taskboard — Mini Trello
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tarefas..."
              className="px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 w-56"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="cursor-pointer px-3 py-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              title="Filtro"
            >
              <option value="all">Todas</option>
              <option value="open">Abertas</option>
              <option value="done">Concluídas</option>
            </select>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="cursor-pointer p-2 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              title="Alternar tema"
            >
              {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => {
                const title = prompt("Título da nova tarefa")
                if (title) addTask(title)
              }}
              className="cursor-pointer px-3 py-2 text-sm rounded-xl flex items-center gap-2 border border-emerald-300 dark:border-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            >
              <Plus size={16} />
              <span>Nova</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column
            status="todo"
            title="A Fazer"
            items={filteredTasks.filter((t) => t.status === "todo")}
            onDragOver={onDragOver}
            onDrop={onDropColumn("todo")}
            addTask={() =>
              addTask(prompt(`Nova tarefa em A Fazer`) || "", "todo")
            }
          >
            {filteredTasks
              .filter((t) => t.status === "todo")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={onDragStart(task.id)}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                />
              ))}
          </Column>

          <Column
            status="doing"
            title="Fazendo"
            items={filteredTasks.filter((t) => t.status === "doing")}
            onDragOver={onDragOver}
            onDrop={onDropColumn("doing")}
            addTask={() =>
              addTask(prompt(`Nova tarefa em Fazendo`) || "", "doing")
            }
          >
            {filteredTasks
              .filter((t) => t.status === "doing")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={onDragStart(task.id)}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                />
              ))}
          </Column>

          <Column
            status="done"
            title="Feito"
            items={filteredTasks.filter((t) => t.status === "done")}
            onDragOver={onDragOver}
            onDrop={onDropColumn("done")}
            addTask={() =>
              addTask(prompt(`Nova tarefa em Feito`) || "", "done")
            }
          >
            {filteredTasks
              .filter((t) => t.status === "done")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={onDragStart(task.id)}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                />
              ))}
          </Column>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="max-w-6xl mx-auto px-4 pb-8 text-xs text-zinc-500">
        Dica: arraste cartões entre colunas • clique no título para editar • use
        o checkbox para concluir.
      </footer>
    </div>
  )
}

// --- Componentes do Board ---
const Column = ({
  title,
  items,
  children,
  onDragOver,
  onDrop,
  addTask,
}: {
  title: string
  items: Task[]
  children: React.ReactNode
  onDragOver: React.DragEventHandler
  onDrop: React.DragEventHandler
  addTask: () => void
  status: Status
}) => (
  <section
    onDrop={onDrop}
    onDragOver={onDragOver}
    className="flex-1 min-h-[60vh] bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-700"
  >
    <header className="flex items-center justify-between mb-3">
      <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
        {title} <span className="text-xs text-zinc-500">({items.length})</span>
      </h2>
      <button
        onClick={addTask}
        className="cursor-pointer text-sm px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
      >
        + Add
      </button>
    </header>
    <div className="space-y-2">
      {children}
      {items.length === 0 && (
        <div className="text-sm text-zinc-500 italic py-6 text-center">
          Arraste tarefas para cá ou clique em “+ Add”.
        </div>
      )}
    </div>
  </section>
)

const TaskCard = ({
  task,
  onDragStart,
  updateTask,
  deleteTask,
}: {
  task: Task
  onDragStart: React.DragEventHandler
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void
  deleteTask: (id: string) => void
}) => (
  <article
    draggable
    onDragStart={onDragStart}
    className="group cursor-grab active:cursor-grabbing rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-sm hover:shadow-lg transition-shadow"
  >
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        className="cursor-pointer mt-1 size-4"
        checked={task.done}
        onChange={(e) =>
          updateTask(task.id, {
            done: e.target.checked,
            status: e.target.checked
              ? "done"
              : task.status === "done"
              ? "todo"
              : task.status,
          })
        }
        title="Marcar como concluída"
      />
      <div className="flex-1">
        <div
          onClick={() => {
            const t = prompt("Editar título", task.title)
            if (t !== null) updateTask(task.id, { title: t })
          }}
          className={`cursor-pointer text-sm leading-5 ${
            task.done
              ? "line-through text-zinc-400"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {task.title}
        </div>
        <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              const t = prompt("Editar título", task.title)
              if (t !== null) updateTask(task.id, { title: t })
            }}
            className="cursor-pointer text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={task.status === "done"}
          >
            Editar
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="cursor-pointer text-xs px-2 py-1 rounded border border-red-300 text-red-600 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  </article>
)

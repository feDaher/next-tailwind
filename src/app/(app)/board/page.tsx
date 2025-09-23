"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { v4 as uuid } from "uuid"
import {
  Plus,
  GripVertical,
  Search,
  Filter as FilterIcon,
  Edit2,
  Trash2,
} from "lucide-react"
import { Task } from "@/lib/types"
import TaskModal from "@/components/TaskModal"

// --- Tipos e Constantes ---
type Status = "todo" | "inprogress" | "done"
const STORAGE_KEY = "taskboard:v1"

// --- Componente Principal ---
export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "open" | "done">("all")

  const [isTaskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [modalTargetStatus, setModalTargetStatus] = useState<Status>("todo")
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const dragTaskIdRef = useRef<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTasks(JSON.parse(raw))
    } catch (error) {
      console.error("Falha ao carregar tarefas:", error)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const handleSaveTask = (taskToSave: Task) => {
    const taskExists = tasks.some((t) => t.id === taskToSave.id)
    if (taskExists) {
      setTasks(tasks.map((t) => (t.id === taskToSave.id ? taskToSave : t)))
    } else {
      setTasks((prev) => [taskToSave, ...prev])
    }
    setTaskModalOpen(false)
    setEditingTask(null)
  }

  const updateTask = (id: string, patch: Partial<Omit<Task, "id">>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const updateTaskStatus = (id: string, newStatus: Status) => {
    updateTask(id, { status: newStatus, done: newStatus === "done" })
  }

  const deleteTask = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta tarefa?")) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const openModalToCreate = (status: Status) => {
    setEditingTask(null)
    setModalTargetStatus(status)
    setTaskModalOpen(true)
  }

  const openModalToEdit = (task: Task) => {
    if (task.status === "done") return
    setEditingTask(task)
    setModalTargetStatus(task.status)
    setTaskModalOpen(true)
  }

  const filteredTasks = useMemo(() => {
    const q = query.toLowerCase().trim()
    return tasks.filter(
      (t) =>
        (t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)) &&
        (filter === "all" || (filter === "done" ? t.done : !t.done))
    )
  }, [tasks, query, filter])

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    dragTaskIdRef.current = id
    e.dataTransfer.effectAllowed = "move"
    setDraggedTaskId(id)
  }
  const onDropColumn = (status: Status) => (e: React.DragEvent) => {
    e.preventDefault()
    const id = dragTaskIdRef.current
    if (!id) return
    updateTaskStatus(id, status)
    dragTaskIdRef.current = null
    setDraggedTaskId(null)
  }
  const onDragEnd = () => {
    setDraggedTaskId(null)
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título ou descrição..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as "all" | "open" | "done")
              }
              className="appearance-none cursor-pointer pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filtro"
            >
              <option value="all">Todas</option>
              <option value="open">Abertas</option>
              <option value="done">Concluídas</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column
            title="A Fazer"
            tasks={filteredTasks.filter((t) => t.status === "todo")}
            onDrop={onDropColumn("todo")}
            onDragOver={onDragOver}
            onAddTask={() => openModalToCreate("todo")}
          >
            {filteredTasks
              .filter((t) => t.status === "todo")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={onDragStart(task.id)}
                  onDragEnd={onDragEnd}
                  isBeingDragged={draggedTaskId === task.id}
                  onEdit={() => openModalToEdit(task)}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                />
              ))}
          </Column>
          <Column
            title="Em Progresso"
            tasks={filteredTasks.filter((t) => t.status === "inprogress")}
            onDrop={onDropColumn("inprogress")}
            onDragOver={onDragOver}
            onAddTask={() => openModalToCreate("inprogress")}
          >
            {filteredTasks
              .filter((t) => t.status === "inprogress")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={onDragStart(task.id)}
                  onDragEnd={onDragEnd}
                  isBeingDragged={draggedTaskId === task.id}
                  onEdit={() => openModalToEdit(task)}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                />
              ))}
          </Column>
          <Column
            title="Feito"
            tasks={filteredTasks.filter((t) => t.status === "done")}
            onDrop={onDropColumn("done")}
            onDragOver={onDragOver}
            onAddTask={() => openModalToCreate("done")}
          >
            {filteredTasks
              .filter((t) => t.status === "done")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={onDragStart(task.id)}
                  onDragEnd={onDragEnd}
                  isBeingDragged={draggedTaskId === task.id}
                  onEdit={() => openModalToEdit(task)}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                />
              ))}
          </Column>
        </div>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          task={editingTask}
          status={modalTargetStatus}
          onClose={() => setTaskModalOpen(false)}
          onSave={handleSaveTask}
        />
      )}
    </>
  )
}

const Column = ({
  title,
  tasks,
  children,
  onDragOver,
  onDrop,
  onAddTask,
}: {
  title: string
  tasks: Task[]
  children: React.ReactNode
  onDragOver: React.DragEventHandler
  onDrop: React.DragEventHandler
  onAddTask: () => void
}) => {
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <section
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={() => setIsDragOver(false)}
      className={`flex-1 min-h-[70vh] bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-3 border-2 border-dashed border-transparent flex flex-col transition-colors duration-300 ${
        isDragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <header className="flex items-center justify-between mb-4 px-1">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {title}{" "}
          <span className="text-xs font-normal px-2 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
            {tasks.length}
          </span>
        </h2>
      </header>
      <div className="space-y-3 flex-grow">{children}</div>
      <button
        onClick={onAddTask}
        className="mt-4 w-full flex items-center justify-center gap-2 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-zinc-600 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors"
      >
        <Plus size={16} /> Adicionar Tarefa
      </button>
    </section>
  )
}

const TaskCard = ({
  task,
  onDragStart,
  onDragEnd,
  isBeingDragged,
  onEdit,
  updateTask,
  deleteTask,
}: {
  task: Task
  onDragStart: React.DragEventHandler
  onDragEnd: React.DragEventHandler
  isBeingDragged: boolean
  onEdit: () => void
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void
  deleteTask: (id: string) => void
}) => {
  const isDone = task.status === "done"

  return (
    <article
      draggable={!isDone}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group relative rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 ease-in-out
        ${
          isBeingDragged
            ? "opacity-50 scale-95 rotate-3"
            : "hover:shadow-lg hover:-translate-y-1"
        }
        ${
          isDone
            ? "cursor-default bg-zinc-50 dark:bg-zinc-800/50"
            : "cursor-grab active:cursor-grabbing"
        }`}
    >
      <div className="flex items-start p-3 gap-3">
        <span
          className={`pt-1 text-slate-400 ${
            isDone ? "opacity-50" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <GripVertical size={16} />
        </span>
        <input
          type="checkbox"
          className="cursor-pointer mt-1 size-4 rounded-sm"
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
        <div
          onClick={() => !isDone && onEdit()}
          className={`flex-1 ${!isDone && "cursor-pointer"}`}
        >
          <h4
            className={`font-medium text-slate-800 dark:text-slate-100 ${
              task.done ? "line-through text-slate-400 dark:text-zinc-500" : ""
            }`}
          >
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">
              {task.description}
            </p>
          )}
        </div>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          disabled={isDone}
          title="Editar"
          className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          title="Remover"
          className="p-1.5 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  )
}

"use client"

import { Task } from "@/lib/types"
import Card from "./Card"
import { Plus } from "lucide-react"

interface ColumnProps {
  title: string
  tasks: Task[]
  onEditTask: (task: Task) => void
  onAddTask: () => void
}

export default function Column({
  title,
  tasks,
  onEditTask,
  onAddTask,
}: ColumnProps) {
  return (
    <div className="bg-gray-200 rounded-lg p-3 w-full md:w-1/3 flex flex-col gap-3">
      <h3 className="font-bold text-gray-700 px-1">{title}</h3>
      <div className="flex flex-col gap-3 flex-grow">
        {tasks.map((task) => (
          <Card key={task.id} task={task} onEdit={onEditTask} />
        ))}
      </div>
      <button
        onClick={onAddTask}
        className="w-full mt-2 p-2 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-300 rounded-md transition-colors"
      >
        <Plus size={16} /> Adicionar Tarefa
      </button>
    </div>
  )
}

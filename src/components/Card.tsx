"use client"

import { Task } from "@/lib/types"
import { Edit2 } from "lucide-react"

interface CardProps {
  task: Task
  onEdit: (task: Task) => void
}

export default function Card({ task, onEdit }: CardProps) {
  return (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 group">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-800">{task.title}</h4>
        <button
          onClick={() => onEdit(task)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 size={16} className="text-gray-500" />
        </button>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mt-2">{task.description}</p>
      )}
    </div>
  )
}

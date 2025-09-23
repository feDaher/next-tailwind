// src/components/TaskModal.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import { X } from "lucide-react"
import { Task } from "@/lib/types"

// Schema de validação para a tarefa
const taskSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskModalProps {
  task?: Task | null
  status: "todo" | "inprogress" | "done"
  onClose: () => void
  onSave: (task: Task) => void
}

export default function TaskModal({
  task,
  status,
  onClose,
  onSave,
}: TaskModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
    },
  })

  const onSubmit = (data: TaskFormData) => {
    const taskToSave: Task = {
      id: task?.id || uuidv4(),
      title: data.title,
      description: data.description || "",
      status: task?.status || status,
      done: (task?.status || status) === "done",
      createdAt: task?.createdAt || Date.now(),
    }
    onSave(taskToSave)
  }

  return (
    // ALTERAÇÃO FEITA AQUI: Adicionado 'backdrop-blur-sm' e ajustada a opacidade
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-lg relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">
          {task ? "Editar Tarefa" : "Criar Nova Tarefa"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Título
            </label>
            <input
              id="title"
              {...register("title")}
              placeholder="Ex: Desenvolver a home page"
              className="mt-1 w-full px-4 py-2 border rounded-md bg-transparent dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Adicione mais detalhes sobre a tarefa..."
              rows={4}
              className="mt-1 w-full px-4 py-2 border rounded-md bg-transparent dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-zinc-700 rounded-md hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

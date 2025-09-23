"use client"

import { User } from "@/lib/types"
import { useSession } from "@/contexts/SessionContext"
import { X, LogOut } from "lucide-react"

interface SettingsModalProps {
  user: User
  onClose: () => void
}

export default function SettingsModal({ user, onClose }: SettingsModalProps) {
  const { logout } = useSession()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-lg relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-6">Dados do Usuário</h3>
        <div className="space-y-3 text-slate-700 dark:text-slate-300">
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Nome Completo:</strong> {user.fullName}
          </p>
          <p>
            <strong>CPF:</strong> {user.cpf}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => {
              logout()
              onClose()
            }}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors font-semibold"
          >
            <LogOut size={18} />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  )
}

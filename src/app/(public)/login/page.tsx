"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useSession } from "@/contexts/SessionContext"
import { User } from "@/lib/types"
import { Mail, KeyRound, LogIn, AlertCircle } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("O formato do email é inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useSession()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: LoginFormData) => {
    try {
      const users: User[] = JSON.parse(localStorage.getItem("users") || "[]")
      const foundUser = users.find(
        (user) => user.email === data.email && user.password === data.password
      )

      if (foundUser) {
        const { password, ...userToSave } = foundUser
        login(userToSave)
      } else {
        alert("Email ou senha inválidas.")
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      alert("Ocorreu um erro durante o login.")
    }
  }

  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null
    return (
      <div className="flex items-center text-red-500 text-sm mt-1">
        <AlertCircle className="w-4 h-4 mr-1" />
        {message}
      </div>
    )
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Bem-vindo de volta!
          </h1>
          <p className="mt-2 text-slate-500">
            Acesse sua conta para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo Email */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="w-5 h-5 text-slate-400" />
              </span>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="Email"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
            <ErrorMessage message={errors.email?.message} />
          </div>

          {/* Campo Senha */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="w-5 h-5 text-slate-400" />
              </span>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Senha"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
            <ErrorMessage message={errors.password?.message} />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
          >
            <LogIn size={18} />
            Entrar
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  )
}

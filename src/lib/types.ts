// src/lib/types.ts

export interface User {
  id: string
  username: string
  fullName: string
  cpf: string
  email: string
  password?: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "inprogress" | "done"
  done: boolean
  createdAt: number
}

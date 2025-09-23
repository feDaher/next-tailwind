"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { IMaskInput } from "react-imask";
import { User as UserIcon, Mail, KeyRound, FileText, AlertCircle } from 'lucide-react';
import { User } from "@/lib/types";

const registerSchema = z.object({
    username: z.string().min(3, "O nome de usuário deve ter pelo menos 3 caracteres"),
    fullName: z.string().min(3, "O nome completo é obrigatório"),
    cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "O formato do CPF é inválido"),
    email: z.string().email("O formato do email é inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
        username: '', fullName: '', cpf: '', email: '', password: '', confirmPassword: ''
    }
  });

  const onSubmit = (data: RegisterFormData) => {
    try {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.some(user => user.email === data.email)) {
        alert('Este email já está em uso.');
        return;
      }
      if (users.some(user => user.cpf === data.cpf)) {
        alert('Este CPF já está cadastrado.');
        return;
      }

      const { confirmPassword, ...newUserPayload } = data;

      const newUser: User = {
        id: uuidv4(),
        ...newUserPayload
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
      router.push('/login');
    } catch (error) {
      console.error("Erro ao registrar:", error);
      alert('Ocorreu um erro durante o cadastro.');
    }
  };

  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <div className="flex items-center text-red-500 text-sm mt-1">
        <AlertCircle className="w-4 h-4 mr-1" />
        {message}
      </div>
    );
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Crie sua conta</h1>
          <p className="mt-2 text-slate-500">É rápido e fácil!</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo Username */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="w-5 h-5 text-slate-400" />
              </span>
              <Controller
                name="username"
                control={control}
                render={({ field }) => <input {...field} placeholder="Nome de usuário" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />}
              />
            </div>
            <ErrorMessage message={errors.username?.message} />
          </div>

          {/* Campo Full Name */}
          <div>
            <div className="relative">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="w-5 h-5 text-slate-400" />
              </span>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => <input {...field} placeholder="Nome Completo" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />}
              />
            </div>
            <ErrorMessage message={errors.fullName?.message} />
          </div>

          {/* Campo CPF */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FileText className="w-5 h-5 text-slate-400" />
              </span>
              <Controller
                name="cpf"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <IMaskInput
                    mask="000.000.000-00"
                    value={value}
                    inputRef={ref}
                    onAccept={(val) => onChange(val)}
                    onBlur={onBlur}
                    placeholder="CPF"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            </div>
            <ErrorMessage message={errors.cpf?.message} />
          </div>

          {/* Campo Email */}
          <div>
            <div className="relative">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="w-5 h-5 text-slate-400" />
              </span>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <input {...field} type="email" placeholder="Email" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />}
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
                render={({ field }) => <input {...field} type="password" placeholder="Senha" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />}
              />
            </div>
            <ErrorMessage message={errors.password?.message} />
          </div>
          
          {/* Campo Confirmar Senha */}
          <div>
             <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="w-5 h-5 text-slate-400" />
              </span>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => <input {...field} type="password" placeholder="Confirmar Senha" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />}
              />
            </div>
            <ErrorMessage message={errors.confirmPassword?.message} />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300">
            Cadastrar
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-500">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </main>
  );
}
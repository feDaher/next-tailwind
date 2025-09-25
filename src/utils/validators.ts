import { z } from 'zod';

export const cpfNumeric = (value: string) => value.replace(/\D/g, '');
export const isCPF11Digits = (value: string) => cpfNumeric(value).length === 11;

export const registerSchema = z.object({
  username: z.string().min(5).max(30),
  fullName: z.string().min(5).max(100),
  cpf: z.string().refine(isCPF11Digits, 'CPF deve conter 11 digitos.'),
  email: z.string().email(),
  password: z.string().min(5).max(30),
  confirmPassword: z.string().min(5).max(30),
}).refine((value) => value.password === value.confirmPassword, {
  message: 'As senhas devem ser iguais',
  path: ['confirmPassword']
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  login: z.string().min(5),
  password: z.string().min(5).max(30),
});

export type LoginInput = z.infer<typeof loginSchema>;


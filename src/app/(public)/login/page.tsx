"use client";
import { useForm } from "react-hook-form";
// import { zodResolver } from ''
import { LoginInput, loginSchema } from "@/utils/validators";
import { useSession } from "@/store/session";
import Link from "next/link";
import { useRouter } from "next/router";

export default function LoginPage() {
  const { login } = useSession();
  const router = useRouter();

  const onSubimt = ({ login: l, password }: LoginInput) => {
    const ok = login(l, password);
    if (ok) router.push('/(app)/board');
    return alert('Credenciais inválidas');
  };

  return(
    <div>
      
    </div>
  )
}

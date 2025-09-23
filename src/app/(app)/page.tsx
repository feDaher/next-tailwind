"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/board")
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Redirecionando...</p>
    </div>
  )
}

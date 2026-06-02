"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export default function Home() {

  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Landing Page</h1>
      <div>
        <Button onClick={() => router.push("/authentication?tab=Login")}>
          Login
        </Button>

        <Button onClick={() => router.push("/authentication?tab=Register")}>
          Register
        </Button>
      </div>
    </div>
  )
}
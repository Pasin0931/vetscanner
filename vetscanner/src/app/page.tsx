"use client"

import { useState, useEffect } from "react"

import Login from "@/components/login"
import Register from "@/components/register"

export default function Home() {
  return (
    <div>
      <Login/>
      <Register/>
    </div>
  )
}
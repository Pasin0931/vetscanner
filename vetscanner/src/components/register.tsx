"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"

export default function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    return (
        <div className="bg-white px-30">
            <h1 className="text-[30px] font-bold">Register</h1>
        </div>
    )
} 
"use client"

import { useState } from "react"

export function useAuth() {
    const [loading, setLoading] = useState(false)

    const login = async (email: string, password: string) => {
        setLoading(true)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        setLoading(false)

        if (!res.ok) {
            throw new Error(data.detail || "Login failed")
        }

        return data
    }

    const register = async (email: string, password: string) => {
        setLoading(true)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password,
                name: email.split("@")[0]
            })
        })

        const data = await res.json()

        setLoading(false)

        if (!res.ok) {
            throw new Error(data.detail || "Register failed")
        }

        return data
    }

    const googleLogin = () => {
        window.location.href =
            "http://localhost:8000/auth/google/login"
    }

    return {
        login,
        register,
        googleLogin,
        loading
    }
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import { motion } from "framer-motion"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    return (
        <div className="flex flex-col justify-center px-10 items-center bg-white py-10 gap-2">
            <h1 className="text-[40px] font-bold pb-5">Login</h1>

            <div className="flex flex-row justify-between bg-[#D9D9D9] gap-20 px-10 py-3 font-bold">
                <button>Login</button>
                <button>Register</button>
            </div>

            <div className="flex flex-col gap-7 pt-7 w-80">
                <div>
                    <h2 className="font-bold ml-6 mb-2">Email</h2>
                    <Input className="bg-[#F7F7F7]">

                    </Input>
                </div>
                <div>
                    <h2 className="font-bold ml-6 mb-2">Password</h2>
                    <Input className="bg-[#F7F7F7]">

                    </Input>
                </div>
            </div>

            <div className="flex flex-row justify-between itme-center gap-23 pt-3">
                <div className="flex flex-row justify-between items-center gap-3 font-bold text-[13px]">
                    <Checkbox>

                    </Checkbox>
                    <button className="font-bold">Remember me</button>
                </div>
                <h2 className="font-bold text-[13px]">Forgot Password</h2>
            </div>

            <Button className="bg-[#B1BB1E] text-black font-bold px-6 mt-10">Login</Button>

        </div>
    )
} 
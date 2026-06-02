"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import { motion } from "framer-motion"

type UsrAuthProps = {
    startTab: string | undefined
}

export default function UsrAuth({ startTab }: UsrAuthProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)

    const [activeTab, setActiveTab] = useState(startTab)

    const [pageLoad, setPageLoad] = useState(false)

    const handle_login_bt = async () => {
        alert("Login")

        if (!email || !password) {
            alert("Login & Register must be filled")
            return
        }

        // get users db

        // if current email not in users db, alert("Email not found") return
        // if input email in users db but password not matched, alert("Password incorrect")
        // else POST newUsr into users db

        setEmail("")
        setPassword("")
    }

    const handle_register_bt = async () => {
        alert("Register")

        if (!email || !password) {
            alert("Login & Register must be filled")
            return
        }

        const newUsr = { email, password, rememberMe }

        // get users db

        // if current email in users db, alert("Email already registered") return
        // else POST newUsr into users db

        setEmail("")
        setPassword("")
    }

    useEffect(() => {
        setEmail("")
        setPassword("")
    }, [])

    return (
        <div className="flex flex-col justify-center px-10 items-center bg-white py-10 gap-2 rounded-lg">
            <h1 className="text-[40px] font-bold pb-5">{activeTab}</h1>

            <div className="relative flex flex-row justify-between bg-[#D9D9D9] gap-20 px-10 py-3 font-bold rounded">
                <motion.div
                    className="absolute top-0 left-0 mt-1 h-10 w-25 bg-[#ADADAD] rounded"
                    animate={{
                        x: activeTab === "Login" ? 11 : 140
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25
                    }}
                />
                <button onClick={() => setActiveTab("Login")} className="relative z-10">Login</button>
                <button onClick={() => setActiveTab("Register")} className="relative z-10">Register</button>
            </div>

            <div className="flex flex-col gap-7 pt-7 w-80">
                <div>
                    <h2 className="font-bold ml-6 mb-2">Email</h2>
                    <Input className="bg-[#F7F7F7]"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    >
                    </Input>
                </div>
                <div>
                    <h2 className="font-bold ml-6 mb-2">Password</h2>
                    <Input className="bg-[#F7F7F7]"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                    >
                    </Input>
                </div>
            </div>

            {activeTab === "Login" ? (
                <div className="flex flex-row justify-between itme-center gap-23 pt-3">
                    <div className="flex flex-row justify-between items-center gap-3 font-bold text-[13px]">
                        <Checkbox
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                        />
                        <button className="font-bold">Remember me</button>
                    </div>
                    <button className="font-bold text-[13px]">
                        Forgot Password
                    </button>
                </div>
            ) : (
                <div className="flex flex-row justify-start itme-start gap-23 pt-3 pr-46.5">
                    <div className="flex flex-row justify-start items-center gap-3 font-bold text-[13px]">
                        <Checkbox
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                        />
                        <button className="font-bold">Remember me</button>
                    </div>
                </div>
            )}

            {activeTab === "Login" ? (
                <Button className="bg-[#B1BB1E] text-black font-bold px-6 mt-10 w-24" onClick={() => handle_login_bt()}>Login</Button>
            ) : (
                <Button className="bg-[#B1BB1E] text-black font-bold px-6 mt-10 w-24" onClick={() => handle_register_bt()}>Register</Button>
            )}

        </div>
    )
} 
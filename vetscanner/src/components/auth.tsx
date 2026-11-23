"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"
import { useAuth } from "@/hook/useAuth"

type UsrAuthProps = {
    startTab: string | undefined
}

export default function UsrAuth({ startTab }: UsrAuthProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(false)

    const [activeTab, setActiveTab] = useState(startTab)
    const [errorMsg, setErrorMsg] = useState("")

    const [pageLoad, setPageLoad] = useState(false)
    const { login, register, googleLogin } = useAuth()

    const router = useRouter();
    const handle_login_bt = async () => {
        setErrorMsg("")
        try {
            await login(email, password, rememberMe)
            alert("Login success")
            // location.reload()
            router.push("/dashboard");
        } catch (err: any) {
            console.log("Login failed !!!", err)
            setErrorMsg(err.message)
        }
    }

    const handle_register_bt = async () => {
        setErrorMsg("")
        try {
            await register(email, password)
            alert("Register success")
        } catch (err: any) {
            setErrorMsg(err.message)
        }
    }

    const handle_oauth = async () => {
        const rememberParam = rememberMe ? "?remember_me=true" : ""
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login${rememberParam}`
        // router.push("/authentication?tab=Login")
    }

    useEffect(() => {
        setEmail("")
        setPassword("")

        const check_have_cookie = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {credentials: "include", method: "GET"})
            if (res.ok) {
                alert("Registered")
                router.push("/dashboard")
            } else {
                router.push("/authentication?tab=Login")
            }
        }

        check_have_cookie()
    }, [])

    return (
        <div className="flex flex-col justify-center px-10 items-center bg-white py-10 gap-2 rounded-lg">
            <h1 className="text-[40px] font-bold pb-5">{activeTab}</h1>

            <div className="relative flex flex-row justify-between bg-[#D9D9D9] py-3 font-bold rounded w-[90%]">
                <motion.div
                    className="absolute top-0 left-0 mt-1 h-10 w-[50%] bg-[#ADADAD] rounded"
                    animate={{
                        x: activeTab === "Login" ? 4 : "100%"
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25
                    }}
                />
                <button onClick={() => { setActiveTab("Login"); setErrorMsg("") }} className="relative z-10 w-[50%] text-center">Login</button>
                <button onClick={() => { setActiveTab("Register"); setErrorMsg("") }} className="relative z-10 w-[50%] text-center">Register</button>
            </div>

            <div className="flex flex-col gap-5 pt-7 w-80">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Email</label>
                    <Input className="bg-[#F7F7F7]"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold">Password</label>
                    <Input className="bg-[#F7F7F7]"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                    />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 font-semibold whitespace-nowrap cursor-pointer">
                        <Checkbox
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                        />
                        Remember me
                    </label>
                    {activeTab === "Login" && (
                        <button className="font-semibold whitespace-nowrap text-gray-500 hover:text-black">
                            Forgot password?
                        </button>
                    )}
                </div>

                {errorMsg && (
                    <p className="text-red-500 text-sm text-center">{errorMsg}</p>
                )}

                {activeTab === "Login" ? (
                    <Button className="bg-[#B1BB1E] hover:bg-[#9CA51A] text-black font-bold w-full" onClick={() => handle_login_bt()}>Login</Button>
                ) : (
                    <Button className="bg-[#B1BB1E] hover:bg-[#9CA51A] text-black font-bold w-full" onClick={() => handle_register_bt()}>Register</Button>
                )}

                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="h-px flex-1 bg-gray-200" />
                    or
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                    onClick={handle_oauth}
                    className="w-full py-2 bg-white border rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
                >
                    Continue with Google
                </button>
            </div>

        </div>
    )
} 
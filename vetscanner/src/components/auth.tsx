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

    const [pageLoad, setPageLoad] = useState(false)
    const { login, register, googleLogin } = useAuth()

    const router = useRouter();
    const handle_login_bt = async () => {
        try {
            await login(email, password)
            alert("Login success")
            // location.reload()
            router.push("/dashboard");
        } catch (err: any) {
            console.log("Login failed !!!", err)
            alert(err.message)
        }
    }

    const handle_register_bt = async () => {
        try {
            await register(email, password)
            alert("Register success")
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handle_oauth = async () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`
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

                {activeTab === "Login" ? (
                    <div className="flex flex-row justify-between items-center gap-23 px-3 w-full">
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
                    <div className="flex flex-row justify-start items-start pr-46.5">
                        <div className="flex flex-row justify-start items-center gap-3 ml-3 font-bold text-[13px]">
                            <Checkbox
                                checked={rememberMe}
                                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                            />
                            <button className="font-bold">Remember me</button>
                        </div>
                    </div>
                )}

                <div className="flex flex-row justify-center items-center">
                    {activeTab === "Login" ? (
                        <Button className="bg-[#B1BB1E] text-black font-bold px-6 w-24" onClick={() => handle_login_bt()}>Login</Button>
                    ) : (
                        <Button className="bg-[#B1BB1E] text-black font-bold px-6 w-24" onClick={() => handle_register_bt()}>Register</Button>
                    )}
                </div>

                <div>
                    <h2 className="font-bold text-center">Or {activeTab?.toLowerCase()} in with google</h2>
                </div>

                <div className="flex flex-col items-center justify-center ">
                    <button
                        onClick={() => {
                            handle_oauth()
                        }}
                        className="px-6 py-2 bg-white border rounded-lg hover:bg-gray-100 transition "
                    >
                        {activeTab} in with Google
                    </button>
                </div>
            </div>

        </div>
    )
} 
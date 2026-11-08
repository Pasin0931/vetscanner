"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, PawPrint, ScanLine, History, Info, LogOut } from "lucide-react"

import { useScanContext } from "@/context/scan_content"

const NAV_ITEMS = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Patient", path: "/patient", icon: PawPrint },
    { label: "Scan", path: "/scan", icon: ScanLine },
    { label: "History", path: "/history", icon: History },
    { label: "About us", path: "/about", icon: Info },
]

export default function Sidebar() {
    const router = useRouter()
    const pathname = usePathname()
    const { isScanning } = useScanContext()
    const [email, setEmail] = useState<string | null>(null)

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error("Not authenticated")
                return res.json()
            })
            .then((data) => setEmail(data.email))
            .catch(() => setEmail(null))
    }, [])

    // Block leaving the page while a scan is running
    const guardedNavigate = (path: string) => {
        if (isScanning) {
            alert("A scan is currently in progress. Please wait for it to finish before leaving this page.")
            return
        }
        router.push(path)
    }

    const handle_logout = async () => {
        if (isScanning) {
            alert("A scan is currently in progress. Please wait for it to finish before logging out.")
            return
        }
        if (!confirm("Are you sure you want to logout?")) return
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: "POST", credentials: "include" })
            router.replace("/")
        } catch (error) {
            alert("Error while logging out")
            console.error(error)
        }
    }

    return (
        <div className="bg-[#242424] flex flex-col justify-between w-75 shrink-0 h-screen text-white">
            <div>
                <div className="p-3 pb-4">
                    <h1 className="text-3xl font-bold text-[#B1BB1E] pb-3 pl-3 pt-4">Vetscanner</h1>
                    <div className="bg-white/30 w-full h-[1px]" />
                </div>

                <nav className="flex flex-col gap-1 px-3">
                    {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
                        const active = pathname.startsWith(path)
                        return (
                            <button
                                key={path}
                                className={`flex items-center gap-5 transition-colors rounded-lg px-4 py-3 ${active ? "bg-white/20" : "bg-white/5 hover:bg-white/15"}`}
                                onClick={() => guardedNavigate(path)}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{label}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>

            <div>
                <div className="bg-white/5 px-4 py-2 text-sm truncate">
                    Hi, {email ?? "..."}
                </div>
                <button
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/15 transition-colors px-4 py-3 w-full"
                    onClick={handle_logout}
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}

"use client";

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button";
import { ScanProvider, useScanContext } from "@/context/scan_content"

function LayoutContent({ children }: { children: React.ReactNode }) {

  const [userEmail, setUserEmail] = useState<string>("")

  const router = useRouter()
  const { isScanning } = useScanContext()

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
    try {
      if (confirm("Logout ?")) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include" })
        console.log("Logout successful")
        localStorage.removeItem('session_id')
        // location.reload()
        router.push("/")
      }
      else {
        return
      }
    } catch (error) {
      alert("Error while logging out")
      console.log(error)
    }

  }

  useEffect(() => {
    const fetch_user = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: "include"
        })
        if (res.ok) {
          const data = await res.json()
          setUserEmail(data.email)
        }
      } catch (err) {
        console.error("Error while fetching current user", err)
      }
    }
    fetch_user()
  }, [])

  return (
    <div>
      <div className="flex">

        <div className="flex-1/4 justify-center">
          <div className="flex flex-col bg-[#242424] h-screen">
            <h1 className="
                        text-center 
                        text-[45px] 
                        text-[#B1BB1E]
                        pt-30
                    ">
              Vetscanner
            </h1>

            <div className="flex flex-col justify-start pt-8">
              <Button className="
                        text-center 
                        text-[25px]
                        transform hover:scale-120 bg-transparent
                        transition duration-300 ease-in-out                        
                        p-8
                        "
                onClick={() => guardedNavigate("/dashboard")}>
                Dashboard
              </Button>

              <Button className="
                        text-center 
                        text-[25px]
                        transform hover:scale-120 bg-transparent 
                        transition duration-300 ease-in-out                        
                        p-8
                        "
                onClick={() => guardedNavigate("/patient")}>
                Patient
              </Button>

              <Button className="
                        text-center 
                        text-[25px]
                        transform hover:scale-120 bg-transparent 
                        transition duration-300 ease-in-out                        
                        p-8                        
                        "
                onClick={() => guardedNavigate("/scan")}>
                Scan
              </Button>

              <Button className="
                        text-center 
                        text-[25px]
                        transform hover:scale-120 bg-transparent 
                        transition duration-300 ease-in-out
                        p-8                        
                        "
                onClick={() => guardedNavigate("/history")}>
                History
              </Button>

              <Button className="
                        text-center 
                        text-[25px]
                        transform hover:scale-120 bg-transparent 
                        transition duration-300 ease-in-out
                        p-8                        
                        "
                onClick={() => guardedNavigate("/about")}>
                About us
              </Button>
            </div>

            <div className="text-center text-[28px] text-white pt-14">
              <p>Welcome back,</p>
              <p className="">{userEmail || "..."}</p>
            </div>

            <button className="text-center text-[25px] bg-[#2F2F2F] p-8 text-white mt-auto mb-10"
              onClick={handle_logout}>
              Logout
            </button>


          </div>
        </div>

        <div className="flex-3/4 justify-center">
          <div className="flex flex-col bg-[#156E68E3] h-screen justify-center items-center ">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <ScanProvider>
      <LayoutContent>{children}</LayoutContent>
    </ScanProvider>
  )
}
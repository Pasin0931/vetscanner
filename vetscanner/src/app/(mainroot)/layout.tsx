
"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button";

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {

  const router = useRouter()

  const handle_logout = async () => {
    try {
      if (confirm("Logout ?")) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include" })
        console.log("Logout successful")
        localStorage.removeItem('session_id')
        location.reload()
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
                onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>

              <Button className="
                        text-center 
                        text-[25px]
                        transform hover:scale-120 bg-transparent 
                        transition duration-300 ease-in-out                        
                        p-8
                        "
                onClick={() => router.push("/patient")}>
                Patient
              </Button>

              <Button className="
                        text-center 
                        text-[25px]
                        transform hover:scale-120 bg-transparent 
                        transition duration-300 ease-in-out                        
                        p-8                        
                        "
                onClick={() => router.push("/scan")}>
                Scan
              </Button>

              <Button className="
                        text-center 
                        text-[25px]
                        transform hover:scale-120 bg-transparent 
                        transition duration-300 ease-in-out
                        p-8                        
                        "
                onClick={() => router.push("/history")}>
                History
              </Button>

              <Button className="
                        text-center 
                        text-[25px]
                        transform hover:scale-120 bg-transparent 
                        transition duration-300 ease-in-out
                        p-8                        
                        "
                onClick={() => router.push("/about")}>
                About us
              </Button>
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
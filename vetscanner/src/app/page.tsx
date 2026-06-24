"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export default function Home() {

  const router = useRouter()

  return (
    <div className="flex h-screen w-screen bg-white">
      <div className="w-10 bg-[#2F7A75] shrink-0" />

      <div className="flex flex-col justify-center px-16 lg:px-24 gap-6 w-full lg:w-1/2">
        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
          The scanner that elevates
          <br />
          your diagnosis
        </h1>

        <p className="text-muted-foreground text-lg max-w-md">
          Upload a slide and let Vetscanner flag tumor regions and classify
          the subtype, turning hours of manual review into a single report.
        </p>

        <div className="flex gap-3 mt-2">
          <Button onClick={() => router.push("/authentication?tab=Login")} className="w-22">
            Login
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/authentication?tab=Register")} className="w-22"
          >
            Register
          </Button>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 relative">
        <img
          src="/vetpet.jpg"
          alt="Veterinarian examining a sample under microscope"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
"use client";

import Sidebar from "@/components/sidebar"
import { ScanProvider } from "@/context/scan_content"

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <ScanProvider>
      <div className="flex">
        <Sidebar />
        <div className="flex flex-col flex-1 bg-[#156E68E3] h-screen justify-center items-center">
          {children}
        </div>
      </div>
    </ScanProvider>
  )
}

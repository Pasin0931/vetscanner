"use client";

import Sidebar from "@/components/sidebar"
import { ScanProvider } from "@/context/scan_content"

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <ScanProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col items-center min-w-0 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </ScanProvider>
  )
}

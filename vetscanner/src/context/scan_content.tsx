"use client"

import { createContext, useContext, useEffect, useState } from "react"

type ScanContextType = {
    isScanning: boolean
    setIsScanning: (value: boolean) => void
}

const ScanContext = createContext<ScanContextType | undefined>(undefined)

export function ScanProvider({ children }: { children: React.ReactNode }) {
    const [isScanning, setIsScanning] = useState(false)

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isScanning) return
            e.preventDefault()
            e.returnValue = ""
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isScanning])

    return (
        <ScanContext.Provider value={{ isScanning, setIsScanning }}>
            {children}
        </ScanContext.Provider>
    )
}

export function useScanContext() {
    const context = useContext(ScanContext)
    if (!context) {
        throw new Error("useScanContext must be used within a ScanProvider")
    }
    return context
}
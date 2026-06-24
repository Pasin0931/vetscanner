"use client"

import { Card } from "../ui/card"

import { columns, Catalogue, History_fetch } from "./columns"
import { DataTable } from "./data-table"

import { useEffect, useState } from "react"

export default function DisplayHistory() {
    const [historyLog, setHistoryLog] = useState<History_fetch[]>([])  
    
    const [loading, setLoading] = useState(false)

    const Fetch_history = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/histories`, {
                credentials: "include"
            })
            const data = await res.json()
            setHistoryLog(data)

        } catch (err) {
            alert("Error while fetching history")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        Fetch_history()
    }, [])
    
    // const data = await DataFetching()
    
    return (
        <div className="flex flex-col justify-center items-start container px-6">    
            <Card className="flex flex-col justify-center h-full w-full border-3 bg-white">
                <h1 className="text-start pl-12 pt-5 font-bold text-5xl">History</h1>
                <DataTable columns={columns} data={historyLog} onRefresh={Fetch_history} loading={loading}/>                
            </Card>        
        </div>
    )
}
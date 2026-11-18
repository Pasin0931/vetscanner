"use client"

import { useEffect, useState } from "react"

import { Page, PageHeader, Panel } from "@/components/layout/page"
import { columns, History_fetch } from "./columns"
import { DataTable } from "./data-table"

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
            setHistoryLog(Array.isArray(data) ? data : [])
        } catch (err) {
            alert("Error while fetching history")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        Fetch_history()
    }, [])

    return (
        <Page>
            <PageHeader title="History" description="All past scans and their reports" />
            <Panel>
                <DataTable columns={columns} data={historyLog} onRefresh={Fetch_history} loading={loading} />
            </Panel>
        </Page>
    )
}

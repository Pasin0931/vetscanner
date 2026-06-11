"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function view() {
    const { id } = useParams()
    const router = useRouter()

    return (
        <div className="flex flex-col justify-center items-center">
            <Card className="p-5">Natsuki Plummet was here HAHAHAHAHAHAHHAAAHAHAHAHJHUAUAHAHAHHW</Card>
            <Button className="mt-3 p-3" onClick={() => router.push("/patient")}>Back</Button>
        </div>
    )
}
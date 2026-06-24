"use client"

import { ColumnDef } from "@tanstack/react-table"
import {MoreHorizontal, Router } from "lucide-react"
// import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { redirect } from "next/navigation"
import Link from "next/link"

export type Catalogue = {
    id: number,
    diagnose: string,
    patient_id: number,
    patient_name: string,
    xray_image: string,
    result: string, // May convert to PDF
    confidence_score: number,
    status: string,
    pdf_report: string,
    date: string,
    time: string
}

// Types for fetching
export type History_fetch = {
    id: number
    patient_id: number
    patient: string
    result: Result
    pdf_report: string
    created_at: string
}

export type Result = {
    tumor_detected: string
    diagnosis: string
    tumor_tile_count: number
    // vote_breakdown: 
    message: string
}

export const columns: ColumnDef<History_fetch>[] = [
    {
        accessorKey: "id",
        // header:"ID"
        header: () => <div className="text-left">ID</div>,
        cell: ({row}) => {
            const rowIdx = row.index + 1
            const id = parseFloat(rowIdx.toString())            

            return <div className="text-left font-medium">{id}</div>
        }
    },
    {
        accessorKey: "patient",
        header: "Patient Name"
    },    
    {
        accessorKey: "result.diagnosis",
        header: "Diagnosis Type",
        enableHiding: false

    },    
    {
        accessorKey: "result.tumor_detected",
        header: "Tumor Detection",
        enableHiding: false

    },  
    {
        accessorKey: "created_at",
        header: "Time Stamp"
    },
    {
        id:"actions",
        cell: ({row, table}) => {
            const cata = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={()=> navigator.clipboard.writeText(cata.id.toString())}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <Link href={cata.pdf_report}>
                            <DropdownMenuItem onClick={() => 
                                    {
                                        console.log(cata)                                    
                                    }
                                }
                            >
                                View report
                            </DropdownMenuItem>
                        </Link>                        

                        <DropdownMenuItem 
                            className="text-red-500"
                            onClick={async () => {
                                try{
                                    if (!confirm("approve")) { return }
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/histories/${cata.id}`, 
                                        {
                                            method: "DELETE",
                                            credentials: "include"
                                        }
                                    )
                                    if (res.ok){
                                        alert("Handled delete individual history successfully")          
                                        table.options.meta?.onRefresh?.()                      
                                    }
                                    else {
                                        const errBody = await res.json().catch(() => null)
                                        alert(errBody?.detail ?? `Failed to delete history (status ${res.status})`)
                                    }
                                } catch(err){
                                    alert("Error while Deleting individual history id")
                                    console.error(err)
                                }                                 
                                // console.log(cata.id)
                            }}
                        >
                            Delete record
                        </DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
        enableHiding: false
    }
]
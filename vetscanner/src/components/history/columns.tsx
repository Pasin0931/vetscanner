"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
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

export type Catalogue = {
    id: number,
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

export const columns: ColumnDef<Catalogue>[] = [
    {
        accessorKey: "id",
        // header:"ID"
        header: () => <div className="text-left">ID</div>,
        cell: ({row}) => {
            const id = parseFloat(row.getValue("id"))            

            return <div className="text-left font-medium">{id}</div>
        }
    },
    {
        accessorKey: "date",
        header: "Date-Stamp"
    },
    {
        accessorKey: "patient_name",
        header: "Patient Name"
    },
    {
        accessorKey: "time",
        header: "Time-stamp"
    },
    {
        id:"actions",
        cell: ({row}) => {
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
                        <DropdownMenuItem>View customer</DropdownMenuItem>
                        <DropdownMenuItem>View payment details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
        enableHiding: false
    }
]


"use client"

import {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { Input } from "../ui/input"
import { LoaderCircle } from "lucide-react"


import React, { useEffect, useState } from "react"

import { History_fetch } from "./columns"

declare module "@tanstack/react-table" {
    interface TableMeta<TData> {
        onRefresh?: () => void
    }
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRefresh?: () => void
    loading?: boolean
}

// Main
export function DataTable<TData, TValue> ({
    columns, data, onRefresh, loading
}: 
    DataTableProps<TData, TValue>
) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [globalFilter, setGlobalFilter] = useState("")
    
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter
        },
        onGlobalFilterChange: setGlobalFilter,  
        
        meta: {
            onRefresh
        },

        globalFilterFn: (row, _, filterValue) => {
            const original = row.original as History_fetch
            const patientName = original.patient ?? ""
            const diagnose = original.result?.diagnosis ?? ""

            return (
                patientName.toLowerCase().includes(filterValue.toLowerCase()) ||
                diagnose.toLowerCase().includes(filterValue.toLowerCase())
            )
        }
    })

    return (
        <div className="flex flex-col items w-full px-5">
            {/* Search and Visibility */}
            <div className="flex items-center py-4">
                {/* Search input */}                
                <div className="w-[45%] bg-[#FFFFFF] rounded-lg">
                    <Input 
                        placeholder="Filter patient or diagnosis type"
                        value={globalFilter}
                        onChange={ (event) => setGlobalFilter(event.target.value) }
                        className="w-full text-start"            
                    />
                    
                </div>
                
                {/* Delete all */}
                <Button 
                    className="text-base ml-[40%] mr-5 px-5 rounded-lg"
                    onClick={async () => {
                                try{
                                    if (!confirm("approve")) { return }
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/histories`, 
                                        {
                                            method: "DELETE",
                                            credentials: "include"
                                        }
                                    )
                                    if (res.ok){
                                        alert("Handled delete all history successfully")          
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
                            }}
                >
                    Clear history
                </Button>
                
                {/* Visible Ticker */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto text-xl">
                            columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="">
                        {table
                            .getAllColumns()
                            .filter(
                                (column) => column.getCanHide()
                            )
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                      key={column.id}
                                      className="capitalize text-md"
                                      checked={column.getIsVisible()}
                                      onCheckedChange={ (value) =>
                                        column.toggleVisibility(!!value)
                                      }
                                    >
                                        {column.id.replaceAll("_", " ")}
                                    </DropdownMenuCheckboxItem>
                                )
                            })
                        }
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>


            {/* Data Table */}
            <div className="overflow-hidden rounded-md bg-[#D9D9D9] w-full h-full border border-3">
                <ScrollArea className="h-[446px] pr-3">
                    <Table>
                        <TableHeader className="bg-[#B1BB1E]">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="text-lg ">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}                                            
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody className="bg-[#FFFFFF] hover:bg-gray-100">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
                                            <LoaderCircle className="h-5 w-5 animate-spin" />
                                            Loading...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-lg">
                                                {
                                                    flexRender(cell.column.columnDef.cell, cell.getContext())
                                                }
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ): (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-lg ">
                                        No results 
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
        
    )
}
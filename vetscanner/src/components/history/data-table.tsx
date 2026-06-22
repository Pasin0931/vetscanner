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
import React, { useState } from "react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue> ({
    columns, data
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
        
        globalFilterFn: (row, _, filterValue) => {
            const patientName = row.getValue<string>("patient_name") ?? ""
            const diagnose = row.getValue<string>("diagnose") ?? ""

            return (
                patientName.toLowerCase().includes(filterValue.toLowerCase()) ||
                diagnose.toLowerCase().includes(filterValue.toLowerCase())
            )
        }
    })

    return (
        <div className="flex flex-col items w-[95%] px-5">
            {/* Search and Visibility */}
            <div className="flex items-center py-4">
                {/* Search input */}                
                <div className="w-[45%] bg-[#FFFFFF] rounded-lg">
                    <Input 
                        placeholder="Filter patient or diagnosis type"
                        value={globalFilter}
                        onChange={ (event) => setGlobalFilter(event.target.value) }
                        //   value={(table.getColumn("patient_name")?.getFilterValue() as string) ?? ""}
                        //   onChange={ (event) => table.getColumn("patient_name")?.setFilterValue(event.target.value) }
                        className="w-full text-start"            
                    />
                    
                </div>
                
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
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })
                        }
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>


            {/* Data Table */}
            <div className="overflow-hidden rounded-md bg-[#242424] w-full h-full">
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
                        <TableBody className="bg-[#313131]">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-lg text-[#B1BB1E]">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ): (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-lg text-emerald-50">
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
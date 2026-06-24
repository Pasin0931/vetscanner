"use client"

import { useState, useEffect, useRef } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

import { useScanContext } from "@/context/scan_content"

type Patient = {
    id: number
    name: string
    breed: string | null
    age: number | null
    weight: number | null
    gender: string | null
    description: string | null
    species: string
    patient_portrait: string | null
    status: string | null
    user_id: number
    created_at: string
}

type ScanStatus = "idle" | "uploading" | "processing" | "done" | "error"

const ACCEPT_FILETYPE = [".svs", ".tiff", ".tif", ".ndpi"]
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 * 1024 // 5GB ceiling, adjust as needed

export default function ScanPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
    const [loadingPatients, setLoadingPatients] = useState(false)

    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<ScanStatus>("idle")
    const [progress, setProgress] = useState(0)
    const [errorMessage, setErrorMessage] = useState("")
    const [result, setResult] = useState<any>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const xhrRef = useRef<XMLHttpRequest | null>(null)

    const { setIsScanning } = useScanContext()

    const fetch_patients = async () => {
        setLoadingPatients(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
                credentials: "include"
            })
            const data = await res.json()
            setPatients(data)
        } catch (err) {
            alert("Error while fetching patients")
        } finally {
            setLoadingPatients(false)
        }
    }

    useEffect(() => {
        fetch_patients()
    }, [])

    // Clear the navigation block if the user leaves this page some other way
    useEffect(() => {
        return () => setIsScanning(false)
    }, [])

    const patientLabels = patients.map((p) => p.name)

    const validateFile = (selected: File): string | null => {
        const lowerName = selected.name.toLowerCase()
        const hasValidExtension = ACCEPT_FILETYPE.some((ext) => lowerName.endsWith(ext))
        if (!hasValidExtension) {
            return `Unsupported file type. Please upload a whole slide image (${ACCEPT_FILETYPE.join(", ")})`
        }
        if (selected.size > MAX_FILE_SIZE_BYTES) {
            return "File is too large. Maximum size is 5GB"
        }
        return null
    }

    const handleFileSelect = (selected: File | null) => {
        if (!selected) return
        const validationError = validateFile(selected)
        if (validationError) {
            setErrorMessage(validationError)
            setFile(null)
            setStatus("error")
            return
        }
        setErrorMessage("")
        setFile(selected)
        setStatus("idle")
        setResult(null)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const dropped = e.dataTransfer.files?.[0] ?? null
        handleFileSelect(dropped)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
    }

    const handle_bt = () => {
        if (!selectedPatientId) {
            alert("Please select a patient first")
            return
        }
        if (!file) {
            alert("Please choose a slide file first")
            return
        }

        setStatus("uploading")
        setProgress(0)
        setErrorMessage("")
        setIsScanning(true)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("patient_id", selectedPatientId.toString())

        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        xhr.responseType = "blob"

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100)
                setProgress(percent)
            }
        }

        xhr.upload.onload = () => {
            setStatus("processing")
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const blob = xhr.response as Blob

                const disposition = xhr.getResponseHeader("Content-Disposition") || ""
                const match = disposition.match(/filename="?([^"]+)"?/)
                const filename = match ? match[1] : `vetscanner_report_${Date.now()}.pdf`

                // trigger the browser to download automatically
                const downloadUrl = window.URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = downloadUrl
                link.download = filename
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(downloadUrl)

                setResult({ filename })
                setStatus("done")
            } else {
                setErrorMessage(`Scan failed (status ${xhr.status}). Please try again.`)
                setStatus("error")
            }
            setIsScanning(false)
        }

        xhr.onerror = () => {
            setErrorMessage("Network error. Check your connection and try again.")
            setStatus("error")
            setIsScanning(false)
        }

        xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/scan/model`)
        xhr.withCredentials = true
        xhr.send(formData)
    }

    const handleCancel = () => {
        xhrRef.current?.abort()
        setStatus("idle")
        setProgress(0)
        setIsScanning(false)
    }

    const handleReset = () => {
        setFile(null)
        setStatus("idle")
        setProgress(0)
        setErrorMessage("")
        setResult(null)
        setIsScanning(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <div className="flex flex-col items-center w-[95%] px-5">
            <Card className="mt-5 p-8 w-[95%] border-3 bg-white">
                <div className="flex flex-col gap-4">
                    <h1 className="font-bold text-4xl">Scanner</h1>

                    <div className="flex flex-col gap-1 w-64">
                        <Combobox
                            items={patientLabels}
                            onValueChange={(val) => {
                                const match = patients.find((p) => p.name === val)
                                setSelectedPatientId(match ? match.id : null)
                            }}
                        >
                            <ComboboxInput placeholder={loadingPatients ? "Loading patients..." : "Select a patient"} />
                            <ComboboxContent>
                                <ComboboxEmpty>No patients found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (<ComboboxItem key={item} value={item}>{item}</ComboboxItem>)}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>

                    {status === "idle" && !file && (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center h-62 bg-gray-100 rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-200 transition"
                        >
                            <p className="font-bold text-gray-500">Upload files</p>
                            <p className="text-gray-400 text-[12px] mt-2">
                                Accepted: {ACCEPT_FILETYPE.join(", ")} — up to 5GB
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ACCEPT_FILETYPE.join(",")}
                                className="hidden"
                                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                            />
                        </div>
                    )}

                    {file && status !== "done" && (
                        <div className="flex flex-col h-62 bg-gray-100 rounded-lg border-2 border-dashed p-6 justify-center">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold break-all">{file.name}</p>
                                    <p className="text-gray-500 text-[13px] mt-1">{formatFileSize(file.size)}</p>
                                </div>
                                {status === "idle" && (
                                    <button
                                        onClick={handleReset}
                                        className="text-gray-500 hover:text-black text-[13px]"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {status === "uploading" && (
                                <div>
                                    <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-[#B1BB1E] h-3 transition-all duration-150"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <p className="text-gray-500 text-[13px]">Uploading... {progress}%</p>
                                        <button
                                            onClick={handleCancel}
                                            className="text-gray-500 hover:text-black text-[13px]"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {status === "processing" && (
                                <div className="flex items-center justify-center py-2">
                                    <div className="animate-spin h-5 w-5 border-2 border-[#B1BB1E] border-t-transparent rounded-full mr-3" />
                                    <p className="text-gray-600 text-[14px]">
                                        Analyzing slide - this can take a few minutes...
                                    </p>
                                </div>
                            )}

                            {status === "error" && (
                                <div>
                                    <p className="text-red-500 text-[14px] mb-3">{errorMessage}</p>
                                    <button
                                        onClick={handleReset}
                                        className="w-full bg-transparent border border-[#B1BB1E] text-[#7c8312] text-[14px] rounded-md py-2"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {status === "done" && result && (
                        <div className="flex flex-col items-center justify-center h-62 bg-gray-100 rounded-lg border-2 border-dashed p-6">
                            <p className="font-bold mb-2">Scan complete</p>
                            <p className="text-gray-600 text-[13px] text-center">
                                Your report has downloaded automatically: <br />
                                <span className="font-mono break-all">{result.filename}</span>
                            </p>
                        </div>
                    )}

                    {status === "idle" && !file && errorMessage && (
                        <p className="text-red-500 text-[13px]">{errorMessage}</p>
                    )}

                    {status === "done" ? (
                        <Button className="w-25 self-center px-15 bg-[#B1BB1E] text-black font-bold" onClick={handleReset}>
                            Scan another
                        </Button>
                    ) : (
                        <Button
                            className="w-25 self-center px-15"
                            onClick={handle_bt}
                            disabled={status === "uploading" || status === "processing"}
                        >
                            Submit
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    )
}
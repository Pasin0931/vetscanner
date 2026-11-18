"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Page, PageHeader, Panel } from "@/components/layout/page"
import { DEFAULT_PORTRAIT, type Patient } from "@/types/patient"

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium">{value || "-"}</p>
        </div>
    )
}

export default function ViewPatientPage() {
    const { id } = useParams()
    const router = useRouter()

    const [patient, setPatient] = useState<Patient | null>(null)

    useEffect(() => {
        const fetch_patient = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/${id}`, {
                credentials: "include"
            })
            if (res.ok) {
                setPatient(await res.json())
            }
        }
        fetch_patient()
    }, [id])

    return (
        <Page>
            <PageHeader
                title={patient?.name ?? "Patient"}
                description="Patient details"
                actions={
                    <>
                        <Button variant="outline" onClick={() => router.push("/patient")}>Back</Button>
                        <Button onClick={() => router.push(`/patient/${id}`)}>Edit</Button>
                    </>
                }
            />

            {!patient ? (
                <div className="flex justify-center py-20">
                    <LoaderCircle className="animate-spin size-10" />
                </div>
            ) : (
                <Panel className="flex flex-col md:flex-row gap-6">
                    <img
                        src={patient.patient_portrait ?? DEFAULT_PORTRAIT}
                        alt={patient.name}
                        className="w-full md:w-64 h-64 object-cover rounded-lg border"
                    />
                    <div className="flex flex-col gap-5 flex-1">
                        <Detail label="Description" value={patient.description} />
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                            <Detail label="Species" value={patient.species} />
                            <Detail label="Breed" value={patient.breed} />
                            <Detail label="Gender" value={patient.gender} />
                            <Detail label="Age" value={patient.age} />
                            <Detail label="Weight (kg)" value={patient.weight} />
                            <Detail label="Status" value={patient.status} />
                        </div>
                    </div>
                </Panel>
            )}
        </Page>
    )
}

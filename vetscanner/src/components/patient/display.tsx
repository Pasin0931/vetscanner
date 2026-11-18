"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Page, PageHeader, Panel } from "@/components/layout/page"
import PatientForm, { EMPTY_PATIENT, type PatientFormValues } from "@/components/patient/patient-form"
import { DEFAULT_PORTRAIT, type Patient } from "@/types/patient"

function toParams(values: PatientFormValues, portrait: string) {
    return new URLSearchParams({
        name_: values.name,
        breed_: values.breed,
        age_: values.age.toString(),
        weight_: values.weight.toString(),
        gender_: values.gender,
        description_: values.description,
        species_: values.species,
        potrait_: portrait,
        status_: values.status,
    })
}

export default function DisplayPage() {
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<"list" | "register">("list")
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(false)

    // "inactive" patients are shown as archived
    const [statusFilter, setStatusFilter] = useState<"active" | "archived">("active")
    const isArchived = (p: Patient) => p.status === "inactive"
    const activeCount = patients.filter((p) => !isArchived(p)).length
    const archivedCount = patients.length - activeCount
    const shownPatients = patients.filter((p) => (statusFilter === "archived") === isArchived(p))

    const [form, setForm] = useState<PatientFormValues>(EMPTY_PATIENT)
    const [pictureFile, setPictureFile] = useState<File | null>(null)
    const [picturePreviewUrl, setPicturePreviewUrl] = useState("")
    const [registering, setRegistering] = useState(false)

    const fetch_patients = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
                credentials: "include"
            })
            const data = await res.json()
            setPatients(Array.isArray(data) ? data : [])
        } catch (err) {
            alert("Error while fetching patients")
        } finally {
            setLoading(false)
        }
    }

    const handlePictureSelect = (file: File) => {
        setPictureFile(file)
        setPicturePreviewUrl(URL.createObjectURL(file))
    }

    const create_patient = async () => {
        setRegistering(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients?${toParams(form, DEFAULT_PORTRAIT)}`, {
                method: "POST",
                credentials: "include"
            })

            if (!res.ok) {
                alert("Error while registering patient")
                return
            }

            const created = await res.json()
            const newPatientId = created.id

            if (pictureFile && newPatientId) {
                const formData = new FormData()
                formData.append("file", pictureFile)

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/?pet_id=${newPatientId}&type=PROFILE`, {
                    method: "POST",
                    credentials: "include",
                    body: formData
                })

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json()
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/${newPatientId}?${toParams(form, uploadData.data.url)}`, {
                        method: "PUT",
                        credentials: "include"
                    })
                } else {
                    alert("Patient registered, but the picture upload failed.")
                }
            }

            alert("Patient registered !")
            setForm(EMPTY_PATIENT)
            setPictureFile(null)
            setPicturePreviewUrl("")
            setActiveTab("list")
            fetch_patients()
        } catch (err) {
            alert("Error while posting new patient")
        } finally {
            setRegistering(false)
        }
    }

    const delete_patient = async (id: number) => {
        if (!confirm("Are you sure ?")) return
        try {
            setLoading(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/${id}`, {
                method: "DELETE",
                credentials: "include"
            })
            if (res.ok) {
                fetch_patients()
                alert("Patient deleted")
            }
        } catch (error) {
            alert("Error while deleting patient")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetch_patients()
    }, [])

    return (
        <Page>
            <PageHeader
                title="Patients"
                description="Manage your patients and register new ones"
                actions={
                    <>
                        <Button variant={activeTab === "list" ? "default" : "outline"} onClick={() => setActiveTab("list")}>
                            Your patients
                        </Button>
                        <Button variant={activeTab === "register" ? "default" : "outline"} onClick={() => setActiveTab("register")}>
                            Register
                        </Button>
                    </>
                }
            />

            {activeTab === "list" && (
                <div className="flex gap-2">
                    <Button size="sm" variant={statusFilter === "active" ? "default" : "outline"} onClick={() => setStatusFilter("active")}>
                        Active ({activeCount})
                    </Button>
                    <Button size="sm" variant={statusFilter === "archived" ? "default" : "outline"} onClick={() => setStatusFilter("archived")}>
                        Inactive ({archivedCount})
                    </Button>
                </div>
            )}

            {activeTab === "list" ? (
                loading ? (
                    <div className="flex justify-center py-20">
                        <LoaderCircle className="animate-spin size-10" />
                    </div>
                ) : shownPatients.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {shownPatients.map((patient) => (
                            <div
                                key={patient.id}
                                onClick={() => router.push(`/patient/${patient.id}/view`)}
                                className="pb-4 bg-[#156E68] rounded-xl drop-shadow-lg cursor-pointer hover:-translate-y-0.5 transition"
                            >
                                <img
                                    src={patient.patient_portrait ?? DEFAULT_PORTRAIT}
                                    alt={patient.name}
                                    className="w-full h-40 object-cover rounded-t-xl"
                                />
                                <div className="w-full h-[2px] bg-white mb-3" />

                                <h2 className="px-5 text-white font-semibold">{patient.name}</h2>
                                <p className="px-5 text-white/80 text-[13px] line-clamp-2 h-10">{patient.description}</p>

                                <div className="px-5 flex justify-between items-center mt-4">
                                    <Button aria-label={`Delete ${patient.name}`} className="bg-black/30 hover:bg-black/40 border border-white/20" onClick={(e) => { e.stopPropagation(); delete_patient(patient.id) }}>
                                        <Trash2 />
                                    </Button>
                                    <Button className="bg-black/30 hover:bg-black/40 border border-white/20 w-20" onClick={(e) => { e.stopPropagation(); router.push(`/patient/${patient.id}`) }}>
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-16">
                        {statusFilter === "archived" ? "No inactive patients" : "No active patients"}
                    </p>
                )
            ) : (
                <Panel>
                    <PatientForm
                        values={form}
                        onChange={setForm}
                        pictureUrl={picturePreviewUrl}
                        onPictureSelect={handlePictureSelect}
                    />
                    <div className="flex justify-end pt-6">
                        <Button onClick={create_patient} disabled={registering}>
                            {registering ? <LoaderCircle className="animate-spin size-4" /> : "Register"}
                        </Button>
                    </div>
                </Panel>
            )}
        </Page>
    )
}

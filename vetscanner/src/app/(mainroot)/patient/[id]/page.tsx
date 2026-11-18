"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Page, PageHeader, Panel } from "@/components/layout/page"
import PatientForm, { EMPTY_PATIENT, type PatientFormValues } from "@/components/patient/patient-form"
import type { Patient } from "@/types/patient"

export default function EditPage() {
    const { id } = useParams()
    const router = useRouter()

    const [form, setForm] = useState<PatientFormValues>(EMPTY_PATIENT)
    const [pictureUrl, setPictureUrl] = useState("")
    const [pictureFile, setPictureFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)

    const handlePictureSelect = (file: File) => {
        setPictureFile(file)
        setPictureUrl(URL.createObjectURL(file))
    }

    const handle_save = async () => {
        setSaving(true)
        try {
            let finalPictureUrl = pictureUrl

            if (pictureFile) {
                const formData = new FormData()
                formData.append("file", pictureFile)

                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/?pet_id=${id}&type=PROFILE`, {
                    method: "POST",
                    credentials: "include",
                    body: formData
                })

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json()
                    finalPictureUrl = uploadData.data.url
                } else {
                    alert("Picture upload failed, saving other changes only.")
                }
            }

            const params = new URLSearchParams({
                name_: form.name,
                breed_: form.breed,
                age_: form.age.toString(),
                weight_: form.weight.toString(),
                gender_: form.gender,
                description_: form.description,
                species_: form.species,
                potrait_: finalPictureUrl,
                status_: form.status
            })
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/${id}?${params}`, {
                method: "PUT",
                credentials: "include"
            })
            if (res.ok) {
                alert("Patient saved !")
                router.push("/patient")
            } else {
                const err = await res.json()
                alert(JSON.stringify(err))
            }
        } catch (err) {
            console.error("error --> ", err)
            alert("Error while saving patient")
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        const fetch_patient = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/${id}`, {
                credentials: "include"
            })
            if (res.ok) {
                const data: Patient = await res.json()
                setForm({
                    name: data.name,
                    description: data.description ?? "",
                    breed: data.breed ?? "",
                    age: data.age ?? 0,
                    weight: data.weight ?? 0,
                    gender: data.gender ?? "",
                    status: data.status ?? "",
                    species: data.species,
                })
                setPictureUrl(data.patient_portrait ?? "")
            }
        }
        fetch_patient()
    }, [id])

    return (
        <Page>
            <PageHeader title="Edit Patient" description="Update this patient's details" />

            <Panel>
                <PatientForm
                    values={form}
                    onChange={setForm}
                    pictureUrl={pictureUrl}
                    onPictureSelect={handlePictureSelect}
                />
                <div className="flex justify-end gap-3 pt-6">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handle_save} disabled={saving}>
                        {saving ? <LoaderCircle className="animate-spin size-4" /> : "Save"}
                    </Button>
                </div>
            </Panel>
        </Page>
    )
}

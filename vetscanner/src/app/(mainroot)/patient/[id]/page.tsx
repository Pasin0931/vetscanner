"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

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

export default function EditPage() {

    const { id } = useParams()
    const router = useRouter()

    const species_mock = ["cat", "dog"]

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [species, setSpecies] = useState("")
    const [breed, setBreed] = useState("")
    const [age, setAge] = useState<number>(0)
    const [weight, setWeight] = useState<number>(0)
    const [gender, setGender] = useState("")
    const [status, setStatus] = useState("")
    const [picture_url, setPictureUrl] = useState("")

    const [loading, setLoading] = useState(false)

    const handle_save = async () => {
        try {
            const params = new URLSearchParams({
                name_: name,
                breed_: breed,
                age_: age.toString(),
                weight_: weight.toString(),
                gender_: gender,
                description_: description,
                species_: species,
                potrait_: picture_url,
                status_: status
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
        }
    }

    useEffect(() => {
        const fetch_patient = async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/${id}`, {
                credentials: "include"
            })
            if (res.ok) {
                const data: Patient = await res.json()
                setName(data.name)
                setDescription(data.description ?? "")
                setSpecies(data.species)
                setBreed(data.breed ?? "")
                setAge(data.age ?? 0)
                setWeight(data.weight ?? 0)
                setGender(data.gender ?? "")
                setStatus(data.status ?? "")
                setPictureUrl(data.patient_portrait ?? "")
            }
        }
        fetch_patient()
    }, [id])

    return (
        <div className="flex flex-col items-center w-[95%] h-170 px-5">
            <Card className="mt-5 p-8 w-[95%] border-3 bg-white overflow-y-auto">
                <div className="flex flex-col gap-4">
                    <h1 className="font-bold text-4xl">Edit Patient</h1>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Description</label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Breed</label>
                        <Input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Enter breed" />
                    </div>

                    <div className="flex flex-row gap-4">
                        <div className="flex flex-col gap-1 w-full">
                            <label className="font-semibold text-sm">Age</label>
                            <Input value={age} placeholder="Enter age" type="number" onChange={(e) => setAge(Number(e.target.value))} />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <label className="font-semibold text-sm">Weight (kg)</label>
                            <Input value={weight} placeholder="Enter weight" type="number" onChange={(e) => setWeight(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Gender</label>
                        <Combobox items={["male", "female"]} onValueChange={(val) => setGender(String(val))}>
                            <ComboboxInput placeholder={gender || "Select gender"} />
                            <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Status</label>
                        <Combobox items={["active", "inactive"]} onValueChange={(val) => setStatus(String(val))}>
                            <ComboboxInput placeholder={status || "Select status"} />
                            <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Species</label>
                        <Combobox items={species_mock} onValueChange={(val) => setSpecies(String(val))}>
                            <ComboboxInput placeholder={species || "Select a species"} />
                            <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Picture</label>
                        <div className="flex items-center justify-center h-62 bg-gray-100 rounded-lg border-2 border-dashed cursor-pointer">
                            {picture_url ? (
                                <img src={picture_url} alt="preview" className="h-full object-contain rounded-lg" />
                            ) : (
                                <p className="font-bold text-gray-500">Upload files</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-row gap-3 self-center mt-4">
                        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button className="bg-black" onClick={handle_save}>Save</Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import { LoaderCircle } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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


export default function view() {
    const { id } = useParams()
    const router = useRouter()

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
                <h1 className="font-bold text-4xl">Patient data</h1>
                    <div className="flex flex-col gap-1 border-1 p-2 rounded-sm">
                        <label className="font-semibold text-sm">Name</label>
                        <h2 className="text-lg">{name}</h2>
                    </div>

                    <div className="flex flex-col gap-1 border-1 p-2 rounded-sm">
                        <label className="font-semibold text-sm">Description</label>
                        <h2 className="text-lg">{description}</h2>
                    </div>

                    <div className="flex flex-col gap-1 border-1 p-2 rounded-sm">
                        <label className="font-semibold text-sm">Breed</label>
                        <h2 className="text-lg">{breed}</h2>
                    </div>

                    <div className="flex flex-row gap-4">
                        <div className="flex flex-col gap-1 w-full border-1 p-2 rounded-sm">
                            <label className="font-semibold text-sm">Age</label>
                            <h2 className="text-lg">{age}</h2>
                        </div>
                        <div className="flex flex-col gap-1 w-full border-1 p-2 rounded-sm">
                            <label className="font-semibold text-sm">Weight (kg)</label>
                            <h2 className="text-lg">{weight}</h2>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 border-1 p-2 rounded-sm">
                        <label className="font-semibold text-sm">Gender</label>
                        <h2 className="text-lg">{gender}</h2>                        
                    </div>

                    <div className="flex flex-col gap-1 border-1 p-2 rounded-sm">
                        <label className="font-semibold text-sm">Status</label>
                        <h2 className="text-lg">{status}</h2>                                                
                    </div>

                    <div className="flex flex-col gap-1 border-1 p-2 rounded-sm">
                        <label className="font-semibold text-sm">Species</label>
                        <h2 className="text-lg">{species}</h2>                                                                        
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-semibold text-sm">Picture</label>
                        <div className="flex items-center justify-center h-62 bg-gray-100 rounded-lg border-2 border-dashed cursor-pointer">
                            {picture_url ? (
                                <img src={picture_url} alt="preview" className="h-full object-contain rounded-lg" />
                            ) : (
                                <LoaderCircle className="animate-spin w-18 h-18"/>                                
                            )}
                        </div>
                    </div>

                <div className="flex flex-col gap-4"></div>
            </Card>
            <Button className="mt-3 p-3 w-20" onClick={() => router.push("/patient")}>Back</Button>
        </div>
    )
}
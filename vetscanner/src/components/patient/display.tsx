"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

import { useRouter } from "next/navigation"

import Image from "next/image"
import { LoaderCircle } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
    patient_portrait: string
    status: string | null
    user_id: number
    created_at: string
}

export default function DisplayPage() {
    const router = useRouter()

    const [activeTab, setActiveTab] = useState("home")

    const species_ = ["cat", "dog"]
    const [patients, setPatients] = useState<Patient[]>([])

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [species, setSpecies] = useState("")
    const [breed, setBreed] = useState("")
    const [age, setAge] = useState<number>(0)
    const [weight, setWeight] = useState<number>(0)
    const [gender, setGender] = useState("")
    const [status, setStatus] = useState("")
    const [potrait, setPotrait] = useState("")

    const [loading, setLoading] = useState(false)

    const fetch_patients = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
                credentials: "include"
            })
            const data = await res.json()
            setPatients(data)
        } catch (err) {
            alert("Error while fetching patients")
        } finally {
            setLoading(false)
        }
    }

    const create_patient = async () => {
        try {
            const this_potrait = potrait.trim() === "" ? "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80" : potrait

            const params = new URLSearchParams({
                name_: name,
                breed_: breed,
                age_: age.toString(),
                weight_: weight.toString(),
                gender_: gender,
                description_: description,
                species_: species,
                potrait_: this_potrait,
                status_: status
            })
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients?${params}`, {
                method: "POST",
                credentials: "include"
            })
            if (res.ok) {
                fetch_patients()
                alert("Patient registered !")
            }
        } catch (err) {
            alert("Error while posting new patient")
        }
    }

    const delete_patient = async (id: number) => {
        try {
            if (!confirm("Are you sure ?")) {
                return
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/${id}`, {
                method: "DELETE",
                credentials: "include"
            })
            if (res.ok) {
                fetch_patients()
                alert("Patient deleted")
            }
            return res
        } catch (error) {
            alert("Error while deleting patient")
        }
    }

    useEffect(() => {
        fetch_patients()
    }, [])

    return (
        <div className="flex flex-col justify-center items-center w-[95%] px-5">
            <div className="relative flex flex-row justify-between bg-[#D9D9D9] py-3 font-bold rounded w-[95%]">
                <motion.div
                    className="absolute top-0 left-0 mt-1 h-10 w-[50%] bg-[#ADADAD] rounded"
                    animate={{
                        x: activeTab === "home" ? 4 : "100%"
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25
                    }}
                />
                <button onClick={() => setActiveTab("home")} className="relative z-10 w-[50%] text-center">Your patients</button>
                <button onClick={() => setActiveTab("register")} className="relative z-10 w-[50%] text-center">Registration</button>
            </div>

            {activeTab === "home" ? (
                <Card className="mt-5 p-5 h-170 w-[95%] border-3 bg-white overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-screen">
                            <LoaderCircle className="animate-spin w-18 h-18"/>
                        </div>
                    ) : patients.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {patients.map((card, index) => (
                                <motion.div key={index} onClick={() => router.push(`/patient/${card.id}/view`)}
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                                    <Card className="flex flex-col p-5 border border-2">
                                        <img
                                            src={card.patient_portrait}
                                            alt="profile"
                                            className="w-full h-40 object-cover rounded-xl border border-2 p-2 mt-5"
                                        />
                                        <p className="px-2 font-bold">{card.name}</p>
                                        <Card className="overflow-hidden h-23">
                                            <p className="px-2 line-clamp-3">{card.description}</p>
                                        </Card>
                                        <div className="flex flex-row justify-between">
                                            <Button variant="destructive" onClick={(e) => { e.stopPropagation(); delete_patient(card.id) }}>Delete</Button>
                                            <Button className="bg-black" onClick={(e) => { e.stopPropagation(); router.push(`/patient/${card.id}`) }}>Edit</Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-screen">
                            <h2 className="font-bold text-lg">No patients registered</h2>
                        </div>
                    )}
                </Card>
            ) : (
                <Card className="mt-5 p-8 h-170 w-[95%] border-3 bg-white overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        <h1 className="font-bold text-4xl">Patient Registration</h1>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Name</label>
                            <Input placeholder="Enter name" onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Description</label>
                            <Input placeholder="Enter description" onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Breed</label>
                            <Input placeholder="Enter breed" onChange={(e) => setBreed(e.target.value)} />
                        </div>

                        <div className="flex flex-row gap-4">
                            <div className="flex flex-col gap-1 w-full">
                                <label className="font-semibold text-sm">Age</label>
                                <Input placeholder="Enter age" type="number" onChange={(e) => setAge(Number(e.target.value))} />
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <label className="font-semibold text-sm">Weight (kg)</label>
                                <Input placeholder="Enter weight" type="number" onChange={(e) => setWeight(Number(e.target.value))} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Gender</label>
                            <Combobox items={["male", "female"]} onValueChange={(val) => setGender(String(val))}>
                                <ComboboxInput placeholder="Select gender" />
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item} onChange={() => setGender(item)}>{item}</ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Status</label>
                            <Combobox items={["active", "inactive"]} onValueChange={(val) => setStatus(String(val))}>
                                <ComboboxInput placeholder="Select status" />
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item} onChange={() => setStatus(item)}>{item}</ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Species</label>
                            <Combobox items={species_} onValueChange={(val) => setSpecies(String(val))}>
                                <ComboboxInput placeholder="Select a species" />
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item} onChange={() => setSpecies(item)}>
                                                {item}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Picture</label>
                            <div className="flex items-center justify-center h-62 bg-gray-100 rounded-lg border-2 border-dashed cursor-pointer">
                                <p className="font-bold text-gray-500">Upload files</p>
                            </div>
                        </div>

                        <Button className="mt-4 w-25 self-center" onClick={() => create_patient()}>Register</Button>
                    </div>
                </Card>
            )}
        </div>
    )
}
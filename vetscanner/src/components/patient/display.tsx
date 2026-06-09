"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

import { useRouter } from "next/navigation"

import Image from "next/image"

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

export default function DisplayPage() {
    const router = useRouter()

    const [activeTab, setActiveTab] = useState("home")

    const species_mock = ["cat", "dog"]
    const [mock, setMock] = useState(
        [
            {
                "id": 1,
                "name": "dog1",
                "description": "dog dog dog dogaaaaaaakajbjkbcdwadwadwadawgvsavxcvvwacvaw dwa awd adadwa adwwawa",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "id": 2,
                "name": "dog2",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "id": 3,
                "name": "dog3",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "id": 4,
                "name": "dog4",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "id": 5,
                "name": "dog5",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "id": 6,
                "name": "dog6",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "id": 7,
                "name": "dog6",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "id": 8,
                "name": "dog6",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "id": 9,
                "name": "dog6",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
        ]
    )

    const handle_delete = () => {
        try {
            if (confirm("Are you sure ?")) {
                return
            }
            return
        } catch (err) {
            console.error("error --> ", err)
            alert("Error while deleting patient")
        }
    }

    const handle_register = () => {
        try {
            alert("Patient Registered")
            return
        } catch (err) {
            console.error("error --> ", err)
            alert("Error while registering new patient")
        }
    }

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {mock.map((card, index) => (
                            <Card key={index} className="flex flex-col p-5 border border-2">
                                <img
                                    src={card.picture_url}
                                    alt="profile"
                                    className="w-full h-40 object-cover rounded-xl border border-2 p-2 mt-5"
                                />
                                <p className="px-2 font-bold">{card.name}</p>
                                <Card className="overflow-hidden h-23">
                                    <p className="px-2 line-clamp-3">{card.description}</p>
                                </Card>
                                <div className="flex flex-row justify-between">
                                    <Button variant="destructive" onClick={() => handle_delete()}>Delete</Button>
                                    <Button className="bg-black" onClick={() => router.push(`/patient/${card.id}`)}>Edit</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Card>
            ) : (
                <Card className="mt-5 p-8 h-170 w-[95%] border-3 bg-white overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        <h1 className="font-bold text-4xl">Patient Registration</h1>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Name</label>
                            <Input placeholder="Enter name" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Description</label>
                            <Input placeholder="Enter description" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-sm">Species</label>
                            <Combobox items={species_mock}>
                                <ComboboxInput placeholder="Select a species" />
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {(item) => (
                                            <ComboboxItem key={item} value={item}>
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

                        <Button className="mt-4 w-25 self-center" onClick={() => handle_register()}>Register</Button>
                    </div>
                </Card>
            )}
        </div>
    )
}
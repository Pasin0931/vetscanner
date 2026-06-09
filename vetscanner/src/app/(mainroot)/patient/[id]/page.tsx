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

export default function EditPage() {

    const { id } = useParams()
    const router = useRouter()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [species, setSpecies] = useState("")
    const [picture_url, setPictureUrl] = useState("")

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

    useEffect(() => {
        const patient = mock.find((p) => p.id === Number(id))
        if (patient) {
            setName(patient.name)
            setDescription(patient.description)
            setSpecies(patient.species)
            setPictureUrl(patient.picture_url)
        }
    }, [id])

    const handle_save = () => {
        try {
            alert(`Saved: ${name}`)
            router.push("/patient")
        } catch (err) {
            console.error("error --> ", err)
            alert("Error while saving patient")
        }
    }

    return (
        <div className="flex flex-col justify-center items-center w-[95%] px-5">
            <Card className="mt-5 p-8 w-[95%] border-3 bg-white">
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
                        <label className="font-semibold text-sm">Species</label>
                        <Combobox items={species_mock}>
                            <ComboboxInput placeholder={species || "Select a species"} />
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
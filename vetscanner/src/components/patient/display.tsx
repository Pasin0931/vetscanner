"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

import Image from "next/image"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DisplayPage() {

    const [activeTab, setActiveTab] = useState("home")

    const [mock, setMock] = useState(
        [
            {
                "name": "dog1",
                "description": "dog dog dog dogaaaaaaakajbjkbcdwadwadwadawgvsavxcvvwacvaw dwa awd adadwa adwwawa",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "name": "dog2",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "name": "dog3",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "name": "dog4",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "name": "dog5",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "name": "dog6",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "name": "dog6",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "name": "dog6",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
            {
                "name": "dog6",
                "description": "dog dog dog dog",
                "species": "dog",
                "picture_url": "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80",
            },
        ]
    )

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="relative flex flex-row justify-between bg-[#D9D9D9] px-50 py-3 font-bold rounded w-[90%]">
                <motion.div
                    className="absolute top-0 left-0 mt-1 h-10 w-120 bg-[#ADADAD] rounded"
                    animate={{
                        x: activeTab === "home" ? 6 : 465
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25
                    }}
                />
                <button onClick={() => setActiveTab("home")} className="relative z-10">Your patients</button>
                <button onClick={() => setActiveTab("register")} className="relative z-10">Registration</button>
            </div>
            <Card className="mt-5 p-5 h-170 w-[90%] border-3 bg-white overflow-y-auto">
                <div className="grid grid-cols-4 gap-4">
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
                                <Button variant="destructive">Delete</Button>
                                <Button className="bg-black">Edit</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </Card>
        </div>
    )
}
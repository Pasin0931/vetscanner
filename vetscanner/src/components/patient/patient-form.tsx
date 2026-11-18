"use client"

import { useRef } from "react"

import { Input } from "@/components/ui/input"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { Field } from "@/components/layout/page"

export type PatientFormValues = {
    name: string
    description: string
    breed: string
    age: number
    weight: number
    gender: string
    status: string
    species: string
}

export const EMPTY_PATIENT: PatientFormValues = {
    name: "",
    description: "",
    breed: "",
    age: 0,
    weight: 0,
    gender: "",
    status: "",
    species: "",
}

const GENDERS = ["male", "female"]
const STATUSES = ["active", "inactive"]
const SPECIES = ["cat", "dog"]

function SelectField({ label, items, value, onChange }: {
    label: string
    items: string[]
    value: string
    onChange: (value: string) => void
}) {
    return (
        <Field label={label}>
            <Combobox items={items} value={value || null} onValueChange={(val) => onChange(val ? String(val) : "")}>
                <ComboboxInput placeholder={`Select ${label.toLowerCase()}`} />
                <ComboboxContent>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                        {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </Field>
    )
}

// Shared by Register and Edit patient
export default function PatientForm({ values, onChange, pictureUrl, onPictureSelect }: {
    values: PatientFormValues
    onChange: (values: PatientFormValues) => void
    pictureUrl: string
    onPictureSelect: (file: File) => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const set = <K extends keyof PatientFormValues>(key: K, value: PatientFormValues[K]) =>
        onChange({ ...values, [key]: value })

    return (
        <div className="flex flex-col gap-4">
            <Field label="Name">
                <Input placeholder="Enter name" value={values.name} onChange={(e) => set("name", e.target.value)} />
            </Field>

            <Field label="Description">
                <Input placeholder="Enter description" value={values.description} onChange={(e) => set("description", e.target.value)} />
            </Field>

            <Field label="Breed">
                <Input placeholder="Enter breed" value={values.breed} onChange={(e) => set("breed", e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Age">
                    <Input type="number" value={values.age} onChange={(e) => set("age", Number(e.target.value))} />
                </Field>
                <Field label="Weight (kg)">
                    <Input type="number" value={values.weight} onChange={(e) => set("weight", Number(e.target.value))} />
                </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField label="Gender" items={GENDERS} value={values.gender} onChange={(v) => set("gender", v)} />
                <SelectField label="Status" items={STATUSES} value={values.status} onChange={(v) => set("status", v)} />
                <SelectField label="Species" items={SPECIES} value={values.species} onChange={(v) => set("species", v)} />
            </div>

            <Field label="Picture">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center h-60 rounded-lg border-2 border-dashed bg-gray-50 cursor-pointer overflow-hidden hover:bg-gray-100 transition"
                >
                    {pictureUrl ? (
                        <img src={pictureUrl} alt="preview" className="h-full object-contain" />
                    ) : (
                        <p className="text-sm text-gray-500">Click to upload a picture</p>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) onPictureSelect(file)
                        }}
                    />
                </div>
            </Field>
        </div>
    )
}

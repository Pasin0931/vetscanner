export type Patient = {
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

export const DEFAULT_PORTRAIT = "https://img.magnific.com/free-photo/pug-dog-isolated-white-background_2829-11416.jpg?semt=ais_hybrid&w=740&q=80"

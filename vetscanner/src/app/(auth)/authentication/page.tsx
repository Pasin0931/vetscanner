import UsrAuth from "@/components/auth"

export default async function AuthPage({ searchParams }: { searchParams: Promise<{tab?: string}>}) {
    const param = await searchParams
    return <UsrAuth startTab={param.tab} />
}
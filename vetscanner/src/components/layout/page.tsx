import { cn } from "@/lib/utils"

type WithChildren = {
    children: React.ReactNode
    className?: string
}

// Same responsive width on every page
export function Page({ children, className }: WithChildren) {
    return (
        <div className={cn("flex flex-col gap-6 w-full min-w-90 sm:w-100 md:w-150 lg:w-200 xl:w-270 px-1 py-10", className)}>
            {children}
        </div>
    )
}

export function PageHeader({ title, description, actions }: {
    title: string
    description?: string
    actions?: React.ReactNode
}) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}

// White content box
export function Panel({ children, className }: WithChildren) {
    return (
        <div className={cn("rounded-xl bg-[#F4F6F6] p-6 drop-shadow-md [&_[data-slot=input]]:bg-white [&_[data-slot=input-group]]:bg-white", className)}>
            {children}
        </div>
    )
}

// Label + input
export function Field({ label, children, className }: WithChildren & { label: string }) {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <label className="text-sm font-medium">{label}</label>
            {children}
        </div>
    )
}

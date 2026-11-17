import { NextResponse, type NextRequest } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"
const LOGIN_PATH = "/authentication?tab=Login"

// redirects to login if the session is missing or expired
export async function proxy(request: NextRequest) {
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId) {
        return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    }

    try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
            headers: { cookie: `session_id=${sessionId}` },
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
        })

        if (res.status === 401) {
            const response = NextResponse.redirect(new URL(LOGIN_PATH, request.url))
            response.cookies.delete("session_id")
            return response
        }
    } catch {
        // Backend down: let the page load anyways
    }

    return NextResponse.next()
}

// Protected pages
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/patient/:path*",
        "/scan/:path*",
        "/history/:path*",
        "/graph/:path*",
        "/about/:path*",
    ],
}

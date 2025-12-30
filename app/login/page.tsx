"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import LoginForm from "./components/login-form"

export default function Page() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const email = form.email.value
        const password = form.password.value

        setLoading(true)
        try {
            const data = {
                email,
                password,
            }

            const res = await fetch("/login/api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error("Invalid credentials")

            const { user } = await res.json()
            localStorage.setItem("user_data", JSON.stringify(user))
            router.push("/tenants")

        } catch (err: any) {
            toast.error("Login unsuccessful!", { description: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <LoginForm />
    )
}
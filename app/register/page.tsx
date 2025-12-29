"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RegisterForm } from "./components/register-form"

export default function Page() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const email = form.email.value
        const name = form.username.value
        const tenant = form.tenant.value
        const password = form.password.value
        const repassword = form.repassword.value

        setLoading(true)
        try {
            if (password != repassword) throw new Error("Passwords do not match")

            const data = {
                email,
                name,
                tenant,
                password,
            }

            const res = await fetch("/register/api", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || "Something went wrong.")
            }

            toast.success("Registration successful!")
            router.push("/login")
        } catch (err: any) {
            toast.error("Registration unsuccessful!", { description: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <RegisterForm onSubmit={handleSubmit} loading={loading} />
            </div>
        </div>
    )
}


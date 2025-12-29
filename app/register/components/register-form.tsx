import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2Icon } from "lucide-react"

type RegisterFormProps = {
    className?: string
    loginPath?: string
    loading?: boolean
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
}

export function RegisterForm({
    className,
    loginPath = "/login",
    loading = false,
    onSubmit,
    ...props
}: RegisterFormProps) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Register to your account</CardTitle>
                    <CardDescription>
                        Enter your details to create an account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="tenant">Tenant Name</Label>
                                <Input
                                    id="tenant"
                                    type="text"
                                    placeholder="your-company"
                                    required
                                />
                            </div>
                            <hr />
                            <div className="grid gap-3">
                                <Label htmlFor="username">Full Name</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="repassword">Re-enter Password</Label>
                                <Input id="repassword" type="password" required />
                            </div>
                            <div className="flex flex-col gap-3 pt-2">
                                <Button type="submit" className="w-full">
                                    {loading ? (
                                        <>
                                            <Loader2Icon className="animate-spin" />
                                            Please wait...
                                        </>
                                    ) : (
                                        "Register"
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <a href={loginPath} className="underline underline-offset-4">
                                Login
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

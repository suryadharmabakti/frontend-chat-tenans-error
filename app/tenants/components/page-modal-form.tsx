"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface PageModalFormProps {
    onSubmit: (name: string) => void;
}

export default function PageModalForm({ onSubmit }: PageModalFormProps) {
    const [formName, setFormName] = useState("");

    const handleSubmit = () => {
        if (!formName.trim()) return;
        onSubmit(formName.trim());
        setFormName(""); // Reset setelah submit
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card
                    className="flex flex-col items-center justify-center text-center shadow-none hover:shadow-md transition-shadow cursor-pointer border-dashed border-2"
                >
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <Plus className="w-8 h-8 mb-2" />
                        <p className="font-medium">Add New Tenant</p>
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Tenant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-3">
                    <div className="space-y-3">
                        <Label htmlFor="tenantName">Tenant Name</Label>
                        <Input
                            id="tenantName"
                            placeholder="Enter tenant name"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button onClick={handleSubmit}>Create</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

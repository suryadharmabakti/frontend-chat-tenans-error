"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import AsyncSelect from "react-select/async";

export interface DefaultOption {
    label: string;
    value: any;
}

export interface FilterField {
    key: string;
    label: string;
    type: 'text' | 'number' | 'currency' | 'date' | 'date_range' | 'select' | 'async-select';
    placeholder?: string;
    options?: DefaultOption[];
    getDataOptions?: (search?: string) => Promise<DefaultOption[]>;
}

interface FilterElementProps {
    filters: Record<string, any>;
    updateFilter: (newFilters: Record<string, any>) => void;
    handleReset: () => void;
    filterFields: FilterField[];
}

export function DynamicFilter({
    filters,
    filterFields,
    updateFilter,
    handleReset,
}: FilterElementProps) {
    const [open, setOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<Record<string, any>>(filters);

    const handleChange = (key: string, value: any) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        updateFilter(localFilters);
        setOpen(false);
    };

    const resetFilters = () => {
        setLocalFilters({});
        handleReset();
        setOpen(false);
    };

    const activeFilterCount = Object.values(filters).reduce((count, val) => {
        if (val === null || val === undefined || val === "") return count;

        // Untuk date_range
        if (typeof val === "object" && val?.start === "" && val?.end === "") return count;

        return count + 1;
    }, 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Filter Data</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {filterFields.map((field) => {
                        const value = localFilters[field.key] ?? "";
                        return (
                            <div key={field.key} className="grid gap-2">
                                <Label>{field.label}</Label>

                                {/* Text / Number / Currency */}
                                {["text", "number", "currency"].includes(field.type) && (
                                    <Input
                                        type={field.type === "currency" ? "number" : field.type}
                                        value={value}
                                        placeholder={field.placeholder}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                    />
                                )}

                                {/* Date */}
                                {field.type === "date" && (
                                    <Input
                                        type="date"
                                        value={value}
                                        placeholder={field.placeholder}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                    />
                                )}

                                {/* Date Range */}
                                {field.type === "date_range" && (
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            value={value?.start || ""}
                                            placeholder="Start date"
                                            onChange={(e) =>
                                                handleChange(field.key, { ...value, start: e.target.value })
                                            }
                                        />
                                        <Input
                                            type="date"
                                            value={value?.end || ""}
                                            placeholder="End date"
                                            onChange={(e) =>
                                                handleChange(field.key, { ...value, end: e.target.value })
                                            }
                                        />
                                    </div>
                                )}

                                {/* Static Select */}
                                {field.type === "select" && (
                                    <Select
                                        value={field.options?.find((opt) => opt.value === value) || null}
                                        onChange={(selected) =>
                                            handleChange(field.key, selected?.value ?? "")
                                        }
                                        options={field.options}
                                        placeholder={field.placeholder || "Select"}
                                        isClearable
                                    />
                                )}

                                {/* Async Select */}
                                {field.type === "async-select" && (
                                    <AsyncSelect
                                        defaultOptions
                                        value={value}
                                        cacheOptions
                                        loadOptions={field.getDataOptions}
                                        onChange={(selected) =>
                                            handleChange(field.key, selected?.value ?? "")
                                        }
                                        placeholder={field.placeholder || "Search..."}
                                        isClearable
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={resetFilters}>
                        Reset
                    </Button>
                    <Button onClick={applyFilters}>Apply Filter</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

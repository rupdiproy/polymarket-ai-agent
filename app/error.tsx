"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Boundary caught:", error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-6 px-4">
            <div className="flex flex-col items-center gap-3 text-center max-w-md">
                <div className="p-4 bg-destructive/10 rounded-full">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="text-muted-foreground text-sm">
                    {error.message || "An unexpected error occurred in the application layer. Please try again or contact support."}
                </p>
            </div>
            <Button onClick={() => reset()} variant="outline" className="min-w-[120px]">
                Try again
            </Button>
        </div>
    );
}

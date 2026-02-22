"use client";

import { Navbar } from "@/components/Navbar";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading, isDemoMode } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user && !isDemoMode) {
            router.push("/");
        }
    }, [user, loading, isDemoMode, router]);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <Navbar />
            <main className="flex-1 container mx-auto p-4 max-w-screen-2xl">
                {children}
            </main>
        </div>
    );
}

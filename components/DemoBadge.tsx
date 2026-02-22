"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Info } from "lucide-react";

export function DemoBadge() {
    const { isDemoMode } = useAuth();

    if (!isDemoMode || !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2 text-sm font-medium text-blue-500 shadow-lg backdrop-blur-md max-w-[90vw] sm:max-w-md pointer-events-none transition-all">
            <Info className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">
                Simulated AI Demo Active
            </span>
        </div>
    );
}

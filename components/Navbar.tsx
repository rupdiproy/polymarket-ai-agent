"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, LayoutDashboard, BrainCircuit } from "lucide-react";

export function Navbar() {
    const { user, login, logout, loading } = useAuth();

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                        <span className="font-bold inline-block hidden sm:inline-block">Polymarket Agent</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">

                    {!loading && (
                        <>
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <Link href="/dashboard">
                                        <Button variant="ghost" size="sm" className="hidden sm:flex">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="sm" onClick={logout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={login}>
                                        Demo
                                    </Button>
                                    <Link href="/auth">
                                        <Button size="sm">
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Sign In
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

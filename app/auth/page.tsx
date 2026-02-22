"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, LogIn, AlertTriangle, Mail, Smartphone, ArrowRight, ShieldCheck } from "lucide-react";
import { fetcher } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
    const { user, login, isDemoMode } = useAuth();
    const router = useRouter();
    const [loadingMsg, setLoadingMsg] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoadingMsg("Syncing user profile...");
            // Simulate calling the /api/user to create/read user
            fetcher("/api/user")
                .then(() => {
                    toast.success("Welcome back!");
                    router.push("/dashboard");
                })
                .catch(() => {
                    toast.error("Failed to fetch user profile.");
                    setLoadingMsg("");
                });
        }
    }, [user, router]);

    const handleDemoLogin = async () => {
        setLoadingMsg("Initializing Demo Session...");
        try {
            await login();
            // The useEffect above will handle redirecting to /dashboard after user state update
        } catch {
            toast.error("Demo login failed");
            setLoadingMsg("");
        }
    };

    const handleEmailPhoneFallback = () => {
        if (isDemoMode) {
            handleDemoLogin();
        } else {
            toast.error("Email and Phone authentication are disabled. Please use Google Sign-In.");
        }
    };

    const handleGoogleLogin = async () => {
        setLoadingMsg("Authenticating with Google...");
        try {
            await login();
        } catch (error: any) {
            console.error(error);
            if (error?.code === "auth/configuration-not-found") {
                toast.error("Firebase Auth Misconfigured", {
                    description: "You are using the default API keys. Please create your own Firebase project and replace the keys in Vercel to use live Authentication."
                });
            } else {
                toast.error("Google login failed or was cancelled.");
            }
            setLoadingMsg("");
        }
    };

    if (!mounted) return null;

    if (loadingMsg) {
        return (
            <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">{loadingMsg}</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center relative">
            <div className="absolute top-8 left-8">
                <Link href="/" className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    <span className="font-bold">Polymarket Agent</span>
                </Link>
            </div>

            <Card className="max-w-md w-full shadow-lg border-white/5 bg-black/40 backdrop-blur-md relative z-10 mx-4">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-max mb-2">
                        <LogIn className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>
                        Sign in to access your Polymarket AI trading dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isDemoMode && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-500 flex gap-2 animate-pulse mb-4">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <p>Demo Mode Active: All sign-ins below simulate success immediately without credentials.</p>
                        </div>
                    )}

                    <Tabs defaultValue="email" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/50 backdrop-blur-md border border-white/5">
                            <TabsTrigger value="email">Email</TabsTrigger>
                            <TabsTrigger value="phone">Phone</TabsTrigger>
                            <TabsTrigger value="google">Google</TabsTrigger>
                        </TabsList>

                        <TabsContent value="email" className="space-y-4 focus-visible:outline-none">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="m@example.com" className="bg-black/20 focus-visible:ring-primary shadow-inner" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link href="#" className="text-xs text-primary hover:underline">Forgot?</Link>
                                    </div>
                                    <Input id="password" type="password" className="bg-black/20 focus-visible:ring-primary shadow-inner" />
                                </div>
                            </div>
                            <Button className="w-full h-11 get-started group" onClick={handleEmailPhoneFallback}>
                                <Mail className="mr-2 h-4 w-4" /> Sign In with Email
                                <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </Button>
                        </TabsContent>

                        <TabsContent value="phone" className="space-y-4 focus-visible:outline-none">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="bg-black/20 focus-visible:ring-primary shadow-inner" />
                                </div>
                                <div className="p-3 rounded-md bg-muted/30 border border-white/5 text-xs text-muted-foreground flex gap-2">
                                    <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>We&apos;ll text you a secure code to confirm your number. Standard rates apply.</span>
                                </div>
                            </div>
                            <Button className="w-full h-11 group" variant="secondary" onClick={handleEmailPhoneFallback}>
                                <Smartphone className="mr-2 h-4 w-4" /> Send Login Code
                            </Button>
                        </TabsContent>

                        <TabsContent value="google" className="space-y-4 focus-visible:outline-none">
                            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-lg bg-black/10 space-y-4 mb-2">
                                <div className="bg-muted p-3 rounded-full">
                                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                <p className="text-sm text-center text-muted-foreground w-3/4">Securely link your Google Identity to avoid remembering passwords.</p>
                            </div>
                            <Button
                                className="w-full text-md h-12 gap-2"
                                variant="outline"
                                onClick={isDemoMode ? handleDemoLogin : handleGoogleLogin}
                            >
                                Continue with Google
                            </Button>
                        </TabsContent>
                    </Tabs>

                    <div className="pt-2 text-center text-xs text-muted-foreground">
                        By signing in, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

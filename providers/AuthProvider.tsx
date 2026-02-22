"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider, isDemoMode } from "../lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
    isDemoMode,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(!(isDemoMode || !auth));
    const router = useRouter();

    useEffect(() => {
        if (isDemoMode || !auth) {
            const storedDemoSession = localStorage.getItem("demo_user_session");
            if (storedDemoSession) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser(JSON.parse(storedDemoSession) as User);
            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        if (isDemoMode) {
            // Mock login
            const demoUser = {
                uid: "demo-user-id",
                displayName: "Demo User",
                email: "demo@example.com",
                photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
            } as User;
            setUser(demoUser);
            localStorage.setItem("demo_user_session", JSON.stringify(demoUser));
            router.push("/dashboard");
            return;
        }

        if (!auth || !googleProvider) return;
        try {
            await signInWithPopup(auth, googleProvider);
            router.push("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        if (isDemoMode) {
            setUser(null);
            localStorage.removeItem("demo_user_session");
            router.push("/");
            return;
        }

        if (!auth) return;
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isDemoMode }}>
            {children}
        </AuthContext.Provider>
    );
}

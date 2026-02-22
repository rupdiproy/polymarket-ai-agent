import { NextResponse } from "next/server";

export async function GET() {
    const isDemoMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

    return NextResponse.json({
        status: "ok",
        mode: isDemoMode ? "demo" : "live",
        environment: {
            firebaseActive: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            walletConnectActive: !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        },
        timestamp: new Date().toISOString()
    });
}

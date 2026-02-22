import { NextResponse } from "next/server";
import { walletConnectSchema } from "@/lib/validators";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = walletConnectSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ success: false, errors: parsed.error.issues }, { status: 400 });
        }

        // In a real app we would persist to database
        return NextResponse.json({ success: true, message: "Wallet connection status tracked." });
    } catch {
        return NextResponse.json({ success: false, message: "Invalid payload format" }, { status: 400 });
    }
}

import { NextResponse } from "next/server";
import { logAppendSchema } from "@/lib/validators";

export async function GET() {
    return NextResponse.json({
        logs: [
            "[INFO] Starting Polymarket AI Agent v1.0...",
            "[INFO] Loaded risk profile: CONSERVATIVE",
            "[WARN] Rate limit threshold approaching on provider."
        ]
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = logAppendSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ success: false, errors: parsed.error.issues }, { status: 400 });
        }

        // Push validated mock log array
        return NextResponse.json({ success: true, message: "Log appended successfully" });
    } catch {
        return NextResponse.json({ success: false, message: "Invalid payload format" }, { status: 400 });
    }
}

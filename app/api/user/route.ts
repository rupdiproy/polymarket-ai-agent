import { NextResponse } from "next/server";
import { userProfileSchema } from "@/lib/validators";

export async function GET() {
    return NextResponse.json({
        id: "demo-user-1234",
        name: "Demo Agent Operator",
        email: "demo@polymarketagent.com",
        tier: "Pro",
        joined: "2026-02-21",
        subscription: "Active"
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = userProfileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ success: false, errors: parsed.error.issues }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            user: { ...parsed.data, _id: "newly-created-demo-id-888" },
            message: "Profile updated successfully.",
        });
    } catch {
        return NextResponse.json({ success: false, message: "Invalid payload format" }, { status: 400 });
    }
}

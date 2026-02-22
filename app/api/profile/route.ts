import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        id: "user-123",
        name: "Demo Agent Operator",
        tier: "Pro",
        joined: "2025-01-01"
    });
}

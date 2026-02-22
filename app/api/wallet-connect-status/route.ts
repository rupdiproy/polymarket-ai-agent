import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "connected",
        network: "Polygon",
        latency: "45ms"
    });
}

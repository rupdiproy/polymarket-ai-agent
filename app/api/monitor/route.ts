import { NextResponse } from "next/server";

export async function GET() {
    // Simulating the latest event for a stream
    return NextResponse.json({
        latestEvent: {
            type: "ODDS_SHIFT",
            market: "ETH > $4000",
            shift: "+5%",
            timestamp: new Date().toISOString()
        }
    });
}

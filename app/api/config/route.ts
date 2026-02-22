import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        simulationMode: true,
        maxDailyLoss: 500,
        maxTradeSizePercent: 10,
        cooldownMinutes: 15
    });
}

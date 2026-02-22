import { NextResponse } from "next/server";

export async function GET() {
    const dummyDecisions = [
        {
            id: "d1",
            market: "Will ETH Break $4000?",
            action: "BUY YES",
            confidence: 85,
            rationale: "Sentiment spike across Twitter and positive influx from institutional ETF flows.",
            riskScore: 3
        },
        {
            id: "d2",
            market: "Fed Rate Cut in March?",
            action: "SELL NO",
            confidence: 60,
            rationale: "Recent CPI print came in hotter than expected. Re-evaluating probability models.",
            riskScore: 8
        }
    ];
    return NextResponse.json(dummyDecisions);
}

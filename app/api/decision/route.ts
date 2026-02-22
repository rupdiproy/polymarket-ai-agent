import { NextResponse } from "next/server";
import { decisionSignalSchema } from "@/lib/validators";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = decisionSignalSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ success: false, errors: parsed.error.issues }, { status: 400 });
        }

        const isBuying = parsed.data.signalType === 'BUY';

        return NextResponse.json({
            success: true,
            recommendation: {
                action: isBuying ? "BUY YES" : "SELL YES",
                confidence: Math.floor(Math.random() * (95 - 60) + 60),
                riskScore: Math.floor(Math.random() * 10),
                rationale: `Intercepted strong ${parsed.data.signalType.toLowerCase()} pressure from tracked wallet against market standard. Recommend mirroring exposure.`
            }
        });
    } catch {
        return NextResponse.json({ success: false, message: "Invalid payload format" }, { status: 400 });
    }
}

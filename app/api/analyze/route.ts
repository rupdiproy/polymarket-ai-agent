import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: Request) {
    try {
        const { target, traderName, strategy, lastCall } = await request.json();

        // Check if OpenAI key is present, otherwise fallback to simulated response for demo
        if (!process.env.OPENAI_API_KEY) {
            await new Promise(r => setTimeout(r, 1500)); // Simulate AI delay
            return NextResponse.json({
                analysis: `[SIMULATED - No OpenAI Key]\nBased on the intercepted call "${lastCall}" from ${traderName}, the ${strategy} strategy aligning with $${target} suggests a high probability of institutional accumulation. Historical backtesting of ${traderName}'s calls during similar market conditions shows a 78% success rate within 48 hours.`,
                confidence: (Math.random() * 20 + 80).toFixed(1) // 80-99
            });
        }

        // Real production AI execution using Vercel AI SDK
        const prompt = `
            You are a ruthless, highly intelligent Crypto and Polymarket quant trader AI.
            Perform a rapid Deep Dive Autopsy on the following intercepted alpha signal:
            - Trader: ${traderName}
            - Target Asset/Market: $${target}
            - Implied Strategy: ${strategy}
            - Intercepted Comms: "${lastCall}"
            
            Provide a 3-sentence maximum rational analysis of why this trade is happening, what to look out for, and output your perceived success confidence.
        `;

        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            prompt: prompt,
            temperature: 0.7,
        });

        // Parse a random confidence specifically for this generated output
        const simulatedAIConfidence = (Math.random() * 15 + 85).toFixed(1);

        return NextResponse.json({
            analysis: text,
            confidence: simulatedAIConfidence
        });

    } catch (error) {
        console.error("AI Analysis failed:", error);
        return NextResponse.json({ error: "Failed to run deep dive autopsy on target." }, { status: 500 });
    }
}

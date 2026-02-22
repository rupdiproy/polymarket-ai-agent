import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/search/trending', {
            next: { revalidate: 30 } // Cache for 30 seconds
        });

        if (!res.ok) throw new Error("Failed to fetch API");
        const data = await res.json();

        // Map the trending coins to simulate Twitter Alpha Traders calling those coins
        const traders = data.coins.slice(0, 15).map((coin: any, index: number) => {
            const handles = [
                "@WhaleAlert_X", "@AlphaHunter_ETC", "@SolanaSniper", "@DegenApe_AI",
                "@SmartMoney_Bot", "@CryptoCap_Bot", "@MemeCoin_Scanner", "@MoonShot_Radar",
                "@DeepValue_AI", "@FlashBot_Intel", "@X_Alpha_Oracle", "@ChainSleuth_AI",
                "@OnChain_Wizard", "@DarkPool_X", "@Liquidity_Hunter", "@Macro_Scope_AI",
                "@DeFi_Whale_Ops", "@Chart_Wizard_X", "@Token_Sniffer_Pro", "@Web3_Alpha_Group"
            ];
            const handle = handles[Math.floor(Math.random() * handles.length)];
            const priceChange = coin.item.data?.price_change_percentage_24h?.usd;

            // If API doesn't return price change, simulate realistically based on market
            const finalChange = priceChange !== undefined
                ? priceChange
                : (Math.random() * 30 - 10); // Between -10% and +20%

            const callTypes = [
                `Accumulating heavy spot on $${coin.item.symbol} before global macro shift. Target: 10x.`,
                `Detecting massive dark pool buying on $${coin.item.symbol}. Breakout imminent, adding to core position.`,
                `On-chain metrics show a massive supply shock loading for $${coin.item.symbol}. I'm all in.`,
                `Short squeeze incoming for $${coin.item.symbol}. Funding rates are deeply negative. Squeezing bears.`,
                `Just loaded a 50x long on $${coin.item.symbol}. Insiders are whispering about a major partnership.`,
                `Whale wallets are quietly scooping up every dip on $${coin.item.symbol}. Don't miss this rotation.`
            ];

            const strategies = ["Momentum Breakout", "Mean Reversion", "News Catalyst", "On-Chain Accumulation", "Liquidity Sweep", "Sentiment Rotation"];

            return {
                id: coin.item.id,
                name: handle,
                target: coin.item.symbol,
                image: coin.item.large,
                pnl: finalChange >= 0 ? `+${finalChange.toFixed(2)}%` : `${finalChange.toFixed(2)}%`,
                active: true, // Randomize activity slightly but keep mostly true
                aiScore: (Math.random() * 15 + 84).toFixed(1), // 84-99 score
                winRate: (Math.random() * 20 + 60).toFixed(1) + "%",
                riskProfile: finalChange > 15 ? "High Risk (Ape)" : "Calculated (Mid-cap)",
                strategy: strategies[Math.floor(Math.random() * strategies.length)],
                lastCall: callTypes[Math.floor(Math.random() * callTypes.length)],
                lastActive: `${Math.floor(Math.random() * 14) + 1} mins ago`,
                marketCap: coin.item.data?.market_cap || "Unknown"
            };
        });

        return NextResponse.json(traders);
    } catch (error) {
        console.error("Trader API fetch failed, using fallback:", error);
        // Fallback if API fails
        const fallbackTraders = [
            { id: "1", name: "@CryptoKing_X", target: "BTC", image: "", pnl: "+14.5%", active: true, aiScore: "95.2", winRate: "82.1%", riskProfile: "Low Risk", strategy: "Trend Following", lastCall: "Called BTC pump before open.", lastActive: "2 mins ago" },
            { id: "2", name: "@WhaleTracker", target: "ETH", image: "", pnl: "+8.2%", active: true, aiScore: "88.4", winRate: "76.4%", riskProfile: "Low Risk", strategy: "On-Chain Accumulation", lastCall: "ETH accumulation detected.", lastActive: "12 mins ago" },
            { id: "3", name: "@SolanaSnipe", target: "SOL", image: "", pnl: "-2.1%", active: false, aiScore: "62.1", winRate: "61.3%", riskProfile: "High Risk", strategy: "Momentum Breakout", lastCall: "Missed SOL entry, monitoring.", lastActive: "45 mins ago" },
        ];
        return NextResponse.json(fallbackTraders);
    }
}

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    try {
        // Fetch 1000 items ordered by 24hr volume to catch fast-moving meme coin trends
        const res = await fetch(`https://gamma-api.polymarket.com/events?limit=1000&active=true&closed=false&order=volume24hr`, {
            headers: {
                'Accept': 'application/json',
            },
            next: { revalidate: 2 } // Cache for 2 seconds to avoid slamming Polymarket
        });

        if (!res.ok) {
            throw new Error(`Gamma API responded with status: ${res.status}`);
        }

        const data = await res.json();

        // STRICTLY FILTER FOR ORGANIC CRYPTO EVENTS + ALL MEME COINS
        const organicCryptoRegex = /\b(bitcoin|btc|ethereum|eth|solana|sol|xrp|doge|pepe|wif|bonk|floki|shib|meme|crypto|token|coin|binance|coinbase|fdv|airdrop|nft|defi|pudgy|kraken|ledger|etf|ai|tao|fet|ocean|render|pengu|sui|taiko|zro|popcat|mog|brett|neiro|trump)\b/i;

        const spamRegex = /\b(vs\.|vs|match|up or down|premier league|swift|taylor swift|nfl|nba|soccer|baseball|tennis|hegseth|duff|election|presidential|senate)\b/i;

        const cryptoData = data.filter((e: any) => {
            if (!e.title) return false;
            const t = e.title.toLowerCase();

            // Absolutely crush any sports/politics spam
            if (spamRegex.test(t)) return false;

            // Must match at least one crypto or memecoin keyword
            return organicCryptoRegex.test(t);
        });

        // To ensure the feed isn't just dominated by the top 10 "Bitcoin Up or Down" 5-minute markets,
        // we're going to take the entire organic crypto list (usually 200+ events) and shuffle a 
        // chunk of it every single time the API is called. This guarantees the UI feed is hyper-dynamic
        // and randomly cycles through meme coins, AI coins, macro bets, and micro real-time bets!

        // Let's sort them first to group the highest volume together, then mix up the top 100.
        const sortedCryptoData = cryptoData.sort((a: any, b: any) => parseFloat(b.volume24hr || 0) - parseFloat(a.volume24hr || 0));

        const top100Data = sortedCryptoData.slice(0, 100);

        // Fisher-Yates shuffle the top 100 active organic crypto events
        for (let i = top100Data.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [top100Data[i], top100Data[j]] = [top100Data[j], top100Data[i]];
        }

        // Return the required slice from the freshly shuffled high-volume pool
        return NextResponse.json(top100Data.slice(0, parseInt(limit, 10)));
    } catch (error) {
        console.error("Failed to fetch from Gamma API:", error);
        return NextResponse.json(
            { error: "Failed to fetch top markets" },
            { status: 500 }
        );
    }
}

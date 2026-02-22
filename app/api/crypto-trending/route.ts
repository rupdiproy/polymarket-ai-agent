import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch 1: CoinGecko Trending List (Organic Search Trends)
        const trendingReq = fetch('https://api.coingecko.com/api/v3/search/trending', {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 }
        });

        // Fetch 2: Open Source Fear & Greed Index
        const fgiReq = fetch('https://api.alternative.me/fng/', {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 300 }
        });

        // Fetch 3: CoinGecko Live Simple Price for Top Movers (Real-time VWAP + 24Hr Volume)
        const livePriceReq = fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,dogecoin,pepe,shiba-inu,bittensor,chainlink,near&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true', {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 30 }
        });

        const [trendingRes, fgiRes, livePriceRes] = await Promise.all([trendingReq, fgiReq, livePriceReq]);

        const trendingData = trendingRes.ok ? await trendingRes.json() : { coins: [] };
        const fgiData = fgiRes.ok ? await fgiRes.json() : { data: [{ value: '50' }] };
        const livePriceData = livePriceRes.ok ? await livePriceRes.json() : {};

        return NextResponse.json({
            trending: trendingData.coins || [],
            fgi: fgiData.data && fgiData.data.length > 0 ? fgiData.data[0].value : '50',
            livePrices: livePriceData
        });
    } catch (error) {
        console.error("Failed to aggregate open source crypto data:", error);
        return NextResponse.json(
            { error: "Failed to aggregate API Intel" },
            { status: 500 }
        );
    }
}

import { useState, useEffect } from 'react';

export interface LiveMarket {
    id: string;
    title: string;
    volume: number;
    price: number;
    trend: 'up' | 'down';
}

export function useLiveMarkets(limit: number = 5) {
    const [markets, setMarkets] = useState<LiveMarket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                // Fetch top active markets by volume from our backend proxy
                const res = await fetch(`/api/markets?limit=${limit}`);
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`API failed with ${res.status}: ${errorText.substring(0, 50)}`);
                }
                const data = await res.json();
                if (!Array.isArray(data)) throw new Error("API returned non-array data");
                if (data.length === 0) throw new Error("API returned 0 active crypto markets.");

                setMarkets((prev) => {
                    return data.map((event: { id: string, title: string, volume: string, markets: { outcomePrices: string }[] }) => {
                        // Find the YES token (usually index 0 or look for outcome 'Yes')
                        const activeMarket = event.markets?.[0];
                        let currentPrice = 50;
                        if (activeMarket?.outcomePrices) {
                            try {
                                const prices = JSON.parse(activeMarket.outcomePrices);
                                if (prices[0]) {
                                    currentPrice = parseFloat(prices[0]) * 100;
                                }
                            } catch {
                                // silent fallback
                            }
                        }

                        // Determine trend by comparing with previous state if it exists
                        const prevMarket = prev.find(p => p.id === event.id);
                        let trend: 'up' | 'down' = prevMarket?.trend || 'up';
                        if (prevMarket && currentPrice > prevMarket.price) trend = 'up';
                        if (prevMarket && currentPrice < prevMarket.price) trend = 'down';

                        return {
                            id: String(event.id),
                            title: event.title ? String(event.title).replace(/\?/g, '') : 'Unknown Market', // Clean up titles
                            volume: typeof event.volume === 'number' ? event.volume : parseFloat(event.volume || "0"),
                            price: currentPrice || 50, // Fallback to 50% if unknown
                            trend
                        };
                    });
                });
                setLoading(false);
            } catch (err: any) {
                console.log("Using simulating fallback data (API fetch caught).", err);
                const fallbackData: LiveMarket[] = [
                    { id: '1', title: `System Error: ${err.message || String(err)}`, volume: 0, price: 50, trend: 'up' },
                ];
                setMarkets(fallbackData);
                setLoading(false);
            }
        };

        fetchMarkets();
        // Poll every 2 seconds for real-time live odds updates as requested
        const interval = setInterval(fetchMarkets, 2000);
        return () => clearInterval(interval);
    }, [limit]);

    return { markets, loading };
}

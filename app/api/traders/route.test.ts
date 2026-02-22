import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

describe('Traders API Route', () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('fetches trending crypto and maps them to simulated alpha traders', async () => {
        // Mock fetch for coingecko
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                coins: [
                    {
                        item: {
                            id: 'bitcoin',
                            symbol: 'BTC',
                            large: 'https://example.com/btc.png',
                            data: {
                                price_change_percentage_24h: { usd: 5.5 },
                                market_cap: '1T'
                            }
                        }
                    },
                    {
                        item: {
                            id: 'ethereum',
                            symbol: 'ETH',
                            large: 'https://example.com/eth.png',
                            data: {
                                price_change_percentage_24h: { usd: -2.1 },
                                market_cap: '400B'
                            }
                        }
                    }
                ]
            })
        });

        const response = await GET();
        const data = await response.json();

        expect(data.length).toBe(2);
        expect(data[0].id).toBe('bitcoin');
        expect(data[0].target).toBe('BTC');
        expect(data[0].active).toBe(true);
        expect(data[0].pnl).toBe('+5.50%');

        expect(data[1].target).toBe('ETH');
        expect(data[1].pnl).toBe('-2.10%');

        // Make sure random logic fields are added
        expect(data[0].aiScore).toBeDefined();
        expect(data[0].riskProfile).toBeDefined();
        expect(data[0].winRate).toBeDefined();
        expect(data[0].lastCall).toBeDefined();
        expect(data[0].strategy).toBeDefined();
        expect(data[0].lastActive).toBeDefined();
    });

    it('returns fallback data when fetch fails', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        const response = await GET();
        const data = await response.json();

        expect(data.length).toBe(3); // The fallback list has 3 items
        expect(data[0].target).toBe('BTC');
        expect(data[1].target).toBe('ETH');
        expect(data[2].target).toBe('SOL');
        expect(data[0].name).toBe('@CryptoKing_X');
    });
});

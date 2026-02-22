import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

describe('Health API Route', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    it('returns status ok and live mode when env vars are present', async () => {
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'mock-api-key';
        process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'mock-wc-id';

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('ok');
        expect(data.mode).toBe('live');
        expect(data.environment.firebaseActive).toBe(true);
        expect(data.environment.walletConnectActive).toBe(true);
    });

    it('returns status ok and demo mode when env vars are missing', async () => {
        delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        delete process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('ok');
        expect(data.mode).toBe('demo');
        expect(data.environment.firebaseActive).toBe(false);
        expect(data.environment.walletConnectActive).toBe(false);
    });
});

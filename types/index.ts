export interface Trader {
    id: string;
    name: string;
    pnl: string;
    active: boolean;
}

export interface Decision {
    id: string;
    market: string;
    action: string;
    rationale: string;
    confidence: number;
    riskScore: number;
}

import { z } from "zod";

export const executeTradeSchema = z.object({
    market: z.string().min(1, "Market string is required"),
    amount: z.number().positive().optional(),
    mode: z.enum(["SIMULATE", "LIVE"]).optional()
});

export const userProfileSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional(),
});

export const walletConnectSchema = z.object({
    address: z.string().startsWith("0x"),
    chainId: z.number().positive(),
    status: z.enum(["connected", "disconnected"]),
});

export const decisionSignalSchema = z.object({
    traderId: z.string().min(1),
    marketId: z.string().min(1),
    signalType: z.enum(["BUY", "SELL"]),
});

export const logAppendSchema = z.object({
    level: z.enum(["INFO", "WARN", "ERROR"]),
    msg: z.string().min(1),
    context: z.any().optional()
});

export type ExecuteTradeInput = z.infer<typeof executeTradeSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type WalletConnectInput = z.infer<typeof walletConnectSchema>;
export type DecisionSignalInput = z.infer<typeof decisionSignalSchema>;
export type LogAppendInput = z.infer<typeof logAppendSchema>;

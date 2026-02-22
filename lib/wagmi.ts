import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
    coinbaseWallet,
    trustWallet,
    ledgerWallet,
    phantomWallet,
    okxWallet,
    safepalWallet,
    bitgetWallet,
    rabbyWallet,
    binanceWallet
} from "@rainbow-me/rainbowkit/wallets";

import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c0a7d5ae15a0c102a92e1afb5e7db016"; // Fallback for Demo Mode

export const config = getDefaultConfig({
    appName: "Polymarket AI Agent",
    projectId,
    chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: true,
    // Metadata required for mobile deep linking (Safari)
    metadata: {
        name: "Polymarket AI Agent",
        description: "AI powered Polymarket trading assistant",
        url: "https://polymarket-agent.vercel.app",
        icons: [],
    },
    // Explicit wallet list with WalletConnect options
    wallets: {
        walletConnect: walletConnectWallet({ projectId, qrcode: true }),
        metaMask: metaMaskWallet,
        rainbow: rainbowWallet,
        coinbase: coinbaseWallet,
        trust: trustWallet,
        ledger: ledgerWallet,
        phantom: phantomWallet,
        okx: okxWallet,
        safepal: safepalWallet,
        bitget: bitgetWallet,
        rabby: rabbyWallet,
        binance: binanceWallet,
    },
});

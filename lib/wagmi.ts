import { getDefaultConfig, getDefaultWallets } from "@rainbow-me/rainbowkit";
import {
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
    coinbaseWallet,
    trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c0a7d5ae15a0c102a92e1afb5e7db016";

const wallets = [
    {
        groupName: 'Recommended',
        wallets: [metaMaskWallet, coinbaseWallet, trustWallet, rainbowWallet, walletConnectWallet],
    },
];

export const config = getDefaultConfig({
    appName: "Polymarket AI Agent",
    projectId,
    wallets,
    chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: true,
    appUrl: "https://polymarket-ai-agent.vercel.app",
    appDescription: "An AI-powered interface for Polymarket",
    appIcon: "https://polymarket-ai-agent.vercel.app/favicon.ico",
});

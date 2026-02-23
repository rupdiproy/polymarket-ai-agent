import { getDefaultConfig, getDefaultWallets } from "@rainbow-me/rainbowkit";

import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "c0a7d5ae15a0c102a92e1afb5e7db016";

export const config = getDefaultConfig({
    appName: "Polymarket Agent",
    projectId,
    chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: true,
});

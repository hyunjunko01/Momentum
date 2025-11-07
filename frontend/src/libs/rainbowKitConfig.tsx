"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { anvil, sepolia, zksync } from "wagmi/chains"

export default getDefaultConfig({
    appName: "Momentum",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [sepolia],
    ssr: false
})
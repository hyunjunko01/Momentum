"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { anvil, sepolia } from "wagmi/chains"

export default getDefaultConfig({
    appName: "Momentum",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [anvil, sepolia],
    ssr: false
})
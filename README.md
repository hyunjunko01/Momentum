# Momentum Project

🚀 Accelerating Scientific Discovery 🚀

Momentum is a decentralized science (DeSci) platform designed to bring transparency, speed, and community funding to the world of scientific research.

## 🔬 The Problem

Scientific progress is humanity's greatest engine, but it's stuck in a system built for a bygone era. The current academic world is plagued by:

* Slow & Biased Funding: Centralized committees take months or years to approve grants, often overlooking bold, unconventional ideas.

* Opaque Processes: Research data is hidden away in private servers, making it impossible to verify findings and leading to a "replication crisis."

* Value Extraction: For-profit publishers lock publicly funded research behind expensive paywalls, slowing down the global flow of knowledge.

We believe science is a public good. It's time to build a system that reflects that.

## ✨ The Solution: Momentum
Momentum is our answer. It's a Web3 platform that allows anyone, anywhere, to directly fund research they believe in. For our MVP, we are focused on proving one core concept: transparent crowdfunding for specific research campaigns.

* Researchers can propose projects and raise funds directly from a global community.

* Backers can support science they are passionate about and receive a unique Patronage NFT as an immutable, on-chain proof of their contribution.

* The entire process—from funding to withdrawal—is governed by a smart contract, ensuring full transparency and accountability.

## 🔗 Live Demo
Check out the live MVP deployed on the Sepolia testnet!

➡️ momentum-desci.vercel.app ⬅️

(Note: You will need a Web3 wallet like MetaMask and some Sepolia ETH to interact with the dApp.)

## 🚀 Key Features (MVP)
* Create Campaigns: Researchers can define a research project with a title, description, and funding goal.

* Discover Projects: Browse a gallery of active research campaigns.

* Fund with Crypto: Backers can connect their wallet and fund projects using USDC.

* Mint Patronage NFTs: Every contribution automatically mints a unique NFT to the backer's wallet.

* Trustless Escrow: Funds are held securely in the smart contract. They are released to the researcher only if the goal is met, and are refundable to backers if it fails.


## 🛠️ Tech Stack
* Blockchain: not decided yet

* Smart Contracts: Solidity

* Frontend: React, Next.js

* Decentralized Storage: IPFS for campaign metadata & proof of results.

## 📄 License
Distributed under the MIT License. 

## dependency

install dependency of foundry

```
cd foundry
forge install OpenZeppelin/openzeppelin-contracts
```

install dependency of frontend
```
cd frontend
pnpm install
```

* .env file
    - you should make .env file to use ProjectId for rainbowKit and test on anvil chain


## deploy script
```forge script script/DeployMomentumFactory.s.sol --rpc-url $ANVIL_RPC_URL --private-key $ANVIL_PRIVATE_KEY --broadcast```
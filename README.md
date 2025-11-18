# Momentum Project

🚀 Accelerating Scientific Discovery 🚀

Momentum is a decentralized science (DeSci) platform designed to bring transparency, speed, and community funding to the world of scientific research.

## 🔬 The Problem

Scientific progress is humanity's greatest engine, but it's stuck in a system built for a bygone era. The current academic world is plagued by:

* **Slow & Biased Funding**: Centralized committees take months or years to approve grants, often overlooking bold, unconventional ideas.
* **Opaque Processes**: Research data is hidden away in private servers, making it impossible to verify findings and leading to a "replication crisis."
* **Value Extraction**: For-profit publishers lock publicly funded research behind expensive paywalls, slowing down the global flow of knowledge.

We believe science is a public good. It's time to build a system that reflects that.

## ✨ The Solution: Momentum

Momentum is our answer. It's a Web3 platform that allows anyone, anywhere, to directly fund research they believe in. For our MVP, we are focused on proving one core concept: transparent crowdfunding for specific research campaigns.

* Researchers can propose projects and raise funds directly from a global community.
* Backers can support science they are passionate about.
* The entire process—from funding to withdrawal—is governed by a smart contract, ensuring full transparency and accountability.

## 🔗 Live Demo

Check out the live MVP deployed on the Sepolia testnet!

➡️ [momentum-desci.vercel.app](https://momentum-one-phi.vercel.app/) ⬅️

(Note: You will need a Web3 wallet like MetaMask and some Sepolia ETH to interact with the dApp.)

## 🚀 Key Features (MVP)

* **Create Campaigns**: Researchers can define a research project with a title, description, and funding goal.
* **Discover Projects**: Browse a gallery of active research campaigns.
* **Fund with Crypto**: Backers can connect their wallet and fund projects using ETH.
* **Trustless Escrow**: Funds are held securely in the smart contract. They are released to the researcher only if the goal is met, and are refundable to backers if it fails.
* **Transparent Research Results**: Backers can check the research results of the projects they funded.

## 🌱 Future Plans

* **Set Milestones**: Setting milestones motivates researchers to conduct more sound research.
* **Mint NFT**: Issue NFTs to give sponsors a token of support.

## 🛠️ Tech Stack

### Smart Contracts

* **Solidity (v0.8.18)**
* **Foundry**: Development, testing, and deployment environment.
* **OpenZeppelin**: ReentrancyGuard (security standard).

### Frontend

* **React & Next.js**
* **wagmi & viem**: Wallet connection and contract interaction.
* **Vercel**: Deployment.

### Decentralized Storage

* **IPFS (via web3.storage / Pinata)**: For campaign metadata & proof of results.

## 🚀 Getting Started (Local Development)

Follow these steps to set up and run the project in your local environment.

### 1. Prerequisites

Before you begin, ensure you have the following tools installed:

* **Node.js** (v18 or higher is recommended)
* **pnpm**: `npm install -g pnpm`
* **Foundry**: Install using `foundryup` via the [official installation guide](https://book.getfoundry.sh/getting-started/installation).

---

### 2. Clone & Install Dependencies

First, clone the repository and install all necessary dependencies for both the smart contracts and the frontend.

```bash
# 1. Clone the repository
git clone [https://github.com/hyunjunko01/Momentum.git](https://github.com/hyunjunko01/Momentum.git)
cd Momentum

# 2. Install smart contract dependencies
cd foundry
forge install
forge build
cd ..

# 3. Install frontend dependencies
cd frontend
pnpm install
cd ..
````

-----

### 3\. Run Local Blockchain & Deploy Contracts

You will need **two separate terminal windows** for this part.

#### 💻 Terminal 1: Start Local Blockchain

```bash
# 1. Start the local blockchain (Anvil)
anvil
```

  * This will start a local node and display 10 test accounts with their **Private Keys**.
  * **Keep this terminal window open.**
  * Copy the **Private Key** for `Account #0`.

#### 💻 Terminal 2: Deploy Smart Contracts

Open a **new terminal window** and follow these steps.

```bash
# 1. Navigate to the project's 'foundry' directory
# (Make sure you are in the Momentum/foundry path)
cd /path/to/Momentum/foundry

# 2. Create a .env file for your deploy script
touch .env

# 3. Add the Anvil RPC URL and your Private Key to the .env file
# Replace [YOUR_ANVIL_PRIVATE_KEY] with the key you copied from Terminal 1
echo "ANVIL_RPC_URL=[http://127.0.0.1:8545](http://127.0.0.1:8545)" > .env
echo "ANVIL_PRIVATE_KEY=[YOUR_ANVIL_PRIVATE_KEY]" >> .env

# 4. Load the environment variables and run the deploy script
source .env
forge script script/DeployMomentumFactory.s.sol --rpc-url $ANVIL_RPC_URL --private-key $ANVIL_PRIVATE_KEY --broadcast
```

  * On success, the script will output the deployed contract address.
  * Look for a line like: `✓ Contract Address: [CONTRACT_ADDRESS]`
  * **Copy this `CONTRACT_ADDRESS`** for the next step.

-----

### 4\. Configure and Run Frontend

Continue in **Terminal 2**.

```bash
# 1. Navigate to the 'frontend' directory
cd ../frontend

# 2. Create the local environment file
touch .env.local

# 3. Add the deployed contract address to .env.local
# Replace [YOUR_CONTRACT_ADDRESS] with the address you just copied
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=[YOUR_CONTRACT_ADDRESS]" > .env.local

# (Optional) Add other required keys (e.g., Pinata, WalletConnect) if needed for local development
# echo "NEXT_PUBLIC_PINATA_KEY=..." >> .env.local
# echo "NEXT_PUBLIC_WALLETCONNECT_ID=..." >> .env.local

# 4. Run the frontend development server
pnpm run dev
```

Your local development environment is now fully set up\!

Open `http://localhost:3000` in your browser to see the dApp running and connected to your local `anvil` blockchain.

## 📄 License

Distributed under the MIT License.

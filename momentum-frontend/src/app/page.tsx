"use client";

import { useState } from 'react';
import type { NextPage } from 'next';
import { Wallet, Target, Users, Clock, ArrowRight, FlaskConical, Github, Twitter } from 'lucide-react';

// --- TYPE DEFINITIONS ---
// This helps us ensure our data is consistent.
type Campaign = {
  id: number;
  title: string;
  researcher: string;
  description: string;
  amountRaised: number;
  fundingGoal: number;
  deadline: Date;
  backers: number;
  category: string;
};

// --- FAKE DATA ---
// In a real app, this data would come from our smart contract.
const fakeCampaigns: Campaign[] = [
  {
    id: 1,
    title: "Mapping Dark Matter with Quantum Sensors",
    researcher: "Dr. Evelyn Reed",
    description: "A novel approach to detect dark matter using next-generation quantum sensors, potentially revolutionizing our understanding of the cosmos.",
    amountRaised: 75_000,
    fundingGoal: 100_000,
    deadline: new Date("2025-11-30"),
    backers: 215,
    category: "Physics"
  },
  {
    id: 2,
    title: "AI-Powered Protein Folding for Drug Discovery",
    researcher: "Dr. Kenji Tanaka",
    description: "Utilizing a new deep learning model to predict protein structures, accelerating the discovery of treatments for rare diseases.",
    amountRaised: 120_500,
    fundingGoal: 150_000,
    deadline: new Date("2025-10-15"),
    backers: 450,
    category: "Biotechnology"
  },
  {
    id: 3,
    title: "CRISPR-based Gene Therapy for Inherited Blindness",
    researcher: "Dr. Maria Rodriguez",
    description: "Developing a safe and effective gene-editing therapy to correct the genetic mutations responsible for Leber congenital amaurosis.",
    amountRaised: 48_000,
    fundingGoal: 200_000,
    deadline: new Date("2026-01-20"),
    backers: 180,
    category: "Medicine"
  },
];

// --- UTILITY FUNCTIONS ---
const daysLeft = (deadline: Date): number => {
  const diff = deadline.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// --- UI COMPONENTS ---

// A single card representing a research campaign
const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const progress = (campaign.amountRaised / campaign.fundingGoal) * 100;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col bg-white dark:bg-gray-800">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-full">{campaign.category}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{campaign.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">by {campaign.researcher}</p>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-grow">{campaign.description}</p>
      </div>

      <div className="px-6 pb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mb-6">
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1.5 text-indigo-500" />
            <span><span className="font-bold text-gray-800 dark:text-white">${campaign.amountRaised.toLocaleString()}</span> raised</span>
          </div>
          <div>
            <span>of ${campaign.fundingGoal.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1.5" />
            <span>{campaign.backers} Backers</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5" />
            <span>{daysLeft(campaign.deadline)} days left</span>
          </div>
        </div>

        <button className="w-full mt-6 bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center">
          Fund Project
        </button>
      </div>
    </div>
  );
};

// The main header for the site
const Header = () => {
  const [isConnected, setIsConnected] = useState(false);

  // In a real app, this would call wagmi/ethers functions
  const handleConnectWallet = () => {
    setIsConnected(!isConnected);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Momentum</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Discover</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Start a Project</a>
          </nav>
          <button
            onClick={handleConnectWallet}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center space-x-2 ${isConnected
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{isConnected ? 'Connected' : 'Connect Wallet'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// The big, attention-grabbing section at the top
const HeroSection = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 pt-32 pb-24 text-center">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Fund the Future of Science.
          <span className="block text-indigo-600 dark:text-indigo-400 mt-2">Transparently.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          Break free from traditional funding. Support groundbreaking research directly, track its progress on-chain, and own a piece of scientific history.
        </p>
        <div className="mt-10 flex justify-center">
          <a href="#campaigns" className="bg-indigo-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center text-lg">
            Discover Campaigns <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
}

// The footer for the site
const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2">
          <FlaskConical className="w-6 h-6 text-indigo-600" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">Momentum</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-4 md:mt-0">&copy; {new Date().getFullYear()} Momentum Protocol. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-gray-400 hover:text-gray-500"><Twitter /></a>
          <a href="#" className="text-gray-400 hover:text-gray-500"><Github /></a>
        </div>
      </div>
    </footer>
  )
}


// --- THE MAIN PAGE COMPONENT ---
const HomePage: NextPage = () => {
  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <Header />

      <main>
        <HeroSection />

        <section id="campaigns" className="py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Active Research Campaigns</h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Support the projects building our future, one discovery at a time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {fakeCampaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;

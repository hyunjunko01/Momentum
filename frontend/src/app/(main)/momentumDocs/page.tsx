"use client";

import { Book, Copy, ClipboardCheck, Rocket, Code, FileText } from 'lucide-react';
import { useState, type FC } from 'react';

// --- CodeBlock Component ---
const CodeBlock: FC<{ codeString: string }> = ({ codeString }) => {
    const [hasCopied, setHasCopied] = useState(false);

    const onCopy = () => {
        navigator.clipboard.writeText(codeString);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <div className="relative my-6">
            <button
                onClick={onCopy}
                className="absolute top-4 right-4 p-2.5 bg-gray-800/80 rounded-lg hover:bg-gray-700/80 transition-colors z-10 backdrop-blur-sm border border-gray-700/50"
                aria-label="Copy code"
            >
                {hasCopied ? (
                    <ClipboardCheck className="w-4 h-4 text-green-400" />
                ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                )}
            </button>
            <pre className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 pt-14 overflow-x-auto backdrop-blur-sm">
                <code className="language-javascript font-mono text-sm text-gray-300 leading-relaxed">
                    {codeString}
                </code>
            </pre>
        </div>
    );
}

const quickstartCode = `import { useWriteContract } from 'wagmi';
import { momentumFactoryAbi } from '@/contracts/MomentumFactory';
import { parseEther } from 'viem';

const { writeContract } = useWriteContract();

// The address you deployed on Anvil/Sepolia
const FACTORY_ADDRESS = '0x...'; 

function createNewCampaign() {
  const goal = parseEther('10.0'); // 10 ETH
  const deadline = 30 * 24 * 60 * 60; // 30 days in seconds
  const title = "My New Research Project";
  const description = "A project to... (must be >50 chars)";
  const category = "Physics";

  writeContract({
    address: FACTORY_ADDRESS,
    abi: momentumFactoryAbi,
    functionName: 'createCampaign',
    args: [goal, deadline, title, description, category]
  });
}`;

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-gray-900">
            {/* Account for header height with pt-24 */}
            <div>
                <div className="max-w-4xl mx-auto px-6 lg:px-8">

                    {/* Hero Section */}
                    <div className="relative pt-32 pb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                            <Book className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-300">Documentation</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                            Build with Momentum
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed">
                            Learn how to integrate with the Momentum protocol and create decentralized research funding campaigns.
                        </p>
                    </div>

                    {/* Main Content */}
                    <article className="space-y-12 ">

                        {/* Introduction Card */}
                        <section className="bg-gray-800/30 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm mb-16">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                    <Rocket className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Getting Started</h2>
                                    <p className="text-gray-400">Everything you need to know to start building</p>
                                </div>
                            </div>
                            <p className="text-base text-gray-300 leading-relaxed">
                                This documentation will guide you through integrating with the Momentum protocol,
                                whether you are building on top of our smart contracts or using our frontend components.
                            </p>
                        </section>

                        {/* Core Concepts */}
                        <section className="pb-16">
                            <div className="flex items-center gap-3 mt-6 mb-6">
                                <div className="p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                    <Code className="w-5 h-5 text-purple-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Core Concepts</h2>
                            </div>

                            <p className="text-base text-gray-300 leading-relaxed mb-6">
                                The Momentum protocol is built on two core smart contracts. Understanding their roles is
                                key to building on our platform:
                            </p>

                            <div className="space-y-4">
                                <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/30 transition-colors">
                                    <h3 className="text-xl font-semibold text-indigo-300 mb-3">MomentumFactory</h3>
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        A singleton contract responsible for deploying, tracking, and managing all campaigns.
                                        This is your main entry point for reading campaign data.
                                    </p>
                                </div>

                                <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-colors">
                                    <h3 className="text-xl font-semibold text-purple-300 mb-3">Campaign</h3>
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        The blueprint contract that is deployed for every new project. It holds all the funds,
                                        manages the state (Open, Successful, Failed), and handles all user interactions like
                                        <code className="px-2 py-0.5 mx-1 bg-gray-900/50 rounded text-sm text-indigo-300 font-mono">fund()</code>
                                        and
                                        <code className="px-2 py-0.5 mx-1 bg-gray-900/50 rounded text-sm text-indigo-300 font-mono">claimRefund()</code>.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Quickstart */}
                        <section>
                            <div className="flex items-center gap-3 mt-6 mb-6">
                                <div className="p-2.5 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <FileText className="w-5 h-5 text-green-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Quickstart: Create a Campaign</h2>
                            </div>

                            <p className="text-base text-gray-300 leading-relaxed mb-4">
                                Creating a campaign is a single transaction to our <code className="px-2 py-0.5 bg-gray-900/50 rounded text-sm text-indigo-300 font-mono">MomentumFactory</code> contract.
                                Here is an example using <span className="text-indigo-300 font-semibold">Wagmi</span> and <span className="text-indigo-300 font-semibold">Viem</span>:
                            </p>

                            <CodeBlock codeString={quickstartCode} />
                        </section>
                    </article>
                </div>
            </div>
            <div className="pb-16"></div>
        </div>
    );
}
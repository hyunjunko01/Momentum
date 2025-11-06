"use client";

import { Globe, Beaker, Zap, Users } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
                        <Beaker className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-300">About Momentum</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                        Our Mission:
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mt-2">
                            Make Science Verifiable
                        </span>
                    </h1>
                    <p className="mt-8 max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed">
                        Traditional scientific funding is broken. It's slow, opaque, and gatekept by a few.
                        Momentum was built to change that. We use the power of the blockchain to create a new
                        ecosystem based on transparency, merit, and community.
                    </p>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white">What We Believe In</h2>
                        <p className="mt-4 text-lg text-gray-400">The principles that guide everything we do</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-8 hover:border-indigo-500/30 transition-all hover:transform hover:scale-[1.02]">
                            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
                                <Globe className="h-7 w-7 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Radical Transparency</h3>
                            <p className="text-base text-gray-400 leading-relaxed">
                                Every funding transaction and research update is recorded on-chain, creating an immutable public record for all to see.
                            </p>
                        </div>
                        <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-8 hover:border-purple-500/30 transition-all hover:transform hover:scale-[1.02]">
                            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-6">
                                <Zap className="h-7 w-7 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Direct & Efficient Funding</h3>
                            <p className="text-base text-gray-400 leading-relaxed">
                                By removing bureaucratic overhead, 100% of funds go directly from backers to researchers, governed by smart contracts.
                            </p>
                        </div>
                        <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-8 hover:border-pink-500/30 transition-all hover:transform hover:scale-[1.02]">
                            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-pink-500/10 border border-pink-500/20 mb-6">
                                <Users className="h-7 w-7 text-pink-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Community-Owned Science</h3>
                            <p className="text-base text-gray-400 leading-relaxed">
                                Backers aren't just donors; they are participants. They receive patronage NFTs and, in the future, will help govern the platform's direction.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-gray-800/20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white">Meet the Team</h2>
                        <p className="mt-4 text-lg text-gray-400">A passionate group of scientists and engineers</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Team Member 1 */}
                        <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-6 text-center hover:border-indigo-500/30 transition-all hover:transform hover:scale-[1.02]">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold border-4 border-gray-800">
                                    A
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-1">Dr. Alice Key</h3>
                            <p className="text-indigo-400 text-sm font-medium">Protocol Architect</p>
                        </div>

                        {/* Team Member 2 */}
                        <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-all hover:transform hover:scale-[1.02]">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold border-4 border-gray-800">
                                    B
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-1">Bob Token</h3>
                            <p className="text-purple-400 text-sm font-medium">Frontend Engineer</p>
                        </div>

                        {/* Team Member 3 */}
                        <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-6 text-center hover:border-pink-500/30 transition-all hover:transform hover:scale-[1.02]">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-4xl font-bold border-4 border-gray-800">
                                    C
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-1">Carol Data</h3>
                            <p className="text-pink-400 text-sm font-medium">IPFS & Data Integrity</p>
                        </div>

                        {/* Team Member 4 */}
                        <div className="bg-gray-800/30 border border-gray-800 rounded-2xl p-6 text-center hover:border-indigo-500/30 transition-all hover:transform hover:scale-[1.02]">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-4xl font-bold border-4 border-gray-800">
                                    D
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-1">Prof. David Chain</h3>
                            <p className="text-blue-400 text-sm font-medium">Research Advisor</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom spacing for footer */}
            <div className="pb-16"></div>
        </div>
    );
}
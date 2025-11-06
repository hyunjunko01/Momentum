"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Microscope } from 'lucide-react';
import Link from 'next/link';

// Header Component
export const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex justify-between items-center h-20">

                    {/* Left side - Logo */}
                    <div className="flex-1 flex justify-start">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Microscope className="w-6 h-6 text-white" />
                            </div>
                            <span className="hidden sm:inline-block text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                                Momentum
                            </span>
                        </Link>
                    </div>

                    {/* Centered Navigation */}
                    <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
                        <Link
                            href="/explore"
                            className="text-gray-300 hover:text-white font-medium transition-colors relative group"
                        >
                            Explore
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link
                            href="/about"
                            className="text-gray-300 hover:text-white font-medium transition-colors relative group"
                        >
                            About
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link
                            href="/momentumDocs"
                            className="text-gray-300 hover:text-white font-medium transition-colors relative group"
                        >
                            Docs
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    </nav>

                    {/* Right side - Wallet Connect */}
                    <div className="flex-1 flex justify-end">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </header>
    );
};

import { Microscope, Twitter, Github, Globe, Mail } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        platform: [
            { name: 'Explore Projects', href: '#projects' },
            { name: 'How It Works', href: '#how-it-works' },
            { name: 'Submit Proposal', href: '/create' },
            { name: 'Documentation', href: '/docs' }
        ],
        community: [
            { name: 'About Us', href: '#about' },
            { name: 'Blog', href: '/blog' },
            { name: 'Forum', href: '/forum' },
            { name: 'Events', href: '/events' }
        ],
        resources: [
            { name: 'Smart Contracts', href: '/contracts' },
            { name: 'API Docs', href: '/api' },
            { name: 'Governance', href: '/governance' },
            { name: 'FAQ', href: '/faq' }
        ]
    };

    const socialLinks = [
        { icon: Twitter, href: 'https://twitter.com', label: 'X' },
        { icon: Github, href: 'https://github.com', label: 'GitHub' },
        { icon: Globe, href: 'https://discord.com', label: 'Discord' },
        { icon: Mail, href: 'mailto:hello@desci.com', label: 'Email' }
    ];

    return (
        <footer className="relative bg-gray-950 border-t border-white/10">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/5 to-purple-950/10 pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-3 group mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Microscope className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                                Momentum
                            </span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                            Empowering groundbreaking research through decentralized funding.
                            Building the future of open science on blockchain.
                        </p>
                        {/* Social Links */}
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-400 transition-all duration-300 group"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Platform</h3>
                        <ul className="space-y-3">
                            {footerLinks.platform.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-indigo-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Community</h3>
                        <ul className="space-y-3">
                            {footerLinks.community.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-indigo-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Resources</h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-indigo-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} DeSci Platform. All rights reserved.
                    </p>
                    <div className="flex space-x-6 text-sm">
                        <Link href="/privacy" className="text-gray-400 hover:text-indigo-400 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-gray-400 hover:text-indigo-400 transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/cookies" className="text-gray-400 hover:text-indigo-400 transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
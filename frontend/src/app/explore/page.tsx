"use client";

import { useMemo, useEffect } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import { Loader, AlertCircle, Clock } from 'lucide-react';
import { CampaignAbi } from '@/contracts/Campaign';
import { MomentumFactoryAbi } from '@/contracts/MomentumFactory';
import Link from 'next/link';

const FACTORY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

interface CampaignData {
    address: `0x${string}`;
    title?: string;
    researcher: `0x${string}` | undefined;
    fundingGoal: bigint | undefined;
    totalFunded: bigint | undefined;
    deadline: bigint | undefined;
    description?: string;
    category?: string;
}

// ⭐ Metadata 타입 정의 (struct로 반환됨)
interface CampaignMetadata {
    title: string;
    description: string;
    category: string;
    createdAt: bigint;
    researcher: string;
}

const CampaignCardSkeleton = () => (
    <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-800 animate-pulse">
        <div className="p-6">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="p-6 bg-gray-800">
            <div className="h-2.5 bg-gray-700 rounded-full w-full mb-4"></div>
            <div className="flex justify-between">
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
        </div>
    </div>
);

const CampaignCard = ({ campaign }: { campaign: CampaignData }) => {
    const { address, researcher, fundingGoal, totalFunded, deadline, title } = campaign;

    const goal = fundingGoal ?? BigInt(0);
    const raised = totalFunded ?? BigInt(0);

    const progress = goal > 0 ? Number((raised * BigInt(100)) / goal) : 0;
    const daysLeft = deadline ? Math.max(0, Math.ceil((Number(deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

    return (
        <Link
            href={`/campaign/${address}`}
            className="block rounded-xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 border-2 border-gray-700 hover:border-indigo-500 bg-gradient-to-br from-gray-800 to-gray-900"
        >
            <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 leading-tight min-h-[3.5rem]">
                    {title || "Untitled Campaign"}
                </h3>

                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                        {researcher ? researcher.slice(2, 4).toUpperCase() : '??'}
                    </div>
                    <p className="text-gray-300 text-sm font-medium">
                        {researcher ? `${researcher.slice(0, 6)}...${researcher.slice(-4)}` : "Loading..."}
                    </p>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-baseline mb-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Progress</span>
                        <span className="text-sm font-bold text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 shadow-inner">
                        <div
                            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Raised</p>
                        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                            {formatEther(raised)} ETH
                        </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Goal</p>
                        <p className="text-xl font-bold text-white">
                            {formatEther(goal)} ETH
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg py-3 px-4">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-semibold text-indigo-300">
                        {daysLeft === 0 ? 'Last day!' : `${daysLeft} days remaining`}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default function ExplorePage() {
    const { data: campaignAddresses, isLoading: isLoadingAddresses, isError, error } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: MomentumFactoryAbi,
        functionName: 'getAllDeployedCampaigns',
    });

    const { data: campaignDetails, isLoading: isLoadingDetails, error: detailsError } = useReadContracts({
        contracts: campaignAddresses?.flatMap(address => [
            {
                address: FACTORY_ADDRESS,
                abi: MomentumFactoryAbi,
                functionName: 'getCampaignDetails',
                args: [address]
            },
            {
                address: FACTORY_ADDRESS,
                abi: MomentumFactoryAbi,
                functionName: 'getCampaignMetadata',
                args: [address]
            }
        ]),
        query: { enabled: !!campaignAddresses && Array.isArray(campaignAddresses) && campaignAddresses.length > 0 },
    });

    useEffect(() => {
        console.log('=== EXPLORE PAGE DEBUG ===');
        console.log('1. Campaign Addresses:', campaignAddresses);
        console.log('2. Is Loading Details:', isLoadingDetails);
        console.log('3. Details Error:', detailsError);
        console.log('4. Campaign Details (RAW):', campaignDetails);

        if (campaignDetails) {
            console.log('5. Details Length:', campaignDetails.length);
            campaignDetails.forEach((detail, index) => {
                console.log(`   Detail ${index}:`, {
                    status: detail.status,
                    result: detail.result,
                    error: detail.error
                });
            });
        }
    }, [campaignAddresses, campaignDetails, isLoadingDetails, detailsError]);

    const campaignsData = useMemo((): CampaignData[] => {
        if (!campaignAddresses || !Array.isArray(campaignAddresses) || !campaignDetails) {
            console.log('❌ Early return: Missing data');
            return [];
        }

        const data: CampaignData[] = [];
        const itemsPerCampaign = 2;

        for (let i = 0; i < campaignAddresses.length; i++) {
            const address = campaignAddresses[i] as `0x${string}`;
            const detailsSlice = campaignDetails.slice(i * itemsPerCampaign, (i + 1) * itemsPerCampaign);

            console.log(`\n📍 Processing Campaign ${i} (${address}):`);
            console.log('  Details Slice:', detailsSlice);

            const details = detailsSlice[0]?.result as [string, bigint, bigint, number, bigint] | undefined;
            // ⭐⭐⭐ 수정: metadata는 객체로 반환됩니다 ⭐⭐⭐
            const metadata = detailsSlice[1]?.result as CampaignMetadata | undefined;

            console.log('  ✓ Details Result:', details);
            console.log('  ✓ Metadata Result:', metadata);
            console.log('  ✓ Title from Metadata:', metadata?.title);

            data.push({
                address,
                researcher: details?.[0] as `0x${string}` | undefined,
                fundingGoal: details?.[1],
                deadline: details?.[2],
                totalFunded: details?.[4],
                // ⭐⭐⭐ 수정: 객체 속성으로 접근 ⭐⭐⭐
                title: metadata?.title,
                description: metadata?.description,
                category: metadata?.category,
            });
        }

        console.log('\n✅ Final Campaigns Data:', data);
        return data;
    }, [campaignAddresses, campaignDetails]);

    const isLoading = isLoadingAddresses || (campaignAddresses && campaignAddresses.length > 0 && isLoadingDetails);

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-400">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-4" />
                    <span className="text-lg block mb-2">Failed to load campaigns.</span>
                    {error && <span className="text-sm text-gray-400">{error.message}</span>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight">Explore Campaigns</h1>
                    <p className="mt-4 text-lg text-gray-400">Support the next generation of scientific discovery.</p>
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => <CampaignCardSkeleton key={i} />)}
                    </div>
                )}

                {!isLoading && campaignsData.length === 0 ? (
                    <p className="text-center text-gray-500">No active campaigns found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {campaignsData.map(campaign => (
                            <CampaignCard key={campaign.address} campaign={campaign} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
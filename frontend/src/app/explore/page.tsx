"use client";

import { useMemo, useEffect } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import { Loader, AlertCircle, Clock } from 'lucide-react';
import { CampaignAbi } from '@/contracts/Campaign';
import { MomentumFactoryAbi } from '@/contracts/MomentumFactory';
import Link from 'next/link';

// --- CONFIGURATION & TYPES ---

const momentumFactoryAbi = MomentumFactoryAbi;
const campaignAbi = CampaignAbi;
const FACTORY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

interface CampaignData {
    address: `0x${string}`;
    researcher: `0x${string}` | undefined;
    fundingGoal: bigint | undefined;
    totalFunded: bigint | undefined;
    deadline: bigint | undefined;
}


// --- UI COMPONENTS ---

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
    const { address, researcher, fundingGoal, totalFunded, deadline } = campaign;

    const goal = fundingGoal ?? BigInt(0);
    const raised = totalFunded ?? BigInt(0);

    const progress = goal > 0 ? Number((raised * BigInt(100)) / goal) : 0;
    const daysLeft = deadline ? Math.max(0, Math.ceil((Number(deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

    return (
        <Link href={`/campaign/${address}`} className="block rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 border border-gray-800 hover:border-indigo-500/50">
            <div className="bg-gray-800/50 h-full flex flex-col">
                <div className="p-6 flex-grow">
                    <h3 className="text-xl font-semibold text-white">Campaign: {address.slice(0, 6)}...{address.slice(-4)}</h3>
                    <p className="mt-2 text-sm text-gray-400 font-medium">by {researcher ? `${researcher.slice(0, 6)}...${researcher.slice(-4)}` : "Loading..."}</p>
                </div>
                <div className="p-6 bg-gray-800">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="mt-3 flex justify-between items-center text-sm font-medium text-gray-300">
                        <span>Raised: <span className="font-bold text-white">{formatEther(raised)} ETH</span></span>
                        <span>Goal: <span className="font-bold text-white">{formatEther(goal)} ETH</span></span>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /><span>{daysLeft} days left</span></div>
                    </div>
                </div>
            </div>
        </Link>
    );
};


// --- Main Explore Page Component ---
export default function ExplorePage() {
    // 1. Get the list of all campaign addresses
    // Use getAllDeployedCampaigns instead of getDeployedCampaigns (which requires offset and limit)
    const { data: campaignAddresses, isLoading: isLoadingAddresses, isError, error } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: momentumFactoryAbi,
        functionName: 'getAllDeployedCampaigns',
    });

    // Debug logs
    useEffect(() => {
        console.log('=== Debug Info ===');
        console.log('Factory Address:', FACTORY_ADDRESS);
        console.log('Campaign Addresses:', campaignAddresses);
        console.log('Is Loading Addresses:', isLoadingAddresses);
        console.log('Is Error:', isError);
        console.log('Error:', error);
        console.log('Is Array:', Array.isArray(campaignAddresses));
    }, [campaignAddresses, isLoadingAddresses, isError, error]);

    // 2. Prepare the batch call for all campaign details
    const campaignDetailContracts = useMemo(() => {
        if (!campaignAddresses || !Array.isArray(campaignAddresses)) {
            console.log('No campaign addresses or not array');
            return [];
        }

        console.log('Preparing contracts for', campaignAddresses.length, 'campaigns');
        return campaignAddresses.map(address => ({
            address: address as `0x${string}`,
            abi: campaignAbi,
        }));
    }, [campaignAddresses]);

    // 3. Fetch details for ALL campaigns in a single batch call
    const { data: campaignDetails, isLoading: isLoadingDetails, error: detailsError } = useReadContracts({
        contracts: campaignDetailContracts.flatMap(contract => [
            { ...contract, functionName: 'i_fundingGoal' },
            { ...contract, functionName: 'i_deadline' },
            { ...contract, functionName: 's_totalFunded' },
            { ...contract, functionName: 'i_researcher' },
        ]),
        query: { enabled: !!campaignAddresses && Array.isArray(campaignAddresses) && campaignAddresses.length > 0 },
    });

    useEffect(() => {
        console.log('Campaign Details:', campaignDetails);
        console.log('Is Loading Details:', isLoadingDetails);
        console.log('Details Error:', detailsError);
    }, [campaignDetails, isLoadingDetails, detailsError]);

    // 4. Process the results in a structured, robust way using useMemo
    const campaignsData = useMemo((): CampaignData[] => {
        if (!campaignAddresses || !Array.isArray(campaignAddresses) || !campaignDetails) {
            console.log('Cannot process campaigns - missing data');
            return [];
        }

        const data: CampaignData[] = [];
        const itemsPerCampaign = 4;

        for (let i = 0; i < campaignAddresses.length; i++) {
            const address = campaignAddresses[i] as `0x${string}`;
            const detailsSlice = campaignDetails.slice(i * itemsPerCampaign, (i + 1) * itemsPerCampaign);

            console.log(`Campaign ${i} (${address}):`, {
                fundingGoal: detailsSlice[0],
                deadline: detailsSlice[1],
                totalFunded: detailsSlice[2],
                researcher: detailsSlice[3],
            });

            data.push({
                address,
                fundingGoal: detailsSlice[0]?.result as bigint | undefined,
                deadline: detailsSlice[1]?.result as bigint | undefined,
                totalFunded: detailsSlice[2]?.result as bigint | undefined,
                researcher: detailsSlice[3]?.result as `0x${string}` | undefined,
            });
        }

        console.log('Processed campaigns data:', data);
        return data;
    }, [campaignAddresses, campaignDetails]);

    // --- Render Logic ---

    const isLoading = isLoadingAddresses || isLoadingDetails;

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

                {/* Debug info for user */}
                <div className="mb-8 p-4 bg-gray-800 rounded-lg text-sm">
                    <p className="text-gray-300">Debug Info:</p>
                    <p className="text-gray-400">Loading: {isLoading ? 'Yes' : 'No'}</p>
                    <p className="text-gray-400">Campaigns Found: {campaignAddresses ? (Array.isArray(campaignAddresses) ? campaignAddresses.length : 'Not an array') : 'None'}</p>
                    <p className="text-gray-400">Processed: {campaignsData.length}</p>
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => <CampaignCardSkeleton key={i} />)}
                    </div>
                )}

                {!isLoading && campaignsData.length === 0 ? (
                    <p className="text-center text-gray-500">No active campaigns found. Check console for debug info.</p>
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
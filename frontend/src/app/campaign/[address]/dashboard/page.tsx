"use client";

import { use } from 'react';
import { useReadContracts, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { Loader, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { ResearchUpdateForm } from '@/components/forms/ResearchUpdateForm';
import { WithdrawFunds } from '@/components/functions/WithdrawFunds';
import { MomentumFactoryAbi } from '@/contracts/MomentumFactory';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// --- Type Definitions ---
interface CampaignMetadata {
    title: string;
    description: string;
    category: string;
    createdAt: bigint;
    researcher: string;
}

type CampaignDetails = [string, bigint, bigint, number, bigint];

const CAMPAIGN_STATE_TEXT = ['Open', 'Successful', 'Failed', 'Paid Out'] as const;

// --- Utility Functions ---
const shortenAddress = (address: string, startChars = 6, endChars = 4) => {
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

// --- Component Sections ---
interface DashboardHeaderProps {
    metadata: CampaignMetadata | undefined;
    address: string;
    researcher: string;
    state: number;
}

function DashboardHeader({ metadata, address, researcher, state }: DashboardHeaderProps) {
    return (
        <div className="p-8 border-b border-gray-800">
            <Link
                href={`/campaign/${address}`}
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Campaign
            </Link>
            <div className="flex items-start gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                    <Shield className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Researcher Dashboard</h1>
                    <p className="text-sm text-gray-400">
                        Campaign: {metadata?.title || shortenAddress(address, 8, 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Researcher: {shortenAddress(researcher)}
                    </p>
                </div>
            </div>
        </div>
    );
}

interface CampaignStatsProps {
    totalFunded: bigint;
    fundingGoal: bigint;
    state: number;
}

function CampaignStats({ totalFunded, fundingGoal, state }: CampaignStatsProps) {
    return (
        <div className="p-8 border-b border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Campaign Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Total Funded</p>
                    <p className="text-2xl font-bold text-white">{formatEther(totalFunded)} ETH</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Funding Goal</p>
                    <p className="text-2xl font-bold text-white">{formatEther(fundingGoal)} ETH</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <p className="text-2xl font-bold text-indigo-300">{CAMPAIGN_STATE_TEXT[state]}</p>
                </div>
            </div>
        </div>
    );
}

// --- Loading and Error States ---
function LoadingState() {
    return (
        <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
            <Loader className="w-8 h-8 animate-spin" />
            <span className="ml-4 text-lg">Loading Dashboard...</span>
        </div>
    );
}

function ErrorState() {
    return (
        <div className="min-h-screen flex items-center justify-center text-red-400 bg-gray-900">
            <AlertCircle className="w-8 h-8" />
            <span className="ml-4 text-lg">Failed to load campaign data.</span>
        </div>
    );
}

function UnauthorizedState({ address }: { address: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-center max-w-md">
                <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-gray-400 mb-6">
                    You must be the campaign researcher to access this dashboard.
                </p>
                <Link
                    href={`/campaign/${address}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    View Campaign
                </Link>
            </div>
        </div>
    );
}


// --- Main Component ---
export default function ResearcherDashboardPage({ params }: { params: Promise<{ address: `0x${string}` }> }) {
    const { address } = use(params);
    const { address: connectedAddress } = useAccount();

    // Fetch campaign details and metadata
    const { data, isLoading: isLoadingMain, isError: isMainError, refetch } = useReadContracts({
        contracts: [
            { address: FACTORY_ADDRESS, abi: MomentumFactoryAbi, functionName: 'getCampaignDetails', args: [address] },
            { address: FACTORY_ADDRESS, abi: MomentumFactoryAbi, functionName: 'getCampaignMetadata', args: [address] },
        ],
    });

    // Parse contract data
    const campaignDetails = data?.[0]?.result as CampaignDetails | undefined;
    const metadata = data?.[1]?.result as CampaignMetadata | undefined;

    // Loading and error states
    if (isLoadingMain) return <LoadingState />;
    if (isMainError || !campaignDetails) return <ErrorState />;

    // Extract campaign data
    const [researcher, fundingGoal, deadline, state, totalFunded] = campaignDetails;

    // Check if connected user is the researcher
    const isOwner = connectedAddress && researcher &&
        connectedAddress.toLowerCase() === researcher.toLowerCase();

    // Redirect if not owner
    if (!isOwner) {
        return <UnauthorizedState address={address} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden border border-gray-800">

                    <DashboardHeader
                        metadata={metadata}
                        address={address}
                        researcher={researcher}
                        state={state}
                    />

                    <CampaignStats
                        totalFunded={totalFunded}
                        fundingGoal={fundingGoal}
                        state={state}
                    />

                    <ResearchUpdateForm campaignAddress={address} />

                    {state === 1 && (
                        <WithdrawFunds campaignAddress={address} onWithdrawn={refetch} />
                    )}

                </div>
            </div>
        </div>
    );
}
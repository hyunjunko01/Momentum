"use client";

import { use } from 'react';
import { useReadContracts, useAccount, useReadContract, useBlockNumber, useBlock } from 'wagmi';
import { formatEther } from 'viem';
import { Loader, AlertCircle, FileText, ArrowUpRight, Settings, Hourglass, XCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { FundCampaignForm } from '@/components/forms/FundCampaignForm';
import { FinalizeCampaign } from '@/components/functions/FinalizeCampaign';
import { ClaimRefund } from '@/components/functions/ClaimRefund';
import { DebugTimeTravel } from '../../../components/functions/DebugTimeTravel';
import { MomentumFactoryAbi } from '@/contracts/MomentumFactory';
import { CampaignAbi } from '@/contracts/Campaign';

const FACTORY_ADDRESS = '0x4c084f922Ee81beDFa69dc1B5D1c44459222036a' as `0x${string}`;

// --- Type Definitions ---
interface CampaignMetadata {
    title: string;
    description: string;
    category: string;
    createdAt: bigint;
    researcher: string;
}

type CampaignDetails = [string, bigint, bigint, number, bigint];

enum CampaignState {
    Open = 0,
    Successful = 1,
    Failed = 2,
    PaidOut = 3
}

const CAMPAIGN_STATE_TEXT = ['Open', 'Successful', 'Failed', 'Paid Out'] as const;

// --- Utility Functions ---
const shortenAddress = (address: string, startChars = 6, endChars = 4) => {
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

const calculateProgress = (totalFunded: bigint, fundingGoal: bigint): number => {
    return Number((totalFunded * BigInt(100)) / fundingGoal);
};

const calculateDaysLeft = (deadline: bigint, currentTimestamp: bigint): string => {
    const secondsLeft = Number(deadline) - Number(currentTimestamp);
    const days = Math.ceil(Math.abs(secondsLeft) / (60 * 60 * 24));

    if (secondsLeft > 0) {
        // Deadline has not passed yet
        return `D-${days}`;
    } else if (secondsLeft < 0) {
        // Deadline has passed
        return `D+${days}`;
    } else {
        // Exactly on deadline
        return 'D-Day';
    }
};

// --- Component Sections ---
interface CampaignHeaderProps {
    metadata: CampaignMetadata | undefined;
    address: string;
    researcher: string;
    state: number;
    isOwner: boolean;
}

function CampaignHeader({ metadata, address, researcher, state, isOwner }: CampaignHeaderProps) {
    return (
        <div className="p-8">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {metadata?.title || `Campaign: ${shortenAddress(address, 8, 0)}...`}
                    </h1>
                    <p className="text-sm text-gray-400 font-medium mb-4">
                        by {shortenAddress(researcher)}
                    </p>
                </div>
                {isOwner && (
                    <Link
                        href={`/campaign/${address}/dashboard`}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Researcher Dashboard
                    </Link>
                )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
                <div className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${state === 0 ? 'bg-blue-500/20 text-blue-300' :
                    state === 1 ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                    }`}>
                    {state === 0 ? <Hourglass className="w-4 h-4" /> :
                        state === 1 ? <CheckCircle className="w-4 h-4" /> :
                            <XCircle className="w-4 h-4" />}
                    {CAMPAIGN_STATE_TEXT[state]}
                </div>

                {metadata?.category && (
                    <span className="px-3 py-1 text-sm font-semibold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                        {metadata.category}
                    </span>
                )}
            </div>

            <p className="mt-6 text-base text-gray-300 whitespace-pre-wrap leading-relaxed">
                {metadata?.description || 'No description available.'}
            </p>
        </div>
    );
}

interface FundingProgressProps {
    totalFunded: bigint;
    fundingGoal: bigint;
    deadline: bigint;
    currentTimestamp: bigint;
}

function FundingProgress({ totalFunded, fundingGoal, deadline, currentTimestamp }: FundingProgressProps) {
    const progress = calculateProgress(totalFunded, fundingGoal);
    const daysLeftText = calculateDaysLeft(deadline, currentTimestamp);
    const deadlineHasPassed = currentTimestamp >= deadline;

    return (
        <div className="p-8 border-t border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Funding Progress</h2>
            <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
            <div className="mt-4 flex justify-between items-center text-lg font-medium text-gray-100">
                <span>
                    <span className="font-bold">{formatEther(totalFunded)}</span> ETH Raised
                </span>
                <span className="text-gray-400">Goal: {formatEther(fundingGoal)} ETH</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div className={`bg-gray-800 p-4 rounded-lg ${deadlineHasPassed ? 'border border-green-500/30' : ''}`}>
                    <p className={`text-2xl font-bold ${deadlineHasPassed ? 'text-green-400' : 'text-white'}`}>
                        {daysLeftText}
                    </p>
                    <p className="text-sm text-gray-400">
                        {deadlineHasPassed ? 'Deadline Passed' : 'Days Left'}
                    </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-2xl font-bold">...</p>
                    <p className="text-sm text-gray-400">Backers</p>
                </div>
            </div>
        </div>
    );
}

interface ResearchUpdatesProps {
    updates: readonly string[] | undefined;
    isLoading: boolean;
}

function ResearchUpdates({ updates, isLoading }: ResearchUpdatesProps) {
    if (isLoading) {
        return (
            <div className="p-8 border-t border-gray-800">
                <h2 className="text-xl font-semibold mb-4">Research Updates</h2>
                <div className="flex items-center gap-2 text-gray-400">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Loading updates...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 border-t border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Research Updates</h2>
            {!updates || updates.length === 0 ? (
                <p className="text-gray-400">No research updates have been submitted yet.</p>
            ) : (
                <ul className="space-y-3">
                    {updates.map((hash, index) => (
                        <li key={`${hash}-${index}`}>
                            <a
                                href={`https://ipfs.io/ipfs/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
                            >
                                <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                <span className="text-gray-300 font-medium truncate">
                                    Update #{index + 1}: {hash}
                                </span>
                                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 ml-auto flex-shrink-0 transition-colors" />
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

interface FundingSectionProps {
    campaignAddress: `0x${string}`;
}

function FundingSection({ campaignAddress }: FundingSectionProps) {
    return (
        <div className="p-8 border-t border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Support This Research</h2>
            <FundCampaignForm campaignAddress={campaignAddress} />
        </div>
    );
}

// --- Loading and Error States ---
function LoadingState() {
    return (
        <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
            <Loader className="w-8 h-8 animate-spin" />
            <span className="ml-4 text-lg">Loading Campaign Details...</span>
        </div>
    );
}

function ErrorState() {
    return (
        <div className="min-h-screen flex items-center justify-center text-red-400 bg-gray-900">
            <AlertCircle className="w-8 h-8" />
            <span className="ml-4 text-lg">Failed to load campaign. Please check the address.</span>
        </div>
    );
}

// --- Main Component ---
export default function CampaignDetailPage({ params }: { params: Promise<{ address: `0x${string}` }> }) {
    const { address } = use(params);
    const { address: connectedAddress } = useAccount();

    // Get current block number to trigger block data fetch
    const { data: blockNumber } = useBlockNumber({ watch: true });

    // Get current block to extract timestamp
    const { data: block } = useBlock({
        blockNumber,
    });

    // Fetch campaign details and metadata
    const { data, isLoading: isLoadingMain, isError: isMainError, refetch } = useReadContracts({
        contracts: [
            { address: FACTORY_ADDRESS, abi: MomentumFactoryAbi, functionName: 'getCampaignDetails', args: [address] },
            { address: FACTORY_ADDRESS, abi: MomentumFactoryAbi, functionName: 'getCampaignMetadata', args: [address] },
        ],
    });

    // Fetch research updates
    const { data: researchUpdates, isLoading: isLoadingUpdates } = useReadContract({
        address: address,
        abi: CampaignAbi,
        functionName: 'getResearchUpdates',
        query: { enabled: !!data },
    });

    // Parse contract data
    const campaignDetails = data?.[0]?.result as CampaignDetails | undefined;
    const metadata = data?.[1]?.result as CampaignMetadata | undefined;

    // Loading and error states
    if (isLoadingMain || !block) return <LoadingState />;
    if (isMainError || !campaignDetails) return <ErrorState />;

    // Extract campaign data
    const [researcher, fundingGoal, deadline, state, totalFunded] = campaignDetails;
    const isOwner = !!(connectedAddress && researcher &&
        connectedAddress.toLowerCase() === researcher.toLowerCase());

    // Use blockchain timestamp instead of Date.now()
    const currentTimestamp = block.timestamp;
    const deadlineHasPassed = currentTimestamp >= deadline;
    const goalAchieved = totalFunded >= fundingGoal;

    // Debug info
    console.log('Debug Info:', {
        deadline: Number(deadline),
        deadlineDate: new Date(Number(deadline) * 1000),
        currentTimestamp: Number(currentTimestamp),
        currentTimestampDate: new Date(Number(currentTimestamp) * 1000),
        deadlineHasPassed,
        goalAchieved,
        totalFunded: formatEther(totalFunded),
        fundingGoal: formatEther(fundingGoal),
        state,
        stateText: CAMPAIGN_STATE_TEXT[state]
    });

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden border border-gray-800">

                    <CampaignHeader
                        metadata={metadata}
                        address={address}
                        researcher={researcher}
                        state={state}
                        isOwner={isOwner}
                    />

                    <FundingProgress
                        totalFunded={totalFunded}
                        fundingGoal={fundingGoal}
                        deadline={deadline}
                        currentTimestamp={currentTimestamp}
                    />

                    <ResearchUpdates
                        updates={researchUpdates as readonly string[] | undefined}
                        isLoading={isLoadingUpdates}
                    />

                    {state === CampaignState.Open && !deadlineHasPassed && (
                        <FundingSection campaignAddress={address} />
                    )}

                    {state === CampaignState.Open && deadlineHasPassed && (
                        <FinalizeCampaign
                            campaignAddress={address}
                            onFinalized={() => refetch()}
                        />
                    )}

                    {state === CampaignState.Failed && (
                        <div className="p-8 border-t border-gray-800">
                            <ClaimRefund
                                campaignAddress={address}
                                userAddress={connectedAddress}
                                onRefunded={() => refetch()}
                            />
                        </div>
                    )}

                    <DebugTimeTravel />

                </div>
            </div>
        </div>
    );
}
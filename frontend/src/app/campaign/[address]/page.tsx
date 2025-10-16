"use client";

import { use } from 'react';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Loader, AlertCircle, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { FundCampaignForm } from '@/components/forms/FundCampaignForm';
import { MomentumFactoryAbi } from '@/contracts/MomentumFactory';

// Factory 컨트랙트 주소 - 실제 배포된 주소로 변경하세요
const FACTORY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`;

export default function CampaignDetailPage({ params }: { params: Promise<{ address: `0x${string}` }> }) {
    // Next.js 15+ App Router에서는 params가 Promise로 전달됩니다
    const { address } = use(params);

    // Factory 컨트랙트의 getCampaignDetails 함수 호출
    const { data: campaignDetails, isLoading, isError } = useReadContract({
        address: FACTORY_ADDRESS, // Factory 컨트랙트 주소
        abi: MomentumFactoryAbi,
        functionName: 'getCampaignDetails',
        args: [address], // 캠페인 주소를 인자로 전달
    });

    // --- Render Logic ---

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
                <Loader className="w-8 h-8 animate-spin" />
                <span className="ml-4 text-lg">Loading Campaign Details...</span>
            </div>
        );
    }

    if (isError || !campaignDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-400 bg-gray-900">
                <AlertCircle className="w-8 h-8" />
                <span className="ml-4 text-lg">Failed to load campaign. Please check the address.</span>
            </div>
        );
    }

    // Destructure the returned data for easier use
    const [researcher, fundingGoal, deadline, state, totalFunded] = campaignDetails;

    const progress = Number((totalFunded * BigInt(100)) / fundingGoal);
    const daysLeft = Math.max(0, Math.ceil((Number(deadline) * 1000 - Date.now()) / (1000 * 60 * 60 * 24)));
    const stateText = ['Open', 'Successful', 'Failed', 'Paid Out'][state];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden border border-gray-800">
                    <div className="p-8">
                        {/* In a real app, Title and Description would come from IPFS */}
                        <h1 className="text-3xl font-bold text-white mb-2">Campaign: {address.slice(0, 8)}...</h1>
                        <p className="text-sm text-gray-400 font-medium">by {researcher.slice(0, 6)}...{researcher.slice(-4)}</p>

                        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${
                            // First, check if the state is Open
                            state === 0 ? 'bg-blue-500/20 text-blue-300' :
                                // If not Open, then check if it's Successful
                                state === 1 ? 'bg-green-500/20 text-green-300' :
                                    // Otherwise, it must be Failed or Paid Out
                                    'bg-red-500/20 text-red-300'
                            }`}>
                            {/* Use the same nested logic for the icon */}
                            {
                                state === 0 ? <Hourglass className="w-4 h-4" /> :
                                    state === 1 ? <CheckCircle className="w-4 h-4" /> :
                                        <XCircle className="w-4 h-4" />
                            }
                            {stateText}
                        </div>

                        <p className="mt-6 text-base text-gray-300">
                            This section would display the detailed campaign description fetched from IPFS.
                        </p>
                    </div>

                    <div className="p-8 border-t border-gray-800">
                        <h2 className="text-xl font-semibold mb-4">Funding Progress</h2>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-lg font-medium text-gray-100">
                            <span><span className="font-bold">{formatEther(totalFunded)}</span> ETH Raised</span>
                            <span className="text-gray-400">Goal: {formatEther(fundingGoal)} ETH</span>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <p className="text-2xl font-bold">{daysLeft}</p>
                                <p className="text-sm text-gray-400">Days Left</p>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <p className="text-2xl font-bold">...</p>
                                <p className="text-sm text-gray-400">Backers</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 border-t border-gray-800">
                        <h2 className="text-xl font-semibold mb-4">Support This Research</h2>
                        {/* We pass the campaign's address as a prop */}
                        <FundCampaignForm campaignAddress={address} />
                    </div>
                </div>
            </div>
        </div>
    );
}
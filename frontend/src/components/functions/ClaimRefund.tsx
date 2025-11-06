"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { Loader, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { CampaignAbi } from '@/contracts/Campaign';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';

interface ClaimRefundProps {
    campaignAddress: `0x${string}`;
    userAddress: `0x${string}` | undefined;
    onRefunded: () => void; // Function to refetch parent data
}

export const ClaimRefund = ({ campaignAddress, userAddress, onRefunded }: ClaimRefundProps) => {

    // Check how much this user is owed
    const { data: refundAmount } = useReadContract({
        address: campaignAddress,
        abi: CampaignAbi,
        functionName: 's_backers',
        args: [userAddress!], // Assumes userAddress is defined if this component is rendered
        query: { enabled: !!userAddress }
    });

    const {
        data: refundHash,
        writeContract: claimRefund,
        isPending: isClaiming,
        error: claimError
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isRefunded
    } = useWaitForTransactionReceipt({
        hash: refundHash,
    });

    // When the transaction is successful, call the parent's refetch function
    useEffect(() => {
        if (isRefunded) {
            onRefunded();
        }
    }, [isRefunded, onRefunded]);

    const handleRefund = () => {
        claimRefund({
            address: campaignAddress,
            abi: CampaignAbi,
            functionName: 'claimRefund',
            args: [],
        });
    };

    if (isRefunded) {
        return (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Refund successful! Your funds are back in your wallet.</span>
            </div>
        );
    }

    if (!refundAmount || refundAmount === BigInt(0)) {
        return (
            <div className="p-4 bg-gray-700/50 border border-gray-700 rounded-lg text-sm text-gray-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>You did not have any funds in this campaign.</span>
            </div>
        );
    }

    return (
        <div className="p-6 border-2 border-dashed border-red-500/30 bg-gray-800/50 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-semibold text-white">Campaign Failed</h3>
                    <p className="text-sm text-gray-400">
                        This campaign did not meet its funding goal. You can claim your refund of
                        <span className="font-bold text-white"> {formatEther(refundAmount)} ETH</span>.
                    </p>
                </div>
            </div>
            <button
                onClick={handleRefund}
                disabled={isClaiming || isConfirming}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {(isClaiming || isConfirming) && <Loader className="w-5 h-5 animate-spin" />}
                {isClaiming ? "Confirm..." : isConfirming ? "Refunding..." : "Claim Your Refund"}
            </button>
            {claimError && <p className="text-sm text-red-400">Error: {(claimError as any).shortMessage}</p>}
        </div>
    );
};
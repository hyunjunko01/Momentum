"use client";

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Loader, BellDot, CheckCircle } from 'lucide-react';
import { CampaignAbi } from '@/contracts/Campaign';
import { useEffect } from 'react';

interface FinalizeCampaignProps {
    campaignAddress: `0x${string}`;
    onFinalized: () => void; // A function to tell the parent page to refetch data
}

export const FinalizeCampaign = ({ campaignAddress, onFinalized }: FinalizeCampaignProps) => {
    const {
        data: finalizeHash,
        writeContract: finalizeCampaign,
        isPending: isFinalizing,
        error: finalizeError
    } = useWriteContract();

    const {
        isLoading: isConfirmingFinalize,
        isSuccess: isFinalized
    } = useWaitForTransactionReceipt({
        hash: finalizeHash,
    });

    // When the transaction is successful, call the parent's refetch function
    useEffect(() => {
        if (isFinalized) {
            onFinalized();
        }
    }, [isFinalized, onFinalized]);

    const handleFinalize = () => {
        finalizeCampaign({
            address: campaignAddress,
            abi: CampaignAbi,
            functionName: 'finalizeCampaign',
            args: [],
        });
    };

    return (
        <div className="p-8 border-t border-gray-800 space-y-4">
            <div className="flex gap-3">
                <BellDot className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-semibold text-white">Campaign Has Ended</h3>
                    <p className="text-sm text-gray-400">The deadline is passed. Please finalize the campaign to determine its outcome (Successful/Failed).</p>
                </div>
            </div>
            <button
                onClick={handleFinalize}
                disabled={isFinalizing || isConfirmingFinalize}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {(isFinalizing || isConfirmingFinalize) && <Loader className="w-5 h-5 animate-spin" />}
                {isFinalizing ? "Confirm..." : isConfirmingFinalize ? "Finalizing..." : "Finalize Campaign"}
            </button>
            {isFinalized && <p className="text-sm text-green-400">Campaign finalized! Refreshing data...</p>}
            {finalizeError && <p className="text-sm text-red-400">{(finalizeError as any).shortMessage}</p>}
        </div>
    );
};
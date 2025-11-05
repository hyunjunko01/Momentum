"use client";

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Loader, Banknote, CheckCircle } from 'lucide-react';
import { CampaignAbi } from '@/contracts/Campaign';
import { useEffect } from 'react';

interface WithdrawFundsProps {
    campaignAddress: `0x${string}`;
    onWithdrawn: () => void; // A function to tell the parent page to refetch data
}

export const WithdrawFunds = ({ campaignAddress, onWithdrawn }: WithdrawFundsProps) => {
    const {
        data: withdrawHash,
        writeContract: withdrawFunds,
        isPending: isWithdrawing,
        error: withdrawError
    } = useWriteContract();

    const {
        isLoading: isConfirmingWithdraw,
        isSuccess: isWithdrawn
    } = useWaitForTransactionReceipt({
        hash: withdrawHash,
    });

    // When the transaction is successful, call the parent's refetch function
    useEffect(() => {
        if (isWithdrawn) {
            onWithdrawn();
        }
    }, [isWithdrawn, onWithdrawn]);

    const handleWithdraw = () => {
        withdrawFunds({
            address: campaignAddress,
            abi: CampaignAbi,
            functionName: 'withdrawFunds',
            args: [],
        });
    };

    return (
        <div className="p-8 border-t border-gray-800 space-y-4">
            <div className="flex gap-3">
                <Banknote className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-semibold text-white">Campaign Successful!</h3>
                    <p className="text-sm text-gray-400">Your campaign has met its goal. You can now withdraw the raised funds.</p>
                </div>
            </div>
            <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || isConfirmingWithdraw}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {(isWithdrawing || isConfirmingWithdraw) && <Loader className="w-5 h-5 animate-spin" />}
                {isWithdrawing ? "Confirm..." : isConfirmingWithdraw ? "Withdrawing..." : "Withdraw Funds"}
            </button>
            {isWithdrawn && <p className="text-sm text-green-400">Funds withdrawn successfully! Refreshing data...</p>}
            {withdrawError && <p className="text-sm text-red-400">{(withdrawError as any).shortMessage}</p>}
        </div>
    );
};
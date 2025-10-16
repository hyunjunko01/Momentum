"use client";

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Loader } from 'lucide-react';
import { CampaignAbi } from '@/contracts/Campaign'; // Make sure you import your Campaign ABI

export const FundCampaignForm = ({ campaignAddress }: { campaignAddress: `0x${string}` }) => {
    const [amount, setAmount] = useState('');

    const { data: hash, writeContract, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleFund = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            alert("Please enter a valid amount to fund.");
            return;
        }

        writeContract({
            address: campaignAddress,
            abi: CampaignAbi,
            functionName: 'fund',
            value: parseEther(amount), // This sends ETH along with the transaction
        });
    };

    if (isSuccess) {
        return <p className="text-green-400 font-bold">Thank you for your contribution!</p>;
    }

    return (
        <form onSubmit={handleFund} className="space-y-4">
            <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.1 ETH"
                className="w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <button
                type="submit"
                disabled={isPending || isConfirming}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {(isPending || isConfirming) && <Loader className="w-5 h-5 animate-spin" />}
                {isPending ? 'Confirm in wallet...' : isConfirming ? 'Confirming...' : 'Fund Campaign'}
            </button>
            {error && <p className="text-sm text-red-400">Error: {(error as any).shortMessage}</p>}
        </form>
    );
};
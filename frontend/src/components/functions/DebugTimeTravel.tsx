"use client";

import { useClient } from 'wagmi';
import { Loader, Clock } from 'lucide-react';
import { useState } from 'react';

/**
 * @title DebugTimeTravel
 * @notice A component for fast-forwarding the Anvil local blockchain time.
 * THIS COMPONENT SHOULD ONLY BE USED IN DEVELOPMENT.
 */
export const DebugTimeTravel = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Get the low-level Viem client from wagmi
    const client = useClient();

    const handleTimeTravel = async (days: number) => {
        if (!client) {
            setError('No client available. Are you connected to a wallet?');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);
        const seconds = days * 24 * 60 * 60;

        try {
            console.log(`Attempting to fast-forward ${days} days (${seconds} seconds)...`);

            // 1. Send the "evm_increaseTime" cheatcode to Anvil
            const increaseResult = await client.request({
                method: 'evm_increaseTime',
                params: [seconds], // Fast-forward by this many seconds
            } as any);
            console.log('evm_increaseTime result:', increaseResult);

            // 2. Mine a new block to make the time change take effect
            const mineResult = await client.request({
                method: 'evm_mine',
                params: [],
            } as any);
            console.log('evm_mine result:', mineResult);

            setSuccess(`Time fast-forwarded by ${days} days! Reloading page...`);

            // Wait a bit before reloading to ensure the transaction is propagated
            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (error: any) {
            console.error("Time travel failed:", error);
            const errorMessage = error?.message || error?.toString() || 'Unknown error';

            if (errorMessage.includes('evm_increaseTime') || errorMessage.includes('not found')) {
                setError('Not connected to Anvil. Time travel only works on local development network.');
            } else {
                setError(`Time travel failed: ${errorMessage}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // This component will only render if the app is in "development" mode
    // Note: In a real Next.js app, this check works.
    // We'll assume process.env.NODE_ENV is "development" for this component to show.
    // if (process.env.NODE_ENV !== 'development') {
    //     return null;
    // }

    return (
        <div className="p-6 border-t border-dashed border-gray-700 space-y-4">
            <h3 className="text-sm font-semibold text-yellow-400">DEV-ONLY: Time Travel Controls</h3>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm">
                    {success}
                </div>
            )}

            <div className="flex gap-4">
                <button
                    onClick={() => handleTimeTravel(1)}
                    disabled={isLoading}
                    className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
                >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                    + 1 Day
                </button>
                <button
                    onClick={() => handleTimeTravel(30)}
                    disabled={isLoading}
                    className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors"
                >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                    + 30 Days
                </button>
            </div>
        </div>
    );
};
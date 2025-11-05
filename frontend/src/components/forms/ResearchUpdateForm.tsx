
import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CampaignAbi } from '@/contracts/Campaign';
import { DataUploader } from "./DataUploader";
import { Loader } from "lucide-react";

interface ResearchUpdateFormProps {
    campaignAddress: `0x${string}`;
}
export const ResearchUpdateForm = ({ campaignAddress }: ResearchUpdateFormProps) => {
    const [ipfsHash, setIpfsHash] = useState<string | null>(null);
    const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleUploadSuccess = (hash: string) => setIpfsHash(hash);

    const handleSubmitUpdateToChain = () => {
        if (!ipfsHash) return;
        writeContract({
            address: campaignAddress,
            abi: CampaignAbi,
            functionName: 'submitResearchUpdate',
            args: [ipfsHash]
        });
    };

    // Reset ipfsHash after successful submission
    useEffect(() => {
        if (isSuccess) {
            setIpfsHash(null);
        }
    }, [isSuccess]);

    const isButtonDisabled = !ipfsHash || isPending || isConfirming;
    const buttonText = isPending ? "Confirm in Wallet..." : isConfirming ? "Submitting..." : "Submit Update to Blockchain";

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold mb-4">Submit Research Update</h2>
            <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">
                        Upload your research update to IPFS. This could include progress reports, data, papers, or any relevant documentation.
                    </p>
                </div>

                <DataUploader onUploadSuccess={handleUploadSuccess} />

                {ipfsHash && (
                    <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-4">
                        <p className="text-sm text-indigo-300 font-medium mb-1">File uploaded to IPFS</p>
                        <p className="text-xs text-gray-400 break-all">{ipfsHash}</p>
                    </div>
                )}

                <button
                    onClick={handleSubmitUpdateToChain}
                    disabled={isButtonDisabled}
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {buttonText}
                    {(isPending || isConfirming) && <Loader className="w-5 h-5 animate-spin" />}
                </button>

                {isSuccess && (
                    <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                        <p className="text-sm text-green-400 flex items-center gap-2">
                            ✓ Update submitted successfully! Your research update has been recorded on the blockchain.
                        </p>
                    </div>
                )}

                {writeError && (
                    <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                        <p className="text-sm text-red-400">
                            Error: {(writeError as any).shortMessage || 'Failed to submit update'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
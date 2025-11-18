"use client";

import { useState, useEffect, type FC, type ChangeEvent } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, decodeEventLog } from 'viem';
import { Loader, PartyPopper, ArrowRight, Copy, AlertCircle } from 'lucide-react';
import { MomentumFactoryAbi } from '@/contracts/MomentumFactory';
import Link from 'next/link';

// In your actual project, you would import this from its own file.
// For this example, it's defined here for completeness.
const momentumFactoryAbi = MomentumFactoryAbi;

const FACTORY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const InputField: FC<any> = ({ id, label, error, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold text-white mb-2">{label}</label>
        {children || <input id={id} name={id} {...props} className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${error ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'}`} />}
        {error && <p className="mt-2 text-sm text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
    </div>
);

// --- Main Form Component ---

interface FormData {
    title: string;
    description: string;
    category: string;
    fundingGoal: string;
    deadlineInDays: string;
    campaignMetadataURI: string;
}
type FormErrors = Partial<Record<keyof FormData, string>>;

export const CreateCampaignForm = () => {
    // --- State Management ---
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        category: '',
        fundingGoal: '',
        deadlineInDays: '',
        campaignMetadataURI: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [newCampaignAddress, setNewCampaignAddress] = useState<string | null>(null);

    // --- Wagmi Hooks for Smart Contract Interaction ---
    // All hooks MUST be called at the top level of the component.
    const { data: hash, writeContract, isPending: isSubmitting, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({ hash });

    // --- Logic & Handlers ---
    useEffect(() => {
        if (receipt?.logs) {
            try {
                const campaignCreatedLog = receipt.logs.find(log => {
                    // A simple check to see if the event signature topic matches
                    return log.topics[0] === '0x1dff23b965dba2af250c61d628a9dbc3857e77c638b2b4655d1fa20dfdf2a17a';
                });

                if (campaignCreatedLog) {
                    const decodedEvent = decodeEventLog({
                        abi: momentumFactoryAbi,
                        data: campaignCreatedLog.data,
                        topics: campaignCreatedLog.topics
                    });
                    const newAddress = (decodedEvent.args as { campaignAddress: string }).campaignAddress;
                    setNewCampaignAddress(newAddress);
                }
            } catch (e) {
                console.error("Error decoding event log:", e);
            }
        }
    }, [receipt]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.title.trim() || formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
        if (!formData.description.trim() || formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
        if (!formData.category) newErrors.category = 'Please select a category';
        const goal = parseFloat(formData.fundingGoal);
        if (isNaN(goal) || goal <= 0) newErrors.fundingGoal = 'Please enter a valid funding goal';
        const days = parseInt(formData.deadlineInDays);
        if (isNaN(days) || days <= 0) newErrors.deadlineInDays = 'Please enter a valid duration in days';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        writeContract({
            address: FACTORY_ADDRESS, // Replace with your deployed factory address
            abi: momentumFactoryAbi,
            functionName: 'createCampaign',
            args: [
                parseEther(formData.fundingGoal),
                BigInt(parseInt(formData.deadlineInDays) * 24 * 60 * 60),
                formData.campaignMetadataURI,
                formData.title,
                formData.description,
                formData.category,
            ],
        });
    };

    // --- Conditional Rendering ---
    if (isConfirmed) {
        return (
            <div className="text-center p-8 border border-green-500/30 rounded-xl bg-green-500/10 text-white animate-fade-in">
                <PartyPopper className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-400">Campaign Created Successfully!</h3>
                <p className="mt-2 text-gray-300">Your research project is now live on the blockchain.</p>
                {newCampaignAddress && (
                    <div className="mt-6 text-left bg-gray-900/50 border border-white/10 rounded-lg p-4">
                        <p className="text-xs text-gray-400 font-medium mb-1">New Campaign Address:</p>
                        <div className="flex items-center justify-between gap-4">
                            <code className="text-sm text-indigo-300 truncate">{newCampaignAddress}</code>
                            <button onClick={() => navigator.clipboard.writeText(newCampaignAddress)} className="text-gray-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
                <Link href={`/explore`} className="mt-8 inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">
                    Explore Project <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <InputField id="title" label="Campaign Title *" value={formData.title} onChange={handleInputChange} error={errors.title} placeholder="A Novel Approach to Quantum Entanglement" />
            <InputField as="textarea" id="description" label="Short Description *" value={formData.description} onChange={handleInputChange} error={errors.description} placeholder="Briefly describe your research..." rows={4} />
            <InputField id="category" label="Category *" value={formData.category} onChange={handleInputChange} error={errors.category} placeholder="eg.// Physics, Computer Science, Biotechnology..." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField id="fundingGoal" label="Funding Goal (ETH) *" type="number" value={formData.fundingGoal} onChange={handleInputChange} error={errors.fundingGoal} placeholder="10.0" />
                <InputField id="deadlineInDays" label="Campaign Duration (Days) *" type="number" value={formData.deadlineInDays} onChange={handleInputChange} error={errors.deadlineInDays} placeholder="30" />
            </div>
            <div className="pt-6 border-t border-white/10">
                <button type="submit" disabled={isSubmitting || isConfirming} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? 'Confirm in Wallet...' : isConfirming ? 'Waiting for Confirmation...' : 'Launch Campaign'}
                    {(isSubmitting || isConfirming) && <Loader className="w-5 h-5 animate-spin" />}
                </button>
                {writeError && <p className="mt-4 text-sm text-red-400 text-center">{(writeError as any).shortMessage || 'An error occurred.'}</p>}
            </div>
        </form>
    );
};
"use client";

import { useState, type FC, type ChangeEvent } from 'react';
import { ArrowLeft, Sparkles, Calendar, Target, FileText, AlertCircle, CheckCircle, Loader, Upload, X, PartyPopper } from 'lucide-react';
import { useWriteContract } from 'wagmi';
import momentumFactoryContract from '@/contracts/MomentumFactory.json';
import { parseEther } from 'viem'; // viem is a powerful utility library that comes with wagmi. Removed for compilability in this environment.

// --- 1. Type Definitions for better stability ---
interface FormData {
    title: string;
    category: string;
    description: string;
    fundingGoal: string;
    deadlineInDays: string;
    fullDescription: string;
    milestones: string[];
    coverImage: File | null;
    termsAccepted: boolean;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

// --- Helper Data ---
const categories = [
    'Quantum Physics', 'Biotechnology', 'Artificial Intelligence',
    'Environmental Science', 'Neuroscience', 'Renewable Energy',
    'Space Exploration', 'Materials Science'
];

const steps = [
    { number: 1, title: 'Basic Info', icon: FileText },
    { number: 2, title: 'Funding', icon: Target },
    { number: 3, title: 'Review & Submit', icon: CheckCircle }
];

// In a real project, you would import your ABI like this:
const momentumFactoryAbi = [] as const;

// --- 2. Sub-components for each step for better organization ---

// --- Step 1 Component ---
const Step1: FC<{ data: FormData; updateField: (field: keyof FormData, value: any) => void; errors: FormErrors; }> = ({ data, updateField, errors }) => (
    <div className="space-y-6 animate-fade-in">
        {/* Campaign Title Input */}
        <div>
            <label className="block text-sm font-semibold text-white mb-2">Campaign Title *</label>
            <input
                type="text"
                value={data.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Quantum Computing Algorithm Development"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${errors.title ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
            />
            {errors.title && <p className="mt-2 text-sm text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.title}</p>}
        </div>
        {/* Category Select */}
        <div>
            <label className="block text-sm font-semibold text-white mb-2">Research Category *</label>
            <select
                value={data.category}
                onChange={(e) => updateField('category', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white focus:outline-none transition-colors ${errors.category ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
            >
                <option value="">Select a category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {errors.category && <p className="mt-2 text-sm text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.category}</p>}
        </div>
        {/* Short Description Textarea */}
        <div>
            <label className="block text-sm font-semibold text-white mb-2">Short Description *</label>
            <textarea
                value={data.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Brief description of your research project (50-200 characters)"
                rows={3}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors resize-none ${errors.description ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'}`}
            />
            <div className="flex justify-between items-center mt-2">
                <div>{errors.description && <p className="text-sm text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.description}</p>}</div>
                <p className="text-sm text-gray-500">{data.description.length} characters</p>
            </div>
        </div>
        {/* Cover Image Upload */}
        <div>
            <label className="block text-sm font-semibold text-white mb-2">Cover Image (Optional)</label>
            {!data.coverImage ? (
                <label className="flex flex-col items-center justify-center w-full h-40 bg-gray-800 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-indigo-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 10MB</p>
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && updateField('coverImage', e.target.files[0])} className="hidden" />
                </label>
            ) : (
                <div className="relative bg-gray-800 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">{data.coverImage.name}</p>
                        <button type="button" onClick={() => updateField('coverImage', null)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                </div>
            )}
        </div>
    </div>
);

// --- Step 2 Component ---
const Step2: FC<{ data: FormData; updateField: (field: keyof FormData, value: any) => void; errors: FormErrors; }> = ({ data, updateField, errors }) => {

    const handleMilestoneChange = (index: number, value: string) => {
        const newMilestones = [...data.milestones];
        newMilestones[index] = value;
        updateField('milestones', newMilestones);
    };

    const addMilestone = () => {
        if (data.milestones.length < 6) {
            updateField('milestones', [...data.milestones, '']);
        }
    };

    const removeMilestone = (index: number) => {
        if (data.milestones.length > 1) {
            updateField('milestones', data.milestones.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Funding Goal Input */}
            <div>
                <label className="block text-sm font-semibold text-white mb-2">Funding Goal (ETH) *</label>
                <div className="relative">
                    <input type="number" step="0.01" value={data.fundingGoal} onChange={(e) => updateField('fundingGoal', e.target.value)} placeholder="10.0" className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${errors.fundingGoal ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'}`} />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">ETH</div>
                </div>
                {errors.fundingGoal && <p className="mt-2 text-sm text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.fundingGoal}</p>}
                <p className="mt-2 text-sm text-gray-500">Min: 0.01 ETH | Max: 1000 ETH</p>
            </div>
            {/* Campaign Duration Input */}
            <div>
                <label className="block text-sm font-semibold text-white mb-2">Campaign Duration (Days) *</label>
                <input type="number" value={data.deadlineInDays} onChange={(e) => updateField('deadlineInDays', e.target.value)} placeholder="30" className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${errors.deadlineInDays ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'}`} />
                {errors.deadlineInDays && <p className="mt-2 text-sm text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.deadlineInDays}</p>}
                {data.deadlineInDays && !isNaN(parseInt(data.deadlineInDays)) && <div className="mt-3 flex items-center gap-2 text-sm text-indigo-400"><Calendar className="w-4 h-4" /><span>Deadline: {new Date(Date.now() + parseInt(data.deadlineInDays) * 24 * 60 * 60 * 1000).toLocaleDateString()}</span></div>}
            </div>
            {/* Milestones Input */}
            <div>
                <label className="block text-sm font-semibold text-white mb-2">Project Milestones (Optional)</label>
                <div className="space-y-3">
                    {data.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input type="text" value={milestone} onChange={(e) => handleMilestoneChange(idx, e.target.value)} placeholder={`Milestone ${idx + 1}`} className="flex-1 px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                            {data.milestones.length > 1 && <button type="button" onClick={() => removeMilestone(idx)} className="p-3 bg-gray-800 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-400" /></button>}
                        </div>
                    ))}
                </div>
                {data.milestones.length < 6 && <button type="button" onClick={addMilestone} className="mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-xl text-sm text-gray-400 transition-colors">+ Add Milestone</button>}
            </div>
        </div>
    )
};

// --- Step 3 Component ---
const Step3: FC<{ data: FormData; updateField: (field: keyof FormData, value: any) => void; errors: FormErrors; }> = ({ data, updateField, errors }) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-white">Review Your Campaign</h2>
        {/* Review Grid */}
        <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 border border-white/5 rounded-xl p-4"><h3 className="text-sm font-semibold text-gray-400 mb-2">Basic Information</h3><div className="space-y-2"><div><p className="text-xs text-gray-500">Title</p><p className="text-white font-semibold">{data.title}</p></div><div><p className="text-xs text-gray-500">Category</p><p className="text-white">{data.category}</p></div></div></div>
            <div className="bg-gray-800/50 border border-white/5 rounded-xl p-4"><h3 className="text-sm font-semibold text-gray-400 mb-2">Funding Details</h3><div className="space-y-2"><div><p className="text-xs text-gray-500">Goal</p><p className="text-white font-semibold">{data.fundingGoal} ETH</p></div><div><p className="text-xs text-gray-500">Duration</p><p className="text-white">{data.deadlineInDays} days</p></div></div></div>
        </div>
        {/* Terms and Conditions Checkbox */}
        <div className="bg-gray-800/50 border border-white/5 rounded-xl p-6">
            <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={data.termsAccepted} onChange={(e) => updateField('termsAccepted', e.target.checked)} className="mt-1 w-5 h-5 rounded border-white/10 bg-gray-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500" /><div className="flex-1"><p className="text-white font-semibold mb-1">I agree to the Terms and Conditions</p><p className="text-sm text-gray-400">By creating this campaign, you agree to our terms of service and confirm that all information provided is accurate. You understand that this is a blockchain-based campaign and all transactions are irreversible.</p></div></label>
            {errors.termsAccepted && <p className="mt-3 text-sm text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.termsAccepted}</p>}
        </div>
    </div>
);

// --- Main Page Component ---
export default function CreateCampaignPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [status, setStatus] = useState<SubmissionStatus>('idle');
    const [errors, setErrors] = useState<FormErrors>({});

    const [formData, setFormData] = useState<FormData>({
        title: '', category: '', description: '', fundingGoal: '',
        deadlineInDays: '', fullDescription: '', milestones: [''],
        coverImage: null, termsAccepted: false
    });

    // This is a generic handler to update any field in the form data
    const updateField = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (step: number): boolean => {
        const newErrors: FormErrors = {};
        if (step === 1) {
            if (!formData.title.trim() || formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
            if (!formData.category) newErrors.category = 'Please select a category';
            if (!formData.description.trim() || formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
        }
        if (step === 2) {
            const goal = parseFloat(formData.fundingGoal);
            if (isNaN(goal) || goal < 0.01 || goal > 1000) newErrors.fundingGoal = 'Goal must be between 0.01 and 1000 ETH';
            const days = parseInt(formData.deadlineInDays);
            if (isNaN(days) || days < 1 || days > 365) newErrors.deadlineInDays = 'Duration must be between 1 and 365 days';
        }
        if (step === 3) {
            if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };
    const handleBack = () => setCurrentStep(prev => prev - 1);

    // --- This is where you would integrate wagmi ---
    // const { writeContractAsync } = useWriteContract();

    const handleSubmit = async () => {
        if (!validate(3)) return;
        setStatus('submitting');

        try {
            // 1. Upload metadata and image to IPFS (not shown here)
            // const metadataURI = await uploadToIPFS({ title, description, ... });

            // 2. Prepare contract arguments
            // In a real project, you would use parseEther from 'viem' to convert ETH to wei.
            // const fundingGoalWei = parseEther(formData.fundingGoal);
            const deadlineInSeconds = parseInt(formData.deadlineInDays) * 24 * 60 * 60;

            // 3. Call the smart contract using wagmi
            /*
            await writeContractAsync({
                address: '0xYOUR_FACTORY_CONTRACT_ADDRESS',
                abi: momentumFactoryAbi,
                functionName: 'createCampaign',
                args: [fundingGoalWei, deadlineInSeconds, metadataURI],
            });
            */

            // Simulate a successful transaction
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log("Transaction successful!");

            setStatus('success');
        } catch (error) {
            console.error('Campaign creation failed:', error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                <PartyPopper className="w-16 h-16 text-green-400 mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Campaign Created Successfully!</h1>
                <p className="text-gray-400 mb-6">Your research is now live for the world to see and support.</p>
                <a href="/" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300">
                    View My Campaign
                </a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
            <div className="border-b border-white/10 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Projects
                    </a>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Stepper UI */}
                <div className="flex items-center justify-between mb-12">
                    {steps.map((step, idx) => (
                        <div key={step.number} className="flex items-center flex-1">
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= step.number ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500' : 'bg-gray-800 border-white/10'}`}><step.icon className="w-6 h-6 text-white" /></div>
                                <span className={`mt-2 text-xs sm:text-sm font-semibold w-24 ${currentStep >= step.number ? 'text-white' : 'text-gray-500'}`}>{step.title}</span>
                            </div>
                            {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-4 transition-all ${currentStep > step.number ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-white/10'}`}></div>}
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900 border border-white/10 rounded-3xl overflow-hidden">
                    <div className="p-8">
                        {currentStep === 1 && <Step1 data={formData} updateField={updateField} errors={errors} />}
                        {currentStep === 2 && <Step2 data={formData} updateField={updateField} errors={errors} />}
                        {currentStep === 3 && <Step3 data={formData} updateField={updateField} errors={errors} />}

                        {status === 'error' && (
                            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fade-in">
                                <div className="flex gap-3"><AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" /><div className="text-sm text-gray-300"><p className="font-semibold text-white mb-1">Submission Failed</p><p>Something went wrong. Please check your wallet and try again.</p></div></div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 pt-8 mt-8 border-t border-white/10">
                            {currentStep > 1 && <button type="button" onClick={handleBack} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all">Back</button>}
                            {currentStep < 3 ? (
                                <button type="button" onClick={handleNext} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300">Continue</button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={status === 'submitting'} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {status === 'submitting' ? <><Loader className="w-5 h-5 animate-spin" />Creating Campaign...</> : 'Confirm & Create Campaign'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { CreateCampaignForm } from '@/components/forms/CreateCampaignForm';
import { Sparkles } from 'lucide-react';

/**
 * @title CreateCampaignPage
 * @notice This is the main page for the campaign creation flow.
 * Its primary role is to provide the page layout and render the form component.
 */
export default function CreateCampaignPage() {
    return (
        // Main container with a gradient background
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">

            {/* Main content area */}
            {/* FIX: Added 'pt-20' (padding-top: 5rem) to push the content down below the fixed header */}
            <section className="relative pt-20 pb- overflow-hidden">
                <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">

                    {/* The main card that will contain our form */}
                    <div className="bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10">

                        {/* A decorative header for the card */}
                        <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
                            <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
                                <Sparkles className="w-8 h-8 text-white mx-auto mb-2" />
                                <h1 className="text-2xl font-bold text-white">Create Your Research Campaign</h1>
                                <p className="text-sm text-indigo-200 mt-1">Fill out the details below to launch your project on-chain.</p>
                            </div>
                        </div>

                        {/* The area where our actual form component is rendered */}
                        <div className="p-8">
                            <CreateCampaignForm />
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}

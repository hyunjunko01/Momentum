"use client";

import { useState, type ChangeEvent } from 'react';
import { Upload, Loader } from 'lucide-react';

type Status = 'idle' | 'uploading' | 'success' | 'error';

interface DataUploaderProps {
    onUploadSuccess: (ipfsHash: string) => void;
}

export const DataUploader = ({ onUploadSuccess }: DataUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<Status>('idle');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setStatus('idle');
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setStatus('uploading');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setStatus('success');

            // 2. CALL THE PARENT'S FUNCTION WITH THE HASH
            onUploadSuccess(data.ipfsHash);

        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="p-6 bg-gray-800/50 border border-white/10 rounded-xl">
            <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-800 border-2 border-gray-700 border-dashed rounded-md appearance-none cursor-pointer hover:border-indigo-500">
                <div className="flex items-center space-x-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="font-medium text-gray-300">
                        {file ? file.name : 'Click to upload or drag & drop'}
                    </span>
                </div>
                <input type="file" onChange={handleFileChange} className="hidden" />
            </label>

            <button
                onClick={handleSubmit}
                disabled={!file || status === 'uploading'}
                className="w-full py-3 mt-4 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {status === 'uploading' && <Loader className="w-5 h-5 animate-spin" />}
                {status === 'idle' && 'Upload Data to IPFS'}
                {status === 'uploading' && 'Uploading...'}
                {status === 'success' && 'Upload Successful!'}
                {status === 'error' && 'Upload Failed'}
            </button>

            {status === 'success' && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-300">
                    <p className="font-semibold">File Uploaded!</p>
                </div>
            )}
            {status === 'error' && <p className="mt-2 text-sm text-red-400">Error uploading file. Please try again.</p>}
        </div>
    );
};
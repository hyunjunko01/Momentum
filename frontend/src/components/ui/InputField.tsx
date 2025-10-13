"use client";

import { type FC } from 'react';
import { AlertCircle } from 'lucide-react';

// 1. Define the "props" that this component will accept using TypeScript.
// This makes the component type-safe and tells other developers what they can pass to it.
interface InputFieldProps {
    id: string;
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error?: string; // The error message is optional.
    type?: 'text' | 'number' | 'password'; // We can specify the types we support.
    placeholder?: string;
    as?: 'input' | 'textarea'; // A prop to decide if it's an input or a textarea.
    rows?: number;
}

/**
 * @title InputField Component
 * @notice A reusable, styled input field for the Momentum platform.
 * It handles displaying a label, the input itself, and any validation errors.
 */
export const InputField: FC<InputFieldProps> = ({
    id,
    label,
    value,
    onChange,
    error,
    type = 'text',
    placeholder,
    as = 'input',
    rows = 3
}) => {
    // 2. We dynamically determine the classes for the input based on whether there is an error.
    // This is a very common pattern in React for conditional styling.
    const inputClasses = `
    w-full px-4 py-3 bg-gray-800 border rounded-xl text-white
    placeholder-gray-500 focus:outline-none transition-colors
    ${error
            ? 'border-red-500 focus:border-red-500'
            : 'border-white/10 focus:border-indigo-500'
        }
  `;

    const InputComponent = as === 'textarea' ? 'textarea' : 'input';

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold text-white mb-2">
                {label}
            </label>

            <InputComponent
                id={id}
                name={id} // The name attribute is also important for forms
                type={as === 'input' ? type : undefined}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={inputClasses}
                rows={as === 'textarea' ? rows : undefined}
            />

            {/* 3. The error message is only rendered if the "error" prop is provided. */}
            {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </p>
            )}
        </div>
    );
};
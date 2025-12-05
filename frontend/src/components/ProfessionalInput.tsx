import React from 'react';

interface ProfessionalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const ProfessionalInput: React.FC<ProfessionalInputProps> = ({ 
  label, 
  error,
  className, 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-gray-700 font-sans text-sm font-medium">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 border rounded-lg font-sans text-gray-900 placeholder-gray-500 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition-all duration-200 ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
        } ${className}`}
      />
      {error && (
        <span className="text-red-600 text-sm font-sans">{error}</span>
      )}
    </div>
  );
};

export default ProfessionalInput;

import React from 'react';

interface RetroInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const RetroInput: React.FC<RetroInputProps> = ({ label, className, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-gray-400 font-mono text-xl uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          {...props}
          className={`w-full bg-[#2a2a2a] border-b-4 border-r-4 border-[#555] text-white font-mono text-xl p-4 outline-none placeholder-gray-500 focus:bg-[#333] focus:border-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] ${className}`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-6 bg-green-500 animate-pulse hidden group-focus-within:block pointer-events-none"></div>
      </div>
    </div>
  );
};

export default RetroInput;

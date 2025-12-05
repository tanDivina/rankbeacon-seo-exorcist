import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  dripping?: boolean;
}

const RetroButton: React.FC<RetroButtonProps> = ({ 
  children, 
  variant = 'primary', 
  dripping = false,
  className,
  ...props 
}) => {
  const baseStyles = "relative px-6 py-3 font-mono text-xl uppercase tracking-wider transition-transform active:translate-y-1 active:shadow-none border-2";
  
  const variants = {
    primary: "bg-[#e5e5e5] text-black border-white shadow-[4px_4px_0px_0px_#000] hover:bg-white",
    secondary: "bg-[#222] text-[#ccc] border-[#555] shadow-[4px_4px_0px_0px_#000] hover:bg-[#333] hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${dripping ? 'dripping-text' : ''} ${className}`}
      {...props}
    >
      {children}
      {dripping && (
        <div className="absolute -bottom-3 left-0 w-full flex justify-around pointer-events-none overflow-visible">
          <div className="w-1 h-3 bg-[#e5e5e5] animate-bounce"></div>
          <div className="w-1 h-5 bg-[#e5e5e5] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-2 bg-[#e5e5e5] animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        </div>
      )}
    </button>
  );
};

export default RetroButton;

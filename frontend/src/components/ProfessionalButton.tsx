import React from 'react';

interface ProfessionalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const ProfessionalButton: React.FC<ProfessionalButtonProps> = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  className,
  ...props 
}) => {
  const baseStyles = "font-sans font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-md hover:shadow-lg",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-400",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-md hover:shadow-lg",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md hover:shadow-lg"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ProfessionalButton;

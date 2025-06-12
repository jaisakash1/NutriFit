import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'p-6',
  ...props 
}) => {
  const baseClasses = `bg-white rounded-xl shadow-sm border border-gray-100 ${padding} ${className}`;
  
  if (hover) {
    return (
      <motion.div
        whileHover={{ 
          y: -2,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ duration: 0.2 }}
        className={baseClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
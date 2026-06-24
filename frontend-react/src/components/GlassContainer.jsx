import React from 'react';

const GlassContainer = ({ children, className = '', padding = '20px', style = {}, onClick }) => {
  return (
    <div 
      className={`glass-container ${className}`} 
      style={{ padding, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassContainer;

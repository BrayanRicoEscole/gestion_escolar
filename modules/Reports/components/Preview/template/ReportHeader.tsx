import React from 'react';

const ReportHeader = () => {
  const headerPath = "assets/header.png";
  const backupLogo = "https://renfort.edu.co/wp-content/uploads/2024/10/logo-renfort.png";

  return (
    <div className="w-full relative z-10 bg-white">
      <img 
        src={headerPath} 
        alt="Red de Colegios RENFORT" 
        className="w-full max-h-32" 
        crossOrigin="anonymous"
        onError={(e) => {
          // Fallback si el asset no se encuentra
          const target = e.target as HTMLImageElement;
          if (target.src !== backupLogo) {
            target.src = backupLogo;
            target.className = "h-20 mx-auto py-4 object-contain";
          }
        }}
      />
    </div>
  );
};

export default ReportHeader;
import React from 'react';

const ReportFooter = () => {
  const footerPath = "assets/footer.png";

  return (
    <div className="w-full relative z-10 bg-white pt-8">
      <img 
        src={footerPath} 
        alt="Red de Colegios RENFORT" 
        className="w-full max-h-32" 
        crossOrigin="anonymous"
        
      />
    </div>
  );
}

export default ReportFooter;

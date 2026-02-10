const coverImage="https://renfort.edu.co/wp-content/uploads/2024/09/renfort.webp"

const CoverPage = () => (
  <div className="report-page flex flex-col bg-background border border-border shadow-lg overflow-hidden">
    <img src={coverImage} alt="Students learning" className="w-full flex-1 object-cover" />
    <div className="px-8 py-6 flex flex-col items-center">
      <h1 className="font-montserrat text-5xl font-black tracking-tight text-report-blue text-center leading-tight">
        GLOBAL LEARNING<br />REPORT
      </h1>
      <div className="mt-4 w-24 h-1 bg-report-orange rounded-full" />
      <p className="mt-3 text-sm text-muted-foreground font-semibold tracking-widest uppercase">
        Red de Colegios RENFORT
      </p>
    </div>
  </div>
);

export default CoverPage;

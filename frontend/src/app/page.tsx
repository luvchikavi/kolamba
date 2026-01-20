export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-neutral-100">
      {/* Logo */}
      <h1 className="text-5xl font-display font-bold text-brand-gradient mb-2 tracking-wide">
        KOLAMBA
      </h1>
      <div className="h-0.5 w-48 bg-brand-gradient mb-4"></div>
      <p className="text-sm text-primary-500 uppercase tracking-widest mb-8">
        The Jewish Culture Club
      </p>

      {/* Hebrew tagline */}
      <p className="text-xl text-neutral-700 mb-8 text-center">
        מקשרים אמנים ישראלים לקהילות יהודיות ברחבי העולם
      </p>

      {/* Coming soon card */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border-t-4 border-primary-400">
        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">
          בקרוב...
        </h2>
        <p className="text-neutral-600 mb-6">
          פלטפורמת Kolamba נמצאת בשלבי פיתוח. חפשו אמנים, צרו קשר וקבעו הופעות
          בקרוב!
        </p>
        <div className="flex gap-4">
          <button className="flex-1 bg-primary-400 hover:bg-primary-600 text-white py-2 px-4 rounded transition-colors">
            אני אמן
          </button>
          <button className="flex-1 bg-secondary-400 hover:bg-secondary-600 text-white py-2 px-4 rounded transition-colors">
            אני קהילה
          </button>
        </div>
      </div>

      {/* Brand colors preview */}
      <div className="mt-12 flex gap-2">
        <div className="w-12 h-12 rounded bg-brand-rose" title="#ca7283"></div>
        <div className="w-12 h-12 rounded bg-brand-teal" title="#53b9cc"></div>
        <div className="w-12 h-12 rounded bg-brand-gray border" title="#e8e9ea"></div>
        <div className="w-12 h-12 rounded bg-brand-black" title="#000000"></div>
      </div>
    </div>
  );
}

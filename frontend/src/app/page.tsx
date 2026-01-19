export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold text-primary-600 mb-4">קולמבה</h1>
      <p className="text-xl text-gray-600 mb-8 text-center">
        מקשרים אמנים ישראלים לקהילות יהודיות ברחבי העולם
      </p>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          בקרוב...
        </h2>
        <p className="text-gray-600">
          פלטפורמת Kolamba נמצאת בשלבי פיתוח. חפשו אמנים, צרו קשר וקבעו הופעות
          בקרוב!
        </p>
      </div>
    </div>
  );
}

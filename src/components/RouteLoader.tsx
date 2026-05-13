export default function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-gray-500 font-medium">Загружаем раздел...</p>
      </div>
    </div>
  );
}

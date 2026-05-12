import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50/50">
      <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center gap-4 border border-gray-100">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin relative z-10" />
        </div>
        <p className="font-semibold text-gray-600 animate-pulse">Menyiapkan halaman...</p>
      </div>
    </div>
  );
}
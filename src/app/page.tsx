import Link from 'next/link'; // <-- 1. Impor komponen Link

export default function HomePage() {
  return (
    <main className="container p-4 mx-auto">
      <h1 className="text-3xl font-bold">
        Selamat Datang di Halaman Utama
      </h1>
      <p className="mt-2 text-gray-700">
        Konten unik untuk homepage akan muncul di sini.
      </p>

      {/* 2. Tambahkan tombol Link di sini */}
      <Link
        href="/form"
        className="inline-block px-6 py-3 mt-4 font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        Pergi ke Halaman Form
      </Link>

      {/* Tombol baru ke halaman Submissions */}
        <Link
          href="/submissions"
          className="inline-block px-6 py-3 mt-4 font-semibold text-white bg-purple-500 rounded-lg shadow-md hover:bg-purple-600"
        >
          Lihat Data Submissions
        </Link>
    </main>
  );
}
// src/components/Navbar.tsx

import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    // Biarkan kelas nav ini apa adanya
    <nav className="w-full bg-blue-400 shadow-md">
      <div className="container px-4 mx-auto">
        {/* Ubah padding vertikal di sini untuk menambah tinggi navbar */}
        <div className="flex items-center justify-between py-6"> {/* Ganti py-4 menjadi py-6 */}
          
          {/* Kiri: Nama Web */}
          <div className="flex-shrink-0">
            {/* Perbesar ukuran teks logo */}
            <Link href="/" className="text-3xl font-bold text-white"> {/* Ganti text-2xl menjadi text-3xl */}
              BatamPortal
            </Link>
          </div>

          {/* Tengah: SearchBar (digabung di sini) */}
          <div className="flex justify-center flex-grow">
            <div className="relative w-2/3">
              {/* Anda bisa biarkan input seperti ini atau tambah padding (py-3) jika perlu */}
              <input
                type="text"
                placeholder="Cari hotel atau tempat wisata..."
                className="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute w-5 h-5 text-gray-400 right-4 top-1/2 transform -translate-y-1/2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Kanan: Tombol Login */}
          <div className="flex-shrink-0">
            {/* Perbesar tombol dan ukuran teksnya */}
            <button className="px-10 py-2 text-lg font-semibold text-blue-500 bg-white rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"> {/* Ubah padding & tambah text-lg */}
              Login
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
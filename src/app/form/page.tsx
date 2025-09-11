// src/app/form/page.tsx
'use client'; 

import React, { useState } from 'react';

export default function CombinedFormPage() {
  // State for all form fields
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kategori, setKategori] = useState('');
  const [subKategori, setSubKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [kontak, setKontak] = useState('');
  const [website, setWebsite] = useState('');
  
  // State for UI feedback
  const [errorLogo, setErrorLogo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Data for dropdowns
  const kategoriData = {
    wisata: ['Pantai', 'Gunung', 'Sejarah'],
    kuliner: ['Restoran', 'Cafe', 'Kaki Lima'],
    akomodasi: ['Hotel', 'Villa', 'Resort'],
  };

  // Function to handle logo file changes
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorLogo('Ukuran file tidak boleh melebihi 5MB.');
        setLogo(null);
      } else {
        setErrorLogo('');
        setLogo(file);
      }
    }
  };

  // Function to handle form submission to the database
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (errorLogo) {
      alert(`Tidak bisa submit: ${errorLogo}`);
      return;
    }

    setIsLoading(true);
    setStatusMessage('Mengirim data...');

    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('alamat', alamat);
    formData.append('kategori', kategori);
    formData.append('subKategori', subKategori);
    formData.append('deskripsi', deskripsi);
    formData.append('kontak', kontak);
    formData.append('website', website);
    if (logo) {
      formData.append('logo', logo);
    }

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setStatusMessage('Formulir berhasil dikirim!');
        // Optionally reset the form fields here
      } else {
        setStatusMessage('Gagal mengirim formulir. Silakan coba lagi.');
      }
    } catch (error) {
      console.error("Terjadi error:", error);
      setStatusMessage('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container p-8 mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Formulir Pendaftaran Lengkap</h1>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white rounded-lg shadow-md">
        
        <h2 className="text-xl font-semibold border-b pb-2 text-gray-700">Informasi Dasar</h2>
        <div>
          <label htmlFor="nama" className="block mb-2 font-semibold text-gray-700">Nama Tempat</label>
          <input type="text" id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label htmlFor="alamat" className="block mb-2 font-semibold text-gray-700">Alamat</label>
          <textarea id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} required></textarea>
        </div>
        <div>
          <label htmlFor="kategori" className="block mb-2 font-semibold text-gray-700">Kategori</label>
          <select id="kategori" value={kategori} onChange={(e) => { setKategori(e.target.value); setSubKategori(''); }} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="" disabled>Pilih Kategori</option>
            {Object.keys(kategoriData).map((kat) => <option key={kat} value={kat}>{kat.charAt(0).toUpperCase() + kat.slice(1)}</option>)}
          </select>
        </div>
        {kategori && (
          <div>
            <label htmlFor="subkategori" className="block mb-2 font-semibold text-gray-700">Sub-Kategori</label>
            <select id="subkategori" value={subKategori} onChange={(e) => setSubKategori(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="" disabled>Pilih Sub-Kategori</option>
              {kategoriData[kategori as keyof typeof kategoriData].map((sub) => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>
        )}
        
        <h2 className="text-xl font-semibold border-b pt-4 pb-2 text-gray-700">Detail Perusahaan (Opsional) </h2>
        <div>
          <label htmlFor="deskripsi" className="block mb-2 font-semibold text-gray-700">Deskripsi Perusahaan</label>
          <textarea id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={5} placeholder="Jelaskan tentang perusahaan Anda..." />
        </div>
        <div>
          <label htmlFor="logo" className="block mb-2 font-semibold text-gray-700">Logo Perusahaan (Max 5MB)</label>
          <input type="file" id="logo" accept="image/png, image/jpeg, image/webp" onChange={handleLogoChange} className="w-full text-sm text-gray-500 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {errorLogo && <p className="mt-2 text-sm text-red-600">{errorLogo}</p>}
          {logo && !errorLogo && <p className="mt-2 text-sm text-green-600">File terpilih: {logo.name}</p>}
        </div>
        <div>
          <label htmlFor="kontak" className="block mb-2 font-semibold text-gray-700">Kontak (Telepon)</label>
          <input type="tel" id="kontak" value={kontak} onChange={(e) => setKontak(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: 081234567890" />
        </div>
        <div>
          <label htmlFor="website" className="block mb-2 font-semibold text-gray-700">Link Website</label>
          <input type="url" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: https://www.batamportal.com" />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Mengirim...' : 'Kirim Pendaftaran'}
          </button>
        </div>

        {statusMessage && <p className="mt-4 text-center font-semibold">{statusMessage}</p>}
      </form>
    </main>
  );
}
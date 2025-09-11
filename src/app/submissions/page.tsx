// src/app/submissions/page.tsx

import { query } from '@/lib/db'; // Import your database query utility
import Image from 'next/image';   // Import Next.js Image component for optimization

// Define a type for our submission data for better type safety
type Submission = {
  id: number;
  nama: string;
  alamat: string;
  kategori: string;
  subkategori: string;
  kontak: string;
  website: string;
  logo_path: string | null;
  created_at: string;
};

// This is a Server Component, so we can fetch data directly
export default async function SubmissionsPage() {
  // Fetch all submissions from the database
  const submissions = (await query({
    query: "SELECT * FROM submissions ORDER BY created_at DESC",
    values: [],
  })) as Submission[];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Data Submissions</h1>

      {/* Table to display the data */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
              <th className="px-5 py-3 border-b-2 border-gray-300 text-left">Logo</th>
              <th className="px-5 py-3 border-b-2 border-gray-300 text-left">Nama</th>
              <th className="px-5 py-3 border-b-2 border-gray-300 text-left">Kategori</th>
              <th className="px-5 py-3 border-b-2 border-gray-300 text-left">Kontak</th>
              <th className="px-5 py-3 border-b-2 border-gray-300 text-left">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="px-5 py-5 bg-white text-sm">
                  {submission.logo_path ? (
                    <Image
                      src={submission.logo_path}
                      alt={`Logo ${submission.nama}`}
                      width={50}
                      height={50}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-[50px] h-[50px] bg-gray-300 rounded-full" />
                  )}
                </td>
                <td className="px-5 py-5 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-semibold">{submission.nama}</p>
                </td>
                <td className="px-5 py-5 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{submission.kategori}</p>
                  <p className="text-gray-600 whitespace-no-wrap">{submission.subkategori}</p>
                </td>
                <td className="px-5 py-5 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{submission.kontak}</p>
                </td>
                <td className="px-5 py-5 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {new Date(submission.created_at).toLocaleDateString('id-ID')}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
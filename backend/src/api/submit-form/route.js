import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
// import { formidable } from 'formidable';
import path from 'path';
import fs from 'fs/promises';

// This config is no longer needed for this method, but it doesn't hurt to keep it.
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    // --- START OF FIX ---
    // Instead of parsing the req directly, we get the form data first.
    const formData = await req.formData();
    // --- END OF FIX ---

    // Make sure the uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Extract text fields from formData
    const nama = formData.get('nama');
    const alamat = formData.get('alamat');
    const kategori = formData.get('kategori');
    const subKategori = formData.get('subKategori');
    const deskripsi = formData.get('deskripsi');
    const kontak = formData.get('kontak');
    const website = formData.get('website');

    // Handle the file upload
    let logoPath = null;
    const logoFile = formData.get('logo');
    if (logoFile && typeof logoFile.arrayBuffer === 'function') {
      const newFileName = `${Date.now()}-${logoFile.name}`;
      const newPath = path.join(uploadDir, newFileName);
      
      // Convert file to buffer and write to disk
      const fileBuffer = Buffer.from(await logoFile.arrayBuffer());
      await fs.writeFile(newPath, fileBuffer);

      logoPath = `/uploads/${newFileName}`; // The path to be stored in DB
    }

    // Insert data into the database
    const result = await query({
      query: 'INSERT INTO submissions (nama, alamat, kategori, subkategori, deskripsi, kontak, website, logo_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      values: [nama, alamat, kategori, subKategori, deskripsi, kontak, website, logoPath],
    });

    return NextResponse.json({ success: true, submissionId: result.insertId });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
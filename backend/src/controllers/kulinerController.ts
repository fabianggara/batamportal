// backend/src/controllers/kulinerController.ts
import { Request, Response } from 'express';
import { getConnection } from '../config/database'; // <-- Import yang BENAR

export const submitKulinerController = async (req: Request, res: Response) => {
    // Kita inisialisasi koneksi di luar try agar bisa di-release di finally
    let connection;

    try {
        // 1. Parse Data dari FormData
        const businessData = JSON.parse(req.body.businessData);
        const tags = JSON.parse(req.body.tags);
        const menu = JSON.parse(req.body.menu);
        const galleryFiles = req.files as Express.Multer.File[];

        // 2. Dapatkan koneksi database
        connection = await getConnection();

        // 3. MULAI TRANSAKSI
        // Penting: Agar jika simpan menu gagal, data bisnis juga dibatalkan (tidak nyampah)
        await connection.beginTransaction();

        // ---------------------------------------------------------
        // A. INSERT Data Bisnis Utama
        // ---------------------------------------------------------
        const [businessResult]: any = await connection.execute(`
            INSERT INTO businesses (
                name, description, address, phone, email, website, 
                latitude, longitude, category_id, subcategory_id, 
                status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `, [
            businessData.place_name,
            businessData.description,
            businessData.address,
            businessData.contact,
            businessData.email,
            businessData.website,
            parseFloat(businessData.latitude) || null,
            parseFloat(businessData.longitude) || null,
            2, // category_id (Kuliner)
            businessData.subcategory_id
        ]);

        const businessId = businessResult.insertId; // Ambil ID bisnis baru

        // ---------------------------------------------------------
        // B. INSERT Tags (Jika ada)
        // ---------------------------------------------------------
        if (tags && tags.length > 0) {
            // Kita loop insert satu per satu agar aman dengan 'execute'
            for (const tagId of tags) {
                await connection.execute(
                    'INSERT INTO business_tags (business_id, tag_id) VALUES (?, ?)',
                    [businessId, tagId]
                );
            }
        }

        // ---------------------------------------------------------
        // C. INSERT Menu (Jika ada)
        // ---------------------------------------------------------
        if (menu && menu.length > 0) {
            for (const item of menu) {
                await connection.execute(`
                    INSERT INTO menu_items (business_id, name, description, price, is_signature) 
                    VALUES (?, ?, ?, ?, ?)
                `, [
                    businessId,
                    item.name,
                    item.description || '',
                    item.price,
                    item.is_signature ? 1 : 0
                ]);
            }
        }

        // ---------------------------------------------------------
        // D. INSERT Galeri (Jika ada file)
        // ---------------------------------------------------------
        if (galleryFiles && galleryFiles.length > 0) {
            for (const file of galleryFiles) {
                // TODO: Idealnya upload ke Cloud Storage dulu dan simpan URL-nya
                // Di sini kita simpan nama filenya saja sebagai contoh
                await connection.execute(
                    'INSERT INTO business_gallery (business_id, image_url) VALUES (?, ?)', // Sesuaikan nama tabel galeri Anda
                    [businessId, file.filename]
                );
            }
        }

        // 4. COMMIT TRANSAKSI (Simpan permanen)
        await connection.commit();

        console.log('Bisnis berhasil disimpan dengan ID:', businessId);
        res.status(201).json({ 
            message: 'Bisnis berhasil didaftarkan!',
            businessId: businessId 
        });

    } catch (error) {
        // Jika ada error, ROLLBACK (Batalkan semua perubahan)
        if (connection) await connection.rollback();
        
        console.error('Error saat submit kuliner:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server saat menyimpan data.' });
    } finally {
        // Wajib lepaskan koneksi kembali ke pool
        if (connection) connection.release();
    }
};
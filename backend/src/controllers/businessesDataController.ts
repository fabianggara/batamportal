// backend/src/controllers/businessesDataController.ts

import { Request, Response } from "express";
import { query, getConnection } from "@/config/database";
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { promisify } from 'util';
import fs from 'fs';
import slugify from 'slugify'; // Pastikan library ini tersedia

// Helper function to delete files (diasumsikan path file adalah properti 'path' dari Multer File)
const unlinkAsync = promisify(fs.unlink);

// --- HELPER FUNCTION ---
// Asumsi: Tabel amenities memiliki kolom 'slug' atau 'id_string' yang sesuai dengan ID dari UI ('wifi', 'parking', dll.)
const findAmenityIdsBySlug = async (slugs: string[], connection: any): Promise<number[]> => {
    if (slugs.length === 0) return [];
    // Ganti 'name' menjadi 'slug' atau 'id_string' jika ada di tabel amenities
    const [amenitiesResult] = await connection.query(
        "SELECT id FROM amenities WHERE name IN (?)", 
        [slugs] 
    );
    return (amenitiesResult as any[]).map(r => r.id);
};

// ----------------------------------------------------------------------------------

// ✅ GET all businesses (sebelumnya: getAllSubmissions)
export const getAllBusinesses = async (req: Request, res: Response) => {
    try {
        // Asumsi `query` mengembalikan array deconstructed: [rows, fields]
        const [rows] = await query("SELECT * FROM business_with_category ORDER BY created_at DESC");

        // PENTING: Lakukan pemeriksaan format data.
        // Jika rows adalah array (kasus 0 atau >1 hasil), gunakan rows.
        // Jika rows BUKAN array (kasus 1 hasil di beberapa driver), bungkus dalam array.
        const dataToSend = Array.isArray(rows) ? rows : (rows ? [rows] : []);

        return res.json({
            success: true,
            data: dataToSend, // <-- SELALU ARRAY DI SINI
        });
    } catch (error) {
        console.error("Error fetching businesses:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch businesses",
        });
    }
};

// ----------------------------------------------------------------------------------

// ✅ GET single business by Id (sebelumnya: getSubmissionById)
export const getBusinessById = async (req: Request, res: Response) => {
    const BUSINESS_ID = req.params.id;
    const connection = await getConnection();
    await connection.beginTransaction();

    try {
        // 1. Ambil data utama dari VIEW (untuk nama kategori)
        const [businessRows] = await connection.query("SELECT * FROM business_with_category WHERE id = ?", [BUSINESS_ID]);
        const business = (businessRows as any[])[0];

        if (!business) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: "Business not found" });
        }
        
        // 2. Ambil data relasi (harus selalu dibungkus dalam array/ditambahkan ke objek utama)
        
        // Relasi Media
        const [media] = await connection.query("SELECT id, file_path, file_type FROM business_media WHERE business_id = ?", [BUSINESS_ID]);
        business.media = media; // Tambahkan array media ke objek business

        // Relasi Fasilitas (JOIN amenities)
        const [amenities] = await connection.query(`
            SELECT t1.amenity_id, t2.name, t2.icon, t1.is_available 
            FROM business_amenities t1 
            JOIN amenities t2 ON t1.amenity_id = t2.id 
            WHERE t1.business_id = ?`, 
            [BUSINESS_ID]
        );
        business.amenities = amenities;

        // Relasi Kamar (Jika ada)
        const [room_types] = await connection.query("SELECT * FROM room_types WHERE business_id = ?", [BUSINESS_ID]);
        business.room_types = room_types;

        // Relasi Review/Rating Breakdown (Jika Anda menggunakannya)
        // const [reviews] = await connection.query("SELECT * FROM reviews WHERE business_id = ? AND status = 'approved'", [BUSINESS_ID]);
        // business.reviews = reviews;


        await connection.commit();
        connection.release();

        return res.json({
            success: true,
            data: business, // Mengirim objek tunggal dengan semua relasi ter-join
        });
    } catch (error) {
        // Log error di server
        console.error("CRITICAL SQL ERROR in getBusinessById:", error);
        
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        // Mengembalikan 500
        return res.status(500).json({
            success: false,
            error: "Internal server error during data retrieval.",
        });
    }
};

// ----------------------------------------------------------------------------------

// ✅ GET related businesses (Memperbaiki 404 dari frontend)
export const getRelatedBusinesses = async (req: Request, res: Response) => {
    const { category_slug, exclude, limit } = req.query;
    const LIMIT = parseInt(limit as string) || 4;
    
    // Perlu category_slug untuk query
    if (!category_slug) {
        return res.status(400).json({ success: false, error: "category_slug is required" });
    }

    try {
        // Query untuk mengambil bisnis dari kategori yang sama, tapi exclude ID item yang sedang dilihat
        const [rows] = await query(`
            SELECT * FROM business_with_category 
            WHERE category_slug = ? AND id != ?
            ORDER BY average_rating DESC, total_reviews DESC
            LIMIT ?`,
            [category_slug, exclude || 0, LIMIT]
        );
        
        const dataToSend = Array.isArray(rows) ? rows : (rows ? [rows] : []);

        return res.json({
            success: true,
            data: dataToSend,
        });
    } catch (error) {
        console.error("Error fetching related businesses:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch related businesses",
        });
    }
};

// ----------------------------------------------------------------------------------

// ✅ POST create business (menggantikan createSubmission)
// Fungsi ini secara spesifik menangani input Akomodasi (Hotel) dengan semua relasi
export const createBusiness = async (req: Request, res: Response) => {
    const connection = await getConnection();
    await connection.beginTransaction();

    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
    const allUploadedPaths: string[] = [];
    
    // Fungsi untuk mengumpulkan semua path agar mudah di-cleanup jika rollback
    if (uploadedFiles.thumbnail_picture) allUploadedPaths.push(...uploadedFiles.thumbnail_picture.map(f => f.path));
    if (uploadedFiles.media_files) allUploadedPaths.push(...uploadedFiles.media_files.map(f => f.path));

    try {
        // Data utama dari form (termasuk JSON string untuk array)
        const { 
            nama, alamat, kontak, website, email, deskripsi, 
            latitude, longitude, subkategori, 
            checkIn, checkOut,
            selectedFacilities, roomTypes: roomTypesJson
        } = req.body;

        // Parsing data JSON
        const parsedFacilities: string[] = JSON.parse(selectedFacilities || '[]');
        const parsedRoomTypes: any[] = JSON.parse(roomTypesJson || '[]');
        
        // Konstanta
        const CATEGORY_ID = 1; // Akomodasi (sesuai seed data)
        const SLUG = slugify(nama, { lower: true, strict: true });
        
        // Validasi dasar
        if (!nama || !alamat || !subkategori) {
            throw new Error("Nama, alamat, dan jenis akomodasi wajib diisi.");
        }

        // Cari ID Subkategori berdasarkan slug
        const [subCatResult] = await connection.query("SELECT id FROM subcategories WHERE slug = ? AND category_id = ?", [subkategori, CATEGORY_ID]);
        const subcategoryData = (subCatResult as any[])[0];
        if (!subcategoryData) {
            throw new Error("Subkategori tidak ditemukan.");
        }
        const SUB_CATEGORY_ID = subcategoryData.id;

        // Ambil path file logo (thumbnail)
        const thumbnailFile = uploadedFiles?.thumbnail_picture?.[0];
        // Menggunakan properti 'filename' yang diberikan Multer setelah upload
        const thumbnailPath = thumbnailFile ? thumbnailFile.filename : null; 

        // 1. INSERT ke TABEL UTAMA: businesses
        const insertBusinessQuery = `
            INSERT INTO businesses 
            (name, slug, description, address, phone, email, website, thumbnail_image, latitude, longitude, category_id, subcategory_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;
        const [businessResult] = await connection.query(insertBusinessQuery, [
            nama, SLUG, deskripsi, alamat, kontak, email, website, thumbnailPath,
            parseFloat(latitude) || null, parseFloat(longitude) || null,
            CATEGORY_ID, SUB_CATEGORY_ID
        ]);
        const BUSINESS_ID = (businessResult as ResultSetHeader).insertId;
        
        // 2. INSERT ke TABEL business_hours (Check-In/Check-Out)
        const hoursData = [];
        for (let day = 0; day <= 6; day++) {
            // Hotel 24 jam, jadi open_time = checkIn, close_time = checkOut
            hoursData.push([BUSINESS_ID, day, true, checkIn, checkOut]); 
        }
        if (hoursData.length > 0) {
            await connection.query(
                `INSERT INTO business_hours (business_id, day_of_week, is_open, open_time, close_time) VALUES ?`,
                [hoursData]
            );
        }

        // 3. INSERT ke TABEL business_amenities
        // Mengubah ID string dari form ('wifi') menjadi ID numerik ('1') dari tabel amenities
        const amenityIds = await findAmenityIdsBySlug(parsedFacilities, connection);
        const amenitiesData = amenityIds.map(amenityId => [BUSINESS_ID, amenityId, true]);
        
        if (amenitiesData.length > 0) {
            await connection.query(
                `INSERT INTO business_amenities (business_id, amenity_id, is_available) VALUES ?`,
                [amenitiesData]
            );
        }

        // 4. INSERT ke TABEL room_types
        const roomTypeData = parsedRoomTypes.map(room => [
            BUSINESS_ID,
            room.name,
            room.description,
            // Mengambil angka dari string (misal: "25 m²" -> 25)
            parseInt(room.size.replace(/\D/g, '') || 0), 
            room.capacity,
            room.bedType,
            parseFloat(room.price) || 0
        ]);

        if (roomTypeData.length > 0) {
            await connection.query(
                `INSERT INTO room_types (business_id, name, description, size_sqm, max_occupancy, bed_type, base_price) VALUES ?`,
                [roomTypeData]
            );
        }

        // 5. INSERT ke TABEL business_media (Galeri)
        const mediaFiles = uploadedFiles?.media_files || [];
        if (mediaFiles.length > 0) {
            const mediaValues = mediaFiles.map((file: Express.Multer.File) => [
                BUSINESS_ID,
                file.filename,
                file.mimetype.startsWith('image') ? 'image' : 'video',
                null, // caption
                0, // display_order
                false, // is_primary
            ]);

            await connection.query(
                `INSERT INTO business_media (business_id, file_path, file_type, caption, display_order, is_primary) VALUES ?`,
                [mediaValues]
            );
        }

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Akomodasi berhasil didaftarkan. Menunggu verifikasi.",
            data: { id: BUSINESS_ID },
        });

    } catch (error) {
        // Hapus semua file yang diunggah dan rollback
        allUploadedPaths.forEach(path => {
            try { unlinkAsync(path); } catch(err) {/* ignore */}
        });
        
        await connection.rollback();
        console.error("Error creating Business:", error);
        
        return res.status(500).json({
            success: false,
            error: (error as Error).message || "Failed to create business submission",
        });
    } finally {
        connection.release();
    }
};

// ----------------------------------------------------------------------------------

// ✅ POST upload media for a specific business (sebelumnya: uploadMedia)
export const uploadMedia = async (req: Request, res: Response) => {
    const connection = await getConnection();
    await connection.beginTransaction();
    const files = (req as any).files;

    try {
        const { id } = req.params; // id adalah business_id

        if (!files || files.length === 0) {
            throw new Error("No files uploaded");
        }

        // Cek keberadaan Business
        const [businessExists] = await connection.query("SELECT id FROM businesses WHERE id = ?", [id]);
        if ((businessExists as any[]).length === 0) {
            throw new Error("Business not found");
        }

        const mediaValues = files.map((file: any) => [
            id,
            file.filename,
            file.mimetype.startsWith('image') ? 'image' : 'video',
            null, 
            0,
            false 
        ]);

        const insertMediaQuery = `
            INSERT INTO business_media (business_id, file_path, file_type, caption, display_order, is_primary)
            VALUES ?
        `;
        await connection.query(insertMediaQuery, [mediaValues]);

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Media uploaded successfully",
            data: { files: files.map((file: any) => file.filename) },
        });

    } catch (error) {
        // Hapus file yang diunggah
        if (files) files.forEach((file: any) => { try { unlinkAsync(file.path); } catch(err) {/* ignore */}});

        await connection.rollback();
        console.error("Error uploading media:", error);
        return res.status(500).json({
            success: false,
            error: (error as Error).message || "Failed to upload media",
        });
    } finally {
        connection.release();
    }
};

// ----------------------------------------------------------------------------------

// ✅ PUT update business (sebelumnya: updateSubmission)
export const updateBusiness = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { 
            nama, email, alamat, kategori, subkategori, deskripsi, kontak, website, latitude, longitude
        } = req.body;
        const file = (req as any).file;

        // Mendapatkan ID Kategori dan Subkategori harus dilakukan di sini
        // Asumsi: nilai 'kategori' dan 'subkategori' adalah ID numerik
        
        const thumbnailPath = file ? file.filename : null;

        const updateQuery = `
        UPDATE businesses 
        SET name = ?, email = ?, address = ?, category_id = ?, subcategory_id = ?, 
            description = ?, phone = ?, website = ?, thumbnail_image = COALESCE(?, thumbnail_image), 
            latitude = ?, longitude = ?, updated_at = NOW()
        WHERE id = ?
        `;

        const [result] = await query(updateQuery, [
            nama, email, alamat, kategori, subkategori, 
            deskripsi, kontak, website, thumbnailPath,
            latitude, longitude,
            id,
        ]);

        if ((result as ResultSetHeader).affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "Business not found",
            });
        }

        return res.json({
            success: true,
            message: "Business updated successfully",
        });
    } catch (error) {
        console.error("Error updating business:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to update business",
        });
    }
};

// ----------------------------------------------------------------------------------

// ✅ DELETE business (sebelumnya: deleteSubmission)
export const deleteBusiness = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Relasi ON DELETE CASCADE akan memastikan semua data terkait (media, kamar, fasilitas) ikut terhapus
        const [result] = await query("DELETE FROM businesses WHERE id = ?", [id]);

        if ((result as ResultSetHeader).affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "Business not found",
            });
        }

        return res.json({
            success: true,
            message: "Business deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting business:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete business",
        });
    }
};
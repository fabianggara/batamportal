// backend/src/controllers/businessesDataController.ts

import { Request, Response } from "express";
import { query, getConnection } from "@/config/database";
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { promisify } from 'util';
import fs from 'fs';
import slugify from 'slugify'; 

// Helper function to delete files (diasumsikan path file adalah properti 'path' dari Multer File)
const unlinkAsync = promisify(fs.unlink);

// --- HELPER FUNCTION ---
// CATATAN: Secara implisit merujuk ke tabel 'facilities'
const findAmenityIdsBySlug = async (slugs: string[], connection: any): Promise<number[]> => {
    if (slugs.length === 0) return [];
    // Query disesuaikan ke tabel 'facilities' (sebelumnya 'amenities')
    const [facilitiesResult] = await connection.query(
        "SELECT id FROM facilities WHERE name IN (?)", 
        [slugs] 
    );
    return (facilitiesResult as any[]).map(r => r.id);
};

// ----------------------------------------------------------------------------------

// ✅ GET all businesses 
export const getAllBusinesses = async (req: Request, res: Response) => {
    try {
        // Asumsi `query` mengembalikan array deconstructed: [rows, fields]
        const [rows] = await query("SELECT * FROM business_with_category ORDER BY created_at DESC");

        // Memastikan data dikirim sebagai array
        const dataToSend = Array.isArray(rows) ? rows : (rows ? [rows] : []);

        return res.json({
            success: true,
            data: dataToSend, 
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

// ✅ GET single business by Id (dengan JOIN komprehensif)
export const getBusinessById = async (req: Request, res: Response) => {
    const BUSINESS_ID = req.params.id;
    let connection;

    try {
        connection = await getConnection();
        await connection.beginTransaction();

        // 1. Ambil data utama dari VIEW (untuk nama kategori, rating, dll.)
        const [businessRows] = await connection.query("SELECT * FROM business_with_category WHERE id = ?", [BUSINESS_ID]);
        const business = (businessRows as any[])[0];

        if (!business) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: "Business not found" });
        }
        
        // 2. Ambil data relasi 
        
        // Relasi Media
        const [media] = await connection.query("SELECT id, file_path, file_type, caption FROM business_media WHERE business_id = ?", [BUSINESS_ID]);
        business.media = Array.isArray(media) ? media : []; 

        // Relasi Fasilitas (JOIN facilities)
        const [facilities] = await connection.query(`
            SELECT t1.facility_id, t2.name, t2.icon, t1.is_available 
            FROM business_facilities t1 
            JOIN facilities t2 ON t1.facility_id = t2.id 
            WHERE t1.business_id = ?`, 
            [BUSINESS_ID]
        );
        // NAMA TABEL DAN KOLOM TELAH DISESUAIKAN: business_facilities dan facilities
        business.amenities = Array.isArray(facilities) ? facilities : []; // Tetap beri nama 'amenities' di JSON untuk frontend

        // Relasi Kamar (Jika ada)
        const [room_types] = await connection.query("SELECT * FROM room_types WHERE business_id = ?", [BUSINESS_ID]);
        business.room_types = Array.isArray(room_types) ? room_types : [];

        // Relasi Jam Operasional (Opsional, tapi penting)
        const [hours] = await connection.query("SELECT day_of_week, is_open, open_time, close_time FROM business_hours WHERE business_id = ?", [BUSINESS_ID]);
        business.hours = Array.isArray(hours) ? hours : [];


        await connection.commit();
        return res.json({
            success: true,
            data: business, // Mengirim objek tunggal dengan semua relasi ter-join
        });
    } catch (error) {
        console.error("CRITICAL SQL ERROR in getBusinessById:", error);
        
        if (connection) {
            await connection.rollback();
            // PENTING: Koneksi dilepas di finally
        }
        return res.status(500).json({
            success: false,
            error: "Internal server error during data retrieval.",
        });
    } finally {
        if (connection) {
             connection.release();
        }
    }
};

// ----------------------------------------------------------------------------------

// ✅ GET related businesses
export const getRelatedBusinesses = async (req: Request, res: Response) => {
    const { category_slug, exclude, limit } = req.query;
    const LIMIT = parseInt(limit as string) || 4;
    
    if (!category_slug) {
        return res.status(400).json({ success: false, error: "category_slug is required" });
    }

    try {
        const [rows] = await query(`
            SELECT * FROM business_with_category 
            WHERE category_slug = ? AND id != ? AND status = 'approved'
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

// ✅ POST create business (Akomodasi)
export const createBusiness = async (req: Request, res: Response) => {
    const connection = await getConnection();
    await connection.beginTransaction();

    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
    const allUploadedPaths: string[] = [];
    
    if (uploadedFiles.thumbnail_picture) allUploadedPaths.push(...uploadedFiles.thumbnail_picture.map(f => f.path));
    if (uploadedFiles.media_files) allUploadedPaths.push(...uploadedFiles.media_files.map(f => f.path));

    try {
        const { 
            nama, alamat, kontak, website, email, deskripsi, 
            latitude, longitude, subkategori, 
            checkIn, checkOut,
            selectedFacilities, roomTypes: roomTypesJson
        } = req.body;

        const parsedFacilities: string[] = JSON.parse(selectedFacilities || '[]');
        const parsedRoomTypes: any[] = JSON.parse(roomTypesJson || '[]');
        
        const CATEGORY_ID = 1; // Akomodasi
        const SLUG = slugify(nama, { lower: true, strict: true });
        
        if (!nama || !alamat || !subkategori) {
            throw new Error("Nama, alamat, dan jenis akomodasi wajib diisi.");
        }

        const [subCatResult] = await connection.query("SELECT id FROM subcategories WHERE slug = ? AND category_id = ?", [subkategori, CATEGORY_ID]);
        const subcategoryData = (subCatResult as any[])[0];
        if (!subcategoryData) {
            throw new Error("Subkategori tidak ditemukan.");
        }
        const SUB_CATEGORY_ID = subcategoryData.id;

        const thumbnailFile = uploadedFiles?.thumbnail_picture?.[0];
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
        
        // 2. INSERT ke TABEL business_hours
        const hoursData = [];
        for (let day = 0; day <= 6; day++) {
            hoursData.push([BUSINESS_ID, day, true, checkIn, checkOut]); 
        }
        if (hoursData.length > 0) {
            await connection.query(
                `INSERT INTO business_hours (business_id, day_of_week, is_open, open_time, close_time) VALUES ?`,
                [hoursData]
            );
        }

        // 3. INSERT ke TABEL business_facilities (DISESUAIKAN)
        const facilityIds = await findAmenityIdsBySlug(parsedFacilities, connection);
        const facilityData = facilityIds.map(facilityId => [BUSINESS_ID, facilityId, true]);
        
        if (facilityData.length > 0) {
            await connection.query(
                `INSERT INTO business_facilities (business_id, facility_id, is_available) VALUES ?`, // DISESUAIKAN
                [facilityData]
            );
        }

        // 4. INSERT ke TABEL room_types
        const roomTypeData = parsedRoomTypes.map(room => [
            BUSINESS_ID, room.name, room.description, parseInt(room.size.replace(/\D/g, '') || 0), 
            room.capacity, room.bedType, parseFloat(room.price) || 0
        ]);

        if (roomTypeData.length > 0) {
            await connection.query(
                `INSERT INTO room_types (business_id, name, description, size_sqm, max_occupancy, bed_type, base_price) VALUES ?`,
                [roomTypeData]
            );
        }

        // 5. INSERT ke TABEL business_media
        const mediaFiles = uploadedFiles?.media_files || [];
        if (mediaFiles.length > 0) {
            const mediaValues = mediaFiles.map((file: Express.Multer.File) => [
                BUSINESS_ID, file.filename, file.mimetype.startsWith('image') ? 'image' : 'video',
                null, 0, false,
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

// ✅ POST upload media for a specific business
export const uploadMedia = async (req: Request, res: Response) => {
    const connection = await getConnection();
    await connection.beginTransaction();
    const files = (req as any).files;

    try {
        const { id } = req.params; 

        if (!files || files.length === 0) {
            throw new Error("No files uploaded");
        }

        const [businessExists] = await connection.query("SELECT id FROM businesses WHERE id = ?", [id]);
        if ((businessExists as any[]).length === 0) {
            throw new Error("Business not found");
        }

        const mediaValues = files.map((file: any) => [
            id, file.filename, file.mimetype.startsWith('image') ? 'image' : 'video',
            null, 0, false 
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

// ✅ PUT update business
export const updateBusiness = async (req: Request, res: Response) => {
    // ... (Logika tidak berubah, tapi menggunakan nama kolom yang benar)
    try {
        const { id } = req.params;
        const { 
            nama, email, alamat, kategori, subkategori, deskripsi, kontak, website, latitude, longitude
        } = req.body;
        const file = (req as any).file;
        
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

// ✅ DELETE business
export const deleteBusiness = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
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
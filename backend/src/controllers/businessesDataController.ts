// backend/src/controllers/businessesDataController.ts

import { Request, Response } from "express";
import { query, getConnection } from "@/config/database";
import { ResultSetHeader } from 'mysql2';
import { promisify } from 'util';
import fs from 'fs';
import slugify from 'slugify'; 

const unlinkAsync = promisify(fs.unlink);

// --- HELPER: Delete Files ---
const deleteFiles = (files: any) => {
    const paths: string[] = [];
    if (files.thumbnail_picture) paths.push(...files.thumbnail_picture.map((f: any) => f.path));
    if (files.media_files) paths.push(...files.media_files.map((f: any) => f.path));
    
    paths.forEach(path => {
        try { unlinkAsync(path); } catch(err) { /* ignore */ }
    });
};

// --- HELPER: Cari ID Tag berdasarkan Nama ---
const findTagIdsByName = async (names: string[], connection: any): Promise<number[]> => {
    if (!names || names.length === 0) return [];
    
    // HAPUS pembatasan type = 'Fasilitas' agar semua tipe tag bisa dibaca
    const [tagsResult] = await connection.query(
        "SELECT id FROM tags WHERE name IN (?)", 
        [names] 
    );
    return (tagsResult as any[]).map((r: any) => r.id);
};

// ==========================================
// BAGIAN 1: PUBLIC READ (Untuk Pengunjung)
// ==========================================

// ✅ GET Businesses by Category 
export const getBusinessesByCategory = async (req: Request, res: Response) => {
    const { categorySlug } = req.params;
    try {
        // Query yang digabung agar efisien
        const getItemsQuery = `
            SELECT 
                b.id, b.name, b.address, b.average_rating, b.total_reviews, b.star_rating,
                b.thumbnail_image, b.description, b.price, b.latitude, b.longitude, b.slug,
                sc.name as subcategory_name
            FROM businesses b
            JOIN categories c ON b.category_id = c.id
            LEFT JOIN subcategories sc ON b.subcategory_id = sc.id
            WHERE c.slug = ? AND b.status = 'approved'
            ORDER BY b.is_featured DESC, b.created_at DESC
        `;
        const items = await query(getItemsQuery, [categorySlug]);

        // Ambil info kategori untuk judul halaman
        const [catResult] = await query("SELECT name FROM categories WHERE slug = ? LIMIT 1", [categorySlug]);
        // @ts-ignore
        const categoryTitle = catResult[0]?.name || categorySlug;

        // Ambil subkategori untuk filter sidebar
        const [subCats] = await query(`
            SELECT s.slug, s.name FROM subcategories s
            JOIN categories c ON s.category_id = c.id
            WHERE c.slug = ? AND s.is_active = 1
        `, [categorySlug]);

        return res.json({
            success: true,
            data: {
                items: items,
                subcategories: subCats,
                category_title: categoryTitle
            }
        });
    } catch (error) {
        console.error(`Error fetching category ${categorySlug}:`, error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ✅ GET Related Businesses
export const getRelatedBusinesses = async (req: Request, res: Response) => {
    const { category_slug, exclude, limit } = req.query;
    const LIMIT = parseInt(limit as string) || 4;
    
    try {
        // Menggunakan VIEW business_with_category jika ada, jika tidak pakai JOIN manual
        // Demi keamanan, kita pakai JOIN manual standar
        const sql = `
            SELECT b.*, c.slug as category_slug 
            FROM businesses b
            JOIN categories c ON b.category_id = c.id
            WHERE c.slug = ? AND b.id != ? AND b.status = 'approved'
            ORDER BY b.average_rating DESC
            LIMIT ?
        `;
        
        const [rows] = await query(sql, [category_slug, exclude || 0, LIMIT]);
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error related businesses:", error);
        return res.status(500).json({ success: false, error: "Failed fetch related" });
    }
};


// ==========================================
// BAGIAN 2: ADMIN / GENERAL CRUD
// ==========================================

// ✅ GET All Businesses (Untuk Table Admin)
export const getAllBusinesses = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT b.*, c.name as category_name, sc.name as subcategory_name 
            FROM businesses b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN subcategories sc ON b.subcategory_id = sc.id
            ORDER BY b.created_at DESC
        `;
        
        const rows = await query(sql); 
        
        return res.json({
            success: true,
            data: rows, // Langsung kirim rows
        });
    } catch (error) {
        console.error("Error fetching all businesses:", error);
        return res.status(500).json({ success: false, error: "Failed to fetch businesses" });
    }
};

// ✅ GET Single Business by ID (Preview Admin & Edit)
export const getBusinessById = async (req: Request, res: Response) => {
    const BUSINESS_ID = req.params.id;
    let connection;

    try {
        connection = await getConnection();
        
        // 1. Ambil Data Utama (Tanpa WHERE approved, agar admin bisa lihat draft)
        const [rows] = await connection.query(`
            SELECT b.*, 
                   c.name as category_name, c.slug as category_slug, 
                   sc.name as subcategory_name, sc.slug as subcategory_slug 
            FROM businesses b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN subcategories sc ON b.subcategory_id = sc.id
            WHERE b.id = ?
        `, [BUSINESS_ID]);
        
        const business = (rows as any[])[0];
        if (!business) return res.status(404).json({ success: false, error: "Business not found" });

        // 2. Ambil Relasi Media
        const [media] = await connection.query("SELECT * FROM business_media WHERE business_id = ?", [BUSINESS_ID]);
        business.media = media || []; 

        // 3. Ambil Relasi Tambahan (Hanya jika tabelnya ada/perlu)
        // Kita bungkus try-catch agar jika tabel belum ada (misal fasilitas/room), tidak error 500
        try {
            const [tags] = await connection.query(`
                SELECT t.id, t.name, t.type 
                FROM business_tags bt
                JOIN tags t ON bt.tag_id = t.id
                WHERE bt.business_id = ?`, 
            [BUSINESS_ID]);
            // Pastikan dimasukkan ke properti "tags" agar frontend bisa membacanya
            business.tags = tags || []; 
        } catch (e) { business.tags = []; }

        try {
            const [rooms] = await connection.query("SELECT * FROM room_types WHERE business_id = ?", [BUSINESS_ID]);
            business.room_types = rooms || [];
        } catch (e) { business.room_types = []; }
        
        try {
            const [menus] = await connection.query("SELECT * FROM menus WHERE business_id = ?", [BUSINESS_ID]);
            business.menus = menus || [];
        } catch (e) { business.menus = []; }

        try {
            const [hours] = await connection.query("SELECT * FROM business_hours WHERE business_id = ?", [BUSINESS_ID]);
            business.hours = hours || [];
        } catch (e) { business.hours = []; }

        return res.json({ success: true, data: business });
    } catch (error) {
        console.error("Get By ID Error:", error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    } finally {
        if (connection) connection.release();
    }
};

// ✅ CREATE Business (Support Kuliner & Hotel)
export const createBusiness = async (req: Request, res: Response) => {
    const connection = await getConnection();
    await connection.beginTransaction();

    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };

    try {
        const { 
            nama, alamat, kontak, website, email, deskripsi, 
            latitude, longitude, subkategori, 
            checkIn, checkOut, selectedFacilities, roomTypes: roomTypesJson,
            menuItems, // <--- Tangkap data menu kuliner
            kategori_id, status,
            price, star_rating 
        } = req.body;

        const CATEGORY_ID = parseInt(kategori_id) || 1; 
        const SLUG = slugify(nama, { lower: true, strict: true }) + '-' + Date.now();

        let SUB_CATEGORY_ID = null;
        if (subkategori) {
            const [subCatResult] = await connection.query(
                "SELECT id FROM subcategories WHERE (slug = ? OR name = ?) AND category_id = ? LIMIT 1", 
                [subkategori, subkategori, CATEGORY_ID]
            );
            if ((subCatResult as any[]).length > 0) {
                SUB_CATEGORY_ID = (subCatResult as any[])[0].id;
            }
        }

        const thumbnailFile = uploadedFiles?.thumbnail_picture?.[0];
        const thumbnailPath = thumbnailFile ? thumbnailFile.filename : null; 

        // 1. Simpan Data Utama Bisnis
        const [businessResult] = await connection.query(`
            INSERT INTO businesses 
            (name, slug, description, address, phone, email, website, thumbnail_image, latitude, longitude, category_id, subcategory_id, status, price, star_rating, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) 
        `, [
            nama, SLUG, deskripsi, alamat, kontak, email, website, thumbnailPath,
            parseFloat(latitude) || null, parseFloat(longitude) || null,
            CATEGORY_ID, SUB_CATEGORY_ID,
            status || 'approved',
            parseFloat(price) || 0,        
            parseInt(star_rating) || null  
        ]);
        const BUSINESS_ID = (businessResult as ResultSetHeader).insertId;

        // 2. Simpan Galeri Tambahan (Carousel)
        const mediaFiles = uploadedFiles?.media_files || [];
        if (mediaFiles.length > 0) {
            const mediaData = mediaFiles.map(file => [
                BUSINESS_ID, file.filename, file.mimetype.startsWith('image') ? 'image' : 'video', null, 0, false
            ]);
            await connection.query(`INSERT INTO business_media (business_id, file_path, file_type, caption, display_order, is_primary) VALUES ?`, [mediaData]);
        }
        
        // 3. Simpan Jam Operasional (Berlaku untuk Hotel dan Kuliner)
        if (checkIn || checkOut) {
            const hoursData = [];
            for (let day = 0; day <= 6; day++) {
                hoursData.push([BUSINESS_ID, day, true, checkIn || '00:00', checkOut || '23:59']); 
            }
            await connection.query(
                `INSERT INTO business_hours (business_id, day_of_week, is_open, open_time, close_time) VALUES ?`,
                [hoursData]
            );
        }

        // 4. Simpan Tags (Fasilitas, Suasana, Area, dll)
        const parsedFacilities = JSON.parse(selectedFacilities || '[]');            
        const tagIds = await findTagIdsByName(parsedFacilities, connection);            
        if (tagIds.length > 0) {
            const tagValues = tagIds.map(tagId => [BUSINESS_ID, tagId]);                
            await connection.query(
                `INSERT INTO business_tags (business_id, tag_id) VALUES ?`,
                [tagValues]
            );
        }

        // 5. LOGIKA KHUSUS AKOMODASI (Kamar)
        if (CATEGORY_ID === 1) {
            const parsedRoomTypes = JSON.parse(roomTypesJson || '[]');
            if (parsedRoomTypes.length > 0) {
                const roomTypeData = parsedRoomTypes.map((room: any) => [
                    BUSINESS_ID, room.name, room.description, parseInt(room.size?.replace(/\D/g, '') || 0), 
                    room.capacity, room.bedType, parseFloat(room.price) || 0
                ]);
                await connection.query(
                    `INSERT INTO room_types (business_id, name, description, size_sqm, max_occupancy, bed_type, base_price) VALUES ?`,
                    [roomTypeData]
                );
            }
        }

        // 6. LOGIKA KHUSUS KULINER (Menu Andalan)
        if (CATEGORY_ID === 2) {
            const parsedMenus = JSON.parse(menuItems || '[]');
            if (parsedMenus.length > 0) {
                const menuData = parsedMenus.map((menu: any) => [
                    BUSINESS_ID, menu.name, menu.description, parseFloat(menu.price) || 0, menu.is_signature ? 1 : 0
                ]);
                await connection.query(
                    `INSERT INTO menus (business_id, name, description, price, is_signature) VALUES ?`,
                    [menuData]
                );
            }
        }

        await connection.commit();
        return res.status(201).json({ success: true, message: "Bisnis berhasil didaftarkan.", data: { id: BUSINESS_ID } });

    } catch (error) {
        deleteFiles(uploadedFiles); // Hapus foto jika database gagal
        await connection.rollback();
        console.error("Error creating Business:", error);
        return res.status(500).json({ success: false, error: (error as Error).message });
    } finally {
        connection.release();
    }
};


// ✅ UPDATE Business
export const updateBusiness = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const connection = await getConnection();
    await connection.beginTransaction();

    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };

    try {
        const { 
            nama, alamat, kontak, website, email, deskripsi, latitude, longitude,
            kategori, subkategori, checkIn, checkOut,
            selectedFacilities, roomTypes, removed_media_ids,
            price, star_rating, 
            menuItems // <--- TAMBAHAN: Tangkap menuItems dari frontend
        } = req.body;

        let CATEGORY_ID = 1; 
        const [catRes]: any = await connection.query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [kategori]);
        if (catRes.length > 0) CATEGORY_ID = catRes[0].id;

        let SUB_CATEGORY_ID = null;
        if (subkategori) {
            const [subRes]: any = await connection.query(
                "SELECT id FROM subcategories WHERE (slug = ? OR name = ?) LIMIT 1", 
                [subkategori, subkategori]
            );
            if (subRes.length > 0) {
                SUB_CATEGORY_ID = subRes[0].id;
            }
        }

        let thumbnailQuery = "";
        let thumbnailValues: any[] = [];
        const thumbnailFile = uploadedFiles?.thumbnail_picture?.[0];
        
        if (thumbnailFile) {
            thumbnailQuery = ", thumbnail_image = ?";
            thumbnailValues.push(thumbnailFile.filename);
        }

        await connection.query(`
            UPDATE businesses 
            SET name = ?, address = ?, phone = ?, website = ?, email = ?, description = ?,
                latitude = ?, longitude = ?, category_id = ?, subcategory_id = ?, 
                price = ?, star_rating = ?,
                updated_at = NOW()
                ${thumbnailQuery}
            WHERE id = ?
        `, [
            nama, alamat, kontak, website, email, deskripsi,
            parseFloat(latitude) || null, parseFloat(longitude) || null,
            CATEGORY_ID, SUB_CATEGORY_ID,
            parseFloat(price) || 0,        
            parseInt(star_rating) || null, 
            ...thumbnailValues, 
            id 
        ]);

        if (removed_media_ids) {
            const removedIds = JSON.parse(removed_media_ids);
            if (removedIds.length > 0) {
                await connection.query(`DELETE FROM business_media WHERE id IN (?) AND business_id = ?`, [removedIds, id]);
            }
        }

        const mediaFiles = uploadedFiles?.media_files || [];
        if (mediaFiles.length > 0) {
            const mediaData = mediaFiles.map(file => [
                id, file.filename, file.mimetype.startsWith('image') ? 'image' : 'video', null, 0, false
            ]);
            await connection.query(`INSERT INTO business_media (business_id, file_path, file_type, caption, display_order, is_primary) VALUES ?`, [mediaData]);
        }

        // ==========================================
        // 1. UPDATE JAM OPERASIONAL (UNTUK SEMUA KATEGORI)
        // ==========================================
        if (checkIn || checkOut) {
            await connection.query(`DELETE FROM business_hours WHERE business_id = ?`, [id]);
            const hoursData = [];
            for (let day = 0; day <= 6; day++) {
                hoursData.push([id, day, true, checkIn || '00:00', checkOut || '23:59']); 
            }
            await connection.query(`INSERT INTO business_hours (business_id, day_of_week, is_open, open_time, close_time) VALUES ?`, [hoursData]);
        }

        // ==========================================
        // 2. UPDATE TAGS & FASILITAS (UNTUK SEMUA KATEGORI)
        // ==========================================
        if (selectedFacilities) {
            await connection.query(`DELETE FROM business_tags WHERE business_id = ?`, [id]);
            const parsedFacilities = JSON.parse(selectedFacilities);
            if (parsedFacilities.length > 0) {
                const [tags]: any = await connection.query(`SELECT id FROM tags WHERE name IN (?)`, [parsedFacilities]);
                const tagIds = tags.map((t: any) => t.id);
                if (tagIds.length > 0) {
                    const tagValues = tagIds.map((tagId: number) => [id, tagId]);
                    await connection.query(`INSERT INTO business_tags (business_id, tag_id) VALUES ?`, [tagValues]);
                }
            }
        }

        // ==========================================
        // 3. LOGIKA KHUSUS AKOMODASI (Kamar)
        // ==========================================
        if (CATEGORY_ID === 1 && roomTypes) {
            const parsedRooms = JSON.parse(roomTypes);
            const roomsToKeep = parsedRooms.filter((r: any) => r.id && !r.id.toString().startsWith('room_')).map((r: any) => r.id);
            
            if (roomsToKeep.length > 0) {
                await connection.query(`DELETE FROM room_types WHERE business_id = ? AND id NOT IN (?)`, [id, roomsToKeep]);
            } else {
                await connection.query(`DELETE FROM room_types WHERE business_id = ?`, [id]);
            }

            for (const room of parsedRooms) {
                if (room.id && !room.id.toString().startsWith('room_')) {
                    await connection.query(`UPDATE room_types SET name = ?, description = ?, size_sqm = ?, max_occupancy = ?, bed_type = ?, base_price = ? WHERE id = ? AND business_id = ?`, [room.name, room.description, room.size_sqm, room.max_occupancy, room.bed_type, room.base_price, room.id, id]);
                } else {
                    await connection.query(`INSERT INTO room_types (business_id, name, description, size_sqm, max_occupancy, bed_type, base_price) VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, room.name, room.description, room.size_sqm, room.max_occupancy, room.bed_type, room.base_price]);
                }
            }
        }

        // ==========================================
        // 4. LOGIKA KHUSUS KULINER (Menu)
        // ==========================================
        if (CATEGORY_ID === 2 && menuItems) {
            const parsedMenus = JSON.parse(menuItems);
            
            // Filter ID asli dari database (yang bentuknya angka, bukan string "menu_1234567")
            const menusToKeep = parsedMenus
                .filter((m: any) => m.id && !m.id.toString().startsWith('menu_'))
                .map((m: any) => m.id);
            
            // Hapus menu yang tidak ada di daftar form lagi
            if (menusToKeep.length > 0) {
                await connection.query(`DELETE FROM menus WHERE business_id = ? AND id NOT IN (?)`, [id, menusToKeep]);
            } else {
                await connection.query(`DELETE FROM menus WHERE business_id = ?`, [id]);
            }

            // Update atau Insert Menu Baru
            for (const menu of parsedMenus) {
                const priceNum = parseFloat(menu.price) || 0;
                const isSig = menu.is_signature ? 1 : 0;

                if (menu.id && !menu.id.toString().startsWith('menu_')) {
                    // Update menu yang sudah ada
                    await connection.query(
                        `UPDATE menus SET name = ?, description = ?, price = ?, is_signature = ? WHERE id = ? AND business_id = ?`, 
                        [menu.name, menu.description, priceNum, isSig, menu.id, id]
                    );
                } else {
                    // Insert menu baru
                    await connection.query(
                        `INSERT INTO menus (business_id, name, description, price, is_signature) VALUES (?, ?, ?, ?, ?)`, 
                        [id, menu.name, menu.description, priceNum, isSig]
                    );
                }
            }
        }

        await connection.commit();
        return res.status(200).json({ success: true, message: "Data bisnis berhasil diperbarui.", data: { id } });

    } catch (error) {
        await connection.rollback();
        console.error("Error updating Business:", error);
        return res.status(500).json({ success: false, error: (error as Error).message });
    } finally {
        connection.release();
    }
};

// ✅ DELETE Business
export const deleteBusiness = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await query("DELETE FROM businesses WHERE id = ?", [id]);
        // @ts-ignore
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: "Business not found" });
        return res.json({ success: true, message: "Business deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({ success: false, error: "Failed to delete" });
    }
};

// ✅ Upload Media Tambahan
export const uploadMedia = async (req: Request, res: Response) => {
    const { id } = req.params;
    const files = (req as any).files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: "No files" });

    try {
        const values = files.map(f => [id, f.filename, 'image']);
        await query("INSERT INTO business_media (business_id, file_path, file_type) VALUES ?", [values]);
        return res.json({ success: true, message: "Media uploaded" });
    } catch (error) {
        return res.status(500).json({ error: "Upload failed" });
    }
};

// ==========================================
// BAGIAN 3: REVIEWS (ULASAN & RATING)
// ==========================================

export const getBusinessReviews = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const rows = await query(`
            SELECT r.id, r.rating, r.comment, r.image_url, r.created_at, r.user_id, 
                   u.name as user_name, u.profile_picture as user_profile_picture
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.business_id = ?
            ORDER BY r.created_at DESC
        `, [id]);
        
        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ success: false, message: 'Gagal mengambil ulasan' });
    }
};

// ✅ POST Review (Ditambah: Tangkap req.file dari Multer dan Insert image_url)
export const createBusinessReview = async (req: any, res: Response) => {
    const { id } = req.params; 
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    // Tangkap gambar dari upload (Bisa req.file atau req.files tergantung konfigurasi route Anda)
    let imageUrl = null;
    if (req.file) {
        imageUrl = req.file.filename;
    } else if (req.files && req.files['image']) {
        imageUrl = req.files['image'][0].filename;
    }

    const parsedRating = parseInt(rating);

    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
        if (imageUrl) deleteFiles({ thumbnail_picture: [{ path: `public/uploads/${imageUrl}` }] }); // hapus file jika gagal
        return res.status(400).json({ success: false, message: 'Rating harus 1-5' });
    }

    const connection = await getConnection();
    await connection.beginTransaction();

    try {
        // CEK APAKAH USER SUDAH PERNAH ME-REVIEW TEMPAT INI
        const [existing] = await connection.query(
            'SELECT id FROM reviews WHERE business_id = ? AND user_id = ?',
            [id, userId]
        );
        if ((existing as any[]).length > 0) {
            await connection.rollback();
            if (imageUrl) deleteFiles({ thumbnail_picture: [{ path: `public/uploads/${imageUrl}` }] });
            return res.status(400).json({ success: false, message: 'Anda sudah pernah memberikan ulasan untuk tempat ini.' });
        }

        // 1. Simpan ulasan ke tabel reviews beserta image_url
        await connection.query(
            'INSERT INTO reviews (business_id, user_id, rating, comment, image_url) VALUES (?, ?, ?, ?, ?)',
            [id, userId, parsedRating, comment, imageUrl]
        );

        // 2. Update otomatis average_rating & total_reviews
        await connection.query(`
            UPDATE businesses 
            SET 
                total_reviews = (SELECT COUNT(*) FROM reviews WHERE business_id = ?),
                average_rating = (SELECT AVG(rating) FROM reviews WHERE business_id = ?)
            WHERE id = ?
        `, [id, id, id]);

        await connection.commit();
        return res.json({ success: true, message: 'Ulasan berhasil ditambahkan' });
    } catch (error) {
        await connection.rollback();
        if (imageUrl) deleteFiles({ thumbnail_picture: [{ path: `public/uploads/${imageUrl}` }] });
        console.error("Error posting review:", error);
        return res.status(500).json({ success: false, message: 'Gagal mengirim ulasan' });
    } finally {
        connection.release();
    }
};

// ✅ DELETE Review (Ditambah: Hapus file gambar dari server lokal jika ada)
export const deleteBusinessReview = async (req: any, res: Response) => {
    const { businessId, reviewId } = req.params;
    const userId = req.user.userId;

    const connection = await getConnection();
    await connection.beginTransaction();

    try {
        // Verifikasi kepemilikan sekaligus mengambil nama file gambar
        const [review] = await connection.query(
            'SELECT id, image_url FROM reviews WHERE id = ? AND user_id = ?',
            [reviewId, userId]
        );
        const reviewData = (review as any[])[0];

        if (!reviewData) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Tidak diizinkan menghapus ulasan ini.' });
        }

        // Hapus ulasan dari database
        await connection.query('DELETE FROM reviews WHERE id = ?', [reviewId]);

        // Hitung ulang dan update rating bisnis
        await connection.query(`
            UPDATE businesses 
            SET 
                total_reviews = (SELECT COUNT(*) FROM reviews WHERE business_id = ?),
                average_rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE business_id = ?), 0)
            WHERE id = ?
        `, [businessId, businessId, businessId]);

        await connection.commit();

        // Hapus file fisik gambar dari folder uploads (jika ada)
        if (reviewData.image_url) {
            try {
                await unlinkAsync(`public/uploads/${reviewData.image_url}`);
            } catch (fsError) {
                console.log('Gagal menghapus file fisik, abaikan:', fsError);
            }
        }

        return res.json({ success: true, message: 'Ulasan berhasil dihapus' });
    } catch (error) {
        await connection.rollback();
        console.error("Error deleting review:", error);
        return res.status(500).json({ success: false, message: 'Gagal menghapus ulasan' });
    } finally {
        connection.release();
    }
};
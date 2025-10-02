// backend/src/controllers/locationDataController.ts

import { Request, Response } from "express";
import { query, getConnection } from "@/config/database";
import { FieldPacket, ResultSetHeader } from 'mysql2';
// import path from 'path';
import { promisify } from 'util';
import fs from 'fs';

// Helper function to delete files
const unlinkAsync = promisify(fs.unlink);

// ✅ GET all submissions
export const getAllSubmissions = async (req: Request, res: Response) => {
    try {
        const data = await query("SELECT * FROM submissions ORDER BY created_at DESC");

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch submissions",
        });
    }
};

// ✅ GET single submission
export const getSubmissionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Dapatkan data submission
        const businessData = await query("SELECT * FROM businesses WHERE id = ?", [id]);

        if (businessData.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Submission not found",
            });
        }

        // Dapatkan media yang terkait
        const mediaData = await query("SELECT * FROM business_media WHERE business_id = ?", [id]);

        const submission = businessData[0];
        // Tambahkan array media ke objek submission
        (submission as any).media = mediaData;

        return res.json({
            success: true,
            data: submission,
        });
    } catch (error) {
        console.error("Error fetching submission:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch submission",
        });
    }
};

// ✅ POST create submission
export const createSubmission = async (req: Request, res: Response) => {
    const connection = await getConnection();
    await connection.beginTransaction();

    // Mengambil file dari req.files, yang merupakan objek
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };

    try {
        const { 
            nama, 
            alamat, 
            kategori, 
            subkategori, 
            kontak, 
            website, 
            email, 
            deskripsi 
        } = req.body;

        // Validasi dasar
        if (!nama || !alamat) {
            // Hapus file yang sudah diunggah jika validasi gagal
            if (uploadedFiles) {
                if (uploadedFiles.thumbnail_image) {
                    uploadedFiles.thumbnail_image.forEach(file => unlinkAsync(file.path));
                }
                if (uploadedFiles.media_files) {
                    uploadedFiles.media_files.forEach(file => unlinkAsync(file.path));
                }
            }
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: "Nama dan alamat wajib diisi",
            });
        }

        // Ambil path file logo (thumbnail)
        const thumbnailFile = uploadedFiles?.thumbnail_image?.[0];
        const thumbnailPath = thumbnailFile ? thumbnailFile.filename : null;

        // 1. Masukkan data ke tabel submissions
        const insertSubmissionQuery = `
            INSERT INTO submissions 
            (place_name, email, address, category, subcategory, description, contact, website, thumbnail_image, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        const [submissionResult] = await connection.query(insertSubmissionQuery, [
            nama, email, alamat, kategori, subkategori, deskripsi, kontak, website, thumbnailPath,
        ]);
        const submissionId = (submissionResult as ResultSetHeader).insertId;

        // 2. Masukkan data media lainnya ke tabel submission_media
        const mediaFiles = uploadedFiles?.media_files || [];
        if (mediaFiles.length > 0) {
            const mediaValues = mediaFiles.map((file: Express.Multer.File) => [
                submissionId,
                file.filename,
                file.mimetype.startsWith('image') ? 'photo' : 'video'
            ]);

            const insertMediaQuery = `
                INSERT INTO submission_media (submission_id, media_path, media_type)
                VALUES ?
            `;
            await connection.query(insertMediaQuery, [mediaValues]);
        }

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Submission created successfully",
            data: { id: submissionId, thumbnail: thumbnailPath, media: mediaFiles.map(file => file.filename) },
        });

    } catch (error) {
        // Hapus semua file yang diunggah jika terjadi error
        if (uploadedFiles) {
            if (uploadedFiles.thumbnail_image) {
                uploadedFiles.thumbnail_image.forEach(file => unlinkAsync(file.path));
            }
            if (uploadedFiles.media_files) {
                uploadedFiles.media_files.forEach(file => unlinkAsync(file.path));
            }
        }
        await connection.rollback();
        console.error("Error creating submission:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to create submission",
        });
    } finally {
        connection.release();
    }
};

// ✅ POST upload media for a specific submission
export const uploadMedia = async (req: Request, res: Response) => {
    const connection = await getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;
        const files = (req as any).files;

        if (!files || files.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                error: "No files uploaded",
            });
        }

        const submissionExists = await connection.query("SELECT id FROM submissions WHERE id = ?", [id]);
        if ((submissionExists as any).length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: "Submission not found",
            });
        }

        const mediaValues = files.map((file: any) => [
            id,
            file.filename,
            file.mimetype.startsWith('image') ? 'photo' : 'video'
        ]);

        const insertMediaQuery = `
            INSERT INTO submission_media (submission_id, media_path, media_type)
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
        await connection.rollback();
        console.error("Error uploading media:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to upload media",
        });
    } finally {
        connection.release();
    }
};

// ✅ PUT update submission
export const updateSubmission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama, email, alamat, kategori, subkategori, deskripsi, kontak, website } = req.body;
        const file = (req as any).file;

        const thumbnailPath = file ? file.filename : null;

        const updateQuery = `
        UPDATE submissions 
        SET place_name = ?, email = ?, address = ?, category = ?, subcategory = ?, 
            description = ?, contact = ?, website = ?, thumbnail_image = ?, updated_at = NOW()
        WHERE id = ?
        `;

        const result = await query(updateQuery, [
            nama,
            email,
            alamat,
            kategori,
            subkategori,
            deskripsi,
            kontak,
            website,
            thumbnailPath,
            id,
        ]);

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "Submission not found",
            });
        }

        return res.json({
            success: true,
            message: "Submission updated successfully",
        });
    } catch (error) {
        console.error("Error updating submission:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to update submission",
        });
    }
};

// ✅ DELETE submission
export const deleteSubmission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await query("DELETE FROM submissions WHERE id = ?", [id]);

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: "Submission not found",
            });
        }

        return res.json({
            success: true,
            message: "Submission deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting submission:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to delete submission",
        });
    }
};
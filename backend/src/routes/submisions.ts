// backend/src/routes/submissions.ts
import express, { Request, Response } from 'express';
import { query } from '../config/database';

const router = express.Router();

// GET /api/submissions - Get all submissions
router.get('/submissions', async (req: Request, res: Response) => {
    try {
        // Query dari database menggunakan function yang sudah ada
        const data = await query('SELECT * FROM submissions ORDER BY created_at DESC');
        
        res.json({
        success: true,
        data: data
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
        success: false,
        error: 'Failed to fetch submissions'
        });
    }
});

// POST /api/submissions - Create new submission
router.post('/submissions', async (req: Request, res: Response) => {
    try {
        const { name, email, message, category } = req.body;
        
        // Validation
        if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: 'Name, email, and message are required'
        });
    }

    // Insert ke database
    const insertQuery = `
        INSERT INTO submissions (name, email, message, category, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    `;
    
    const result = await query(insertQuery, [name, email, message, category || null]);
    
        res.status(201).json({
        success: true,
        message: 'Submission created successfully',
        data: { id: (result as any).insertId }
    });
    
    } catch (error) {
        console.error('Error creating submission:', error);
        res.status(500).json({
        success: false,
        error: 'Failed to create submission'
        });
    }
});

// GET /api/submissions/:id - Get single submission
router.get('/submissions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await query('SELECT * FROM submissions WHERE id = ?', [id]);
        
        if (data.length === 0) {
        return res.status(404).json({
            success: false,
            error: 'Submission not found'
        });
        }
        
        res.json({
        success: true,
        data: data[0]
    });
    
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({
        success: false,
        error: 'Failed to fetch submission'
        });
    }
});

// PUT /api/submissions/:id - Update submission
router.put('/submissions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, message, category, status } = req.body;
        
        const updateQuery = `
        UPDATE submissions 
        SET name = ?, email = ?, message = ?, category = ?, status = ?, updated_at = NOW()
        WHERE id = ?
        `;
        
        const result = await query(updateQuery, [name, email, message, category, status, id]);
        
        if ((result as any).affectedRows === 0) {
        return res.status(404).json({
            success: false,
            error: 'Submission not found'
        });
        }
        
        res.json({
        success: true,
        message: 'Submission updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).json({
        success: false,
        error: 'Failed to update submission'
        });
    }
});

// DELETE /api/submissions/:id - Delete submission
router.delete('/submissions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM submissions WHERE id = ?', [id]);
        
        if ((result as any).affectedRows === 0) {
        return res.status(404).json({
            success: false,
            error: 'Submission not found'
        });
        }
        
        res.json({
        success: true,
        message: 'Submission deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({
        success: false,
        error: 'Failed to delete submission'
        });
    }
});

export default router;
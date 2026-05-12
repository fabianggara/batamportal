import { Request, Response } from 'express';
import { getConnection } from '../config/database';

export const getRecommendations = async (req: Request, res: Response) => {
    let connection: any;
    try {
        connection = await getConnection();
        
        const sqlQuery = `
            WITH RankedSubmissions AS (
                SELECT
                    id, name, address, thumbnail_image, category_id,
                    latitude, longitude,
                    ROW_NUMBER() OVER(PARTITION BY category_id ORDER BY published_at DESC) as row_num
                FROM businesses
                WHERE (status = 'approved' OR status = 'pending') AND category_id IN (1, 2, 3)
            )
            SELECT id, name, address, thumbnail_image, category_id, latitude, longitude
            FROM RankedSubmissions
            WHERE row_num <= 4;
        `;
        
        const [results] = await connection.query(sqlQuery);

        const categoryMap: { [key: number]: { category: string, type: string } } = {
            1: { category: 'Akomodasi', type: 'akomodasi' },
            2: { category: 'Kuliner',    type: 'kuliner' },
            3: { category: 'Wisata',   type: 'wisata' }
        };

        let formattedResults: any[] = [];
        if (Array.isArray(results)) {
            formattedResults = results.map((item: any) => {
                const mapping = categoryMap[item.category_id];
                return {
                    ...item,
                    category: mapping ? mapping.category : 'Unknown',
                    type: mapping ? mapping.type : 'unknown'
                };
            });
        }

        return res.json({ success: true, data: formattedResults });

    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    } finally {
        if (connection) connection.release();
    }
};

export const getPopularRecommendations = async (req: Request, res: Response) => {
    let connection: any;
    try {
        connection = await getConnection();
        
        // Anti-Error: Menggunakan COALESCE agar aman dari nilai NULL
        const sqlQuery = `
            WITH RankedBusinesses AS (
                SELECT 
                    b.id, b.name, b.thumbnail_image, b.address,
                    b.latitude, b.longitude, b.category_id,
                    COALESCE(b.average_rating, 0) as rating,
                    ROW_NUMBER() OVER(PARTITION BY b.category_id ORDER BY COALESCE(b.average_rating, 0) DESC, COALESCE(b.total_reviews, 0) DESC, b.id ASC) as rn
                FROM businesses b
                WHERE b.status = 'approved' OR b.status = 'pending'
            )
            SELECT * FROM RankedBusinesses WHERE rn <= 4;
        `;
        
        const [results] = await connection.query(sqlQuery);

        // Anti-Error: Pemetaan langsung (tanpa JOIN SQL yang rawan gagal)
        const categoryMap: { [key: number]: { category: string, slug: string } } = {
            1: { category: 'Akomodasi', slug: 'akomodasi' },
            2: { category: 'Kuliner', slug: 'kuliner' },
            3: { category: 'Wisata', slug: 'wisata' }
        };

        const formattedResults = (results as any[]).map(item => ({
            ...item,
            category: categoryMap[item.category_id]?.category || 'Umum',
            slug: categoryMap[item.category_id]?.slug || 'umum'
        }));

        return res.json({ success: true, data: formattedResults });

    } catch (error) {
        console.error("Error fetching popular recommendations:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    } finally {
        if (connection) connection.release();
    }
};

// FUNGSI REKOMENDASI PERSONAL (CBF JACCARD DENGAN PEMBOBOTAN FREKUENSI & RATING)
export const getPersonalizedRecommendations = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId || req.user?.id;
    let connection: any;

    try {
        connection = await getConnection();

        const categoryMap: { [key: number]: string } = {
            1: 'akomodasi',
            2: 'kuliner'
        };

        const getBulletproofFallback = async (allowedCategories: number[] = [1, 2]) => {
            const catString = allowedCategories.join(',');
            const [items]: any = await connection.query(`
                SELECT id, name, thumbnail_image, address, latitude, longitude, category_id, COALESCE(average_rating, 0) as average_rating 
                FROM businesses 
                WHERE (status = 'approved' OR status = 'pending') 
                  AND category_id IN (${catString})
                ORDER BY average_rating DESC, total_reviews DESC 
                LIMIT 50
            `);
            return items.map((item: any) => {
                const catId = Number(item.category_id);
                const cat = categoryMap[catId];
                return {
                    ...item,
                    category: cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Umum',
                    type: cat || 'unknown'
                };
            });
        };

        if (!userId) {
            const fallback = await getBulletproofFallback([1, 2]);
            return res.json({ success: true, data: fallback.slice(0, 8) });
        }

        const interactionWeights: Record<number, number> = {};

        try {
            // PERBAIKAN: Tarik juga kolom interaction_type
            const [interactions]: any = await connection.query('SELECT business_id, interaction_type FROM user_interactions WHERE user_id = ?', [userId]);
            
            interactions.forEach((i: any) => {
                const currentScore = interactionWeights[i.business_id] || 0;
                
                // Beri bobot yang berbeda!
                if (i.interaction_type === 'like') {
                    interactionWeights[i.business_id] = currentScore + 3; // Like sangat kuat (+3 Poin)
                } else if (i.interaction_type === 'visit') {
                    // Jika hanya visit, nilainya kecil (+1 Poin). 
                    // Atau Anda bisa mengubahnya jadi +0 jika tidak ingin visit dihitung sama sekali.
                    interactionWeights[i.business_id] = currentScore + 1; 
                }
            });
        } catch (e) { console.error("Gagal load interaksi", e); }

        try {
            const [reviews]: any = await connection.query('SELECT business_id, rating FROM reviews WHERE user_id = ?', [userId]);
            reviews.forEach((r: any) => {
                const currentScore = interactionWeights[r.business_id] || 0;
                if (r.rating >= 4) {
                    interactionWeights[r.business_id] = currentScore + 5; 
                } else if (r.rating <= 2) {
                    interactionWeights[r.business_id] = currentScore - 5; 
                } else {
                    interactionWeights[r.business_id] = currentScore + 2; 
                }
            });
        } catch (e) { console.error("Gagal load review", e); }

        const interactedItemIds = Object.keys(interactionWeights)
            .map(id => Number(id))
            .filter(id => (interactionWeights[id] || 0) > 0);

        if (interactedItemIds.length === 0) {
            const fallback = await getBulletproofFallback([1, 2]);
            return res.json({ success: true, data: fallback.slice(0, 8) });
        }

        const [userFeaturesQuery]: any = await connection.query(`
            SELECT b.id as business_id, b.category_id, b.subcategory_id, bt.tag_id, t.type as tag_type
            FROM businesses b
            LEFT JOIN business_tags bt ON b.id = bt.business_id
            LEFT JOIN tags t ON bt.tag_id = t.id
            WHERE b.id IN (?) AND b.category_id IN (1, 2)
        `, [interactedItemIds]);

        const userProfileTags: Record<string, number> = {}; 
        const userPreferredAreas = new Set<string>(); 
        const userCategoryCounts: Record<number, number> = { 1: 0, 2: 0 }; 
        const userSubcategoryCounts: Record<number, number> = {}; 
        const processedBusinesses = new Set(); // Untuk mencegah duplikasi poin kategori

        userFeaturesQuery.forEach((row: any) => {
            const businessWeight = interactionWeights[row.business_id] || 1;
            const catId = Number(row.category_id);
            const subCatId = row.subcategory_id ? Number(row.subcategory_id) : null;

            // HANYA tambah poin kategori jika business_id ini belum diproses dalam looping ini
            if (catId && !processedBusinesses.has(row.business_id)) {
                userCategoryCounts[catId] = (userCategoryCounts[catId] || 0) + businessWeight;
                processedBusinesses.add(row.business_id); // Tandai sudah diproses
            }

            // Poin subkategori dan tag tetap dibiarkan agar profil minat tetap tajam
            if (subCatId) {
                userSubcategoryCounts[subCatId] = (userSubcategoryCounts[subCatId] || 0) + businessWeight;
            }
            if (row.tag_id) {
                const tagKey = `tag_${row.tag_id}`;
                userProfileTags[tagKey] = 1; 
                if (row.tag_type === 'Area') {
                    userPreferredAreas.add(tagKey);
                }
            }
        });

        // ========================================================
        // RADAR DEBUGGING: Cek terminal VS Code Anda!
        // ========================================================
        console.log("\n=== RADAR AI REKOMENDASI ===");
        console.log(`User ID yang request: ${userId}`);
        console.log(`Total Poin Akomodasi dihitung: ${userCategoryCounts[1] || 0}`);
        console.log(`Total Poin Kuliner dihitung: ${userCategoryCounts[2] || 0}`);
        console.log("==============================\n");

        const [candidates]: any = await connection.query(`
            SELECT 
                b.id, b.name, b.address, b.latitude, b.longitude, b.category_id, b.subcategory_id,
                b.thumbnail_image, COALESCE(b.average_rating, 0) as average_rating, COALESCE(b.total_reviews, 0) as total_reviews,
                GROUP_CONCAT(bt.tag_id) as tags
            FROM businesses b
            LEFT JOIN business_tags bt ON b.id = bt.business_id
            WHERE b.id NOT IN (?) 
              AND (b.status = 'approved' OR b.status = 'pending')
              AND b.category_id IN (1, 2)
            GROUP BY b.id
        `, [interactedItemIds]);

        let scoredRecommendations = candidates.map((candidate: any) => {
            const candidateTags = new Set<string>();
            if (candidate.tags) {
                candidate.tags.split(',').forEach((tagId: string) => candidateTags.add(`tag_${tagId}`));
            }

            let intersectionScore = 0;
            let hasMatchingArea = false; 

            candidateTags.forEach(tag => {
                if (userProfileTags[tag]) intersectionScore += 1;
                if (Number(candidate.category_id) === 1 && userPreferredAreas.has(tag)) hasMatchingArea = true;
            });

            const userUniqueTagsCount = Object.keys(userProfileTags).length;
            const union = userUniqueTagsCount + candidateTags.size - intersectionScore;
            
            let jaccardScore = union === 0 ? 0 : intersectionScore / union;
            if (hasMatchingArea) jaccardScore += 1.0; 

            const catId = Number(candidate.category_id);
            const cat = categoryMap[catId];
            return {
                ...candidate,
                category_id: catId, // Paksa menjadi Number
                similarityScore: jaccardScore,
                category: cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Umum',
                type: cat || 'unknown'
            };
        });

        const akomodasiItems = scoredRecommendations.filter((c: any) => c.category_id === 1);
        const kulinerItems = scoredRecommendations.filter((c: any) => c.category_id === 2);

        const sortByRelevance = (a: any, b: any) => {
            const aSubScore = userSubcategoryCounts[a.subcategory_id] || 0;
            const bSubScore = userSubcategoryCounts[b.subcategory_id] || 0;
            if (bSubScore !== aSubScore) return bSubScore - aSubScore;
            if (b.similarityScore !== a.similarityScore) return b.similarityScore - a.similarityScore;
            return b.average_rating - a.average_rating;
        };

        akomodasiItems.sort(sortByRelevance);
        kulinerItems.sort(sortByRelevance);

        const scoreAkomodasi = userCategoryCounts[1] || 0;
        const scoreKuliner = userCategoryCounts[2] || 0;
        const totalScore = scoreAkomodasi + scoreKuliner;

        let finalRecommendations: any[] = [];
        let quotaKuliner = 0;
        let quotaAkomodasi = 0;

        if (totalScore > 0) {
            if (scoreAkomodasi === 0 && scoreKuliner > 0) {
                quotaKuliner = 8;
                quotaAkomodasi = 0;
            } else if (scoreKuliner === 0 && scoreAkomodasi > 0) {
                quotaAkomodasi = 8;
                quotaKuliner = 0;
            } else {
                quotaKuliner = Math.round((scoreKuliner / totalScore) * 8);
                quotaAkomodasi = 8 - quotaKuliner;

                if (kulinerItems.length < quotaKuliner) {
                    quotaKuliner = kulinerItems.length;
                    quotaAkomodasi = 8 - quotaKuliner;
                } else if (akomodasiItems.length < quotaAkomodasi) {
                    quotaAkomodasi = akomodasiItems.length;
                    quotaKuliner = 8 - quotaAkomodasi;
                }
            }

            const selectedKuliner = kulinerItems.slice(0, quotaKuliner);
            const selectedAkomodasi = akomodasiItems.slice(0, quotaAkomodasi);

            finalRecommendations = [...selectedKuliner, ...selectedAkomodasi];

            finalRecommendations.sort((a: any, b: any) => {
                const aCatScore = userCategoryCounts[a.category_id] || 0;
                const bCatScore = userCategoryCounts[b.category_id] || 0;
                if (bCatScore !== aCatScore) return bCatScore - aCatScore;
                return sortByRelevance(a, b);
            });
        }

        if (finalRecommendations.length < 8) {
            let allowedCats = [];
            if (scoreAkomodasi > 0) allowedCats.push(1);
            if (scoreKuliner > 0) allowedCats.push(2);
            
            if (allowedCats.length === 0) allowedCats = [1, 2];

            const fallbackData = await getBulletproofFallback(allowedCats); 
            const existingIds = new Set(finalRecommendations.map((i: any) => i.id));
            
            for (const item of fallbackData) {
                if (!existingIds.has(item.id) && finalRecommendations.length < 8) {
                    finalRecommendations.push(item);
                    existingIds.add(item.id);
                }
            }
        }

        finalRecommendations = finalRecommendations.map(({ tags, ...rest }: any) => rest);

        return res.json({ success: true, data: finalRecommendations });

    } catch (error) {
        console.error("Backend Error (Content-Based):", error);
        return res.status(500).json({ success: false, error: "Server error" });
    } finally {
        if (connection) connection.release();
    }
};

export const resetPersonalRecommendations = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.userId || req.user?.id;
    let connection: any;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Harap login terlebih dahulu' });
    }

    try {
        connection = await getConnection();
        
        // 1. Menghapus semua riwayat visit dan like
        await connection.query('DELETE FROM user_interactions WHERE user_id = ?', [userId]);

        // 2. TAMBAHKAN INI: Menghapus semua ulasan dan rating
        await connection.query('DELETE FROM reviews WHERE user_id = ?', [userId]);

        return res.json({ success: true, message: 'Riwayat rekomendasi berhasil direset!' });
    } catch (error) {
        console.error("Backend Error (Reset Rekomendasi):", error);
        return res.status(500).json({ success: false, error: "Gagal mereset rekomendasi" });
    } finally {
        if (connection) connection.release();
    }
};
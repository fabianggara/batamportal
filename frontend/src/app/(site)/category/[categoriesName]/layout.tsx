// 1. CREATE: frontend/src/app/(site)/category/[categoriesName]/layout.tsx
// This layout wraps all category pages

import { Metadata } from 'next';

interface Props {
    params: { categoriesName: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const categoryName = params.categoriesName;
    const capitalizedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    
    return {
        title: `${capitalizedCategory} - BatamPortal`,
        description: `Temukan ${categoryName} terbaik di Batam. Daftar lengkap dengan review, harga, dan informasi detail.`,
        keywords: `${categoryName}, batam, ${categoryName} batam, wisata batam`,
    };
}

export default function CategoryLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { categoriesName: string };
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}
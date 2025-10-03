// 1. CREATE: frontend/src/app/(site)/category/[categoriesName]/layout.tsx
// This layout wraps all category pages

import { Metadata } from 'next';

interface Props {
    params: { categoriesName: string };
}

export async function generateMetadata({ params: { categoriesName } }: Props): Promise<Metadata> {
    const capitalizedCategory = categoriesName.charAt(0).toUpperCase() + categoriesName.slice(1);
    
    return {
        title: `${capitalizedCategory} - BatamPortal`,
        description: `Temukan ${categoriesName} terbaik di Batam. Daftar lengkap dengan review, harga, dan informasi detail.`,
        keywords: `${categoriesName}, batam, ${categoriesName} batam, wisata batam`,
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
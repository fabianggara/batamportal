import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Detail Item - BatamPortal',
    description: 'Lihat detail lengkap bisnis dan destinasi di Batam',
    };

    export default function ItemDetailLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
        <div className="min-h-screen">
        {children}
        </div>
    );
}
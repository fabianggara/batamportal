// src/app/(site)/form/accommodationBook/page.tsx

import AccommodationBookForm from './AccommodationBookForm';
import React from 'react';

const BookingPage = () => {
    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8">
        {/* Kamu bisa menambahkan header atau komponen lain di sini */}
            <AccommodationBookForm />
        </div>
    );
};

export default BookingPage;
'use client'

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Building, Search } from 'lucide-react';
import Header from '../../components/Header';

// Main Body Component
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    { icon: Building, label: "Categories" },
    { icon: Building, label: "Categories" },
    { icon: Building, label: "Categories" },
    { icon: Building, label: "Categories" },
    { icon: Building, label: "Categories" },
  ];

  const recommendations = [
    {
      id: 1,
      name: "Nama",
      description: "Deskripsi Singkat kebenaranshaliahala alkahkakakakaklah",
      image: "/api/placeholder/150/100",
      tag: "Hot Deal"
    },
    {
      id: 2,
      name: "Nama",
      description: "Deskripsi Singkat kebenaranshaliahala alkahkakakakaklah",
      image: "/api/placeholder/150/100",
      tag: "Hot Deal"
    },
    {
      id: 3,
      name: "Nama",
      description: "Deskripsi Singkat kebenaranshaliahala alkahkakakakaklah",
      image: "/api/placeholder/150/100",
      tag: "Hot Deal"
    },
    {
      id: 4,
      name: "Nama",
      description: "Deskripsi Singkat kebenaranshaliahala alkahkakakakaklah",
      image: "/api/placeholder/150/100",
      tag: "Hot Deal"
    }
  ];

  const slides = [
    {
      id: 1,
      title: "WELCOME TO BATAM",
      image: "/api/placeholder/600/300",
      description: "Beautiful view of Batam city"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Include Header */}
      <Header />
      
      {/* Search Section */}
      <div className="bg-white shadow-sm p-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Cari tempat yang ingin anda kunjungi di batam"
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Categories Section */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex-shrink-0 bg-gray-600 text-white rounded-lg p-4 min-w-[120px] text-center hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <Building className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">{category.label}</span>
            </div>
          ))}
        </div>

        {/* First Recommendations Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Rekomendasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="bg-gray-300 h-32 flex items-center justify-center text-gray-600">
                    <span>Gambar</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  <button className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-orange-600 transition-colors">
                    {item.tag}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Recommendations Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Rekomendasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((item, index) => (
              <div key={`second-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="bg-gray-300 h-32 flex items-center justify-center text-gray-600">
                    <span>Gambar</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  <button className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-orange-600 transition-colors">
                    Hot Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Section */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={slide.id} className="w-full flex-shrink-0 relative">
                  <div className="h-64 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center relative">
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url('data:image/svg+xml;base64,${btoa(`
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300">
                            <defs>
                              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                              </linearGradient>
                            </defs>
                            <rect width="600" height="300" fill="url(#grad)"/>
                          </svg>
                        `)}')`
                      }}
                    />
                    <div className="relative z-10 text-center text-white">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-wider">
                        {slide.title}
                      </h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
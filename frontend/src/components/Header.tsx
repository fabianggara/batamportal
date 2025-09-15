'use client'

import React from 'react';
import { User, Bell, Settings } from 'lucide-react';

// Header Component
const Header = () => {
  return (
    <div className="bg-white shadow-sm p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">Batam</h1>
        </div>
        
        {/* User Profile Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          
          {/* Settings */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="w-6 h-6" />
          </button>
          
          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-sm font-medium text-gray-800">John Doe</span>
              <span className="text-xs text-gray-500">john@example.com</span>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
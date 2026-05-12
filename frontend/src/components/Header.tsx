"use client";

import React from 'react';
import API_URL from '@/lib/api';

export default function Header({ user }: { user: any }) {
  const handleLogout = () => {
    fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
      .then(() => {
        window.location.href = '/login';
      });
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">ReachInbox</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.name} ({user.email})</span>
            {user.avatar && (
              <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border" />
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

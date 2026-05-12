"use client";

import React from 'react';
import API_URL from '../lib/api';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">ReachInbox Scheduler</h1>
        <p className="text-gray-600 mb-8">Sign in to schedule and manage your cold email campaigns.</p>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" className="w-5 h-5 mr-3" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

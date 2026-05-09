"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import ScheduledEmails from '../../components/ScheduledEmails';
import SentEmails from '../../components/SentEmails';
import ComposeEmail from '../../components/ComposeEmail';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled'); // scheduled | sent
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    // Fetch user profile to check auth
    fetch('http://localhost:5000/auth/me', {credentials: 'include'})
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        router.push('/login');
      });
  }, [router]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Email Dashboard</h1>
          <button 
            onClick={() => setShowCompose(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
          >
            + Compose New Email
          </button>
        </div>

        <div className="bg-white rounded shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'scheduled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scheduled Emails
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sent Emails
              </button>
            </nav>
          </div>

          <div className="p-4">
            {activeTab === 'scheduled' && <ScheduledEmails refreshTrigger={showCompose} />}
            {activeTab === 'sent' && <SentEmails />}
          </div>
        </div>
      </main>

      {showCompose && <ComposeEmail onClose={() => setShowCompose(false)} />}
    </div>
  );
}

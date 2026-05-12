"use client";

import React, { useEffect, useState } from 'react';
import API_URL from '../lib/api';

export default function ScheduledEmails({ refreshTrigger }: { refreshTrigger?: any }) {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/emails/scheduled`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch scheduled emails: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then(data => {
        setEmails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshTrigger]);

  if (loading) return <div className="py-8 text-center text-gray-500">Loading...</div>;

  if (emails.length === 0) {
    return <div className="py-8 text-center text-gray-500">No scheduled emails found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {emails.map(email => (
            <tr key={email.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.recipientEmail}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.subject}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(email.scheduledTime).toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  email.status === 'scheduled' || email.status === 'queued'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {email.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

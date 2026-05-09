"use client";

import React, { useEffect, useState } from 'react';

export default function SentEmails() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/emails/sent', { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch sent emails: ${res.status} ${text}`);
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
  }, []);

  if (loading) return <div className="py-8 text-center text-gray-500">Loading...</div>;

  if (emails.length === 0) {
    return <div className="py-8 text-center text-gray-500">No sent emails found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {emails.map(email => (
            <tr key={email.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.recipientEmail}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.subject}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.sentTime ? new Date(email.sentTime).toLocaleString() : 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${email.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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

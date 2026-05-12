"use client";

import React, { useState } from 'react';
import API_URL from '../lib/api';

export default function ComposeEmail({ onClose }: { onClose: () => void }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState<{ email: string }[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [delayBetweenEmails, setDelayBetweenEmails] = useState(2000);
  const [hourlyLimit, setHourlyLimit] = useState(200);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const parsedEmails = lines.map(line => {
        const parts = line.split(',');
        const emailPart = parts.find(p => p.includes('@'));
        return emailPart ? { email: emailPart.trim() } : null;
      }).filter(Boolean) as { email: string }[];
      setRecipients(parsedEmails);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipients.length === 0) {
      alert('Please upload a valid CSV with emails.');
      return;
    }
    if (!scheduledTime) {
      alert('Please set a schedule time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/emails/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject, body, recipients, scheduledTime, delayBetweenEmails, hourlyLimit }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule emails');

      alert(`✅ ${data.count} email(s) scheduled successfully! Check the Scheduled tab.`);
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Compose &amp; Schedule Campaign</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              required
              rows={5}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV (Leads)</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {recipients.length > 0 && (
              <p className="mt-2 text-sm text-green-600 font-medium">✓ {recipients.length} valid email(s) detected</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                required
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delay Between Emails (ms)</label>
              <input
                type="number"
                min="0"
                value={delayBetweenEmails}
                onChange={e => setDelayBetweenEmails(Number(e.target.value))}
                className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Limit</label>
              <input
                type="number"
                min="1"
                value={hourlyLimit}
                onChange={e => setHourlyLimit(Number(e.target.value))}
                className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

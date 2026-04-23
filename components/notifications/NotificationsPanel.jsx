'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAccountNotifications, updateAccountNotifications } from '@/features/notifications/api/client';

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function prettify(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function NotificationsPanel({
  endpoint = '/api/account/notifications',
  emptyTitle = 'No notifications yet',
  emptyBody = 'New order, team, return, and payout updates will appear here.',
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const json = await getAccountNotifications(endpoint);
      setRows(json.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [endpoint]);

  const updateNotification = async (notificationId, status, markAllRead = false) => {
    try {
      setSaving(true);
      setError('');
      await updateAccountNotifications(markAllRead ? { markAllRead: true, status } : { notificationId, status });
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update notification');
    } finally {
      setSaving(false);
    }
  };

  const unreadCount = rows.filter((row) => row.status === 'unread').length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">Durable lifecycle updates across orders, access, reviews, and payouts.</p>
          </div>
          <button
            type="button"
            disabled={saving || unreadCount === 0}
            onClick={() => updateNotification('', 'read', true)}
            className="rounded-xl border border-[#2E6417] px-4 py-2 text-sm font-semibold text-[#2E6417] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="rounded-2xl border border-[#E8E4DC] bg-white p-5 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-500">Loading notifications...</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#fafcfb] p-8 text-center">
            <p className="text-base font-semibold text-gray-900">{emptyTitle}</p>
            <p className="mt-2 text-sm text-gray-500">{emptyBody}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className={`rounded-2xl border p-4 ${row.status === 'unread' ? 'border-[#bde0ca] bg-[#f6fbf8]' : 'border-gray-100 bg-white'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{row.title}</p>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${row.status === 'unread' ? 'bg-[#e5f6ec] text-[#2E6417]' : 'bg-gray-100 text-gray-600'}`}>
                        {prettify(row.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{row.body}</p>
                    <p className="text-xs text-gray-500">{formatDate(row.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.action_url ? (
                      <Link
                        href={row.action_url}
                        className="rounded-xl bg-[#2E6417] px-3 py-2 text-sm font-semibold text-white hover:bg-[#245213]"
                      >
                        Open
                      </Link>
                    ) : null}
                    {row.status === 'unread' ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => updateNotification(row.id, 'read')}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"
                      >
                        Mark read
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => updateNotification(row.id, 'archived')}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

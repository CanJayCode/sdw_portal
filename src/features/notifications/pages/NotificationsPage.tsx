import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getNotificationPreferences, listNotifications, markAllAsRead, markAsRead, updateNotificationPreferences, type NotificationChannel } from '../api';
import { Card, ErrorMessage, Spinner } from '@/components/ui/Feedback';

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('ALL');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => listNotifications({ limit: 30 }),
  });

  const preferencesQuery = useQuery({ queryKey: ['notification-preferences'], queryFn: getNotificationPreferences });

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const readAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const preferencesMutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-preferences'] }),
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message="Failed to load notifications." />;

  const filteredNotifications = data?.notifications.filter((notification) => {
    if (category === 'ALL') return true;
    const type = notification.type.toLowerCase();
    if (category === 'EVENTS') return type.includes('event') || type.includes('registration');
    if (category === 'ANNOUNCEMENTS') return type.includes('announcement');
    return !type.includes('event') && !type.includes('registration') && !type.includes('announcement');
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Notifications
          {!!data?.meta.unreadCount && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({data.meta.unreadCount} unread)
            </span>
          )}
        </h1>
        <button
          onClick={() => readAllMutation.mutate()}
          className="text-sm text-brand-600 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Notification categories">
        {['ALL', 'EVENTS', 'ANNOUNCEMENTS', 'SYSTEM'].map((item) => (
          <button key={item} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${category === item ? 'bg-brand-600 text-white' : 'border text-gray-500'}`}>
            {item[0] + item.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredNotifications?.map((n) => (
          <Card key={n._id} className={n.isRead ? 'opacity-60' : ''}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => readMutation.mutate(n._id)}
                  className="whitespace-nowrap text-xs text-brand-600 hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {preferencesQuery.data && Object.keys(preferencesQuery.data).length > 0 && (
        <Card className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Notification preferences</h2>
          <div className="space-y-3">
            {Object.entries(preferencesQuery.data).map(([type, channel]) => (
              <label key={type} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span>{type.replaceAll('_', ' ')}</span>
                <select value={channel} onChange={(event) => preferencesMutation.mutate({ ...preferencesQuery.data, [type]: event.target.value as NotificationChannel })} className="px-3 py-2 text-xs">
                  <option value="IN_APP">In app</option>
                  <option value="EMAIL">Email</option>
                  <option value="NONE">None</option>
                </select>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* TODO (owner of this module): notification preferences UI
          (GET/PATCH /users/me/notification-preferences), pagination */}
    </div>
  );
}

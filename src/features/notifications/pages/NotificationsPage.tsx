import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markAllAsRead, markAsRead } from '../api';
import { Card, ErrorMessage, Spinner } from '@/components/ui/Feedback';

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => listNotifications({ limit: 30 }),
  });

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const readAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage message="Failed to load notifications." />;

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

      <div className="space-y-2">
        {data?.notifications.map((n) => (
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

      {/* TODO (owner of this module): notification preferences UI
          (GET/PATCH /users/me/notification-preferences), pagination */}
    </div>
  );
}

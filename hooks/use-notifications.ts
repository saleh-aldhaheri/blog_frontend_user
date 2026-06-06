
import { useEffect, useState } from "react";
import { notificationApi } from "@/src/v1/api/notification.api";
import type { NotificationItem } from "@/src/v1/types/response/notification";

export function useNotifications(userId: number | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!userId) return;
    notificationApi.getAll().then(res => {
      setNotifications(res.data);
    }).catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let channel: any;
    const setup = async () => {
      const Echo = (await import("@/lib/echo")).default;
      channel = Echo.private(`App.Models.User.${userId}`)
        .notification((n: any) => {
          const normalized: NotificationItem = {
            id: n.id,
            name: n.name,
            avatar: n.avatar,
            message: n.message,
          };
          setNotifications(prev => {
            if (prev.some(item => item.id === normalized.id)) return prev;
            return [normalized, ...prev];
          });
        });
    };
    setup();
    return () => {
      if (channel) {
        channel.stopListening(
          ".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated"
        );
      }
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, markAsRead };
}
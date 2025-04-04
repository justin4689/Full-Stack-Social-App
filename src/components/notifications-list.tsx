"use client";

import { getNotifications, markNotificationsAsRead } from "@/actions/notification.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { NotificationType } from "@prisma/client";
import { useRouter } from "next/navigation";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadNotifications = async () => {
      const notifications = await getNotifications();
      setNotifications(notifications);
    };

    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markNotificationsAsRead([notification.id]);
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ));
    }

    // Navigate based on notification type
    switch (notification.type) {
      case NotificationType.LIKE:
      case NotificationType.COMMENT:
        if (notification.post) {
          router.push(`/post/${notification.post.id}`);
        }
        break;
      case NotificationType.FOLLOW:
        router.push(`/profile/${notification.creator.username}`);
        break;
      case NotificationType.MESSAGE:
        if (notification.message) {
          router.push(`/messages?conversation=${notification.message.conversation.id}`);
        }
        break;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case NotificationType.LIKE:
        return "liked your post";
      case NotificationType.COMMENT:
        return "commented on your post";
      case NotificationType.FOLLOW:
        return "started following you";
      case NotificationType.MESSAGE:
        return "sent you a message";
      default:
        return "interacted with you";
    }
  };

  if (!notifications.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No notifications yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <button
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={`w-full text-left p-4 rounded-lg transition-colors hover:bg-muted ${
            !notification.read ? "bg-muted/50" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <Avatar className="size-10">
              <AvatarImage src={notification.creator.image ?? "/avatar.png"} />
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {notification.creator.name ?? notification.creator.username}{" "}
                <span className="font-normal">
                  {getNotificationText(notification)}
                </span>
              </p>
              {notification.type === NotificationType.MESSAGE && notification.message && (
                <p className="text-sm text-muted-foreground truncate">
                  {notification.message.content}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt))} ago
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

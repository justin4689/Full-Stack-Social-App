"use client";

import { getNotifications } from "@/actions/notification.action";
import { useEffect, useState } from "react";

export function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      const notifications = await getNotifications();
      const unreadCount = notifications.filter((n) => !n.read).length;
      setCount(unreadCount);
    };

    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
      {count}
    </div>
  );
}

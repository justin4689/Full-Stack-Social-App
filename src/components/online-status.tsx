"use client";
import { useEffect, useState } from "react";
import { getUserOnlineStatus} from "@/actions/online-status.action";

interface OnlineStatusProps {
  userId: string;
  showLastSeen?: boolean;
}

export function OnlineStatus({ userId, showLastSeen = true }: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const result = await getUserOnlineStatus(userId);
      if (result.success && result.data) {
        setIsOnline(result.data.isOnline);
        setLastSeen(new Date(result.data.lastSeen));
      }
    };

    checkStatus();
    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${days}j`;
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full  relative ${
          isOnline ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      {showLastSeen && lastSeen && !isOnline && (
        <span className="text-sm text-gray-500 text-nowrap absolute left-10 top-0.5">
          En ligne {formatLastSeen(lastSeen)}
        </span>
      )}
    </div>
  );
}

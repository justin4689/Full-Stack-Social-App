"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { updateOnlineStatus } from "@/actions/online-status.action";

export function OnlineStatusHandler() {
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    // Mettre à jour le statut en ligne
    const updateStatus = async (isOnline: boolean) => {
      await updateOnlineStatus(user.id, isOnline);
    };

    // Mettre à jour le statut quand l'utilisateur arrive
    updateStatus(true);

    // Mettre à jour le statut quand l'utilisateur part
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateStatus(true);
      } else {
        updateStatus(false);
      }
    };

    // Mettre à jour le statut avant que l'utilisateur ne ferme la page
    const handleBeforeUnload = () => {
      updateStatus(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Nettoyer les event listeners
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updateStatus(false);
    };
  }, [user?.id]);

  return null;
}

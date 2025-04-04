"use client";

import { BellIcon, HomeIcon, MessageSquareIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import{ ModeToggle} from "@/components/ModeToggle";
import { getNotifications } from "@/actions/notification.action";
import { getUnreadMessagesCount } from "@/actions/message.action";
import { useEffect, useState } from "react";
import { OnlineStatus } from "./online-status";

function DesktopNavbar() {
  const { user } = useUser();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const loadCounts = async () => {
      // Load notifications
      const notifications = await getNotifications();
      const notifCount = notifications.filter(n => !n.read).length;
      setUnreadNotifications(notifCount);

      // Load unread messages
      const messageCount = await getUnreadMessagesCount();
      setUnreadMessages(messageCount);
    };

    if (user) {
      loadCounts();
      // Poll for updates every 30 seconds
      const interval = setInterval(loadCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/notifications" className="relative">
              <BellIcon className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {unreadNotifications}
                </div>
              )}
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/messages" className="relative">
              <MessageSquareIcon className="w-4 h-4" />
              {unreadMessages > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {unreadMessages}
                </div>
              )}
              <span className="hidden lg:inline">Messages</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link
              href={`/profile/${
                user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
          
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}
export default DesktopNavbar;
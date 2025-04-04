import { OnlineStatus } from "./online-status";
import Image from "next/image";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    image?: string;
    username: string;
  };
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border">
      <div className="relative">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name || ""}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div className="absolute -bottom-1 -right-1">
          <OnlineStatus userId={user.id} showLastSeen={false} />
        </div>
      </div>
      <div>
        <h3 className="font-semibold">{user.name}</h3>
        <p className="text-sm text-gray-500">@{user.username}</p>
      </div>
    </div>
  );
}

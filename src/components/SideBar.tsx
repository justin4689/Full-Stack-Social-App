import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { getUserByClerkId } from "@/actions/user.action";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { LinkIcon, MapPinIcon, Users2Icon } from "lucide-react";
import { OnlineStatus } from "./online-status";

async function Sidebar() {
  const authUser = await currentUser();
  if (!authUser) return <UnAuthenticatedSidebar />;

  const user = await getUserByClerkId(authUser.id);
  if (!user) return null;

  return (
    <div className="sticky top-20">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/profile/${user.username}`}
              className="flex flex-col items-center justify-center"
            >
              <Avatar className="w-20 h-20 border-2 relative">
                <AvatarImage src={user.image || "/avatar.png"} />
                {/* <OnlineStatus userId={user.id} /> */}
              </Avatar>
            

              <div className="mt-4 space-y-1">
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
            </Link>

            {user.bio && <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>}

            <div className="w-full">
              <Separator className="my-4" />
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{user._count.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <Separator orientation="vertical" />
                <div>
                  <p className="font-medium">{user._count.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
              </div>
              <Separator className="my-4" />
            </div>

            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {user.location || "No location"}
              </div>
              <div className="flex items-center text-muted-foreground">
                <LinkIcon className="w-4 h-4 mr-2 shrink-0" />
                {user.website ? (
                  <a href={`${user.website}`} className="hover:underline truncate" target="_blank">
                    {user.website}
                  </a>
                ) : (
                  "No website"
                )}
              </div>
            </div>

            {/* Section des amis en ligne */}
            {user._count.following > 0 && (
              <div className="w-full mt-4">
                <Separator className="my-4" />
                <div className="flex items-center gap-2 mb-3">
                  <Users2Icon className="w-4 h-4" />
                  <h4 className="font-medium">Amis en ligne</h4>
                </div>
                <div className="space-y-3">
                  {user.following.map((follow) => (
                    <Link
                      key={follow.followingId}
                      href={`/profile/${follow.following.username}`}
                      className="flex items-center gap-2 hover:bg-accent p-2 rounded-lg"
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={follow.following.image || "/avatar.png"} />
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 transform scale-75">
                          <OnlineStatus userId={follow.followingId} showLastSeen={false} />
                        </div>
                      </div>
                      <span className="text-sm">{follow.following.name || follow.following.username}</span>
                    </Link>
                  ))
                }</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Sidebar;

const UnAuthenticatedSidebar = () => (
  <div className="sticky top-20">
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">Welcome Back!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-4">
          Login to access your profile and connect with others.
        </p>
        <SignInButton mode="modal">
          <Button className="w-full" variant="outline">
            Login
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="w-full mt-2" variant="default">
            Sign Up
          </Button>
        </SignUpButton>
      </CardContent>
    </Card>
  </div>
);
import { ProfilePage } from "./ProfilePage";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  return <ProfilePage username={username} />;
}
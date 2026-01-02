import { getProfile } from "@/modules/auth/actions";
import { ProfilePageClient } from "./page-client";

export default async function ProfilePage() {
  const user = await getProfile();

  return <ProfilePageClient user={user} />;
}

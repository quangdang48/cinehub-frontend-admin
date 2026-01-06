import { getProfile } from "@/modules/auth/actions";
import { ProfilePageClient } from "./page-client";

// Force dynamic rendering (no static pre-rendering)
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getProfile();

  return <ProfilePageClient user={user} />;
}

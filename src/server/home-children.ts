import { cookies } from "next/headers";
import { getPrisma } from "@/data/db/client";
import { AGES_COOKIE, parseAges } from "@/domain/ages";
import { listChildren } from "@/server/family";
import { accountsAvailable, getCurrentUser } from "@/server/auth/session";

export type HomeChild = {
  id: string;
  nickname: string | null;
  birthYear: number;
  interests: string[];
  /** True when the child comes from the welcome-screen ages cookie, not a profile. */
  byAge: boolean;
};

/**
 * The children the home page personalises for: the signed-in parent's child profiles,
 * or else the ages picked on the welcome screen (device cookie). Nothing new is stored.
 */
export async function homeChildren(now: Date): Promise<HomeChild[]> {
  const user = accountsAvailable() ? await getCurrentUser() : null;
  const profiles = user ? await listChildren(getPrisma(), user.id) : [];
  if (profiles.length) {
    return profiles.map((c) => ({ id: c.id, nickname: c.nickname, birthYear: c.birthYear, interests: c.interests, byAge: false }));
  }
  const year = now.getUTCFullYear();
  return parseAges((await cookies()).get(AGES_COOKIE)?.value).map((age) => ({
    id: `age-${age}`,
    nickname: null,
    birthYear: year - age,
    interests: [],
    byAge: true,
  }));
}

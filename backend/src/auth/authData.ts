import { AuthUser } from "./types";

// In-memory database for authenticated users
export const authUsersDb: AuthUser[] = [];
export let nextAuthUserId = 1;

export function allocateAuthUserId(): number {
  return nextAuthUserId++;
}

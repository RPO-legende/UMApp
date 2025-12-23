export interface User {
  id: number;
  name: string;
}

export const usersDb: User[] = [];
export let nextUserId = 1;

export function allocateUserId(): number {
  return nextUserId++;
}

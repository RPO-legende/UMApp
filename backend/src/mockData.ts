export interface MockUser {
  id: number;
  name: string;
}

export const usersDb: MockUser[] = [];
export let nextUserId = 1;

export function allocateUserId(): number {
  return nextUserId++;
}

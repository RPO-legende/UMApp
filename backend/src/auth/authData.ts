import sql from "../db";
import { UserProfile } from "./types";

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const users = await sql`
    SELECT user_id as id, email, first_name as name, password_hash as "passwordHash"
    FROM RPO_Projekt."user"
    WHERE email = ${email}
  `;
  return users.length > 0 ? (users[0] as UserProfile) : null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: number): Promise<UserProfile | null> {
  const users = await sql`
    SELECT user_id as id, email, first_name as name, password_hash as "passwordHash"
    FROM RPO_Projekt."user"
    WHERE user_id = ${id}
  `;
  return users.length > 0 ? (users[0] as UserProfile) : null;
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  name: string,
  passwordHash: string
): Promise<UserProfile> {
  const result = await sql`
    INSERT INTO RPO_Projekt."user" (email, first_name, password_hash)
    VALUES (${email}, ${name}, ${passwordHash})
    RETURNING user_id as id, email, first_name as name, password_hash as "passwordHash"
  `;
  return result[0] as UserProfile;
}

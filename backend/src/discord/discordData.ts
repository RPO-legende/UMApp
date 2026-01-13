import sql from "../db"

export type DiscordServer = {
  id: number
  inviteUrl: string
  name: string
  iconUrl?: string
  createdAt: string
  createdByUserId?: number
}

export async function listDiscordServers(): Promise<DiscordServer[]> {
  const rows = await sql`
    SELECT
      discord_server_id as id,
      invite_url as "inviteUrl",
      name,
      icon_url as "iconUrl",
      created_at as "createdAt",
      "FK_created_by_user_id" as "createdByUserId"
    FROM RPO_Projekt.discord_server
    ORDER BY created_at DESC
  `
  return rows as DiscordServer[]
}

export async function findDiscordServerByInvite(inviteUrl: string): Promise<DiscordServer | null> {
  const rows = await sql`
    SELECT
      discord_server_id as id,
      invite_url as "inviteUrl",
      name,
      icon_url as "iconUrl",
      created_at as "createdAt",
      "FK_created_by_user_id" as "createdByUserId"
    FROM RPO_Projekt.discord_server
    WHERE invite_url = ${inviteUrl}
    LIMIT 1
  `
  return rows.length ? (rows[0] as DiscordServer) : null
}

export async function createDiscordServer(input: {
  inviteUrl: string
  name: string
  iconUrl?: string
  createdByUserId?: number
}): Promise<DiscordServer> {
  const rows = await sql`
    INSERT INTO RPO_Projekt.discord_server (invite_url, name, icon_url, "FK_created_by_user_id")
    VALUES (${input.inviteUrl}, ${input.name}, ${input.iconUrl ?? null}, ${input.createdByUserId ?? null})
    RETURNING
      discord_server_id as id,
      invite_url as "inviteUrl",
      name,
      icon_url as "iconUrl",
      created_at as "createdAt",
      "FK_created_by_user_id" as "createdByUserId"
  `
  return rows[0] as DiscordServer
}

export async function deleteDiscordServer(id: number): Promise<boolean> {
  const rows = await sql`
    DELETE FROM RPO_Projekt.discord_server
    WHERE discord_server_id = ${id}
    RETURNING discord_server_id
  `
  return rows.length > 0
}

export async function isUserAdmin(userId: number): Promise<boolean> {
  const rows = await sql`
    SELECT 1
    FROM RPO_Projekt.user_role ur
    JOIN RPO_Projekt.role r ON ur.FK_role_id = r.role_id
    WHERE ur.FK_user_id = ${userId}
      AND r.role_name = 'admin'
      AND (ur.valid_from IS NULL OR ur.valid_from <= CURRENT_DATE)
      AND (ur.valid_to IS NULL OR ur.valid_to >= CURRENT_DATE)
    LIMIT 1
  `
  return rows.length > 0
}

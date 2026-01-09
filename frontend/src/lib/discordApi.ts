const API = "/api"

export type DiscordServer = {
  id: string
  inviteUrl: string
  name: string
  iconUrl?: string
  addedAt: string
}

async function handle(res: Response) {
  if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`)
  const ct = res.headers.get("content-type") || ""
  return ct.includes("application/json") ? res.json() : res.text()
}

export const DiscordApi = {
  listServers: async (): Promise<DiscordServer[]> => handle(await fetch(`${API}/discord`)),
  addServer: async (inviteUrl: string, adminToken?: string): Promise<DiscordServer> =>
    handle(
      await fetch(`${API}/discord`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-um-admin": adminToken } : {}),
        },
        body: JSON.stringify({ inviteUrl }),
      })
    ),
  removeServer: async (id: string, adminToken?: string): Promise<void> => {
    await handle(
      await fetch(`${API}/discord/${id}`, {
        method: "DELETE",
        headers: {
          ...(adminToken ? { "x-um-admin": adminToken } : {}),
        },
      })
    )
  },
}

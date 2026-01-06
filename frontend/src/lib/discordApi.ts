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
  addServer: async (inviteUrl: string): Promise<DiscordServer> =>
    handle(
      await fetch(`${API}/discord`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteUrl }),
      })
    ),
}

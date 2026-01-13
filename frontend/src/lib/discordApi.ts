import { apiDelete, apiGet, apiPost } from "@/lib/api"

export type DiscordServer = {
  id: number
  inviteUrl: string
  name: string
  iconUrl?: string
  createdAt: string
  createdByUserId?: number
}

export const DiscordApi = {
  listServers: async (): Promise<DiscordServer[]> => apiGet("/discord"),
  addServer: async (inviteUrl: string): Promise<DiscordServer> =>
    apiPost("/discord", { inviteUrl }),
  removeServer: async (id: number): Promise<void> => {
    await apiDelete(`/discord/${id}`)
  },
  adminStatus: async (): Promise<{ isAdmin: boolean }> => apiGet("/discord/admin"),
}

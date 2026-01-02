import { Body, Controller, Get, Post, Route, Tags } from "tsoa"
import { addServer, listServers, type DiscordServer } from "./discordStore"
import { fetchDiscordMeta, normalizeInviteUrl } from "./discordMeta"

class CreateDiscordServerDto {
  /**
   * Discord invite URL (discord.gg/..., discord.com/invite/...)
   */
  public inviteUrl!: string
}

@Route("discord")
@Tags("Discord")
export class DiscordController extends Controller {
  @Get("/")
  public async getServers(): Promise<DiscordServer[]> {
    return listServers()
  }

  @Post("/")
  public async createServer(@Body() body: CreateDiscordServerDto): Promise<DiscordServer> {
    const normalized = normalizeInviteUrl(body.inviteUrl || "")

    let name = normalized
    let iconUrl: string | undefined
    try {
      const meta = await fetchDiscordMeta(normalized)
      name = meta.name
      iconUrl = meta.iconUrl
    } catch {
      // Keep fallback values if metadata fetch fails.
    }

    const created = await addServer({ inviteUrl: normalized, name, iconUrl })
    this.setStatus(201)
    return created
  }
}

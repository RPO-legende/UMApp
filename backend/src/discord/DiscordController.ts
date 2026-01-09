import { Body, Controller, Delete, Get, Post, Request, Route, Tags, Path as TPath } from "tsoa"
import express from "express"
import { addServer, listServers, removeServer, type DiscordServer } from "./discordStore"
import { fetchDiscordMeta, normalizeInviteUrl } from "./discordMeta"

class CreateDiscordServerDto {
  /**
   * Discord invite URL (discord.gg/..., discord.com/invite/...)
   */
  public inviteUrl!: string
}

const ADMIN_TOKENS = new Set(["umapp-admin"])

function requireAdmin(req: express.Request) {
  const token = String(req.header("x-um-admin") || "")
  if (!ADMIN_TOKENS.has(token)) {
    throw Object.assign(new Error("Admin access required"), { status: 403 })
  }
}

@Route("discord")
@Tags("Discord")
export class DiscordController extends Controller {
  @Get("/")
  public async getServers(): Promise<DiscordServer[]> {
    return listServers()
  }

  @Post("/")
  public async createServer(
    @Body() body: CreateDiscordServerDto,
    @Request() req: express.Request
  ): Promise<DiscordServer> {
    requireAdmin(req)
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

  @Delete("{id}")
  public async deleteServer(
    @TPath() id: string,
    @Request() req: express.Request
  ): Promise<{ ok: true }> {
    requireAdmin(req)
    const removed = await removeServer(id)
    if (!removed) {
      this.setStatus(404)
      throw new Error("Server not found")
    }
    return { ok: true }
  }
}

import { Body, Controller, Delete, Get, Path, Post, Request, Route, Security, Tags } from "tsoa"
import type { Request as ExpressRequest } from "express"
import { fetchDiscordMeta, normalizeInviteUrl } from "./discordMeta"
import {
  createDiscordServer,
  deleteDiscordServer,
  findDiscordServerByInvite,
  isUserAdmin,
  listDiscordServers,
  type DiscordServer,
} from "./discordData"
import { UserProfile } from "../auth/types"

class CreateDiscordServerDto {
  /**
   * Discord invite URL (discord.gg/..., discord.com/invite/...)
   */
  public inviteUrl!: string
}

async function ensureAdmin(user?: UserProfile) {
  if (!user) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 })
  }
  const isAdmin = await isUserAdmin(user.id)
  if (!isAdmin) {
    throw Object.assign(new Error("Admin access required"), { status: 403 })
  }
}

@Route("discord")
@Tags("Discord")
export class DiscordController extends Controller {
  @Get("/")
  public async list(): Promise<DiscordServer[]> {
    return listDiscordServers()
  }

  @Get("admin")
  @Security("jwt")
  public async adminStatus(@Request() request: ExpressRequest): Promise<{ isAdmin: boolean }> {
    const user = request.user as UserProfile | undefined
    if (!user) {
      this.setStatus(401)
      throw new Error("Unauthorized")
    }
    const isAdmin = await isUserAdmin(user.id)
    return { isAdmin }
  }

  @Post("/")
  @Security("jwt")
  public async create(
    @Body() body: CreateDiscordServerDto,
    @Request() request: ExpressRequest
  ): Promise<DiscordServer> {
    await ensureAdmin(request.user as UserProfile | undefined)
    const normalized = normalizeInviteUrl(body.inviteUrl || "")

    const existing = await findDiscordServerByInvite(normalized)
    if (existing) return existing

    let name = normalized
    let iconUrl: string | undefined
    try {
      const meta = await fetchDiscordMeta(normalized)
      name = meta.name
      iconUrl = meta.iconUrl
    } catch {
      // Keep fallback values if metadata fetch fails.
    }

    const createdByUserId = (request.user as UserProfile | undefined)?.id
    const created = await createDiscordServer({
      inviteUrl: normalized,
      name,
      iconUrl,
      createdByUserId,
    })
    this.setStatus(201)
    return created
  }

  @Delete("{id}")
  @Security("jwt")
  public async remove(
    @Path() id: number,
    @Request() request: ExpressRequest
  ): Promise<{ ok: true }> {
    await ensureAdmin(request.user as UserProfile | undefined)
    const removed = await deleteDiscordServer(id)
    if (!removed) {
      this.setStatus(404)
      throw new Error("Server not found")
    }
    return { ok: true }
  }
}

import fs from "fs/promises"
import fssync from "fs"
import path from "path"
import crypto from "crypto"

export type DiscordServer = {
  id: string
  inviteUrl: string
  name: string
  iconUrl?: string
  addedAt: string
}

type DiscordIndex = { servers: DiscordServer[] }

const STORAGE_DIR = "./storage"
const INDEX_DIR = path.join(STORAGE_DIR, "_index")
const INDEX_FILE = path.join(INDEX_DIR, "discord.json")

async function ensureDiscordStore() {
  await fs.mkdir(INDEX_DIR, { recursive: true })
  if (!fssync.existsSync(INDEX_FILE)) {
    await fs.writeFile(INDEX_FILE, JSON.stringify({ servers: [] }, null, 2), "utf-8")
  }
}

async function readIndex(): Promise<DiscordIndex> {
  await ensureDiscordStore()
  const raw = await fs.readFile(INDEX_FILE, "utf-8").catch(() => `{"servers":[]}`)
  const parsed = JSON.parse(raw)
  return { servers: Array.isArray(parsed.servers) ? parsed.servers : [] }
}

async function writeIndex(index: DiscordIndex) {
  await ensureDiscordStore()
  const tmp = INDEX_FILE + ".tmp"
  await fs.writeFile(tmp, JSON.stringify(index, null, 2), "utf-8")
  await fs.rename(tmp, INDEX_FILE)
}

export async function listServers(): Promise<DiscordServer[]> {
  const index = await readIndex()
  return index.servers
}

export async function addServer(data: Omit<DiscordServer, "id" | "addedAt">): Promise<DiscordServer> {
  const index = await readIndex()
  const existing = index.servers.find((s) => s.inviteUrl === data.inviteUrl)
  if (existing) return existing

  const server: DiscordServer = {
    id: crypto.randomUUID(),
    inviteUrl: data.inviteUrl,
    name: data.name,
    iconUrl: data.iconUrl,
    addedAt: new Date().toISOString(),
  }

  index.servers.push(server)
  await writeIndex(index)
  return server
}

type DiscordMeta = {
  name: string
  iconUrl?: string
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function extractInviteCode(inviteUrl: string) {
  try {
    const url = new URL(inviteUrl)
    const host = url.hostname.toLowerCase()
    if (host === "discord.gg" || host === "www.discord.gg") {
      const code = url.pathname.split("/").filter(Boolean)[0]
      return code || null
    }
    if (host === "discord.com" || host === "www.discord.com") {
      const parts = url.pathname.split("/").filter(Boolean)
      if (parts[0] === "invite" && parts[1]) return parts[1]
    }
  } catch {
    return null
  }
  return null
}

async function fetchInviteApi(inviteUrl: string): Promise<DiscordMeta | null> {
  const code = extractInviteCode(inviteUrl)
  if (!code) return null

  const apiUrl = `https://discord.com/api/v9/invites/${code}?with_counts=true&with_expiration=true`
  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent": "UMAppBot/1.0",
    },
  })
  if (!res.ok) return null

  const data = await res.json().catch(() => null)
  const guild = data?.guild
  if (!guild?.name) return null

  const iconUrl = guild.id && guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
    : undefined

  return { name: guild.name, iconUrl }
}

function getMetaContent(html: string, key: string) {
  const re = new RegExp(
    `<meta\\s+[^>]*?(?:property|name)=[\"']${escapeRegExp(key)}[\"'][^>]*?>`,
    "i"
  )
  const tag = html.match(re)?.[0]
  if (!tag) return undefined
  const contentMatch = tag.match(/content=["']([^"']+)["']/i)
  return contentMatch?.[1]
}

function getTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match?.[1]
}

function cleanTitle(title: string) {
  return title
    .replace(/^\s*Join\s+the\s+/i, "")
    .replace(/\s*\|\s*Discord\s*$/i, "")
    .replace(/\s*-\s*Discord\s*$/i, "")
    .trim()
}

export function normalizeInviteUrl(input: string) {
  const trimmed = input.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let url: URL
  try {
    url = new URL(withProtocol)
  } catch {
    throw Object.assign(new Error("Invalid Discord invite URL"), { status: 400 })
  }

  const host = url.hostname.toLowerCase()
  const isDiscordHost = host === "discord.gg" || host === "www.discord.gg" || host === "discord.com" || host === "www.discord.com"
  if (!isDiscordHost) {
    throw Object.assign(new Error("Invalid Discord invite URL"), { status: 400 })
  }

  if ((host === "discord.com" || host === "www.discord.com") && !url.pathname.startsWith("/invite/")) {
    throw Object.assign(new Error("Invalid Discord invite URL"), { status: 400 })
  }

  const path = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "")
  if (!path) {
    throw Object.assign(new Error("Invalid Discord invite URL"), { status: 400 })
  }

  return `${url.origin}/${path}`
}

export async function fetchDiscordMeta(inviteUrl: string): Promise<DiscordMeta> {
  const apiMeta = await fetchInviteApi(inviteUrl).catch(() => null)
  if (apiMeta) return apiMeta

  const res = await fetch(inviteUrl, {
    headers: {
      "User-Agent": "UMAppBot/1.0",
    },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch invite metadata (${res.status})`)
  }
  const html = await res.text()

  const title =
    getMetaContent(html, "og:title") ||
    getMetaContent(html, "twitter:title") ||
    getTitle(html) ||
    inviteUrl

  const image =
    getMetaContent(html, "og:image") ||
    getMetaContent(html, "twitter:image")

  const name = cleanTitle(title)
  return { name: name || inviteUrl, iconUrl: image }
}

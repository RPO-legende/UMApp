import { useEffect, useMemo, useState } from "react"
import { DiscordApi, type DiscordServer } from "@/lib/discordApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ServerAvatar({ server }: { server: DiscordServer }) {
  const fallback = useMemo(() => server.name?.trim()?.[0]?.toUpperCase() || "D", [server.name])
  return (
    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
      {server.iconUrl ? (
        <img src={server.iconUrl} alt={server.name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-semibold">{fallback}</span>
      )}
    </div>
  )
}

function ServerCard({ server }: { server: DiscordServer }) {
  return (
    <Card className="rounded-2xl group">
      <CardContent className="flex items-center gap-3 py-4">
        <ServerAvatar server={server} />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{server.name}</p>
          <p className="text-xs text-muted-foreground truncate">{server.inviteUrl}</p>
        </div>
        <Button asChild className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
          <a href={server.inviteUrl} target="_blank" rel="noreferrer">
            Invite
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

function AddServerDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [inviteUrl, setInviteUrl] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  const canSubmit = inviteUrl.trim().length > 6 && !busy

  async function submit() {
    setErr("")
    setBusy(true)
    try {
      await DiscordApi.addServer(inviteUrl.trim())
      setInviteUrl("")
      setOpen(false)
      onAdded()
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add server")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">Add server</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Discord server</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Invite link</Label>
            <Input
              placeholder="https://discord.gg/your-invite"
              value={inviteUrl}
              onChange={(e) => setInviteUrl(e.target.value)}
            />
          </div>
          {err ? <p className="text-sm text-destructive">{err}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={submit} disabled={!canSubmit}>
              {busy ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function DiscordPage() {
  const [servers, setServers] = useState<DiscordServer[]>([])
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setErr("")
      setLoading(true)
      setServers(await DiscordApi.listServers())
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load servers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Discord</h1>
          <p className="text-sm text-muted-foreground">University Discord servers.</p>
        </div>
        <AddServerDialog onAdded={load} />
      </div>

      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}

      <div className="grid sm:grid-cols-2 gap-4">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>

      {!loading && servers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No servers yet. Add the first one.</p>
      ) : null}
    </div>
  )
}

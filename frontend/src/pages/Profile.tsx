import { useEffect, useState } from "react"
import { ProfileApi, type ProfileNote, type ProfileResponse } from "@/lib/profileApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function ProfileNoteCard({ note }: { note: ProfileNote }) {
  const isApproved = note.status === "APPROVED"

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base flex-1">{note.title}</CardTitle>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {note.status}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {note.description ? <p className="text-sm text-muted-foreground">{note.description}</p> : null}

        <div className="text-xs text-muted-foreground space-y-1">
          <div>Predmet: {note.courseId}</div>
          <div>Program: {note.programId} • Letnik: {note.year}</div>
          <div>Naloženo: {new Date(note.createdAt).toLocaleString()}</div>
          <div>Datoteka: {note.originalFilename}</div>
        </div>

        <Button asChild className="rounded-xl">
          <a href={note.downloadUrl} target="_blank" rel="noreferrer">
            Download
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setErr("")
      setLoading(true)

      // quick client-side check (optional)
      // const token = localStorage.getItem("token")
      // if (!token) {
      //   throw new Error("Niste prijavljeni (manjka JWT token).")
      // }

      const data = await ProfileApi.me()
      setProfile(data)
    } catch (e: any) {
      setProfile(null)
      setErr(e?.message ?? "Failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Profil</h1>
          <p className="text-sm text-muted-foreground">Pregled vaših podatkov in naloženih zapiskov.</p>
        </div>

        <Button variant="outline" className="rounded-xl" onClick={load}>
          Osveži
        </Button>
      </div>

      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Nalagam...</p> : null}

      {profile ? (
        <>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Osnovni podatki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span> {profile.id}
              </div>
              <div>
                <span className="text-muted-foreground">Ime:</span> {profile.name}
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span> {profile.email}
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-semibold">Moji zapiski</h2>
            <p className="text-sm text-muted-foreground">Vsi zapiski, ki ste jih naložili (APPROVED + PENDING).</p>
          </div>

          {profile.notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nimate še naloženih zapiskov.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {profile.notes.map((n) => (
                <ProfileNoteCard key={n.id} note={n} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

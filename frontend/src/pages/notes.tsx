import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { NotesApi, type Course, type Note, type Program } from "@/lib/notesApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

//Začasni pogled za admina.
const isAdmin = true

function NoteCard({ note }: { note: Note }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <CardTitle className="text-base flex-1">{note.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {note.description ? <p className="text-sm text-muted-foreground">{note.description}</p> : null}
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <span>{new Date(note.createdAt).toLocaleString()}</span>
        </div>
        <Button asChild className="rounded-xl">
          <a href={note.downloadUrl} target="_blank" rel="noreferrer">
            Download
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}function ApproveNoteCard({
  note,
  onApprove,
  onRemove,
  
}: {
  note: Note
  onApprove: (id: string) => void | Promise<void>
  onRemove: (id: string) => void | Promise<void>

}) {
  const isApproved = note.status === "APPROVED"

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex-1">{note.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {note.description && (
          <p className="text-sm text-muted-foreground">{note.description}</p>
        )}

        <div className="text-xs text-muted-foreground">
          {new Date(note.createdAt).toLocaleString()}
        </div>

        <div className="flex flex-wrap gap-2">
          {!isApproved && (
            <Button
              className="rounded-xl"
              onClick={() => onApprove(note.id)}
            >
              Approve
            </Button>
          )}

          <Button
            variant="destructive"
            className="rounded-xl"
            onClick={() => onRemove(note.id)}

          >
            Remove
          </Button>

          <Button asChild className="rounded-xl">
            <a href={note.downloadUrl} target="_blank" rel="noreferrer">
              Download
            </a>
          </Button>
        </div>

        {isApproved && (
          <p className="text-xs text-green-600 font-medium">
            Approved
          </p>
        )}
      </CardContent>
    </Card>
  )
}





function UploadDialog({
  programId,
  year,
  courseId,
  onDone,
}: {
  programId: string
  year: number
  courseId: string
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  const canSubmit = title.trim().length > 1 && !!file && !busy

  async function submit() {
    if (!file) return
    setErr("")
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append("programId", programId)
      fd.append("year", String(year))
      fd.append("courseId", courseId)
      fd.append("title", title)
      fd.append("description", description)
      fd.append("file", file)

      await NotesApi.uploadNote(fd)

      setTitle("")
      setDescription("")
      setFile(null)
      setOpen(false)
      onDone()
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">Upload</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Upload zapiskov</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Naslov</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="npr. Kolokvij 1" />
          </div>

          <div className="space-y-2">
            <Label>Opis (opcijsko)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

       

          <div className="space-y-2">
            <Label>Datoteka</Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {err ? <p className="text-sm text-destructive">{err}</p> : null}

          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)} disabled={busy}>
              Prekliči
            </Button>
            <Button className="rounded-xl" onClick={submit} disabled={!canSubmit}>
              {busy ? "Nalagam..." : "Pošlji v pregled"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


/** PAGE 1: /notes */
export function NotesProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [err, setErr] = useState("")
  useEffect(() => {
    ;(async () => {
      try {
        setErr("")
        setPrograms(await NotesApi.getPrograms())
      } catch (e: any) {
        setErr(e?.message ?? "Failed")
      }
    })()
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Zapiski</h1>
        <p className="text-sm text-muted-foreground">Izberi smer in letnik.</p>
      </div>

      {err ? <p className="text-sm text-destructive">{err}</p> : null}

      <div className="grid sm:grid-cols-2 gap-4">
        {programs.map((p) => (
          <Card key={p.id} className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[...Array(p.yearsC).keys()].map((i) => {
            const y = i + 1
            return (
                <Button key={y} variant="outline" className="rounded-xl" asChild>
                <Link to={`/notes/program/${p.id}/year/${y}`}>{y}. letnik</Link>
                </Button>
            )
            })}

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/** PAGE 2: /notes/program/:programId/year/:yearId */
export function NotesCoursesPage() {
  const { programId = "", yearId = "1" } = useParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [err, setErr] = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        setErr("")
        setCourses(await NotesApi.getCourses(programId, yearId))
      } catch (e: any) {
        setErr(e?.message ?? "Failed")
      }
    })()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Predmeti</h1>
          <p className="text-sm text-muted-foreground">
            Program: <span className="font-medium">{programId}</span>, letnik: <span className="font-medium">{yearId}</span>
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" asChild>
          <Link to="/notes">Nazaj</Link>
        </Button>
      </div>

      {err ? <p className="text-sm text-destructive">{err}</p> : null}

      <div className="grid sm:grid-cols-2 gap-4">
        {courses.map((c) => (
          <Card key={c.id} className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{c.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{c.id}</p>
              <Button className="rounded-xl" asChild>
                <Link to={
                  isAdmin ? `/notes/moderation/program/${programId}/year/${yearId}/course/${c.id}`
                  :`/notes/program/${programId}/year/${yearId}/course/${c.id}`
                  }>Odpri</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/** PAGE 3: /notes/program/:programId/year/:yearId/course/:courseId */
export function NotesCoursePage() {
  const { courseId = "", programId = "", yearId = "1" } = useParams()
  const [notes, setNotes] = useState<Note[]>([])
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setErr("")
      setLoading(true)
      setNotes(await NotesApi.getApprovedNotes(courseId))
    } catch (e: any) {
      setErr(e?.message ?? "Failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])


const yearNumber = Number(yearId)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Zapiski</h1>
          <p className="text-sm text-muted-foreground">Predmet: {courseId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/notes">Smeri</Link>
          </Button>
          <UploadDialog programId={programId} year={yearNumber} courseId={courseId} onDone={load} />
        </div>
      </div>

      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Nalagam...</p> : null}

      <div className="grid sm:grid-cols-2 gap-4">
        {notes.map((n) => (
          <NoteCard key={n.id} note={n} />
        ))}
      </div>

      {!loading && notes.length === 0 ? <p className="text-sm text-muted-foreground">Ni še odobrenih zapiskov.</p> : null}
    </div>
  )
}


/** PAGE 4: /notes/moderation/p/:programId/y/:year/course/:courseId */
export function NotesCourseModerationPage() {
  const { courseId = "", programId = "", yearId = "1" } = useParams()
  const [notes, setNotes] = useState<Note[]>([])
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(true)
  async function load() {
    try {
      setErr("")
      setLoading(true)
      const data = await NotesApi.getAllNotes(courseId)
      setNotes(data)
    } catch (e: any) {
      setErr(e?.message ?? "Failed")
    } finally {
      setLoading(false)
    }
  }

const yearNumber = Number(yearId)
  useEffect(() => {
    load()
  }, [])

 async function handleApprove(id: string) {

  try {
    await NotesApi.approve(id)
     
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, status: "APPROVED" } : note
      )
    )
  } catch {
    
  }
}
async function handleRemove(id: string) {
  
  try {
    await NotesApi.remove(id)
    setNotes((prev) => prev.filter((note) => note.id !== id))
  } catch{

  }
}
  return (
      <div className="space-y-4">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Zapiski</h1>
          <p className="text-sm text-muted-foreground">Predmet: {courseId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/notes">Smeri</Link>
          </Button>
          <UploadDialog programId={programId} year={yearNumber} courseId={courseId} onDone={load} />
        </div>
      </div>
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Nalagam...</p> : null}
      <div className="grid sm:grid-cols-2 gap-4">
        {notes.map((note) => (
            <ApproveNoteCard
                key={note.id}
                note={note}
                onApprove={handleApprove}
                onRemove={handleRemove}

            />
            ))}
      </div>
      {!loading && notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ni še  zapiskov.</p>
      ) : null}
    </div>
  )
}


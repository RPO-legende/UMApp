const API = "/api"
export type Program = { id: string; name: string; yearsC: number}
export type Course = { id: string; name: string; programId: string; year: number }
export type NoteStatus = "APPROVED" | "PENDING" 

export type Note = {
  id: string
  title: string
  description?: string
  createdAt: string
  status: NoteStatus
  mimeType: string
  sizeBytes: number
  downloadUrl: string
  programId?: string
  year?: number
  courseId?: string
  uploaderIp?: string
}


//Handler za fetche, preveri če je error in potem če ni vrne json ali pa tekst
async function handle(res: Response) {
  if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`)
  const ct = res.headers.get("content-type") || ""
  return ct.includes("application/json") ? res.json() : res.text()
}

export const NotesApi = {
  //Klici api
  getPrograms: async (): Promise<Program[]> => handle(await fetch(`${API}/programs`)),

  getCourses: async (programId: string, year: string | number): Promise<Course[]> =>
    handle(await fetch(`${API}/programs/${programId}/years/${year}/courses`)),
  getApprovedNotes: async (courseId: string): Promise<Note[]> =>
    handle(await fetch(`${API}/notes/courses/${courseId}/notes`)),
  getPendingNotes: async(courseId: string): Promise<Note[]> =>
    handle(await fetch(`${API}/notes/moderation/${courseId}/notes`)),
  getAllNotes: async (courseId: string): Promise<Note[]> =>
    handle(await fetch(`${API}/notes/courses/${courseId}/notes/all`)),
  uploadNote: async (form: FormData): Promise<{ id: string; status: NoteStatus }> => {
    const res = await fetch(`${API}/notes/upload`, {
      method: "POST",
      body: form,
    })
    return handle(res)
  },
  approve: async (id: string): Promise<void> => {
    await handle(
      await fetch(`${API}/notes/${id}/approve`, { method: "POST" })
    )
  },
  remove: async (id: string): Promise<void> => {
    await handle(
      await fetch(`${API}/notes/${id}`, {
        method: "DELETE"
      })
    )
  },
}

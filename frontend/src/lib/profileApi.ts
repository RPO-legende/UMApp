const API = "/api"

export type ProfileNote = {
  id: string
  title: string
  description?: string
  createdAt: string
  status: "APPROVED" | "PENDING"
  courseId: string
  programId: string
  year: number
  mimeType: string
  sizeBytes: number
  originalFilename: string
  downloadUrl: string
}

export type ProfileResponse = {
  id: number
  email: string
  name: string
  notes: ProfileNote[]
}

// same handle() style as NotesApi
async function handle(res: Response) {
  if (!res.ok) throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`)
  const ct = res.headers.get("content-type") || ""
  return ct.includes("application/json") ? res.json() : res.text()
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const ProfileApi = {
  me: async (): Promise<ProfileResponse> =>
    handle(
      await fetch(`${API}/profile/me`, {
        headers: {
          ...authHeaders(),
        },
      })
    ),
}

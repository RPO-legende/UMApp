import fs from "fs/promises"
import fssync from "fs"
import path from "path"
import crypto from "crypto"



export type NoteStatus = "PENDING" | "APPROVED"

export type NoteMeta = {
  id: string
  programId: string
  year: number
  courseId: string
  title: string
  description?: string
  originalFilename: string
  mimeType: string
  sizeBytes: number
  status: NoteStatus
  createdAt: string 
 
}

//glavni direktorij
export const STORAGE_DIR = "./storage" 
//struktura zapiskovnega direktorija
export function noteFolder(
  status: NoteStatus,
  programId: string,
  year: number,
  courseId: string,
  noteId: string
) {
  return path.join(STORAGE_DIR, baseDir(status), programId, String(year), courseId, noteId)
}

//preveri če spada v pending ali aproved
function baseDir(status: NoteStatus) {
  return status === "PENDING" ? "pending" : "approved"
}
//generira id za zapisek
export function newId() {
  return crypto.randomUUID()
}
//Failsafe funkcija, da se pravilno shrani datoteka, da slučajno ne pride do napake med premikom, ustvarjanju ali brisanju zapiskov.
export function safeName(name: string) {
  return name.replace(/[^\w.\-()+ ]+/g, "_")
}
//Ustvari začetne direktorije
export async function ensureDirs() {

  await fs.mkdir(STORAGE_DIR, { recursive: true })  
  await fs.mkdir(path.join(STORAGE_DIR, "pending"), { recursive: true })
  await fs.mkdir(path.join(STORAGE_DIR, "approved"), { recursive: true })
  const indexDir = path.join(STORAGE_DIR, "_index")
  await fs.mkdir(indexDir, { recursive: true })
  const indexFile = path.join(indexDir, "notes.json")
  if (!fssync.existsSync(indexFile)) {
    await fs.writeFile(indexFile, JSON.stringify({ notes: [] }, null, 2), "utf-8")
  }
}
//prepbere glavno index datoteko
async function readIndex(): Promise<{ notes: any[] }> {
  const index = path.join(STORAGE_DIR, "_index", "notes.json")
  const jsonIndex = await fs.readFile(index, "utf-8").catch(() => `{"notes":[]}`)
  return JSON.parse(jsonIndex)
}
//zapise note v glavni index
async function writeIndex(indexId: { notes: any[] }) {
  const index = path.join(STORAGE_DIR, "_index", "notes.json")
  const tmp = index + ".tmp"
  await fs.writeFile(tmp, JSON.stringify(indexId, null, 2), "utf-8")
  await fs.rename(tmp, index)
}
//izbrise note iz glavnega indexa
async function deleteNoteIndex(indexId: string)
{
    const data = await readIndex()
    if(!data.notes)
    {
        throw new Error("data is not an object")
    }
    const numberOfNotes = data.notes.length
    data.notes = data.notes.filter((note:any) => note.id !== indexId)
    if(numberOfNotes === data.notes.length)
    {
        throw new Error("this note doesn't exist")
    }
    await writeIndex(data)
}
//sprozi se na server.ts download za datoteko
export function toDownloadUrl(noteId: string) {
  return `/api/notes/${noteId}/download`
}
//Sprejme meta podatek in ga shrani v glavni index
export async function addToIndex(meta: NoteMeta, fileRelPath: string) {
  const index = await readIndex()
  index.notes.push({
    id: meta.id,
    programId: meta.programId,
    year: meta.year,
    courseId: meta.courseId,
    title: meta.title,
    description: meta.description ?? "",
    status: meta.status,
    mimeType: meta.mimeType,
    sizeBytes: meta.sizeBytes,
    createdAt: meta.createdAt,
    fileRelPath,
  })
  await writeIndex(index)
}
//Spremeni status iz pending v approved v glavnem indeks in njegovo relativno pot
export async function updateIndexStatus(noteId: string, status: NoteStatus, fileRelPath: string) {
  const index = await readIndex()
  const note = index.notes.find((x) => x.id === noteId)
  if (note) {
    note.status = status
    note.fileRelPath = fileRelPath
  }
  await writeIndex(index)
}
//Glede na predmet verne vse odobrene zapiske
export async function listApprovedByCourse(courseId: string) {
  const index = await readIndex()
  return index.notes.filter((note) => note.courseId === courseId && note.status === "APPROVED")
}
//Glede na predmet verne vse zapiske ki so pending 
export async function listPending(courseId: string) {
  const index = await readIndex()
  return index.notes.filter((note) =>note.courseId === courseId && note.status === "PENDING")
}
//Glede na predmet verne vse zapiske
export async function listByCourse(courseId: string) {
  const index = await readIndex()
  return index.notes.filter((n) => n.courseId === courseId)
}
//Piše meta podatke posameznega zapiska v njegov direktorij
export async function writeMeta(folder: string, meta: NoteMeta) {
  await fs.writeFile(path.join(folder, "meta.json"), JSON.stringify(meta, null, 2), "utf-8")
}
//Prebere meta podatke posameznega zapiska v njegovem direktorju
export async function readMeta(folder: string): Promise<NoteMeta> {
  const raw = await fs.readFile(path.join(folder, "meta.json"), "utf-8")
  return JSON.parse(raw)
}
//Najde direktorij v katerem je note z njegovim id-jem
export async function findFolderById(noteId: string): Promise<{ status: NoteStatus; folder: string } | null> {
  const index = await readIndex()
  const note = index.notes.find((x) => x.id === noteId)
  if (!note) return null
  const folder = path.join(STORAGE_DIR, baseDir(note.status), note.programId, String(note.year), note.courseId, note.id)
  return { status: note.status as NoteStatus, folder }
}
//Najde absolutno pot do note-a
export async function getFileAbsById(noteId: string) {
  const found = await findFolderById(noteId)
  if (!found) return null
  const meta = await readMeta(found.folder)
  const fileAbs = path.join(found.folder, safeName(meta.originalFilename))
  return { meta, fileAbs }
}
//Odobri note in ga premakne v approved direktorij
export async function approveAndMove(noteId: string) {
  const found = await findFolderById(noteId)
  if (!found) throw new Error("Note not found")
  const meta = await readMeta(found.folder)

  const approvedFolder = path.join(noteFolder("APPROVED",meta.programId,meta.year,meta.courseId,meta.id)
  )
  await fs.mkdir(path.dirname(approvedFolder), { recursive: true })
  await fs.rename(found.folder, approvedFolder)
  const updatedMeta: NoteMeta = { ...meta, status: "APPROVED" }
  await writeMeta(approvedFolder, updatedMeta)
  const fileAbs = path.join(approvedFolder, safeName(updatedMeta.originalFilename))
  const fileRelPath = path.relative(STORAGE_DIR, fileAbs).replace(/\\/g, "/")

  await updateIndexStatus(noteId, "APPROVED", fileRelPath)

  return { ok: true as const, folder: approvedFolder }
}
//Izbris direktorija v katerem je bil note
export async function deleteNoteFolder(noteId: string){
    const found = await findFolderById(noteId)
    if(!found) throw new Error("Note not found")
    deleteNoteIndex(noteId)
    await fs.rm(found.folder, { recursive: true, force: true })
}


import fs from "fs/promises"
import fssync from "fs"
import path from "path"
import crypto from "crypto"
import sql from "../db"

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
  uploaderId?: number
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

//Failsafe funkcija, da se pravilno shrani datoteka
export function safeName(name: string) {
  return name.replace(/[^\w.\-()+ ]+/g, "_")
}

//Ustvari začetne direktorije
export async function ensureDirs() {
  await fs.mkdir(STORAGE_DIR, { recursive: true })  
  await fs.mkdir(path.join(STORAGE_DIR, "pending"), { recursive: true })
  await fs.mkdir(path.join(STORAGE_DIR, "approved"), { recursive: true })
}

//sprozi se na server.ts download za datoteko
export function toDownloadUrl(noteId: string) {
  return `/api/notes/${noteId}/download`
}

//Sprejme meta podatek in ga shrani v database
export async function addToIndex(meta: NoteMeta, fileRelPath: string) {
  await sql`
    INSERT INTO RPO_Projekt.note (
      note_id,
      title, 
      description, 
      original_filename,
      file_path,
      mime_type,
      size_bytes,
      status,
      created_at,
      FK_program_id,
      FK_year_semester_id,
      FK_course_id,
      FK_uploader_user_id
    ) VALUES (
      ${meta.id},
      ${meta.title},
      ${meta.description || ''},
      ${meta.originalFilename},
      ${fileRelPath},
      ${meta.mimeType},
      ${meta.sizeBytes},
      ${meta.status},
      ${meta.createdAt},
      ${parseInt(meta.programId)},
      ${meta.year},
      ${parseInt(meta.courseId)},
      ${meta.uploaderId}
    )
  `;
}

//Spremeni status iz pending v approved v database
export async function updateIndexStatus(noteId: string, status: NoteStatus, fileRelPath: string) {
  await sql`
    UPDATE RPO_Projekt.note 
    SET status = ${status}, file_path = ${fileRelPath}
    WHERE note_id = ${noteId}
  `;
}

//Glede na predmet verne vse odobrene zapiske
export async function listApprovedByCourse(courseId: string) {
  const notes = await sql`
    SELECT 
      note_id as id,
      title,
      description,
      created_at as "createdAt",
      file_path as "fileRelPath",
      mime_type as "mimeType",
      size_bytes as "sizeBytes",
      status,
      FK_program_id::text as "programId",
      FK_year_semester_id as year,
      FK_course_id::text as "courseId"
    FROM RPO_Projekt.note
    WHERE FK_course_id = ${parseInt(courseId)}
      AND status = 'APPROVED'
    ORDER BY created_at DESC
  ` as any[];
  
  return notes.map((n: any) => ({
    id: n.id,
    programId: n.programId,
    year: n.year,
    courseId: n.courseId,
    title: n.title,
    description: n.description,
    status: 'APPROVED',
    mimeType: n.mimeType,
    sizeBytes: n.sizeBytes,
    createdAt: n.createdAt,
    fileRelPath: n.fileRelPath
  }));
}

//Glede na predmet verne vse zapiske ki so pending 
export async function listPending(courseId: string) {
  const notes = await sql`
    SELECT 
      note_id as id,
      title,
      description,
      created_at as "createdAt",
      file_path as "fileRelPath",
      mime_type as "mimeType",
      size_bytes as "sizeBytes",
      status,
      FK_program_id::text as "programId",
      FK_year_semester_id as year,
      FK_course_id::text as "courseId"
    FROM RPO_Projekt.note
    WHERE FK_course_id = ${parseInt(courseId)}
      AND status = 'PENDING'
    ORDER BY created_at DESC
  ` as any[];
  
  return notes.map((n: any) => ({
    id: n.id,
    programId: n.programId,
    year: n.year,
    courseId: n.courseId,
    title: n.title,
    description: n.description,
    status: 'PENDING',
    mimeType: n.mimeType,
    sizeBytes: n.sizeBytes,
    createdAt: n.createdAt,
    fileRelPath: n.fileRelPath
  }));
}

//Glede na predmet verne vse zapiske
export async function listByCourse(courseId: string) {
  const notes = await sql`
    SELECT 
      note_id as id,
      title,
      description,
      created_at as "createdAt",
      file_path as "fileRelPath",
      mime_type as "mimeType",
      size_bytes as "sizeBytes",
      status,
      FK_program_id::text as "programId",
      FK_year_semester_id as year,
      FK_course_id::text as "courseId"
    FROM RPO_Projekt.note
    WHERE FK_course_id = ${parseInt(courseId)}
    ORDER BY created_at DESC
  ` as any[];
  
  return notes.map((n: any) => ({
    id: n.id,
    programId: n.programId,
    year: n.year,
    courseId: n.courseId,
    title: n.title,
    description: n.description,
    status: n.status,
    mimeType: n.mimeType,
    sizeBytes: n.sizeBytes,
    createdAt: n.createdAt,
    fileRelPath: n.fileRelPath
  }));
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
  const notes = await sql`
    SELECT 
      status,
      FK_program_id::text as "programId",
      FK_year_semester_id as year,
      FK_course_id::text as "courseId"
    FROM RPO_Projekt.note
    WHERE note_id = ${noteId}
    LIMIT 1
  ` as any[];
  
  if (notes.length === 0) return null;
  const note = notes[0];
  
  const status: NoteStatus = note.status as NoteStatus;
  const folder = path.join(STORAGE_DIR, baseDir(status), note.programId, String(note.year), note.courseId, noteId);
  
  return { status, folder };
}

//Najde absolutno pot do note-a
export async function getFileAbsById(noteId: string) {
  const notes = await sql`
    SELECT 
      note_id,
      original_filename,
      file_path,
      mime_type,
      status,
      FK_program_id::text as "programId",
      FK_year_semester_id as year,
      FK_course_id::text as "courseId"
    FROM RPO_Projekt.note
    WHERE note_id = ${noteId}
    LIMIT 1
  ` as any[];
  
  if (notes.length === 0) return null;
  const note = notes[0];
  
  const status: NoteStatus = note.status as NoteStatus;
  const folder = path.join(STORAGE_DIR, baseDir(status), note.programId, String(note.year), note.courseId, noteId);
  const fileAbs = path.join(folder, safeName(note.original_filename));
  
  const meta: NoteMeta = {
    id: note.note_id,
    programId: note.programId,
    year: note.year,
    courseId: note.courseId,
    title: '',
    originalFilename: note.original_filename,
    mimeType: note.mime_type,
    sizeBytes: 0,
    status: status,
    createdAt: ''
  };
  
  return { meta, fileAbs };
}

//Odobri note in ga premakne v approved direktorij
export async function approveAndMove(noteId: string) {
  const found = await findFolderById(noteId)
  if (!found) throw new Error("Note not found")
  const meta = await readMeta(found.folder)

  const approvedFolder = path.join(
    noteFolder("APPROVED", meta.programId, meta.year, meta.courseId, meta.id)
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
  if (!found) throw new Error("Note not found")
  
  // Delete from database
  await sql`note 
    WHERE note_idile 
    WHERE visibility::jsonb->>'noteId' = ${noteId}
  `;
  
  // Delete folder from filesystem
  await fs.rm(found.folder, { recursive: true, force: true })
}


import path from "path"
import fs from "fs/promises"
import fssync from "fs"
import express from "express"
import multer from "multer"
import {
  Controller,
  Get,
  Post,
  Route,
  Tags,
  Path as TPath,
  Middlewares,
  Request,
  Delete,
} from "tsoa"
import {
  NoteMeta,
  newId,
  safeName,
  writeMeta,
  addToIndex,
  listApprovedByCourse,
  listPending,
  toDownloadUrl,
  approveAndMove,
  deleteNoteFolder,
  ensureDirs,
  noteFolder,
  listByCourse,
} from "../storage/storage"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
})

function isAllowed(appendix: string) {
  return ["application/pdf", "image/png", "image/jpeg",    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain","application/zip",
    "application/x-zip-compressed",].includes(appendix)
}

@Route("notes")
@Tags("Notes")
//Če se niso se ustvarijo osnovni direktoriiji za approve in pending
export class NotesController extends Controller {
    constructor(){
        super()
        ensureDirs().catch(() => {})
    }
/*Upload preveri če je dovoljena datotečna priponka in če je so podatki pravilni potem se ustvari novi direktorij in v tistegase shrani meta
podatek o zapisku to pomeni smer, letnik, kateri predmet je. Nato pa še tisti podatke vpišen v glavni index kjer so shranjeni vsi zapiski.
*/
  @Post("/upload")
  @Middlewares(upload.single("file")as any)
  public async upload(@Request() req: express.Request): Promise<{ id: string; status: "PENDING" }> {
    const file = (req as any).file as Express.Multer.File | undefined
    if (!file) throw Object.assign(new Error("Missing file"), { status: 400 })
    if (!isAllowed(file.mimetype)) throw Object.assign(new Error("Unsupported file extension or file type"), { status: 400 })

    const programId = String(req.body.programId || "").trim()
    const year = Number(req.body.year)
    const courseId = String(req.body.courseId || "").trim()
    const title = String(req.body.title || "").trim()
    const description = String(req.body.description || "").trim()
    

    if (!programId || !Number.isFinite(year) || !courseId || title.length < 2) {
      throw Object.assign(new Error("Missing required fields"), { status: 400 })
    }

    const id = newId()
    const originalFilename = safeName(file.originalname || "file")
    const folder = path.join(noteFolder("PENDING", programId, year, courseId, id))
    await fs.mkdir(folder, { recursive: true })
    const fileAbs = path.join(folder, originalFilename)
    await fs.writeFile(fileAbs, file.buffer)
    const meta: NoteMeta = {
      id,
      programId,
      year,
      courseId,
      title,
      description: description || undefined,
      originalFilename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      
    }
    await writeMeta(folder, meta)
    const fileRelative = path.relative("./storage", fileAbs).replace(/\\/g, "/")
    await addToIndex(meta, fileRelative)

    return { id, status: "PENDING" }
  }
/*Vrne se list tistih zapiskov ki so odobreni */
  @Get("/courses/{courseId}/notes")
  public async listApproved(@TPath() courseId: string): Promise<any[]> {
    const items = await listApprovedByCourse(courseId)
    return items.map((note) => ({ ...note, downloadUrl: toDownloadUrl(note.id) }))
  }
  /*Vrne se list vseh zapiskov tistega predmeta */
  @Get("/courses/{courseId}/notes/all")
  public async asyncListAll(@TPath()courseId: string): Promise<any[]>{
    return (await listByCourse(courseId)).map((note) => ({
    ...note,
    downloadUrl: toDownloadUrl(note.id),}))
  }
/*Vrne se list tistih zapiskov ki so pending */
  @Get("/moderation/{courseId}/notes")
  public async listPendingAdmin(@TPath()courseId: string): Promise<any[]> {
    const items = await listPending(courseId)
    return items.map((note) => ({ ...note, downloadUrl: toDownloadUrl(note.id) }))
  }
  //Odobri zapisek
  @Post("/{noteId}/approve")
  public async approve(@TPath()noteId: string): Promise<{ok: true}>
  {
    await approveAndMove(noteId)
    return {ok: true}
  }
  //Izbriše ga
  @Delete("/{noteId}")
  public async remove(@TPath()noteId: string): Promise<{ok: true}>
  {
    await deleteNoteFolder(noteId)
    return{ok: true}
  }
  



  
 
}

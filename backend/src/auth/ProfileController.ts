import {
  Controller,
  Get,
  Route,
  Tags,
  Request,
  Security,
} from "tsoa";
import { UserProfile } from "../auth/types";
import sql from "../db";
import { toDownloadUrl } from "../storage/storage";

type UserNote = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  status: "PENDING" | "APPROVED";
  courseId: string;
  programId: string;
  year: number;
  mimeType: string;
  sizeBytes: number;
  originalFilename: string;
  downloadUrl: string;
};

interface ProfileResponse {
  id: number;
  email: string;
  name: string;
  notes: UserNote[];
}

// Extend the Express Request type
declare module "express-serve-static-core" {
  interface Request {
    user?: UserProfile;
  }
}

@Route("profile")
@Tags("Profile")
export class ProfileController extends Controller {
  /**
   * Get current user profile - requires JWT authentication
   * @example request headers {"Authorization": "Bearer <token>"}
   */
  @Get("me")
  @Security("jwt")
  public async getCurrentUser(@Request() request: any): Promise<ProfileResponse> {
    const user = request.user;

    if (!user) {
      this.setStatus(401);
      throw new Error("Unauthorized");
    }

    // Fetch notes uploaded by this user
    const notes = await sql`
      SELECT
        note_id as id,
        title,
        description,
        created_at as "createdAt",
        status,
        FK_course_id::text as "courseId",
        FK_program_id::text as "programId",
        FK_year_semester_id as year,
        mime_type as "mimeType",
        size_bytes as "sizeBytes",
        original_filename as "originalFilename"
      FROM RPO_Projekt.note
      WHERE FK_uploader_user_id = ${user.id}
      ORDER BY created_at DESC
    ` as any[];

    const mappedNotes: UserNote[] = notes.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description || undefined,
      createdAt: n.createdAt,
      status: n.status,
      courseId: n.courseId,
      programId: n.programId,
      year: n.year,
      mimeType: n.mimeType,
      sizeBytes: n.sizeBytes,
      originalFilename: n.originalFilename,
      downloadUrl: toDownloadUrl(n.id),
    }));

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      notes: mappedNotes,
    };
  }
}

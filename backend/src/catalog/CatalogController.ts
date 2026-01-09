import { Controller, Get, Route, Tags, Path as TPath } from "tsoa"
import sql from "../db";

@Route("programs")
@Tags("Catalog")
export class CatalogController extends Controller {
  @Get("/")
  public async getPrograms() {
    const programs = await sql`
      SELECT study_program_id as id, study_program_name as name, code
      FROM RPO_Projekt.study_program
      ORDER BY study_program_id
    `;
    return programs;
  }

  @Get("/{programId}/years/{year}/courses")
  public async getCourses(@TPath() programId: string, @TPath() year: number) {
    const courses = await sql`
      SELECT c.course_id as id, c.course_name as name, c.course_code as code, c.ECTS_points as ects
      FROM RPO_Projekt.course c
      WHERE c.course_id IN (
        SELECT DISTINCT co.FK_course_id
        FROM RPO_Projekt.course_offering co
        JOIN RPO_Projekt.study_group sg ON co.FK_study_group_id = sg.study_group_id
        JOIN RPO_Projekt.track t ON sg.FK_track_id = t.track_id
        WHERE t.FK_study_program_id = ${parseInt(programId)}
        AND t.FK_year_semester_id = ${year}
      )
      ORDER BY c.course_name
    `;
    return courses;
  }
}

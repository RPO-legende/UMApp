import { Controller, Get, Put, Route, Tags, Path, Body } from "tsoa";
import sql from "../db";

export type PredmetSkupina = { predmetId: string; skupina: string };

export type ShraniSkupinoBody = {
  enabled: boolean;
  skupine: PredmetSkupina[];
};

@Route("api/users")
@Tags("ModulSkupine")
export class GroupsController extends Controller {
  @Get("{userId}/modules/{programId}/years/{year}/grades/{grade}/groups")
  public async getSkupine(
    @Path() userId: number,
    @Path() programId: string,
    @Path() year: number,
    @Path() grade: number
  ) {
    const rows = await sql<PredmetSkupina[]>`
      SELECT
        c.course_code AS "predmetId",
        cg.label      AS "skupina"
      FROM RPO_Projekt.course_group_member cgm
      JOIN RPO_Projekt.course_group   cg ON cg.course_group_id = cgm.fk_course_group_id
      JOIN RPO_Projekt.course_delivery cd ON cd.course_delivery_id = cg.fk_course_delivery_id
      JOIN RPO_Projekt.course_offering co ON co.course_offering_id = cd.fk_course_offering_id
      JOIN RPO_Projekt.course          c  ON c.course_id = co.fk_course_id
      JOIN RPO_Projekt.study_group     sg ON sg.study_group_id = co.fk_study_group_id
      JOIN RPO_Projekt.track           t  ON t.track_id = sg.fk_track_id
      JOIN RPO_Projekt.study_program   sp ON sp.study_program_id = t.fk_study_program_id
      WHERE cgm.fk_user_id = ${userId}
        AND sp.code = ${programId}
        AND t.fk_year_semester_id = ${year}
        AND t.grade = ${grade}
      ORDER BY c.course_code, cg.label
    `;

    return {
      userId,
      programId,
      year,
      grade,
      enabled: rows.length > 0,
      skupine: rows,
    };
  }

  @Put("{userId}/modules/{programId}/years/{year}/grades/{grade}/groups")
  public async shraniSkupine(
    @Path() userId: number,
    @Path() programId: string,
    @Path() year: number,
    @Path() grade: number,
    @Body() body: ShraniSkupinoBody
  ) {
    return await sql.begin(async (tx: any) => {
      // delete existing memberships in scope
      await tx.unsafe(
        `
        DELETE FROM RPO_Projekt.course_group_member cgm
        USING RPO_Projekt.course_group cg,
              RPO_Projekt.course_delivery cd,
              RPO_Projekt.course_offering co,
              RPO_Projekt.study_group sg,
              RPO_Projekt.track t,
              RPO_Projekt.study_program sp
        WHERE cgm.fk_course_group_id = cg.course_group_id
          AND cg.fk_course_delivery_id = cd.course_delivery_id
          AND cd.fk_course_offering_id = co.course_offering_id
          AND co.fk_study_group_id = sg.study_group_id
          AND sg.fk_track_id = t.track_id
          AND t.fk_study_program_id = sp.study_program_id
          AND cgm.fk_user_id = $1
          AND sp.code = $2
          AND t.fk_year_semester_id = $3
          AND t.grade = $4
        `,
        [userId, programId, year, grade]
      );

      if (!body.enabled || body.skupine.length === 0) {
        return { userId, programId, year, grade, enabled: false, skupine: [] };
      }

      // insert new memberships
      for (const s of body.skupine) {
        const found = (await tx.unsafe(
          `
          SELECT cg.course_group_id
          FROM RPO_Projekt.course_group cg
          JOIN RPO_Projekt.course_delivery cd ON cd.course_delivery_id = cg.fk_course_delivery_id
          JOIN RPO_Projekt.course_offering co ON co.course_offering_id = cd.fk_course_offering_id
          JOIN RPO_Projekt.course c          ON c.course_id = co.fk_course_id
          JOIN RPO_Projekt.study_group sg    ON sg.study_group_id = co.fk_study_group_id
          JOIN RPO_Projekt.track t           ON t.track_id = sg.fk_track_id
          JOIN RPO_Projekt.study_program sp  ON sp.study_program_id = t.fk_study_program_id
          WHERE c.course_code = $1
            AND cg.label = $2
            AND sp.code = $3
            AND t.fk_year_semester_id = $4
            AND t.grade = $5
          LIMIT 1
          `,
          [s.predmetId, s.skupina, programId, year, grade]
        )) as { course_group_id: number }[];

        if (!found || found.length === 0) {
          this.setStatus(400);
          throw new Error(
            `Group not found: predmetId=${s.predmetId}, skupina=${s.skupina}, program=${programId}, year=${year}, grade=${grade}`
          );
        }

        await tx.unsafe(
          `
          INSERT INTO RPO_Projekt.course_group_member (joined_at, fk_course_group_id, fk_user_id)
          VALUES (CURRENT_DATE, $1, $2)
          `,
          [found[0].course_group_id, userId]
        );
      }

      return { userId, programId, year, grade, enabled: true, skupine: body.skupine };
    });
  }
}

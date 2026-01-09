import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
  Tags,
  Delete,
  Put
} from "tsoa";
import sql from "../db";

export interface News {
  news_id: number;
  title: string;
  content: string;
  created_at?: Date;
  published_at?: Date;
  is_active?: boolean;
  is_pinned?: boolean;
}

// Use a class (good for tsoa validation via JSDoc)
export class CreateNewsDto {
  /**
   * @minLength 3
   */
  public title!: string;

  /**
   * @minLength 1
   */
  public content!: string;
  
  public FK_created_by_user_id!: number;
  public FK_faculty_id!: number;
}

export class UpdateNewsDto {
  /**
   * @minLength 3
   */
  public title!: string;

  /**
   * @minLength 1
   */
  public content!: string;
}

@Route("news")
@Tags("News")
export class NewsController extends Controller {
  @Get() //localhost:3000/news
  public async getAllNews(): Promise<News[]> {
    const news = await sql`
      SELECT * FROM RPO_Projekt.news
      ORDER BY created_at DESC
    `;
    return news as unknown as News[];
  }

  @Get("{id}")
  public async getNews(@Path() id: number): Promise<News> {
    const [found] = await sql`
      SELECT * FROM RPO_Projekt.news
      WHERE news_id = ${id}
    `;

    if (!found) {
      this.setStatus(404);
      throw new Error("News not found");
    }

    return found as News;
  }


  @SuccessResponse("201", "Created")
  @Post("/")
  public async createNews(
    @Body() body: CreateNewsDto,
    @Query() notify?: boolean
  ): Promise<News> {
    const [created] = await sql`
      INSERT INTO RPO_Projekt.news (title, content, created_at, is_active, is_pinned, FK_created_by_user_id, FK_faculty_id)
      VALUES (
        ${body.title},
        ${body.content},
        NOW(),
        true,
        false,
        ${body.FK_created_by_user_id},
        ${body.FK_faculty_id}
      )
      RETURNING *
    `;

    if (notify) {
      console.log("Notify: news created", created.news_id);
    }

    this.setStatus(201);
    return created as News;
  }

  // PUT /{id}
  // Full update (client must send title + content)
  @Put("{id}")
  public async updateNews(
    @Path() id: number,
    @Body() body: UpdateNewsDto
  ): Promise<News> {
    const [updated] = await sql`
      UPDATE RPO_Projekt.news
      SET title = ${body.title}, content = ${body.content}
      WHERE news_id = ${id}
      RETURNING *
    `;

    if (!updated) {
      this.setStatus(404);
      throw new Error("News not found");
    }

    return updated as News;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("{id}")
  public async deleteNews(@Path() id: number): Promise<void> {
    const result = await sql`
      DELETE FROM RPO_Projekt.news
      WHERE news_id = ${id}
      RETURNING news_id
    `;

    if (result.length === 0) {
      this.setStatus(404);
      throw new Error("News not found");
    }

    this.setStatus(204);
    return;
  }
}

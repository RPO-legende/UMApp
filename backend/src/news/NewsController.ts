import path from "path";
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

export interface News {
  id: number;
  title: string;
  content: string;
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

// Simple in-memory "DB"
const newsDb: News[] = [];
let nextId = 1;

@Route("news")
@Tags("News")
export class NewsController extends Controller {
  @Get() //localhost:3000/news
  public getAllNews(): News[] {
    return newsDb;
  }

  @Get("{id}") //localhost:3000/news/num
  public getNews(@Path() id: number): News {
    const found = newsDb.find(n => n.id === id);

    if (!found) {
      this.setStatus(404);
      // tsoa prefers throwing for errors; this is simplest
      throw new Error("News not found");
    }

    return found;
  }


  @SuccessResponse("201", "Created")
  @Post("newNews")
  public createNews(
    @Body() body: CreateNewsDto,
    @Query() notify?: boolean
  ): News {
    const created: News = {
      id: nextId++,
      title: body.title,
      content: body.content
    };

    newsDb.push(created);

    if (notify) {
      console.log("Notify: news created", created.id);
    }

    this.setStatus(201);
    return created;
  }

  // PUT /news/{id}
  // Full update (client must send title + content)
  @Put("changeNews/{id}")
  public updateNews(
    @Path() id: number,
    @Body() body: UpdateNewsDto
  ): News {
    const index = newsDb.findIndex(n => n.id === id);

    if (index === -1) {
      this.setStatus(404);
      throw new Error("News not found");
    }

    const updated: News = {
      id,
      title: body.title,
      content: body.content
    };

    newsDb[index] = updated;   // store it
    return updated;            // return it
  }

  @SuccessResponse("204", "Deleted")
  @Delete("deleteNews/{id}")
  public deleteNews(@Path() id: number): void {
    const index = newsDb.findIndex(n => n.id === id);

    if (index === -1) {
      this.setStatus(404);
      throw new Error("News not found");
    }

    newsDb.splice(index, 1);
    this.setStatus(204);
    return;
  }
}

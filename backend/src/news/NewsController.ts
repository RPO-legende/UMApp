import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
  Tags
} from "tsoa";

interface News {
  id: number;
  title: string;
  content: string;
}

class CreateNewsDto {
  /**
   * @minLength 3
   */
  public title: string;

  /**
   * @minLength 1
   */
  public content: string;
}

// base path: /news
@Route("news")
// Swagger group
@Tags("News")
export class NewsController extends Controller {

  @Get("{id}")
  // @Path() prebere parameter iz URL-ja in ga pretvori v number
  // če ni number → 400 Bad Request
  public getNews(
    @Path() id: number,

    // @Query() prebere query parameter iz URL-ja
    // primer: ?uppercase=true
    @Query() uppercase?: boolean
  ): News {
    const title = uppercase ? `NEWS ${id}` : `News ${id}`;

    return {
      id,
      title,
      content: "Mock news content."
    };
  }

  @SuccessResponse("201", "Created")
  // Swagger dokumentira status 201
  @Post("/")
  /**
   * @Body() prebere JSON body in ga validira
   * @Query() prebere query parameter iz URL-ja
   */
  public createNews(
    @Body() body: CreateNewsDto,

    // ?notify=true
    // uporabi se lahko za dodatno logiko
    @Query() notify?: boolean
  ): News {
    this.setStatus(201);

    if (notify) {
      console.log("Notify: news created");
    }

    return {
      id: 1,
      title: body.title,
      content: body.content
    };
  }
}

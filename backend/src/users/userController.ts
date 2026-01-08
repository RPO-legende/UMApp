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
import sql from "../db";

interface User {
  user_id: number;
  first_name?: string;
  last_name?: string;
  email: string;
}

class CreateUserDto {
  /**
   * @minLength 3
   */
  public email: string;
  public first_name?: string;
  public last_name?: string;
}

// base path: /users
@Route("users")
// Swagger skupina
@Tags("Users")
export class UserController extends Controller {

  
  @Get("{id}")
  public async getUser(
    @Path() id: number
  ): Promise<User> {
    const [user] = await sql`
      SELECT * FROM RPO_Projekt."user"
      WHERE user_id = ${id}
    `;

    if (!user) {
      this.setStatus(404);
      throw new Error("User not found");
    }

    return user;
  }
 
  @SuccessResponse("201", "Created")
  // Swagger dokumentira status 201
  @Post("/")
  /**
   * @Body() bere JSON body in ga validira
   * @Query() bere query parameter iz URL-ja
   */
  public async createUser(
    @Body() body: CreateUserDto,

    // ?notify=true
    // uporabi se npr. za dodatno logiko (pošlji email ipd.)
    @Query() notify?: boolean
  ): Promise<User> {
    const [created] = await sql`
      INSERT INTO RPO_Projekt."user" (email, first_name, last_name, created_at)
      VALUES (
        ${body.email},
        ${body.first_name || null},
        ${body.last_name || null},
        NOW()
      )
      RETURNING *
    `;

    if (notify) {
      console.log("Notify user created:", created.user_id);
    }

    this.setStatus(201);

    return created;
  }
}

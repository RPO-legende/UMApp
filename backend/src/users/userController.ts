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

import {User, usersDb, allocateUserId } from "../mockData";

class CreateUserDto {
  /**
   * @minLength 3
   */
  public name: string;
}

// base path: /users
@Route("users")
// Swagger skupina
@Tags("Users")
export class UserController extends Controller {

  
  @Get("{id}")
public getUser(
  @Path() id: number
): User {
  const user = usersDb.find(u => u.id === id);

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
  public createUser(
    @Body() body: CreateUserDto,

    // ?notify=true
    // uporabi se npr. za dodatno logiko (pošlji email ipd.)
    @Query() notify?: boolean
  ): User {
    const created: User = {
      id: allocateUserId(),
      name: body.name,
    };

    usersDb.push(created);

    if (notify) {
      console.log("Notify user created:", created.id);
    }

    this.setStatus(201);

    if (notify) {
      // tukaj bi npr. poslal email
      console.log("Notify user created");
    }

    usersDb.push(created);

    return { id: 1, name: body.name };
  }
}

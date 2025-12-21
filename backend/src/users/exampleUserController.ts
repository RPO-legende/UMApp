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

interface User {
  id: number;
  name: string;
}

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
  // @Path() bere parameter iz URL-ja in ga pretvori v number
  // če ni number → 400 Bad Request
  public getUser(
    @Path() id: number,

    // @Query() bere query parameter iz URL-ja
    // primer: ?uppercase=true
    // TSOA ga avtomatsko pretvori v boolean
    @Query() uppercase?: boolean
  ): User {
    const name = uppercase ? "ANA" : "Ana";
    return { id, name };
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
    this.setStatus(201);

    if (notify) {
      // tukaj bi npr. poslal email
      console.log("Notify user created");
    }

    return { id: 1, name: body.name };
  }
}

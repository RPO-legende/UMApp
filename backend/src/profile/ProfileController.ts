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

interface Profile {
  id: number;
  username: string;
  displayName: string;
}

class CreateProfileDto {
  /**
   * @minLength 3
   */
  public username: string;

  /**
   * @minLength 3
   */
  public displayName: string;
}

// base path: /profile
@Route("profile")
// Swagger skupina
@Tags("Profile")
export class ProfileController extends Controller {

  @Get("{id}")
  // @Path() prebere parameter iz URL-ja in ga pretvori v number
  // če ni number → 400 Bad Request
  public getProfile(
    @Path() id: number,

    // @Query() prebere query parameter iz URL-ja
    // primer: ?uppercase=true
    @Query() uppercase?: boolean
  ): Profile {
    const displayName = uppercase ? `USER ${id}` : `User ${id}`;

    return {
      id,
      username: `user_${id}`,
      displayName
    };
  }

  @SuccessResponse("201", "Created")
  // Swagger dokumentira status 201
  @Post("/")
  /**
   * @Body() prebere JSON body in ga validira
   * @Query() prebere query parameter iz URL-ja
   */
  public createProfile(
    @Body() body: CreateProfileDto,

    // ?notify=true
    @Query() notify?: boolean
  ): Profile {
    this.setStatus(201);

    if (notify) {
      console.log("Notify: profile created");
    }

    return {
      id: 1,
      username: body.username,
      displayName: body.displayName
    };
  }
}

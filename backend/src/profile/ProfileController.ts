import { Controller, Get, Path, Route, Tags } from "tsoa";
import { usersDb, User } from "../mockData";

@Route("profile")
@Tags("Profile")
export class ProfileController extends Controller {

  @Get("{id}")
  public getProfile(@Path() id: number): User {
    const user = usersDb.find(u => u.id === id);

    if (!user) {
      this.setStatus(404);
      throw new Error("User not found");
    }

    return user;
  }
}

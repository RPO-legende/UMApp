import { Controller, Get, Path, Route, Tags } from "tsoa";
import { usersDb, MockUser } from "../mockData";

@Route("mock-profile")
@Tags("Mock Profile")
export class MockProfileController extends Controller {

  @Get("{id}")
  public getProfile(@Path() id: number): MockUser {
    const user = usersDb.find(u => u.id === id);

    if (!user) {
      this.setStatus(404);
      throw new Error("User not found");
    }

    return user;
  }
}

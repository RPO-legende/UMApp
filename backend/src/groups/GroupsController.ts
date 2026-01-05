import {
  Controller,
  Get,
  Put,
  Route,
  Tags,
  Path,
  Body
} from "tsoa";

import {
  loadUserModuleGroups,
  saveUserModuleGroups,
  ShraniSkupinoBody
} from "../groupStorage/userModuleGroups";

@Route("api/users")
@Tags("ModulSkupine")
export class GroupsController extends Controller {

  @Get("{userId}/modules/{programId}/years/{year}/groups")
  public getSkupine(
    @Path() userId: number,
    @Path() programId: string,
    @Path() year: number
  ) {
    const existing = loadUserModuleGroups(userId, programId, year);

    return existing ?? {
      userId,
      programId,
      year,
      enabled: false,
      skupine: []
    };
  }

  @Put("{userId}/modules/{programId}/years/{year}/groups")
  public shraniSkupine(
    @Path() userId: number,
    @Path() programId: string,
    @Path() year: number,
    @Body() body: ShraniSkupinoBody
  ) {
    return saveUserModuleGroups(
      userId,
      programId,
      year,
      body.enabled,
      body.skupine
    );
  }
}

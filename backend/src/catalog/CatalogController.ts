import { Controller, Get, Route, Tags, Path as TPath } from "tsoa"
//makeshift podatkovna baza za smeri in predmete
const programs = [
  { id: "rit-un", name: "Računalništvo in informacijske tehnologije",yearsC: 3 },
  { id: "rit-mag", name: "Računalništvo in informacijske tehnologije(magisterij)",yearsC: 2},
]

const coursesByProgramYear: Record<string, { id: string; name: string; programId: string; year: number }[]> = {
  "rit-un-1": [
    { id: "dst", name: "Diskretne strukture", programId: "rit-un", year: 1 },
    { id: "pro1", name: "Programiranje 1", programId: "rit-un", year: 1 },
  ],
  "rit-un-2": [{ id: "rpo", name: "Razvoj programske opreme", programId: "rit-un", year: 2 }],
  "rit-mag-1": [{id: "ram", name: "Računalniška multimedija",programId:"rit-mag",year:1}],
}

@Route("programs")
@Tags("Catalog")
export class CatalogController extends Controller {
  @Get("/")
  public async getPrograms() {
    return programs
  }

  @Get("/{programId}/years/{year}/courses")
  public async getCourses(@TPath() programId: string, @TPath() year: number) {
    return coursesByProgramYear[`${programId}-${year}`] ?? []
  }
}

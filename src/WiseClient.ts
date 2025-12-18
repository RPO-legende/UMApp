import { Buffer } from 'buffer';

// --- JAVNI TIPI ---
export interface Programme { id: string; name: string; }
export interface Branch { id: string; branchName: string; }
export interface Group { id: number; name: string; }

export interface CourseWithDetails {
  courseId: number;
  courseName: string;
  lecturers: string[];
  rooms: string[];
  subGroups: Group[];
  activityTypes: string[];
}

export class WiseTimetableProvider {
  private readonly BASE_AUTH_URL = 'https://wise-tt.com/WTTWebRestAPI/ws/rest/';
  private token: string | null = null;
  private serverUrl: string | null = null;
  private schoolCode: string | null = null;

  constructor(
    private userSchoolCode: string = 'feri',
    private username: string = 'wtt_api_user_a',
    private password: string = 'H50lsd2$XejBIBv7t'
  ) {}


    //pravilen workflow!!!
  async initialize(): Promise<void> {
    const basic = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const loginRes = await fetch(`${this.BASE_AUTH_URL}login`, {
      headers: { Authorization: `Basic ${basic}` }
    });
    if (!loginRes.ok) throw new Error(`Login ni uspel: ${loginRes.status}`);
    const loginJson = (await loginRes.json()) as { token: string };
    this.token = loginJson.token;

    const urlRes = await fetch(`${this.BASE_AUTH_URL}url?schoolCode=${this.userSchoolCode}&language=slo`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    const urlData = (await urlRes.json()) as { server: string };
    this.serverUrl = urlData.server.replace(/^http:/, 'https:');

    const infoRes = await fetch(`${this.serverUrl}schoolCode?schoolCode=${this.userSchoolCode}&language=slo`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    const infoData = (await infoRes.json()) as { schoolCode: string };
    this.schoolCode = infoData.schoolCode;
  }

  private async request<T>(endpoint: string): Promise<T> {
    if (!this.token || !this.serverUrl) await this.initialize();
    const res = await fetch(`${this.serverUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return (await res.json()) as T;
  }

  async getProgrammes(): Promise<Programme[]> {
    return await this.request<Programme[]>(`basicProgrammeAll?schoolCode=${this.schoolCode}&language=slo`);
  }

  async getBranches(programmeId: string, year: string): Promise<Branch[]> {
    return await this.request<Branch[]>(`branchAllForProgrmmeYear?schoolCode=${this.schoolCode}&language=slo&programmeId=${programmeId}&year=${year}`);
  }

  async getCoursesAndGroups(branchId: string, dateFrom: string, dateTo: string): Promise<CourseWithDetails[]> {
    const groups = await this.request<GroupBranchMain[]>(`groupAllForBranch?schoolCode=${this.schoolCode}&language=slo&branchId=${branchId}`);
    if (!groups || !Array.isArray(groups)) return [];

    const childIds = groups.flatMap(g => g.childGroups.map(ch => ch.id)).join('_');
    if (!childIds) return [];

    const schedule = await this.request<any[]>(`scheduleByGroups?schoolCode=${this.schoolCode}&dateFrom=${dateFrom}&dateTo=${dateTo}&language=slo&groupsId=${childIds}`);
    if (!Array.isArray(schedule)) return [];

    // debug (Izpiše prvi objekt)
    // if (schedule.length > 0) console.log("DEBUG PRVI TERMIN:", JSON.stringify(schedule[0], null, 2));

    const results: CourseWithDetails[] = [];

    for (const lec of schedule) {
      if (!lec) continue;
      const cId = Number(lec.courseId);
      if (!cId || !lec.course) continue;

      let existing = results.find(r => r.courseId === cId);
      if (!existing) {
        existing = {
          courseId: cId,
          courseName: lec.course,
          lecturers: [],
          rooms: [],
          subGroups: [],
          activityTypes: []
        };
        results.push(existing);
      }

      // Delajoče iskanje IZVAJALCEV
      // Se preveri: staffs.name, staff.name, lecturer, staffName
      const staffSources = [lec.staffs, lec.staff, lec.lecturers, lec.lecturer];
      staffSources.forEach(source => {
        if (Array.isArray(source)) {
          source.forEach(s => {
            const name = typeof s === 'string' ? s : s?.name || s?.staffName;
            if (name && !existing!.lecturers.includes(name)) existing!.lecturers.push(name);
          });
        } else if (typeof source === 'string') {
          if (!existing!.lecturers.includes(source)) existing!.lecturers.push(source);
        } else if (source && typeof source === 'object') {
          const name = (source as any).name || (source as any).staffName;
          if (name && !existing!.lecturers.includes(name)) existing!.lecturers.push(name);
        }
      });

      // Iskanje prostora
      const roomSources = [lec.rooms, lec.room, lec.roomName];
      roomSources.forEach(source => {
        if (Array.isArray(source)) {
          source.forEach(r => {
            const rName = typeof r === 'string' ? r : r?.name || r?.roomName;
            if (rName && !existing!.rooms.includes(rName)) existing!.rooms.push(rName);
          });
        } else if (typeof source === 'string') {
          if (!existing!.rooms.includes(source)) existing!.rooms.push(source);
        }
      });

      // TIP IZVAJANJA
      const type = lec.activityType || lec.eventTypeName || lec.type;
      if (type && !existing.activityTypes.includes(type)) existing.activityTypes.push(type);

      // SKUPINE
      if (Array.isArray(lec.groups)) {
        lec.groups.forEach((g: any) => {
          if (!existing!.subGroups.some(sg => sg.id === g.id)) {
            existing!.subGroups.push({ id: g.id, name: g.name });
          }
        });
      }
    }
    return results;
  }
}

interface GroupBranchMain {
  id: string;
  name: string;
  childGroups: Group[];
}
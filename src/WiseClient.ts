import { Buffer } from 'buffer';

export interface Lecturer { name: string; }
export interface Programme { id: string; name: string; }
export interface Branch { id: string; branchName: string; }
export interface Group { id: number; name: string; }
export interface Course { 
    id: number; 
    name: string; 
    lecturers: string[]; 
}

const AUTH_URL = 'https://wise-tt.com/WTTWebRestAPI/ws/rest/';

export class WiseTimetableProvider {
    private token: string;
    private serverUrl: string;
    private schoolCode: string;

    constructor(token: string, serverUrl: string, schoolCode: string) {
        this.token = token;
        this.serverUrl = serverUrl;
        this.schoolCode = schoolCode;
    }

    //static helper za konekcijo in pridobitev instance
    static async create(userSchoolCode: string) {
        const basic = Buffer.from("wtt_api_user_a:H50lsd2$XejBIBv7t").toString('base64');
        const loginRes = await fetch(AUTH_URL + "login", { headers: { "Authorization": "Basic " + basic } });
        const loginData = await loginRes.json();
        const token = loginData.token;

        const urlRes = await fetch(`${AUTH_URL}url?schoolCode=${userSchoolCode}&language=slo`, { headers: { "Authorization": "Bearer " + token } });
        const urlData = await urlRes.json();
        const serverUrl = urlData.server.replace('http://', 'https://');

        const codeRes = await fetch(`${serverUrl}schoolCode?schoolCode=${userSchoolCode}&language=slo`, { headers: { "Authorization": "Bearer " + token } });
        const codeData = await codeRes.json();

        return new WiseTimetableProvider(token, serverUrl, codeData.schoolCode);
    }

    //  Programmes
    async getProgrammes(): Promise<Programme[]> {
        const data = await this.getWithToken(`${this.serverUrl}basicProgrammeAll?schoolCode=${this.schoolCode}&language=slo`);
        const filtered = [];
        for (const p of data) {
            const name = p.name.toUpperCase();
            // Ne vem ni kaj je, so v seznamu tudi programi "KOOD", ki niso pravi študijski program
            if (!name.includes("KOOD")) {
                filtered.push(p);
            }
        }
        return filtered;
    }

    // Modules/Branches
    async getModules(programmeId: string, year: string): Promise<Branch[]> {
        return await this.getWithToken(`${this.serverUrl}branchAllForProgrmmeYear?schoolCode=${this.schoolCode}&language=slo&programmeId=${programmeId}&year=${year}`);
    }

    // Courses(Predmeti znotraj modula)
    async getCourses(moduleId: string): Promise<Course[]> {
        const groups = await this.getGroupsForBranch(moduleId);
        let ids = '';
        for (const g of groups) { ids += g.id + '_'; }
        ids = ids.slice(0, -1);

        if (!ids) return [];

        const from = new Date().toISOString().split('T')[0];
        const toDate = new Date(); toDate.setFullYear(toDate.getFullYear() + 1);
        const to = toDate.toISOString().split('T')[0];

        const schedule = await this.getWithToken(`${this.serverUrl}scheduleByGroups?schoolCode=${this.schoolCode}&dateFrom=${from}&dateTo=${to}&language=slo&groupsId=${ids}`);
        
        const coursesMap = new Map();
        if (schedule) {
            for (const item of schedule) {
                const courseId = Number(item.courseId);
                if (!courseId) continue;

                if (!coursesMap.has(courseId)) {
                    coursesMap.set(courseId, { id: courseId, name: item.course, lecturers: [] });
                }
                const courseObj = coursesMap.get(courseId);

                // Demonstratori nima svoj API pa jih dodamo iz vec polja
                const sources = [item.staffs, item.staff, item.lecturers];
                for (const s of sources) {
                    if (!s) continue;
                    const people = Array.isArray(s) ? s : [s];
                    for (const p of people) {
                        let n = (typeof p === 'string' ? p : p.name || p.staffName)?.trim();
                        if (n && !courseObj.lecturers.includes(n)) {
                            courseObj.lecturers.push(n);
                        }
                    }
                }
            }
        }
        return Array.from(coursesMap.values());
    }

    // Skupine znotraj predmeta 
    async getCourseGroups(moduleId: string, courseId: number): Promise<Group[]> {
        const groups = await this.getGroupsForBranch(moduleId);
        let ids = '';
        for (const g of groups) { ids += g.id + '_'; }
        ids = ids.slice(0, -1);

        const from = new Date().toISOString().split('T')[0];
        const toDate = new Date(); toDate.setFullYear(toDate.getFullYear() + 1);
        const to = toDate.toISOString().split('T')[0];

        const schedule = await this.getWithToken(`${this.serverUrl}scheduleByGroups?schoolCode=${this.schoolCode}&dateFrom=${from}&dateTo=${to}&language=slo&groupsId=${ids}`);
        
        const courseGroups = [];
        const seen = new Set();
        if (schedule) {
            for (const item of schedule) {
                if (Number(item.courseId) === courseId && item.groups) {
                    for (const g of item.groups) {
                        if (!seen.has(g.id)) {
                            seen.add(g.id);
                            courseGroups.push({ id: g.id, name: g.name });
                        }
                    }
                }
            }
        }
        return courseGroups;
    }

    private async getWithToken(url: string) {
        const res = await fetch(url, { headers: { "Authorization": "Bearer " + this.token } });
        return await res.json();
    }

    private async getGroupsForBranch(branchId: string) {
        const data = await this.getWithToken(`${this.serverUrl}groupAllForBranch?schoolCode=${this.schoolCode}&language=slo&branchId=${branchId}`);
        const groups = [];
        for (const item of data) {
            if (item.childGroups) {
                for (const g of item.childGroups) { groups.push(g); }
            }
        }
        return groups;
    }
}
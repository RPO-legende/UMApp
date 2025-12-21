import { WiseTimetableProvider } from './src/WiseClient.ts';

async function main() {
    let wise;
    try {
        wise = await WiseTimetableProvider.create('feri');
        console.log("Class initialized successfully.\n");
    } catch (err) {
        console.log("Setup Error: " + err.message);
        return;
    }

    // 1. ALL PROGRAMS
    let progs = [];
    try {
        console.log("PROGRAMS");
        progs = await wise.getProgrammes();
        for (const p of progs) { console.log("- " + p.name); }
    } catch (e) { console.log("Error: " + e.message); }

    // 2. RIT UN YEAR 1
    let ritUn, firstMod, courses = [];
    try {
        console.log("\nRIT UN YEAR 1");
        for (const p of progs) {
            if (p.name.includes("RAČUNALNIŠTVO") && p.name.includes("(BU20)")) { ritUn = p; break; }
        }
        const modules = await wise.getModules(ritUn.id, "1");
        firstMod = modules[0];
        console.log("Module: " + firstMod.branchName);

        courses = await wise.getCourses(firstMod.id);
        for (const c of courses) { console.log("  - " + c.name); }
    } catch (e) { console.log("Error: " + e.message); }

    // 3. GROUPS FOR OSS
    try {
        console.log("\nGROUPS FOR OSS");
        let oss;
        for (const c of courses) { if (c.name.includes("SVETOVNEGA SPLETA")) { oss = c; break; } }
        const groups = await wise.getCourseGroups(firstMod.id, oss.id);
        for (const g of groups) { console.log("    > " + g.name); }
    } catch (e) { console.log("Error: " + e.message); }

    // 4. RIT VS YEAR 3
    try {
        console.log("\nRIT VS YEAR 3 MODULES");
        let ritVs;
        for (const p of progs) { if (p.name.includes("BV20")) { ritVs = p; break; } }
        const modules = await wise.getModules(ritVs.id, "3");
        for (const m of modules) { console.log("  Module: " + m.branchName); }
    } catch (e) { console.log("Error: " + e.message); }

    // 5. MASTER'S CHECK
    try {
        console.log("\nMASTER'S CHECK");
        let mag;
        for (const p of progs) { if (p.name.includes("BM20")) { mag = p; break; } }
        const magB = await wise.getModules(mag.id, "1");
        const magC = await wise.getCourses(magB[0].id);
        console.log("Master Courses: " + magC.length);
    } catch (e) { console.log("Error: " + e.message); }

    // 6. LECTURER SEARCH (RAVBER)
    try {
        console.log("\nSEARCHING RAVBER");
        const y3B = await wise.getModules(ritUn.id, "3");
        for (const b of y3B) {
            const list = await wise.getCourses(b.id);
            for (const c of list) {
                for (const l of c.lecturers) {
                    if (l.toUpperCase().includes("RAVBER")) console.log("Ravber teaches: " + c.name);
                }
            }
        }
    } catch (e) { console.log("Error: " + e.message); }

    // 7. LIST ALL UNIQUE LECTURERS (From RIT UN Year 1)
    try {
        console.log("\nALL LECTURERS IN RIT UN YEAR 1");
        const allLecturers = new Set();
        
        // We take the courses we fetched in Test 2
        for (const c of courses) {
            for (const lecturerName of c.lecturers) {
                allLecturers.add(lecturerName);
            }
        }

        // Sort them alphabetically for a nice list
        const sortedLecturers = Array.from(allLecturers).sort();
        for (const name of sortedLecturers) {
            console.log(name);
        }
        console.log("Total unique lecturers: " + sortedLecturers.length);
    } catch (e) { console.log("Error: " + e.message); }

}

main();
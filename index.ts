import { WiseTimetableProvider } from './src/WiseClient.ts';

async function main() {
  const api = new WiseTimetableProvider('feri');
  try {
    await api.initialize();
    const progs = await api.getProgrammes();
    const myProg = progs[0];
    if (!myProg || !myProg.id) return;

    // Primer za trenutni teden
    const from = new Date().toISOString().split('T')[0] || "";
    const to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || "";

    const branches = await api.getBranches(myProg.id, "3"); // Primer za 3. letnik elektrotehnika moduli
    
    for (const b of branches) {
      if (!b.id) continue;
      console.log(`\nMODUL: ${b.branchName}`);
      
      const courses = await api.getCoursesAndGroups(b.id, from, to);
      for (const c of courses) {
        console.log(`  |-- PREDMET: ${c.courseName} (${c.activityTypes.join(', ')})`);
        console.log(`  |   |-- IZVAJALCI: ${c.lecturers.join(', ') || 'Neznano'}`);
        console.log(`  |   |-- PROSTORI: ${c.rooms.join(', ') || 'Neznano'}`);
      }
    }
  } catch (e) { console.error(e); }
}
main();
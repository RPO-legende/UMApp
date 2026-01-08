import sql from './db';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Insert faculties
    console.log('Inserting faculties...');
    await sql`
      INSERT INTO RPO_Projekt.faculty (name) VALUES
      ('Fakulteta za računalništvo in informatiko'),
      ('Fakulteta za elektrotehniko'),
      ('Fakulteta za strojništvo')
      ON CONFLICT DO NOTHING
    `;

    // Insert program types
    console.log('Inserting program types...');
    await sql`
      INSERT INTO RPO_Projekt.program_type (program_type_name) VALUES
      ('Univerzitetni študij'),
      ('Visokošolski strokovni študij'),
      ('Magistrski študij')
      ON CONFLICT DO NOTHING
    `;

    // Get IDs
    const [fri] = await sql`SELECT faculty_id FROM RPO_Projekt.faculty WHERE name = 'Fakulteta za računalništvo in informatiko'`;
    const [univType] = await sql`SELECT program_type_id FROM RPO_Projekt.program_type WHERE program_type_name = 'Univerzitetni študij'`;

    // Insert study programs
    console.log('Inserting study programs...');
    await sql`
      INSERT INTO RPO_Projekt.study_program (study_program_name, code, FK_program_type_id, FK_faculty_id) VALUES
      ('Računalništvo in informatika', 'RI', ${univType.program_type_id}, ${fri.faculty_id}),
      ('Računalništvo in matematika', 'RM', ${univType.program_type_id}, ${fri.faculty_id})
      ON CONFLICT DO NOTHING
    `;

    // Insert year semesters
    console.log('Inserting year semesters...');
    await sql`
      INSERT INTO RPO_Projekt.year_semester (semester_number) VALUES
      (1), (2), (3), (4), (5), (6)
      ON CONFLICT DO NOTHING
    `;

    // Get study programs
    const programs = await sql`SELECT study_program_id, study_program_name FROM RPO_Projekt.study_program`;
    const semesters = await sql`SELECT year_semester_id, semester_number FROM RPO_Projekt.year_semester`;

    // Insert tracks for each program and semester
    console.log('Inserting tracks...');
    for (const program of programs) {
      for (const semester of semesters) {
        await sql`
          INSERT INTO RPO_Projekt.track (track_name, track_code, FK_study_program_id, FK_year_semester_id) VALUES
          (${program.study_program_name} || ' - ' || ${semester.semester_number} || '. semester', 
           ${program.study_program_name.substring(0, 2)} || ${semester.semester_number}, 
           ${program.study_program_id}, 
           ${semester.year_semester_id})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    // Insert academic years
    console.log('Inserting academic years...');
    await sql`
      INSERT INTO RPO_Projekt.academic_year (year_label, date_start, date_end) VALUES
      ('2024/2025', '2024-10-01', '2025-09-30'),
      ('2025/2026', '2025-10-01', '2026-09-30')
      ON CONFLICT DO NOTHING
    `;

    // Insert courses
    console.log('Inserting courses...');
    
    const courses = [
      { name: 'Algoritmi in podatkovne strukture', code: 'APS', ects: 6 },
      { name: 'Programiranje 1', code: 'P1', ects: 6 },
      { name: 'Programiranje 2', code: 'P2', ects: 6 },
      { name: 'Računalniške arhitekture', code: 'RA', ects: 6 },
      { name: 'Verjetnost in statistika', code: 'VS', ects: 6 },
      { name: 'Diskretne strukture', code: 'DS', ects: 6 },
      { name: 'Razvoj programske opreme', code: 'RPO', ects: 6 },
      { name: 'Operacijski sistemi', code: 'OS', ects: 6 },
      { name: 'Računalniške komunikacije', code: 'RK', ects: 6 },
      { name: 'Podatkovne baze', code: 'PB', ects: 6 }
    ];

    for (const course of courses) {
      await sql`
        INSERT INTO RPO_Projekt.course (course_name, course_code, ECTS_points) VALUES
        (${course.name}, ${course.code}, ${course.ects})
        ON CONFLICT DO NOTHING
      `;
    }

    // Get inserted data
    const allCourses = await sql`SELECT course_id FROM RPO_Projekt.course`;
    const allTracks = await sql`SELECT track_id, FK_study_program_id, FK_year_semester_id FROM RPO_Projekt.track`;
    const [academicYear] = await sql`SELECT academic_year_id FROM RPO_Projekt.academic_year WHERE year_label = '2024/2025'`;

    // Insert study groups (one for each track in current academic year)
    console.log('Inserting study groups...');
    for (const track of allTracks) {
      await sql`
        INSERT INTO RPO_Projekt.study_group (group_name, FK_track_id, FK_academic_year_id) VALUES
        ('Group ' || ${track.track_id}, ${track.track_id}, ${academicYear.academic_year_id})
        ON CONFLICT DO NOTHING
      `;
    }

    // Get study groups
    const studyGroups = await sql`SELECT study_group_id, FK_track_id FROM RPO_Projekt.study_group`;

    // Insert course offerings (link courses to study groups)
    console.log('Inserting course offerings...');
    for (const studyGroup of studyGroups) {
      // Assign 3-5 random courses to each study group
      const numCourses = 3 + Math.floor(Math.random() * 3);
      const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
      const selectedCourses = shuffled.slice(0, numCourses);

      for (const course of selectedCourses) {
        await sql`
          INSERT INTO RPO_Projekt.course_offering (is_active, FK_course_id, FK_study_group_id) VALUES
          (true, ${course.course_id}, ${studyGroup.study_group_id})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();

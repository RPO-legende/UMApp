-- Database Initialization Script for PostgreSQL
-- Schema: RPO_Projekt

-- Create schema
DROP SCHEMA IF EXISTS RPO_Projekt CASCADE;
CREATE SCHEMA RPO_Projekt;

-- Set search path to use the schema
SET search_path TO RPO_Projekt;

-- Table: user
CREATE TABLE RPO_Projekt."user" (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: role
CREATE TABLE RPO_Projekt.role (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(45)
);

-- Table: user_role
CREATE TABLE RPO_Projekt.user_role (
  user_role_id SERIAL PRIMARY KEY,
  valid_from DATE,
  valid_to DATE,
  FK_user_id INT NOT NULL,
  FK_role_id INT NOT NULL,
  CONSTRAINT fk_user_role_user FOREIGN KEY (FK_user_id) REFERENCES RPO_Projekt."user" (user_id),
  CONSTRAINT fk_user_role_role1 FOREIGN KEY (FK_role_id) REFERENCES RPO_Projekt.role (role_id)
);

-- Table: discord_server
CREATE TABLE RPO_Projekt.discord_server (
  discord_server_id SERIAL PRIMARY KEY,
  invite_url TEXT UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  icon_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FK_created_by_user_id INT,
  CONSTRAINT fk_discord_server_user FOREIGN KEY (FK_created_by_user_id) REFERENCES RPO_Projekt."user" (user_id)
);

-- Table: program_type
CREATE TABLE RPO_Projekt.program_type (
  program_type_id SERIAL PRIMARY KEY,
  program_type_name VARCHAR(45)
);

-- Table: faculty
CREATE TABLE RPO_Projekt.faculty (
  faculty_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Table: study_program
CREATE TABLE RPO_Projekt.study_program (
  study_program_id SERIAL PRIMARY KEY,
  study_program_name VARCHAR(45),
  code VARCHAR(45) NOT NULL,
  FK_program_type_id INT NOT NULL,
  FK_faculty_id INT NOT NULL,
  CONSTRAINT fk_study_program_program_type1 FOREIGN KEY (FK_program_type_id) REFERENCES RPO_Projekt.program_type (program_type_id),
  CONSTRAINT fk_study_program_faculty1 FOREIGN KEY (FK_faculty_id) REFERENCES RPO_Projekt.faculty (faculty_id)
);

-- Table: academic_year
CREATE TABLE RPO_Projekt.academic_year (
  academic_year_id SERIAL PRIMARY KEY,
  year_label VARCHAR(45),
  date_start DATE,
  date_end DATE
);

-- Table: year_semester
CREATE TABLE RPO_Projekt.year_semester (
  year_semester_id SERIAL PRIMARY KEY,
  semester_number INT,
  date_start DATE,
  date_end DATE
);

-- Table: track
CREATE TABLE RPO_Projekt.track (
  track_id SERIAL PRIMARY KEY,
  track_name VARCHAR(45),
  track_code VARCHAR(45),
  FK_study_program_id INT NOT NULL,
  FK_year_semester_id INT NOT NULL,
  CONSTRAINT fk_track_study_program1 FOREIGN KEY (FK_study_program_id) REFERENCES RPO_Projekt.study_program (study_program_id),
  CONSTRAINT fk_track_year_semester1 FOREIGN KEY (FK_year_semester_id) REFERENCES RPO_Projekt.year_semester (year_semester_id)
);

-- Table: student_profile
CREATE TABLE RPO_Projekt.student_profile (
  student_profile_id SERIAL PRIMARY KEY,
  student_number VARCHAR(45),
  FK_user_id INT NOT NULL,
  CONSTRAINT fk_student_profile_user1 FOREIGN KEY (FK_user_id) REFERENCES RPO_Projekt."user" (user_id)
);

-- Table: study_group
CREATE TABLE RPO_Projekt.study_group (
  study_group_id SERIAL PRIMARY KEY,
  group_name VARCHAR(45),
  FK_track_id INT NOT NULL,
  FK_academic_year_id INT NOT NULL,
  CONSTRAINT fk_study_group_track1 FOREIGN KEY (FK_track_id) REFERENCES RPO_Projekt.track (track_id),
  CONSTRAINT fk_study_group_academic_year1 FOREIGN KEY (FK_academic_year_id) REFERENCES RPO_Projekt.academic_year (academic_year_id)
);

-- Table: study_group_member
CREATE TABLE RPO_Projekt.study_group_member (
  study_group_member_id SERIAL PRIMARY KEY,
  FK_user_id INT NOT NULL,
  FK_study_group_id INT NOT NULL,
  CONSTRAINT fk_study_group_member_user1 FOREIGN KEY (FK_user_id) REFERENCES RPO_Projekt."user" (user_id),
  CONSTRAINT fk_study_group_member_study_group1 FOREIGN KEY (FK_study_group_id) REFERENCES RPO_Projekt.study_group (study_group_id)
);

-- Table: course
CREATE TABLE RPO_Projekt.course (
  course_id SERIAL PRIMARY KEY,
  course_name VARCHAR(45),
  course_code VARCHAR(45),
  ECTS_points INT
);

-- Table: course_offering
CREATE TABLE RPO_Projekt.course_offering (
  course_offering_id SERIAL PRIMARY KEY,
  is_active BOOLEAN,
  FK_course_id INT NOT NULL,
  FK_study_group_id INT NOT NULL,
  CONSTRAINT fk_course_offering_course1 FOREIGN KEY (FK_course_id) REFERENCES RPO_Projekt.course (course_id),
  CONSTRAINT fk_course_offering_study_group1 FOREIGN KEY (FK_study_group_id) REFERENCES RPO_Projekt.study_group (study_group_id)
);

-- Table: delivery_type
CREATE TABLE RPO_Projekt.delivery_type (
  delivery_type_id SERIAL PRIMARY KEY,
  delivery_name VARCHAR(45)
);

-- Table: course_delivery
CREATE TABLE RPO_Projekt.course_delivery (
  course_delivery_id SERIAL PRIMARY KEY,
  is_for_all BOOLEAN,
  FK_course_offering_id INT NOT NULL,
  FK_delivery_type_id INT NOT NULL,
  CONSTRAINT fk_course_delivery_course_offering1 FOREIGN KEY (FK_course_offering_id) REFERENCES RPO_Projekt.course_offering (course_offering_id),
  CONSTRAINT fk_course_delivery_delivery_type1 FOREIGN KEY (FK_delivery_type_id) REFERENCES RPO_Projekt.delivery_type (delivery_type_id)
);

-- Table: course_group
CREATE TABLE RPO_Projekt.course_group (
  course_group_id SERIAL PRIMARY KEY,
  label VARCHAR(45),
  capacity INT,
  FK_course_delivery_id INT NOT NULL,
  CONSTRAINT fk_course_group_course_delivery1 FOREIGN KEY (FK_course_delivery_id) REFERENCES RPO_Projekt.course_delivery (course_delivery_id)
);

-- Table: course_group_member
CREATE TABLE RPO_Projekt.course_group_member (
  course_group_member_id SERIAL PRIMARY KEY,
  joined_at DATE,
  FK_course_group_id INT NOT NULL,
  FK_user_id INT NOT NULL,
  CONSTRAINT fk_course_group_member_course_group1 FOREIGN KEY (FK_course_group_id) REFERENCES RPO_Projekt.course_group (course_group_id),
  CONSTRAINT fk_course_group_member_user1 FOREIGN KEY (FK_user_id) REFERENCES RPO_Projekt."user" (user_id)
);

-- Table: staff_role
CREATE TABLE RPO_Projekt.staff_role (
  staff_role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(60) NOT NULL
);

-- Table: course_staff
CREATE TABLE RPO_Projekt.course_staff (
  course_staff_id SERIAL PRIMARY KEY,
  FK_course_offering_id INT NOT NULL,
  FK_user_id INT NOT NULL,
  FK_staff_role_id INT NOT NULL,
  CONSTRAINT fk_course_staff_course_offering1 FOREIGN KEY (FK_course_offering_id) REFERENCES RPO_Projekt.course_offering (course_offering_id),
  CONSTRAINT fk_course_staff_user1 FOREIGN KEY (FK_user_id) REFERENCES RPO_Projekt."user" (user_id),
  CONSTRAINT fk_course_staff_staff_role1 FOREIGN KEY (FK_staff_role_id) REFERENCES RPO_Projekt.staff_role (staff_role_id)
);

-- Table: schedule_entry
CREATE TABLE RPO_Projekt.schedule_entry (
  schedule_entry_id SERIAL PRIMARY KEY,
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  location VARCHAR(200) NOT NULL,
  FK_course_offering_id INT NOT NULL,
  FK_course_group_id INT,
  CONSTRAINT fk_schedule_entry_course_offering1 FOREIGN KEY (FK_course_offering_id) REFERENCES RPO_Projekt.course_offering (course_offering_id),
  CONSTRAINT fk_schedule_entry_course_group1 FOREIGN KEY (FK_course_group_id) REFERENCES RPO_Projekt.course_group (course_group_id)
);

-- Table: exam
CREATE TABLE RPO_Projekt.exam (
  exam_id SERIAL PRIMARY KEY,
  start_at TIMESTAMP,
  end_at TIMESTAMP,
  location VARCHAR(100),
  required_presence BOOLEAN,
  FK_course_offering_id INT NOT NULL,
  CONSTRAINT fk_exam_course_offering1 FOREIGN KEY (FK_course_offering_id) REFERENCES RPO_Projekt.course_offering (course_offering_id)
);

-- Table: exam_staff
CREATE TABLE RPO_Projekt.exam_staff (
  exam_staff_id SERIAL PRIMARY KEY,
  staff_role VARCHAR(45),
  FK_exam_id INT NOT NULL,
  FK_user_id INT NOT NULL,
  CONSTRAINT fk_exam_staff_exam1 FOREIGN KEY (FK_exam_id) REFERENCES RPO_Projekt.exam (exam_id),
  CONSTRAINT fk_exam_staff_user1 FOREIGN KEY (FK_user_id) REFERENCES RPO_Projekt."user" (user_id)
);

-- Table: chat_message
CREATE TABLE RPO_Projekt.chat_message (
  chat_message_id BIGSERIAL PRIMARY KEY,
  sent_at TIMESTAMP,
  content TEXT,
  FK_sender_user_id INT NOT NULL,
  FK_receiver_user_id INT NOT NULL,
  FK_reply_to_message BIGINT,
  CONSTRAINT fk_chat_message_user1 FOREIGN KEY (FK_sender_user_id) REFERENCES RPO_Projekt."user" (user_id),
  CONSTRAINT fk_chat_message_receiver_user1 FOREIGN KEY (FK_receiver_user_id) REFERENCES RPO_Projekt."user" (user_id),
  CONSTRAINT fk_chat_message_chat_message1 FOREIGN KEY (FK_reply_to_message) REFERENCES RPO_Projekt.chat_message (chat_message_id)
);

-- Table: material_file
CREATE TABLE RPO_Projekt.material_file (
  material_file_id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP,
  visibility VARCHAR(45),
  is_approved BOOLEAN,
  FK_uploader_user_id INT NOT NULL,
  CONSTRAINT fk_material_file_user1 FOREIGN KEY (FK_uploader_user_id) REFERENCES RPO_Projekt."user" (user_id)
);

-- Table: material_course
CREATE TABLE RPO_Projekt.material_course (
  material_course_id SERIAL PRIMARY KEY,
  FK_material_file_id INT NOT NULL,
  FK_course_id INT NOT NULL,
  CONSTRAINT fk_material_course_material_file1 FOREIGN KEY (FK_material_file_id) REFERENCES RPO_Projekt.material_file (material_file_id),
  CONSTRAINT fk_material_course_course1 FOREIGN KEY (FK_course_id) REFERENCES RPO_Projekt.course (course_id)
);

-- Table: material_approval
CREATE TABLE RPO_Projekt.material_approval (
  material_approval_id SERIAL PRIMARY KEY,
  status VARCHAR(45) NOT NULL,
  reviewed_at TIMESTAMP,
  note VARCHAR(300),
  FK_material_file_id INT NOT NULL,
  FK_reviewed_by_user_id INT,
  CONSTRAINT fk_material_approval_material_file1 FOREIGN KEY (FK_material_file_id) REFERENCES RPO_Projekt.material_file (material_file_id),
  CONSTRAINT fk_material_approval_user1 FOREIGN KEY (FK_reviewed_by_user_id) REFERENCES RPO_Projekt."user" (user_id)
);

-- Table: assignment
CREATE TABLE RPO_Projekt.assignment (
  assignment_id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  due_at TIMESTAMP,
  FK_course_offering_id INT NOT NULL,
  CONSTRAINT fk_assignment_course_offering1 FOREIGN KEY (FK_course_offering_id) REFERENCES RPO_Projekt.course_offering (course_offering_id)
);

-- Table: external_platform
CREATE TABLE RPO_Projekt.external_platform (
  external_platform_id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  category VARCHAR(45)
);

-- Table: external_link
CREATE TABLE RPO_Projekt.external_link (
  external_link_id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  url VARCHAR(500) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  description TEXT,
  created_at TIMESTAMP,
  is_approved BOOLEAN,
  FK_external_platform_id INT NOT NULL,
  FK_created_by_user_id INT NOT NULL,
  CONSTRAINT fk_external_link_external_platform1 FOREIGN KEY (FK_external_platform_id) REFERENCES RPO_Projekt.external_platform (external_platform_id),
  CONSTRAINT fk_external_link_user1 FOREIGN KEY (FK_created_by_user_id) REFERENCES RPO_Projekt."user" (user_id)
);

-- Table: external_link_target
CREATE TABLE RPO_Projekt.external_link_target (
  external_link_target_id SERIAL PRIMARY KEY,
  target_type VARCHAR(45) NOT NULL,
  FK_external_link_id INT NOT NULL,
  FK_study_group_id INT,
  FK_course_offering_id INT,
  FK_course_group_id INT,
  CONSTRAINT fk_external_link_target_external_link1 FOREIGN KEY (FK_external_link_id) REFERENCES RPO_Projekt.external_link (external_link_id),
  CONSTRAINT fk_external_link_target_study_group1 FOREIGN KEY (FK_study_group_id) REFERENCES RPO_Projekt.study_group (study_group_id),
  CONSTRAINT fk_external_link_target_course_offering1 FOREIGN KEY (FK_course_offering_id) REFERENCES RPO_Projekt.course_offering (course_offering_id),
  CONSTRAINT fk_external_link_target_course_group1 FOREIGN KEY (FK_course_group_id) REFERENCES RPO_Projekt.course_group (course_group_id)
);

-- Table: external_link_approval
CREATE TABLE RPO_Projekt.external_link_approval (
  external_link_approval_id SERIAL PRIMARY KEY,
  status VARCHAR(45) NOT NULL,
  reviewed_at TIMESTAMP,
  note VARCHAR(300),
  FK_external_link_id INT NOT NULL,
  FK_reviewed_by_user_id INT,
  CONSTRAINT fk_external_link_approval_external_link1 FOREIGN KEY (FK_external_link_id) REFERENCES RPO_Projekt.external_link (external_link_id),
  CONSTRAINT fk_external_link_approval_user1 FOREIGN KEY (FK_reviewed_by_user_id) REFERENCES RPO_Projekt."user" (user_id)
);

-- Table: news
CREATE TABLE RPO_Projekt.news (
  news_id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP,
  published_at TIMESTAMP,
  is_active BOOLEAN,
  is_pinned BOOLEAN,
  FK_created_by_user_id INT NOT NULL,
  FK_faculty_id INT NOT NULL,
  CONSTRAINT fk_news_user1 FOREIGN KEY (FK_created_by_user_id) REFERENCES RPO_Projekt."user" (user_id),
  CONSTRAINT fk_news_faculty1 FOREIGN KEY (FK_faculty_id) REFERENCES RPO_Projekt.faculty (faculty_id)
);

-- Table: permission
CREATE TABLE RPO_Projekt.permission (
  permission_id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL,
  description VARCHAR(300)
);

-- Table: role_permission
CREATE TABLE RPO_Projekt.role_permission (
  role_permission_id SERIAL PRIMARY KEY,
  FK_role_id INT NOT NULL,
  FK_permission_id INT NOT NULL,
  CONSTRAINT fk_role_permission_role1 FOREIGN KEY (FK_role_id) REFERENCES RPO_Projekt.role (role_id),
  CONSTRAINT fk_role_permission_permission1 FOREIGN KEY (FK_permission_id) REFERENCES RPO_Projekt.permission (permission_id)
);

-- Table: user_permission
CREATE TABLE RPO_Projekt.user_permission (
  user_permission_id SERIAL PRIMARY KEY,
  FK_user_id INT NOT NULL,
  FK_permission_id INT NOT NULL,
  is_allowed BOOLEAN NOT NULL,
  CONSTRAINT fk_user_permission_user1 FOREIGN KEY (FK_user_id) REFERENCES RPO_Projekt."user" (user_id),
  CONSTRAINT fk_user_permission_permission1 FOREIGN KEY (FK_permission_id) REFERENCES RPO_Projekt.permission (permission_id)
);

-- Table: note
CREATE TABLE RPO_Projekt.note (
  note_id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FK_program_id INT NOT NULL,
  FK_year_semester_id INT NOT NULL,
  FK_course_id INT NOT NULL,
  FK_uploader_user_id INT,
  CONSTRAINT fk_note_study_program FOREIGN KEY (FK_program_id) REFERENCES RPO_Projekt.study_program (study_program_id),
  CONSTRAINT fk_note_year_semester FOREIGN KEY (FK_year_semester_id) REFERENCES RPO_Projekt.year_semester (year_semester_id),
  CONSTRAINT fk_note_course FOREIGN KEY (FK_course_id) REFERENCES RPO_Projekt.course (course_id),
  CONSTRAINT fk_note_user FOREIGN KEY (FK_uploader_user_id) REFERENCES RPO_Projekt."user" (user_id)
);

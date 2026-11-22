import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { seedDatabase } from "./seed";
import { dataDir } from "./paths";

const globalForDb = globalThis as unknown as { __icpcDb?: DatabaseSync };

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner',
  designation TEXT,
  department_id INTEGER REFERENCES departments(id),
  unit_id INTEGER REFERENCES units(id),
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  must_change_password INTEGER NOT NULL DEFAULT 0,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(department_id);

CREATE TABLE IF NOT EXISTS app_sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON app_sessions(user_id);

CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_ip TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);

CREATE TABLE IF NOT EXISTS course_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES course_categories(id),
  department_id INTEGER REFERENCES departments(id),
  level TEXT NOT NULL DEFAULT 'Beginner',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  instructor_id INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'draft',
  legal_review_status TEXT NOT NULL DEFAULT 'not_required',
  is_mandatory INTEGER NOT NULL DEFAULT 0,
  cpd_points INTEGER NOT NULL DEFAULT 0,
  pass_mark INTEGER NOT NULL DEFAULT 60,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  exam_minutes INTEGER NOT NULL DEFAULT 30,
  objectives_json TEXT,
  prerequisites_json TEXT,
  approved_by INTEGER REFERENCES users(id),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

CREATE TABLE IF NOT EXISTS course_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL,
  comments TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);

CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'reading',
  content TEXT,
  video_url TEXT,
  resource_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'self',
  status TEXT NOT NULL DEFAULT 'active',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  last_lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
  enrolled_at TEXT NOT NULL,
  completed_at TEXT,
  UNIQUE(user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL,
  UNIQUE(enrollment_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS course_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'all',
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  mandatory INTEGER NOT NULL DEFAULT 1,
  due_date TEXT,
  assigned_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'quiz',
  instructions TEXT,
  pass_mark INTEGER NOT NULL DEFAULT 60,
  duration_minutes INTEGER NOT NULL DEFAULT 20,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  question_count INTEGER NOT NULL DEFAULT 0,
  shuffle INTEGER NOT NULL DEFAULT 0,
  show_results INTEGER NOT NULL DEFAULT 1,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assessments_course ON assessments(course_id);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options_json TEXT,
  correct_json TEXT,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_questions_course ON questions(course_id);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  points REAL NOT NULL DEFAULT 1,
  UNIQUE(assessment_id, question_id)
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  started_at TEXT NOT NULL,
  submitted_at TEXT,
  deadline_at TEXT,
  score REAL,
  max_score REAL,
  percent REAL,
  passed INTEGER,
  status TEXT NOT NULL DEFAULT 'in_progress',
  time_spent_seconds INTEGER,
  graded_by INTEGER REFERENCES users(id),
  graded_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment ON assessment_attempts(assessment_id);

CREATE TABLE IF NOT EXISTS attempt_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_json TEXT,
  auto_score REAL,
  manual_score REAL,
  is_correct INTEGER,
  feedback TEXT,
  graded_by INTEGER REFERENCES users(id),
  graded_at TEXT,
  UNIQUE(attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cert_no TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  final_score REAL NOT NULL,
  grade TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0,
  revoked_reason TEXT,
  UNIQUE(user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);

CREATE TABLE IF NOT EXISTS badges (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  icon TEXT NOT NULL DEFAULT 'award',
  criteria TEXT,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL REFERENCES badges(key) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  awarded_at TEXT NOT NULL,
  UNIQUE(user_id, badge_key)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all',
  pinned INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  published_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS training_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  modality TEXT NOT NULL DEFAULT 'virtual',
  venue TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 50,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TEXT NOT NULL,
  UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS course_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comments TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  actor_name TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details TEXT,
  ip TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS email_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  to_email TEXT,
  subject TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export function getDb(): DatabaseSync {
  if (!globalForDb.__icpcDb) {
    const dir = dataDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const db = new DatabaseSync(path.join(dir, "icpc-lms.db"));
    db.exec(SCHEMA);
    globalForDb.__icpcDb = db;
  }
  return globalForDb.__icpcDb;
}

export function initDb() {
  const db = getDb();
  // Seed once against the staff register; safe across restarts and HMR.
  const row = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (row.n === 0) {
    seedDatabase(db);
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function withTransaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

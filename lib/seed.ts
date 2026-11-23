import { hashPassword } from "./crypto";
import { allCourses } from "./content";

interface SeedUser {
  staffId: string;
  firstName: string;
  otherName?: string;
  lastName: string;
  role: string;
  designation: string;
  dept: string;
  unit?: string;
  status?: "active" | "pending";
  pendingActivation?: boolean;
}

const DEPARTMENTS: { code: string; name: string; description: string }[] = [
  { code: "LEGAL", name: "Legal Services", description: "Legal advice, prosecution support, statutory interpretation and legal drafting." },
  { code: "INVEST", name: "Investigation and Operations", description: "Case investigation, operations, evidence management and case documentation." },
  { code: "SEC", name: "Security and Intelligence", description: "Intelligence gathering, security risk management and threat assessment." },
  { code: "ICT", name: "ICT and Digital Transformation", description: "Information systems, cybersecurity, data governance and digital services." },
  { code: "HR", name: "Human Resources and Administration", description: "Staffing, training, welfare, performance and personnel administration." },
  { code: "PR", name: "Public Enlightenment and Public Relations", description: "Public education, media relations, advocacy and stakeholder engagement." },
  { code: "PRS", name: "Planning, Research and Statistics", description: "Policy analysis, research, monitoring, evaluation and institutional statistics." },
  { code: "FIN", name: "Finance and Accounts", description: "Financial management, budgeting, accounting and internal controls." },
  { code: "PROC", name: "Procurement and Supply Chain Management", description: "Procurement planning, contract management and supply chain integrity." },
  { code: "MON", name: "Monitoring and Compliance", description: "Compliance monitoring, systems review and corruption risk management." },
  { code: "ADMIN", name: "General Administration", description: "Institutional administration, records, facilities and support services." },
  { code: "ETHICS", name: "Ethics, Integrity and Professional Conduct", description: "Professional standards, integrity promotion and conduct advisory services." },
  { code: "CHAIR", name: "Office of the Chairman", description: "Executive leadership, strategic oversight and institutional governance." },
];

const UNITS: Record<string, string[]> = {
  ICT: ["Cybersecurity Unit", "Infrastructure and Support Unit", "Digital Transformation Unit"],
  INVEST: ["Financial Investigations Unit", "Case Management Unit", "Operations Unit"],
  LEGAL: ["Legal Drafting Unit", "Prosecution Support Unit"],
  HR: ["Training and Development Unit", "Personnel Records Unit"],
  SEC: ["Intelligence Analysis Unit", "Security Operations Unit"],
};

const CATEGORIES: { slug: string; name: string; description: string }[] = [
  { slug: "legal-services", name: "Legal Services", description: "Nigerian legislation, regulatory compliance, prosecution and legal drafting." },
  { slug: "investigation-operations", name: "Investigation and Operations", description: "Investigative practice, case management, evidence and operations." },
  { slug: "security-intelligence", name: "Security and Intelligence Gathering", description: "Intelligence analysis, security management and threat assessment." },
  { slug: "ict-digital", name: "ICT and Digital Transformation", description: "Cybersecurity, information security, data and digital government." },
  { slug: "human-resources", name: "Human Resources and Administration", description: "Public service rules, labour law, performance and people management." },
  { slug: "public-enlightenment", name: "Public Enlightenment and Public Relations", description: "Strategic communication, advocacy and stakeholder engagement." },
  { slug: "prs", name: "Planning, Research and Statistics", description: "Research, monitoring and evaluation, statistics and policy analysis." },
  { slug: "finance-accounts", name: "Finance and Accounts", description: "Public financial management, accounting and internal control." },
  { slug: "procurement-supply-chain", name: "Procurement and Supply Chain Management", description: "Public procurement, contract management and value for money." },
  { slug: "monitoring-compliance", name: "Monitoring and Compliance", description: "Compliance monitoring, risk management and systems review." },
  { slug: "general-leadership", name: "General Administration and Leadership Development", description: "Leadership, administration, change management and professional skills." },
  { slug: "ethics-integrity", name: "Ethics, Integrity and Professional Conduct", description: "Professional ethics, integrity and anti-corruption standards." },
];

const CATEGORY_DEPT: Record<string, string> = {
  "legal-services": "LEGAL",
  "investigation-operations": "INVEST",
  "security-intelligence": "SEC",
  "ict-digital": "ICT",
  "human-resources": "HR",
  "public-enlightenment": "PR",
  prs: "PRS",
  "finance-accounts": "FIN",
  "procurement-supply-chain": "PROC",
  "monitoring-compliance": "MON",
  "general-leadership": "ADMIN",
  "ethics-integrity": "ETHICS",
};

const BADGES = [
  { key: "course_explorer", name: "Course Explorer", description: "Completed your first course", tier: "bronze", icon: "compass", criteria: "Complete 1 course", sort: 1 },
  { key: "learning_champion", name: "Learning Champion", description: "Completed five courses across the portal", tier: "silver", icon: "trophy", criteria: "Complete 5 courses", sort: 2 },
  { key: "legal_compliance_specialist", name: "Legal Compliance Specialist", description: "Completed three legal and regulatory courses", tier: "gold", icon: "scale", criteria: "Complete 3 legal courses", sort: 3 },
  { key: "cybersecurity_champion", name: "Cybersecurity Awareness Champion", description: "Passed the cybersecurity awareness programme", tier: "silver", icon: "shield", criteria: "Pass Cybersecurity Awareness", sort: 4 },
  { key: "investigation_excellence", name: "Investigation Excellence", description: "Completed three investigation and operations courses", tier: "silver", icon: "search", criteria: "Complete 3 investigation courses", sort: 5 },
  { key: "intelligence_analyst", name: "Intelligence Analyst", description: "Passed the intelligence gathering and analysis course", tier: "bronze", icon: "eye", criteria: "Pass Intelligence Gathering and Analysis", sort: 6 },
  { key: "digital_transformation_champion", name: "Digital Transformation Champion", description: "Completed two ICT and digital courses", tier: "silver", icon: "cpu", criteria: "Complete 2 ICT courses", sort: 7 },
  { key: "integrity_ethics_advocate", name: "Integrity and Ethics Advocate", description: "Passed the public service rules and ethics course", tier: "bronze", icon: "handshake", criteria: "Pass Public Service Rules and Professional Ethics", sort: 8 },
  { key: "advanced_learner", name: "Advanced Learner", description: "Maintained an average score of 80% across three or more courses", tier: "gold", icon: "star", criteria: "Average 80% across 3 courses", sort: 9 },
  { key: "departmental_learning_champion", name: "Departmental Learning Champion", description: "Highest course completion record in your department", tier: "gold", icon: "medal", criteria: "Top learner in department", sort: 10 },
  { key: "high_performance", name: "High Performance", description: "Scored 90% or higher in a final examination", tier: "silver", icon: "zap", criteria: "Score 90%+ in a final exam", sort: 11 },
  { key: "learning_streak", name: "Learning Streak", description: "Studied on several separate days in a row", tier: "bronze", icon: "flame", criteria: "Learning activity on 5 separate days", sort: 12 },
];

const USERS: SeedUser[] = [
  { staffId: "P0001", firstName: "Ada", otherName: "Nneka", lastName: "Okafor", role: "super_admin", designation: "Director, ICT", dept: "ICT", unit: "Digital Transformation Unit" },
  { staffId: "P0002", firstName: "Ngozi", otherName: "Chiamaka", lastName: "Eze", role: "training_admin", designation: "Deputy Director, Training and Development", dept: "HR", unit: "Training and Development Unit" },
  { staffId: "P0003", firstName: "Ibrahim", otherName: "Musa", lastName: "Bello", role: "instructor", designation: "Assistant Director, Cybersecurity", dept: "ICT", unit: "Cybersecurity Unit" },
  { staffId: "P0004", firstName: "Aisha", lastName: "Lawal", role: "instructor", designation: "Principal Legal Officer", dept: "LEGAL", unit: "Legal Drafting Unit" },
  { staffId: "P0005", firstName: "Musa", lastName: "Danjuma", role: "instructor", designation: "Deputy Director, Investigations", dept: "INVEST", unit: "Financial Investigations Unit" },
  { staffId: "P0006", firstName: "Chinedu", lastName: "Anene", role: "coordinator", designation: "Departmental Training Coordinator", dept: "INVEST", unit: "Case Management Unit" },
  { staffId: "P0007", firstName: "Emeka", lastName: "Nwosu", role: "management", designation: "Director of Operations", dept: "CHAIR" },
  { staffId: "P0008", firstName: "Fatima", otherName: "Hauwa", lastName: "Abubakar", role: "learner", designation: "Senior Legal Officer", dept: "LEGAL", unit: "Prosecution Support Unit" },
  { staffId: "P0009", firstName: "Tunde", lastName: "Bakare", role: "learner", designation: "Senior Systems Analyst", dept: "ICT", unit: "Infrastructure and Support Unit" },
  { staffId: "P0010", firstName: "Halima", lastName: "Sani", role: "learner", designation: "Accounts Officer", dept: "FIN" },
  { staffId: "P0011", firstName: "Olumide", lastName: "Adebayo", role: "learner", designation: "Research Officer", dept: "PRS" },
  { staffId: "P0012", firstName: "Kelechi", lastName: "Obi", role: "learner", designation: "Public Relations Officer", dept: "PR" },
  { staffId: "P0013", firstName: "Zainab", lastName: "Musa", role: "learner", designation: "Procurement Officer", dept: "PROC" },
  { staffId: "P0014", firstName: "Peter", lastName: "Akpan", role: "learner", designation: "Compliance Monitoring Officer", dept: "MON" },
  { staffId: "P0015", firstName: "Funmi", lastName: "Adeleke", role: "learner", designation: "State Counsel", dept: "LEGAL" },
  { staffId: "P0016", firstName: "Suleiman", lastName: "Garba", role: "learner", designation: "Investigating Officer", dept: "INVEST", unit: "Operations Unit" },
  { staffId: "P0017", firstName: "Amara", lastName: "Okonkwo", role: "learner", designation: "Human Resources Officer", dept: "HR", unit: "Personnel Records Unit" },
  { staffId: "P0018", firstName: "Bala", lastName: "Yusuf", role: "learner", designation: "Finance Officer", dept: "FIN" },
  { staffId: "P0019", firstName: "Yetunde", otherName: "Folake", lastName: "Ojo", role: "learner", designation: "Cybersecurity Analyst", dept: "ICT", unit: "Cybersecurity Unit" },
  { staffId: "P0020", firstName: "Danladi", lastName: "Musa", role: "learner", designation: "Intelligence Officer", dept: "SEC", unit: "Intelligence Analysis Unit" },
  { staffId: "P0021", firstName: "Ifeoma", lastName: "Nnamdi", role: "learner", designation: "Administrative Officer", dept: "ADMIN" },
  { staffId: "P0022", firstName: "Grace", lastName: "Adeyemi", role: "learner", designation: "Training Officer", dept: "HR", unit: "Training and Development Unit", status: "pending", pendingActivation: true },
  { staffId: "P0023", firstName: "Samuel", lastName: "Adeoye", role: "learner", designation: "Legal Officer", dept: "LEGAL", unit: "Legal Drafting Unit" },
  { staffId: "P0024", firstName: "Blessing", lastName: "Etim", role: "learner", designation: "Statistician", dept: "PRS" },
  { staffId: "P0025", firstName: "Ahmed", lastName: "Sule", role: "learner", designation: "Supply Chain Officer", dept: "PROC" },
];

const DEPT_COURSE: Record<string, string> = {
  LEGAL: "aml-cft-essentials",
  INVEST: "fundamentals-anti-corruption-investigation",
  SEC: "intelligence-gathering-analysis",
  ICT: "data-protection-privacy-management",
  HR: "nigerian-labour-law",
  PR: "strategic-public-relations-advocacy",
  PRS: "monitoring-evaluation-foundations",
  FIN: "compliance-risk-management",
  PROC: "public-procurement-essentials",
  MON: "compliance-risk-management",
  ADMIN: "leadership-supervisory-skills",
  ETHICS: "public-service-rules-professional-ethics",
  CHAIR: "leadership-supervisory-skills",
};

const MANDATORY_SLUGS = [
  "understanding-the-icpc-act",
  "cybersecurity-awareness-public-officers",
  "public-service-rules-professional-ethics",
];

function gradeFor(percent: number): string {
  if (percent >= 85) return "Distinction";
  if (percent >= 70) return "Merit";
  return "Pass";
}

export function seedDatabase(db: any) {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const daysAgo = (days: number, hour = 9) => {
    const d = new Date(now.getTime() - days * 86400000);
    d.setUTCHours(hour, 0, 0, 0);
    return d;
  };
  const daysAhead = (days: number, hour = 10) => {
    const d = new Date(now.getTime() + days * 86400000);
    d.setUTCHours(hour, 0, 0, 0);
    return d;
  };
  const year = new Date().getFullYear();
  const demoHash = hashPassword("ICPC@2026");
  let certSeq = 1;
  const newCertNo = () => `ICPC-${year}-${String(certSeq++).padStart(5, "0")}`;

  db.exec("BEGIN");
  try {
    // ---------------------------------------------------------------- settings
    const settings: Record<string, string> = {
      institution_name: "Independent Corrupt Practices and Other Related Offences Commission",
      institution_short: "ICPC",
      portal_name: "ICPC Digital Learning and Capacity Development Portal",
      motto: "Integrity, Transparency, Accountability",
      support_email: "lms.support@icpc.gov.ng",
      signatory_name: "Chairman, ICPC",
      signatory_title: "Chairman, Independent Corrupt Practices and Other Related Offences Commission",
      annual_cpd_target: "40",
      default_pass_mark: "60",
      email_notifications: "1",
      email_mode: "simulation",
      demo_mode: "1",
      retention_years: "7",
      certificate_prefix: "ICPC",
      max_login_attempts: "5",
      lockout_minutes: "15",
    };
    const setStmt = db.prepare("INSERT OR REPLACE INTO settings(key, value) VALUES(?, ?)");
    for (const [k, v] of Object.entries(settings)) setStmt.run(k, v);

    // ------------------------------------------------------------- departments
    const deptIds = new Map<string, number>();
    const deptStmt = db.prepare("INSERT INTO departments(name, code, description, created_at) VALUES(?,?,?,?)");
    for (const d of DEPARTMENTS) {
      const info = deptStmt.run(d.name, d.code, d.description, iso(daysAgo(360)));
      deptIds.set(d.code, Number(info.lastInsertRowid));
    }

    const unitIds = new Map<string, number>();
    const unitStmt = db.prepare("INSERT INTO units(department_id, name, created_at) VALUES(?,?,?)");
    for (const [deptCode, units] of Object.entries(UNITS)) {
      for (const name of units) {
        const info = unitStmt.run(deptIds.get(deptCode)!, name, iso(daysAgo(360)));
        unitIds.set(`${deptCode}:${name}`, Number(info.lastInsertRowid));
      }
    }

    // --------------------------------------------------------------- categories
    const catIds = new Map<string, number>();
    const catStmt = db.prepare("INSERT INTO course_categories(name, slug, description, created_at) VALUES(?,?,?,?)");
    for (const c of CATEGORIES) {
      const info = catStmt.run(c.name, c.slug, c.description, iso(daysAgo(360)));
      catIds.set(c.slug, Number(info.lastInsertRowid));
    }

    // ------------------------------------------------------------------- badges
    const badgeStmt = db.prepare(
      "INSERT INTO badges(key, name, description, tier, icon, criteria, sort) VALUES(?,?,?,?,?,?,?)"
    );
    for (const b of BADGES) {
      badgeStmt.run(b.key, b.name, b.description, b.tier, b.icon, b.criteria, b.sort);
    }

    // -------------------------------------------------------------------- users
    const userIds = new Map<string, number>();
    const userStmt = db.prepare(`
      INSERT INTO users(staff_id, email, password_hash, first_name, middle_name, last_name, role, designation,
        department_id, unit_id, phone, status, must_change_password, last_login_at, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    for (const u of USERS) {
      const email = `${u.firstName.toLowerCase()}.${u.lastName.toLowerCase()}@icpc.gov.ng`;
      const deptId = deptIds.get(u.dept)!;
      const unitId = u.unit ? unitIds.get(`${u.dept}:${u.unit}`) ?? null : null;
      const status = u.status ?? "active";
      const info = userStmt.run(
        u.staffId,
        email,
        u.pendingActivation ? null : demoHash,
        u.firstName,
        u.otherName ?? null,
        u.lastName,
        u.role,
        u.designation,
        deptId,
        unitId,
        null,
        status,
        0,
        u.pendingActivation ? null : iso(daysAgo(3, 8)),
        iso(daysAgo(180)),
        iso(daysAgo(3))
      );
      userIds.set(u.staffId, Number(info.lastInsertRowid));
    }

    // ------------------------------------------------------------- announcements
    const annStmt = db.prepare(
      "INSERT INTO announcements(title, body, audience, pinned, created_by, published_at) VALUES(?,?,?,?,?,?)"
    );
    annStmt.run(
      "Mandatory Q4 training window now open",
      "All officers are required to complete the three institutional mandatory courses by 31 December. Progress is visible on your learner dashboard and to your Departmental Training Coordinator.",
      "all",
      1,
      userIds.get("P0002"),
      iso(daysAgo(2))
    );
    annStmt.run(
      "New data protection module published",
      "The Data Protection and Privacy Management course has been updated to reflect the Nigeria Data Protection Act 2023 and institutional breach-reporting procedures.",
      "all",
      0,
      userIds.get("P0001"),
      iso(daysAgo(7))
    );
    annStmt.run(
      "Certificate verification is now available",
      "Every ICPC course certificate now carries a QR code and a unique certificate number. Employers and partner institutions can verify authenticity on the public verification page.",
      "all",
      0,
      userIds.get("P0001"),
      iso(daysAgo(12))
    );
    annStmt.run(
      "Call for course reviewers — Legal Services",
      "Legal courses currently carry demonstration labels pending formal Legal Department review. Qualified reviewers should contact the Training and Development Unit.",
      "instructors",
      0,
      userIds.get("P0002"),
      iso(daysAgo(4))
    );

    // ----------------------------------------------------------------- sessions
    const sessStmt = db.prepare(`
      INSERT INTO training_sessions(course_id, title, description, modality, venue, starts_at, ends_at, capacity, created_by, created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)
    `);
    sessStmt.run(
      null,
      "Cybersecurity Awareness Clinic",
      "Live clinic on phishing, password hygiene and incident reporting, aligned with the mandatory cybersecurity course.",
      "virtual",
      "Microsoft Teams (link shared on registration)",
      iso(daysAhead(4, 10)),
      iso(daysAhead(4, 12)),
      120,
      userIds.get("P0003"),
      iso(daysAgo(5))
    );
    sessStmt.run(
      null,
      "Investigative Report Writing Workshop",
      "Practical workshop with peer review of executive summaries and evidence referencing.",
      "physical",
      "ICPC Academy, Abuja — Seminar Room B",
      iso(daysAhead(11, 9)),
      iso(daysAhead(11, 14)),
      40,
      userIds.get("P0005"),
      iso(daysAgo(6))
    );
    sessStmt.run(
      null,
      "AML/CFT Roundtable: emerging risks",
      "Roundtable on virtual assets, beneficial ownership and suspicious transaction reporting.",
      "hybrid",
      "Conference Hall, ICPC Headquarters",
      iso(daysAhead(18, 14)),
      iso(daysAhead(18, 16)),
      80,
      userIds.get("P0004"),
      iso(daysAgo(3))
    );
    sessStmt.run(
      null,
      "Leadership Conversation: integrity under pressure",
      "Executive conversation on ethical leadership and decision-making in sensitive operations.",
      "virtual",
      "ICPC staff portal",
      iso(daysAhead(25, 11)),
      iso(daysAhead(25, 12)),
      200,
      userIds.get("P0002"),
      iso(daysAgo(1))
    );

    // ------------------------------------------------------------------ courses
    const courseStmt = db.prepare(`
      INSERT INTO courses(slug, title, summary, description, category_id, department_id, level, duration_minutes,
        instructor_id, created_by, status, legal_review_status, is_mandatory, cpd_points, pass_mark, max_attempts,
        exam_minutes, objectives_json, prerequisites_json, approved_by, published_at, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    const moduleStmt = db.prepare("INSERT INTO modules(course_id, title, description, position) VALUES(?,?,?,?)");
    const lessonStmt = db.prepare(
      "INSERT INTO lessons(module_id, title, type, content, video_url, resource_url, duration_minutes, position) VALUES(?,?,?,?,?,?,?,?)"
    );
    const assessmentStmt = db.prepare(`
      INSERT INTO assessments(course_id, module_id, title, type, instructions, pass_mark, duration_minutes, max_attempts,
        question_count, shuffle, show_results, is_published, created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    const questionStmt = db.prepare(`
      INSERT INTO questions(course_id, type, prompt, options_json, correct_json, explanation, points, difficulty, created_at)
      VALUES(?,?,?,?,?,?,?,?,?)
    `);
    const linkStmt = db.prepare(
      "INSERT INTO assessment_questions(assessment_id, question_id, position, points) VALUES(?,?,?,?)"
    );

    const courseMeta = new Map<
      number,
      {
        slug: string;
        title: string;
        category: string;
        lessons: number[];
        finalAssessmentId: number;
        finalMaxScore: number;
        passMark: number;
        deptCode: string;
      }
    >();
    const courseIdBySlug = new Map<string, number>();
    const instructorByStaff = new Map<string, number>();

    for (const [idx, c] of allCourses.entries()) {
      const instructorId = userIds.get(c.instructorStaffId)!;
      instructorByStaff.set(c.instructorStaffId, instructorId);
      const deptCode = CATEGORY_DEPT[c.category] ?? "ADMIN";
      const info = courseStmt.run(
        c.slug,
        c.title,
        c.summary,
        c.description,
        catIds.get(c.category)!,
        deptIds.get(deptCode)!,
        c.level,
        c.durationMinutes,
        instructorId,
        instructorId,
        "published",
        c.legalDemo ? "demo_pending" : "not_required",
        c.mandatory ? 1 : 0,
        c.cpdPoints,
        c.passMark,
        c.maxAttempts,
        c.examMinutes,
        JSON.stringify(c.objectives),
        JSON.stringify(c.prerequisites ?? []),
        userIds.get("P0001"),
        iso(daysAgo(70 - idx * 3)),
        iso(daysAgo(80 - idx * 3)),
        iso(daysAgo(10))
      );
      const courseId = Number(info.lastInsertRowid);
      courseIdBySlug.set(c.slug, courseId);

      const lessonIds: number[] = [];
      for (const [mi, m] of c.modules.entries()) {
        const mInfo = moduleStmt.run(courseId, m.title, m.description, mi + 1);
        const moduleId = Number(mInfo.lastInsertRowid);
        for (const [li, l] of m.lessons.entries()) {
          const lInfo = lessonStmt.run(
            moduleId,
            l.title,
            l.type ?? "reading",
            l.content,
            l.videoUrl ?? null,
            null,
            l.minutes,
            li + 1
          );
          lessonIds.push(Number(lInfo.lastInsertRowid));
        }

        if (m.knowledgeCheck) {
          const kcInfo = assessmentStmt.run(
            courseId,
            moduleId,
            m.knowledgeCheck.title,
            "knowledge_check",
            "Check your understanding before continuing. This knowledge check is not timed and does not count toward your final grade.",
            50,
            0,
            3,
            0,
            0,
            1,
            1,
            iso(daysAgo(60))
          );
          const kcId = Number(kcInfo.lastInsertRowid);
          for (const [qi, q] of m.knowledgeCheck.questions.entries()) {
            const qInfo = questionStmt.run(
              courseId,
              q.type,
              q.prompt,
              q.options ? JSON.stringify(q.options) : null,
              q.correct === undefined ? null : JSON.stringify(q.correct),
              q.explanation ?? null,
              q.points ?? 1,
              q.difficulty ?? "easy",
              iso(daysAgo(60))
            );
            linkStmt.run(kcId, Number(qInfo.lastInsertRowid), qi + 1, q.points ?? 1);
          }
        }
      }

      const finalInfo = assessmentStmt.run(
        courseId,
        null,
        `Final Examination: ${c.title}`,
        "final_exam",
        `This examination is timed for ${c.examMinutes} minutes. You may attempt it up to ${c.maxAttempts} times. A score of ${c.passMark}% or higher is required to complete the course and earn a certificate.`,
        c.passMark,
        c.examMinutes,
        c.maxAttempts,
        0,
        0,
        1,
        1,
        iso(daysAgo(55))
      );
      const finalId = Number(finalInfo.lastInsertRowid);
      let maxScore = 0;
      for (const [qi, q] of c.finalExam.entries()) {
        const pts = q.points ?? 1;
        maxScore += pts;
        const qInfo = questionStmt.run(
          courseId,
          q.type,
          q.prompt,
          q.options ? JSON.stringify(q.options) : null,
          q.correct === undefined ? null : JSON.stringify(q.correct),
          q.explanation ?? null,
          pts,
          q.difficulty ?? "medium",
          iso(daysAgo(55))
        );
        linkStmt.run(finalId, Number(qInfo.lastInsertRowid), qi + 1, pts);
      }

      if (c.assignment) {
        const asgInfo = assessmentStmt.run(
          courseId,
          null,
          c.assignment.title,
          "assignment",
          c.assignment.instructions,
          50,
          0,
          1,
          0,
          0,
          1,
          1,
          iso(daysAgo(50))
        );
        const asgId = Number(asgInfo.lastInsertRowid);
        const qInfo = questionStmt.run(
          courseId,
          "essay",
          c.assignment.prompt,
          null,
          null,
          "Graded manually by the course instructor against the stated criteria.",
          c.assignment.points,
          "hard",
          iso(daysAgo(50))
        );
        linkStmt.run(asgId, Number(qInfo.lastInsertRowid), 1, c.assignment.points);
      }

      courseMeta.set(courseId, {
        slug: c.slug,
        title: c.title,
        category: c.category,
        lessons: lessonIds,
        finalAssessmentId: finalId,
        finalMaxScore: maxScore,
        passMark: c.passMark,
        deptCode,
      });
    }

    // --------------------------------------------------------------- assignments
    const assignStmt = db.prepare(`
      INSERT INTO course_assignments(course_id, scope, department_id, user_id, mandatory, due_date, assigned_by, created_at)
      VALUES(?,?,?,?,?,?,?,?)
    `);
    for (const slug of MANDATORY_SLUGS) {
      assignStmt.run(
        courseIdBySlug.get(slug)!,
        "all",
        null,
        null,
        1,
        iso(daysAhead(39, 17)),
        userIds.get("P0002"),
        iso(daysAgo(20))
      );
    }
    const deptAssignments: [string, string][] = [
      ["data-protection-privacy-management", "ICT"],
      ["intelligence-gathering-analysis", "SEC"],
      ["investigative-report-writing", "INVEST"],
      ["public-procurement-essentials", "PROC"],
    ];
    for (const [slug, deptCode] of deptAssignments) {
      assignStmt.run(
        courseIdBySlug.get(slug)!,
        "department",
        deptIds.get(deptCode)!,
        null,
        1,
        iso(daysAhead(55, 17)),
        userIds.get("P0002"),
        iso(daysAgo(15))
      );
    }

    // --------------------------------------------------------------- enrollments
    const enrollStmt = db.prepare(
      "INSERT OR IGNORE INTO enrollments(user_id, course_id, source, status, progress_percent, last_lesson_id, enrolled_at, completed_at) VALUES(?,?,?,?,?,?,?,?)"
    );
    const findEnroll = db.prepare("SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?");
    const progressStmt = db.prepare(
      "INSERT OR IGNORE INTO lesson_progress(enrollment_id, lesson_id, completed_at) VALUES(?,?,?)"
    );
    const updateEnroll = db.prepare(
      "UPDATE enrollments SET status = ?, progress_percent = ?, last_lesson_id = ?, completed_at = ? WHERE id = ?"
    );
    const attemptStmt = db.prepare(`
      INSERT INTO assessment_attempts(assessment_id, user_id, attempt_number, started_at, submitted_at, deadline_at,
        score, max_score, percent, passed, status, time_spent_seconds, graded_by, graded_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    const certStmt = db.prepare(
      "INSERT OR IGNORE INTO certificates(cert_no, user_id, course_id, final_score, grade, issued_at) VALUES(?,?,?,?,?,?)"
    );
    const notifStmt = db.prepare(
      "INSERT INTO notifications(user_id, title, body, type, link, is_read, created_at) VALUES(?,?,?,?,?,?,?)"
    );
    const feedbackStmt = db.prepare(
      "INSERT OR IGNORE INTO course_feedback(course_id, user_id, rating, comments, created_at) VALUES(?,?,?,?,?)"
    );
    const emailStmt = db.prepare(
      "INSERT INTO email_queue(user_id, to_email, subject, body, status, created_at) VALUES(?,?,?,?,?,?)"
    );

    const completions: { userId: number; courseId: number; category: string; score: number; deptCode: string; at: string }[] = [];

    const activeLearners = USERS.filter((u) => !u.pendingActivation);
    const learnerIndex = new Map<string, number>();
    activeLearners.forEach((u, i) => learnerIndex.set(u.staffId, i));

    const completeCourse = (staffId: string, slug: string, dayOffset: number, scorePercent: number) => {
      const userId = userIds.get(staffId)!;
      const courseId = courseIdBySlug.get(slug);
      if (!courseId) return;
      const meta = courseMeta.get(courseId)!;
      const completedAt = iso(daysAgo(dayOffset, 16));
      const enrolledAt = iso(daysAgo(dayOffset + 21, 9));
      enrollStmt.run(userId, courseId, "assigned", "completed", 100, meta.lessons[meta.lessons.length - 1] ?? null, enrolledAt, completedAt);
      const enr = findEnroll.get(userId, courseId) as { id: number } | undefined;
      if (!enr) return;
      meta.lessons.forEach((lessonId, i) => {
        progressStmt.run(enr.id, lessonId, iso(daysAgo(dayOffset + 14 - Math.min(i, 10), 11)));
      });
      const maxScore = meta.finalMaxScore;
      const earned = Math.round((scorePercent / 100) * maxScore * 10) / 10;
      attemptStmt.run(
        meta.finalAssessmentId,
        userId,
        1,
        iso(daysAgo(dayOffset + 1, 10)),
        completedAt,
        iso(daysAgo(dayOffset, 11)),
        earned,
        maxScore,
        scorePercent,
        scorePercent >= meta.passMark ? 1 : 0,
        "graded",
        900 + dayOffset * 3,
        userIds.get("P0001"),
        completedAt
      );
      if (scorePercent >= meta.passMark) {
        certStmt.run(newCertNo(), userId, courseId, scorePercent, gradeFor(scorePercent), completedAt);
        completions.push({ userId, courseId, category: meta.category, score: scorePercent, deptCode: meta.deptCode, at: completedAt });
        if (staffId === "P0008") {
          notifStmt.run(
            userId,
            "Certificate issued",
            `Your certificate for ${meta.title} is ready to download.`,
            "success",
            "/certificates",
            0,
            completedAt
          );
        }
      }
      if (staffId === "P0008") {
        feedbackStmt.run(courseId, userId, 5, "Practical, well-structured and relevant to my role.", completedAt);
      }
    };

    const startCourse = (staffId: string, slug: string, percent: number, dayOffset: number) => {
      const userId = userIds.get(staffId)!;
      const courseId = courseIdBySlug.get(slug);
      if (!courseId) return;
      const meta = courseMeta.get(courseId)!;
      enrollStmt.run(userId, courseId, "self", "active", 0, null, iso(daysAgo(dayOffset, 10)), null);
      const enr = findEnroll.get(userId, courseId) as { id: number } | undefined;
      if (!enr) return;
      const count = Math.max(1, Math.floor((percent / 100) * meta.lessons.length));
      for (let i = 0; i < count; i++) {
        progressStmt.run(enr.id, meta.lessons[i], iso(daysAgo(Math.max(1, dayOffset - i), 15)));
      }
      updateEnroll.run("active", percent, meta.lessons[count - 1] ?? null, null, enr.id);
    };

    for (const u of activeLearners) {
      const userId = userIds.get(u.staffId)!;
      const i = learnerIndex.get(u.staffId)!;
      const isLearner = u.role === "learner";

      for (const slug of MANDATORY_SLUGS) {
        const courseId = courseIdBySlug.get(slug)!;
        enrollStmt.run(userId, courseId, "assigned", "active", 0, null, iso(daysAgo(30 - (i % 10))), null);
        if (!isLearner) continue;
        if (slug === "cybersecurity-awareness-public-officers") {
          if (i % 3 !== 1) completeCourse(u.staffId, slug, 12 + ((i * 3) % 40), 70 + ((i * 7) % 26));
          else startCourse(u.staffId, slug, 25 + (i % 4) * 15, 8);
        } else if (slug === "public-service-rules-professional-ethics") {
          if (i % 4 === 2) completeCourse(u.staffId, slug, 18 + ((i * 5) % 30), 72 + ((i * 3) % 24));
          else if (i % 3 === 0) startCourse(u.staffId, slug, 30 + (i % 3) * 20, 6);
        } else {
          if (i % 5 === 1) completeCourse(u.staffId, slug, 22 + ((i * 4) % 25), 68 + ((i * 5) % 28));
          else if (i % 2 === 0) startCourse(u.staffId, slug, 40 + (i % 4) * 10, 5);
        }
      }

      if (isLearner) {
        const deptSlug = DEPT_COURSE[u.dept];
        if (deptSlug && !MANDATORY_SLUGS.includes(deptSlug)) {
          if (i % 2 === 0) completeCourse(u.staffId, deptSlug, 8 + ((i * 6) % 30), 70 + ((i * 4) % 25));
          else startCourse(u.staffId, deptSlug, 20 + (i % 4) * 15, 7);
        }
        if (u.staffId === "P0008") {
          startCourse(u.staffId, "understanding-the-icpc-act", 50, 6);
          startCourse(u.staffId, "aml-cft-essentials", 25, 9);
        }
        if (u.staffId === "P0019" || u.staffId === "P0020") {
          if (u.staffId === "P0019") completeCourse(u.staffId, "intelligence-gathering-analysis", 10, 88);
          if (u.staffId === "P0020") completeCourse(u.staffId, "data-protection-privacy-management", 9, 79);
        }
      }
    }

    // Department coordinator also has learning progress.
    startCourse("P0006", "evidence-collection-preservation", 35, 7);
    startCourse("P0005", "investigative-report-writing", 60, 4);

    // A submitted assignment awaiting instructor grading.
    const irwId = courseIdBySlug.get("investigative-report-writing")!;
    const irwAssign = db
      .prepare("SELECT id FROM assessments WHERE course_id = ? AND type = 'assignment' LIMIT 1")
      .get(irwId) as { id: number } | undefined;
    if (irwAssign) {
      const essayQ = db
        .prepare(
          "SELECT q.id, aq.points FROM questions q JOIN assessment_questions aq ON aq.question_id = q.id WHERE aq.assessment_id = ? LIMIT 1"
        )
        .get(irwAssign.id) as { id: number; points: number } | undefined;
      if (essayQ) {
        const submittedAt = iso(daysAgo(2, 15));
        const info = attemptStmt.run(
          irwAssign.id,
          userIds.get("P0016")!,
          1,
          iso(daysAgo(2, 13)),
          submittedAt,
          submittedAt,
          null,
          essayQ.points,
          null,
          null,
          "submitted",
          2400,
          null,
          null
        );
        db.prepare(
          "INSERT INTO attempt_responses(attempt_id, question_id, answer_json, auto_score, manual_score, is_correct) VALUES(?,?,?,?,?,?)"
        ).run(
          Number(info.lastInsertRowid),
          essayQ.id,
          JSON.stringify(
            "EXECUTIVE SUMMARY\n\nAllegation: The procurement officer approved a N12 million supply contract without competitive bidding to a company linked to a relative.\n\nEvidence reviewed: the contract, a single quotation, and company registration records showing the relative as a director. The officer declined interview but submitted a written urgency claim. Bank records were unavailable.\n\nFindings: It is established that only one quotation was obtained and that a relative is a director of the supplier. An inference of favouritism is reasonable but not yet proven. The claim of urgency is unverified.\n\nGaps: bank records, procurement approval trail and the relationship between the officer and the supplier require further enquiry.\n\nRecommendation: extend the investigation, obtain financial records, and consider interim administrative safeguards."
          ),
          null,
          null,
          null
        );
        const notif = db
          .prepare("SELECT id FROM notifications WHERE user_id = 1 LIMIT 1")
          .get() as { id: number } | undefined;
        if (!notif) {
          notifStmt.run(
            userIds.get("P0005")!,
            "Assignment awaiting your grading",
            "Suleiman Garba submitted the Investigative Report Writing assignment.",
            "info",
            "/instructor/grading",
            0,
            submittedAt
          );
        }
      }
    }

    // ------------------------------------------------------- badges from activity
    const badgeAwardStmt = db.prepare(
      "INSERT OR IGNORE INTO user_badges(user_id, badge_key, course_id, awarded_at) VALUES(?,?,?,?)"
    );
    const completionsByUser = new Map<number, typeof completions>();
    for (const c of completions) {
      if (!completionsByUser.has(c.userId)) completionsByUser.set(c.userId, []);
      completionsByUser.get(c.userId)!.push(c);
    }
    const slugByCourseId = new Map<number, string>();
    for (const [id, meta] of courseMeta) slugByCourseId.set(id, meta.slug);

    for (const [userId, list] of completionsByUser) {
      const count = list.length;
      const avg = list.reduce((s, c) => s + c.score, 0) / count;
      const award = (key: string, courseId: number | null) =>
        badgeAwardStmt.run(userId, key, courseId, iso(daysAgo(1, 12)));
      if (count >= 1) award("course_explorer", list[0].courseId);
      if (count >= 5) award("learning_champion", null);
      if (list.filter((c) => c.category === "legal-services").length >= 3) award("legal_compliance_specialist", null);
      if (list.some((c) => slugByCourseId.get(c.courseId) === "cybersecurity-awareness-public-officers")) award("cybersecurity_champion", null);
      if (list.filter((c) => c.category === "investigation-operations").length >= 3) award("investigation_excellence", null);
      if (list.some((c) => slugByCourseId.get(c.courseId) === "intelligence-gathering-analysis")) award("intelligence_analyst", null);
      if (list.filter((c) => c.category === "ict-digital").length >= 2) award("digital_transformation_champion", null);
      if (list.some((c) => slugByCourseId.get(c.courseId) === "public-service-rules-professional-ethics")) award("integrity_ethics_advocate", null);
      if (count >= 3 && avg >= 80) award("advanced_learner", null);
      if (list.some((c) => c.score >= 90)) award("high_performance", null);
    }

    const deptScores = new Map<string, Map<number, number>>();
    for (const c of completions) {
      if (!deptScores.has(c.deptCode)) deptScores.set(c.deptCode, new Map());
      const m = deptScores.get(c.deptCode)!;
      m.set(c.userId, (m.get(c.userId) ?? 0) + 1);
    }
    for (const [, m] of deptScores) {
      let topUser = 0;
      let topCount = 0;
      for (const [uid, count] of m) {
        if (count > topCount) {
          topCount = count;
          topUser = uid;
        }
      }
      if (topCount >= 2) badgeAwardStmt.run(topUser, "departmental_learning_champion", null, iso(daysAgo(1, 12)));
    }

    // ---------------------------------------------------------------- feedback
    const feedbackSamples: [string, string, number, string][] = [
      ["P0009", "cybersecurity-awareness-public-officers", 5, "Clear and directly applicable to our daily work."],
      ["P0020", "intelligence-gathering-analysis", 4, "The structured analysis techniques were especially useful."],
      ["P0015", "aml-cft-essentials", 4, "Good overview; I would like more case studies."],
      ["P0010", "public-service-rules-professional-ethics", 5, "Very relevant refresher on conduct and records."],
    ];
    for (const [staffId, slug, rating, comment] of feedbackSamples) {
      feedbackStmt.run(courseIdBySlug.get(slug)!, userIds.get(staffId)!, rating, comment, iso(daysAgo(9)));
    }

    // ----------------------------------------------------------- notifications
    for (const u of USERS) {
      if (u.pendingActivation) continue;
      notifStmt.run(
        userIds.get(u.staffId)!,
        "Welcome to the ICPC Learning Portal",
        "Your learning profile is active. Explore the course catalogue and check your mandatory training assignments.",
        "info",
        "/courses",
        1,
        iso(daysAgo(14))
      );
    }
    notifStmt.run(
      userIds.get("P0008")!,
      "Mandatory training reminder",
      "You have outstanding mandatory courses. Complete them before the 31 December compliance deadline.",
      "warning",
      "/dashboard",
      0,
      iso(daysAgo(1))
    );
    notifStmt.run(
      userIds.get("P0008")!,
      "New course recommendation",
      "Based on your Legal Services role, 'Anti-Money Laundering and Counter-Terrorism Financing' has been recommended for you.",
      "info",
      "/courses/aml-cft-essentials",
      0,
      iso(daysAgo(3))
    );

    // ------------------------------------------------------- session registration
    db.prepare(
      "INSERT OR IGNORE INTO session_registrations(session_id, user_id, registered_at) VALUES(1, ?, ?)"
    ).run(userIds.get("P0008")!, iso(daysAgo(2)));

    // -------------------------------------------------------------- email queue
    emailStmt.run(
      userIds.get("P0008")!,
      "fatima.abubakar@icpc.gov.ng",
      "Certificate issued — Cybersecurity Awareness for Public Officers",
      "Your certificate is available in the portal.",
      "sent",
      iso(daysAgo(12))
    );
    emailStmt.run(
      userIds.get("P0009")!,
      "tunde.bakare@icpc.gov.ng",
      "Mandatory training assignment",
      "You have been assigned the institutional mandatory training programme.",
      "sent",
      iso(daysAgo(20))
    );

    // --------------------------------------------------------------- audit trail
    const auditStmt = db.prepare(
      "INSERT INTO audit_logs(actor_id, actor_name, action, entity, entity_id, details, ip, created_at) VALUES(?,?,?,?,?,?,?,?)"
    );
    auditStmt.run(null, "System", "database.seeded", "system", null, `Seeded ${allCourses.length} courses and ${USERS.length} staff records (demonstration data).`, "127.0.0.1", iso(now));
    auditStmt.run(userIds.get("P0001")!, "Ada Okafor", "settings.updated", "settings", "annual_cpd_target", "Annual CPD target set to 40 points.", "10.0.0.12", iso(daysAgo(2, 11)));
    auditStmt.run(userIds.get("P0002")!, "Ngozi Eze", "assignment.created", "course", String(courseIdBySlug.get("cybersecurity-awareness-public-officers")), "Institution-wide mandatory assignment published.", "10.0.0.21", iso(daysAgo(20, 10)));
    auditStmt.run(userIds.get("P0004")!, "Aisha Lawal", "course.published", "course", String(courseIdBySlug.get("understanding-the-icpc-act")), "Course published with demonstration legal-review label.", "10.0.0.33", iso(daysAgo(15, 14)));

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

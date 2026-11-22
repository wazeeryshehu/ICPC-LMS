import type { CourseSeed } from "./types";

export const professionalCourses: CourseSeed[] = [
  {
    slug: "public-service-rules-professional-ethics",
    title: "Public Service Rules and Professional Ethics",
    summary:
      "Core public-service obligations, ethical decision-making and anti-corruption duties for ICPC officers.",
    description:
      "This mandatory course covers the Public Service Rules framework, appointment and discipline principles, conflict-of-interest management and the ethical standards expected of public officers. It links integrity rules to daily decisions in procurement, enforcement and administration.",
    category: "ethics-integrity",
    level: "Beginner",
    durationMinutes: 180,
    mandatory: true,
    cpdPoints: 5,
    passMark: 70,
    maxAttempts: 3,
    examMinutes: 25,
    objectives: [
      "Explain the purpose and structure of the Public Service Rules",
      "Apply ethical standards to conflicts of interest and gifts",
      "Describe discipline, attendance and accountability obligations",
      "Recognise when to escalate an integrity concern",
    ],
    instructorStaffId: "P0002",
    modules: [
      {
        title: "The Public Service Framework",
        description: "Rules, rights and responsibilities.",
        lessons: [
          {
            title: "Public Service Rules: purpose and scope",
            minutes: 20,
            content: `## Why rules matter

The Public Service Rules (PSR) provide a common framework for managing public servants: appointments, promotions, discipline, leave, allowances and conduct. They translate the constitutional values of the public service into operational obligations.

## Structure and authority

The PSR operate alongside the Constitution, enabling legislation, circulars and departmental instructions. Where provisions conflict, officers should seek guidance rather than choose informally. The Head of Service issues and updates the rules.

## Responsibilities of officers

Officers must be punctual, loyal to the institution, politically neutral in the discharge of duties, honest with public resources, and respectful of lawful instructions. Rights — such as fair procedure and welfare entitlements — are balanced by duties.

> Demonstration note: consult the current PSR edition and extant circulars; this course is an overview, not a substitute for the rules.

## Key takeaways
- The PSR create a shared framework for public-service conduct.
- Rights and duties are interconnected.
- Circulars and guidance may update practice.`,
          },
          {
            title: "Appointment, promotion and discipline",
            minutes: 20,
            content: `## Merit and due process

Appointment and promotion should rest on eligibility, performance and fair competition. Records must be accurate because they shape career decisions.

## Discipline

Disciplinary action must follow procedure: inform the officer of allegations, provide an opportunity to respond, allow representation, and decide based on evidence. Penalties range from warning to dismissal, depending on the misconduct and the rules.

## Administrative investigations

Investigations should be timely, impartial and documented. The investigating officer should have no conflict of interest. Findings must distinguish fact from opinion and recommend proportionate action.

## Key takeaways
- Merit and documentation underpin credible HR decisions.
- Discipline requires notice, hearing and evidence.
- Conflict-free investigations protect fairness.`,
          },
        ],
        knowledgeCheck: {
          title: "Knowledge check: PSR foundations",
          questions: [
            {
              type: "mcq",
              prompt: "The Public Service Rules primarily provide:",
              options: [
                "A framework for public-service management and conduct",
                "Criminal procedure for all offences",
                "Local government election rules",
                "Private employment contracts",
              ],
              correct: 0,
              explanation: "The PSR govern public-service management and conduct.",
            },
            {
              type: "true_false",
              prompt: "A disciplinary decision may be made without informing the officer of the allegation.",
              correct: false,
              explanation: "Notice and an opportunity to respond are essential to fair procedure.",
            },
            {
              type: "multi",
              prompt: "An administrative investigation should be:",
              options: [
                "Timely",
                "Impartial and free from conflict of interest",
                "Documented",
                "Conducted by the suspect",
              ],
              correct: [0, 1, 2],
              explanation: "Independence, timeliness and documentation are core standards.",
            },
          ],
        },
      },
      {
        title: "Ethics and Integrity",
        description: "Conflicts, gifts and anti-corruption duties.",
        lessons: [
          {
            title: "Code of conduct and conflict of interest",
            minutes: 20,
            content: `## Integrity in decisions

Public officers must act in the public interest, not for private gain. A conflict of interest exists when personal, family or financial interests could improperly influence official decisions — even if no improper act has occurred.

## Managing conflicts

- Disclose the interest promptly to a supervisor.
- Withdraw from decision-making where appropriate.
- Record the disclosure and the steps taken.
- Avoid arrangements that create the appearance of favouritism.

## Gifts and benefits

Accepting gifts or hospitality can create obligations and undermine impartiality. Follow institutional rules on disclosure and refusal, especially from vendors, contractors and investigated persons.

## Key takeaways
- Disclosure and recusal are the primary conflict tools.
- Appearance matters as much as actual influence.
- Gifts from interested parties require caution and disclosure.`,
          },
          {
            title: "Anti-corruption obligations and reporting",
            minutes: 20,
            content: `## Every officer's duty

Public officers must not demand or accept bribes, must protect public assets and must report suspected corruption through proper channels. Reporting is a professional duty, not disloyalty.

## Raising concerns safely

Use designated reporting channels. Document what you observed, when, and who was involved. Avoid investigating on your own where that could compromise evidence or safety.

## Retaliation and protection

Institutions should protect good-faith reporters from retaliation. Know the policy, the protections available and the limits of confidentiality.

## Key takeaways
- Integrity obligations apply to every officer.
- Report through official channels with factual detail.
- Good-faith reporting should be protected.`,
          },
        ],
      },
      {
        title: "Service Delivery and Accountability",
        description: "Attendance, welfare and records.",
        lessons: [
          {
            title: "Attendance, leave and welfare",
            minutes: 15,
            content: `## Reliability as integrity

Punctuality and attendance are integrity issues: public funds pay for a service that citizens expect. Absence procedures, leave rules and approvals must be followed and recorded.

## Welfare and wellbeing

Staff welfare — health, safety and reasonable working conditions — supports performance. Supervisors should recognise stress and fatigue, especially in sensitive casework, and use available support systems.

## Balance

Wellbeing is not a soft extra; it protects judgement and reduces error. Institutions should combine clear expectations with practical support.

## Key takeaways
- Attendance discipline is part of public accountability.
- Welfare supports sustainable performance.
- Supervisors share responsibility for a healthy workplace.`,
          },
          {
            title: "Records, assets and accountability",
            minutes: 15,
            content: `## The record is the institution's memory

Official records must be accurate, complete, secure and retrievable. Files, registers and digital systems should reflect reality; backdating or altering records is a serious integrity breach.

## Public assets

Vehicles, equipment, funds and information are held in trust. Use them for official purposes, record custody and report loss or damage promptly. Asset registers support accountability and audits.

## Audit readiness

Accountability is not only about avoiding loss; it is about being able to demonstrate that rules were followed. Good records make audits straightforward and protect honest officers.

## Key takeaways
- Accurate records are an integrity obligation.
- Public assets are held in trust.
- Audit readiness protects the institution and its staff.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "A conflict of interest exists when:",
        options: [
          "A personal interest could improperly influence an official decision",
          "Two officers disagree on a policy",
          "A staff member takes annual leave",
          "A case is complex",
        ],
        correct: 0,
        explanation: "Potential improper influence, not actual misconduct, defines a conflict.",
      },
      {
        type: "multi",
        prompt: "Appropriate responses to a conflict of interest include:",
        options: ["Prompt disclosure", "Recusal from the decision", "Recording the steps taken", "Concealing it to avoid embarrassment"],
        correct: [0, 1, 2],
        explanation: "Disclosure, recusal and documentation manage conflicts; concealment aggravates them.",
      },
      {
        type: "true_false",
        prompt: "A disciplinary decision can be based on rumour without an opportunity for the officer to respond.",
        correct: false,
        explanation: "Fair procedure requires notice, evidence and an opportunity to respond.",
      },
      {
        type: "mcq",
        prompt: "The primary purpose of the Public Service Rules is to:",
        options: [
          "Regulate private businesses",
          "Provide a framework for public-service management and conduct",
          "Replace the Constitution",
          "Govern foreign diplomacy",
        ],
        correct: 1,
        explanation: "The PSR structure public-service administration and conduct.",
      },
      {
        type: "fill",
        prompt: "Stepping aside from a decision because of a personal interest is called ______.",
        correct: ["recusal", "recusing oneself"],
        explanation: "Recusal removes the decision-maker from the conflicted matter.",
      },
      {
        type: "true_false",
        prompt: "Accepting gifts from contractors bidding for work is harmless if the gift is small.",
        correct: false,
        explanation: "Even small gifts can create obligations or the appearance of favouritism and must follow rules.",
      },
      {
        type: "multi",
        prompt: "Public assets should be:",
        options: ["Used for official purposes", "Recorded in asset registers", "Reported if lost or damaged", "Treated as personal property"],
        correct: [0, 1, 2],
        explanation: "Public assets are held in trust, not owned personally.",
      },
      {
        type: "mcq",
        prompt: "A good-faith corruption concern should be reported:",
        options: [
          "On social media first",
          "Through designated official channels",
          "To the suspect directly",
          "Never",
        ],
        correct: 1,
        explanation: "Official channels protect evidence, confidentiality and the reporter.",
      },
      {
        type: "true_false",
        prompt: "Altering official records to correct a small error informally is acceptable.",
        correct: false,
        explanation: "Records must be corrected transparently; informal alteration is an integrity breach.",
      },
      {
        type: "mcq",
        prompt: "A key reason accurate records matter is that they:",
        options: [
          "Increase paperwork",
          "Allow the institution to demonstrate accountability",
          "Replace supervision",
          "Guarantee promotion",
        ],
        correct: 1,
        explanation: "Records are evidence of lawful, accountable administration.",
      },
    ],
  },
  {
    slug: "nigerian-labour-law",
    title: "Nigerian Labour Law",
    summary:
      "Employment contracts, workplace rights, termination standards and dispute resolution in Nigeria.",
    description:
      "This course introduces the legal framework governing employment in Nigeria, including contracts, termination and fair procedure, wages, leave, safety and dispute resolution institutions. It focuses on practical application for HR and supervisory officers.",
    category: "human-resources",
    level: "Intermediate",
    durationMinutes: 165,
    legalDemo: true,
    cpdPoints: 5,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 25,
    objectives: [
      "Identify the sources of Nigerian labour law",
      "Explain the essential terms of an employment contract",
      "Apply fair procedure to termination and discipline",
      "Describe dispute-resolution pathways",
    ],
    instructorStaffId: "P0002",
    modules: [
      {
        title: "The Employment Relationship",
        description: "Sources of law and contracts.",
        lessons: [
          {
            title: "Sources and scope of labour law",
            minutes: 20,
            content: `## A layered framework

Nigerian employment law draws on the Constitution, the Labour Act, other statutes, case law, collective agreements, international standards and workplace policies. Public-service employment is also shaped by the Public Service Rules and applicable regulations.

## Who is covered

The Labour Act principally addresses "workers" in the private and lower-level employment context; public servants and management staff are governed by other regimes. Understanding which regime applies is the first analytical step.

## Terms cannot override the law

A contract cannot lawfully remove statutory protections. Where a term conflicts with mandatory law, the law prevails.

> Demonstration note: this is general educational content, not legal advice; confirm current statutes and case law.

## Key takeaways
- Employment law is layered, not a single statute.
- Identify the applicable regime before analysing a dispute.
- Mandatory law overrides contrary contract terms.`,
          },
          {
            title: "Contracts and essential terms",
            minutes: 20,
            content: `## Written clarity

An employment contract should state parties, job title, duties, remuneration, hours, leave, notice, termination terms and applicable policies. Ambiguity creates disputes.

## Types of engagement

Permanent, fixed-term, probationary and casual arrangements carry different expectations and risks. Probation should be defined with clear duration and assessment criteria.

## Variation

Changes to core terms should follow agreed procedures. Unilateral changes to pay or duties can be a breach and may ground a dispute.

## Key takeaways
- Clarity prevents disputes.
- Probation needs defined criteria.
- Changes to core terms require lawful process.`,
          },
        ],
        knowledgeCheck: {
          title: "Knowledge check: employment foundations",
          questions: [
            {
              type: "mcq",
              prompt: "Which regime additionally governs public-service employment?",
              options: ["The Public Service Rules", "The Companies Act", "Maritime law", "Customary land law"],
              correct: 0,
              explanation: "The PSR and public-service regulations apply alongside general labour law.",
            },
            {
              type: "true_false",
              prompt: "A contract term can lawfully remove a statutory employment protection.",
              correct: false,
              explanation: "Mandatory statutory protections cannot be contracted away.",
            },
            {
              type: "multi",
              prompt: "An employment contract should clarify:",
              options: ["Duties and remuneration", "Notice and termination", "Leave entitlements", "The employer's private political views"],
              correct: [0, 1, 2],
              explanation: "Core terms should be clear; unrelated private matters do not belong.",
            },
          ],
        },
      },
      {
        title: "Workplace Rights",
        description: "Termination, wages, leave and safety.",
        lessons: [
          {
            title: "Termination and fair procedure",
            minutes: 20,
            content: `## Lawful termination

Termination must comply with the contract and the law. For misconduct, a fair process typically includes notice of the allegation, an opportunity to respond, an impartial decision-maker and a reasoned outcome.

## Summary dismissal

Summary dismissal is reserved for serious misconduct. It should be supported by evidence and documented procedure; using it casually invites litigation and damages.

## Redundancy

Redundancy should be genuine, based on objective criteria, and handled with lawful notice and consultation. Discrimination or targeting disguised as redundancy is unlawful.

## Key takeaways
- Process and evidence protect lawful outcomes.
- Summary dismissal is exceptional.
- Redundancy requires objective justification.`,
          },
          {
            title: "Wages, leave, health and safety",
            minutes: 20,
            content: `## Remuneration

Wages must be paid as agreed and in accordance with the law. Unlawful deductions can ground claims. Pay records should be accurate and accessible.

## Leave and working time

Annual leave, maternity provisions and rest periods protect health and productivity. Policies should state entitlements, approval processes and records.

## Safety

Employers owe duties to provide a safe workplace, assess hazards and respond to incidents. Health and safety is a legal and ethical obligation, not a welfare extra.

## Key takeaways
- Pay accuracy is a legal obligation.
- Leave and rest are protected entitlements.
- Safety duties require assessment and documentation.`,
          },
        ],
      },
      {
        title: "Disputes and Institutions",
        description: "Resolving workplace conflicts.",
        lessons: [
          {
            title: "Grievance handling and internal resolution",
            minutes: 15,
            content: `## Early resolution

Most disputes can be resolved internally through clear grievance procedures: raise the issue, document it, meet, consider options and record the outcome. Confidentiality and freedom from retaliation are essential.

## Mediation

Mediation can preserve relationships and produce practical solutions. It works best when parties participate voluntarily and the mediator is neutral.

## Escalation

Unresolved grievances should escalate through defined levels with timeframes. Ad hoc handling creates inconsistency and distrust.

## Key takeaways
- Clear procedures reduce escalation.
- Mediation suits relationship-preserving disputes.
- Defined timeframes build confidence.`,
          },
          {
            title: "Industrial disputes and legal institutions",
            minutes: 15,
            content: `## Collective disputes

Collective bargaining, union recognition and industrial action are regulated. Employers should engage in good faith and document negotiations.

## Institutions

Depending on the dispute, forums may include the National Industrial Court, industrial arbitration panels, the Ministry of Labour and Employment and internal appeal mechanisms. Choosing the right forum and respecting timelines is essential.

## Evidence

Employment cases turn on records: contracts, correspondence, warnings, appraisals and minutes. Good HR documentation is the strongest defence and the fairest basis for decisions.

## Key takeaways
- Collective disputes require good-faith engagement.
- Forum and timelines matter.
- HR records are decisive evidence.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "Before dismissing an employee for misconduct, an employer should generally:",
        options: [
          "Act immediately without explanation",
          "Notify the allegation and allow a fair response",
          "Tell other staff first",
          "Confiscate personal property",
        ],
        correct: 1,
        explanation: "Notice and an opportunity to respond are central to fair procedure.",
      },
      {
        type: "true_false",
        prompt: "A contract can lawfully waive all statutory employment protections.",
        correct: false,
        explanation: "Mandatory statutory protections cannot be waived by contract.",
      },
      {
        type: "multi",
        prompt: "Essential employment terms usually include:",
        options: ["Duties", "Remuneration", "Notice and termination", "The employer's family history"],
        correct: [0, 1, 2],
        explanation: "Core terms govern the working relationship.",
      },
      {
        type: "mcq",
        prompt: "Summary dismissal is appropriate for:",
        options: [
          "Any minor lateness",
          "Serious misconduct supported by evidence and process",
          "An employee requesting leave",
          "A disagreement with a supervisor",
        ],
        correct: 1,
        explanation: "Summary dismissal is exceptional and requires serious, evidenced misconduct.",
      },
      {
        type: "fill",
        prompt: "A neutral third party helping parties reach a voluntary settlement is acting as a ______.",
        correct: ["mediator"],
        explanation: "Mediation is facilitated by a neutral mediator.",
      },
      {
        type: "true_false",
        prompt: "Health and safety obligations are optional welfare benefits.",
        correct: false,
        explanation: "Employers have legal duties to provide a safe workplace.",
      },
      {
        type: "mcq",
        prompt: "The strongest evidence in an employment dispute usually comes from:",
        options: [
          "Rumours",
          "Contemporaneous records and documented process",
          "Social media polls",
          "A manager's memory alone",
        ],
        correct: 1,
        explanation: "Documentation is decisive in employment cases.",
      },
      {
        type: "multi",
        prompt: "Genuine redundancy should be based on:",
        options: ["Objective criteria", "Lawful notice and consultation", "Discriminatory targeting", "Documented business need"],
        correct: [0, 1, 3],
        explanation: "Objectivity, consultation and genuine need distinguish redundancy from targeting.",
      },
    ],
  },
  {
    slug: "leadership-supervisory-skills",
    title: "Leadership and Supervisory Skills",
    summary:
      "Lead teams with clarity, accountability, good communication and ethical judgement.",
    description:
      "Designed for supervisors and aspiring leaders, this course covers leadership styles, feedback, delegation, performance management and leading change. It grounds leadership in public-service ethics and anti-corruption values.",
    category: "general-leadership",
    level: "Intermediate",
    durationMinutes: 150,
    cpdPoints: 5,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 20,
    objectives: [
      "Adapt leadership style to context and people",
      "Give clear, constructive feedback",
      "Delegate with accountability and support",
      "Lead change while maintaining integrity",
    ],
    instructorStaffId: "P0002",
    modules: [
      {
        title: "Leading People",
        description: "Style, communication and trust.",
        lessons: [
          {
            title: "Leadership styles and situational judgement",
            minutes: 15,
            content: `## No single best style

Directive, coaching, supportive and delegating styles each fit different situations. A new officer needs clear instruction; an experienced professional benefits from autonomy and challenge. Leaders should adapt rather than default.

## Public-service leadership

Institutional leadership requires political neutrality, stewardship of public resources and modelling integrity. What leaders tolerate becomes the team's standard.

## Self-awareness

Effective leaders seek feedback, recognise their triggers and manage stress. A leader who cannot receive feedback will struggle to give it.

## Key takeaways
- Adapt style to people and context.
- Model the standards you expect.
- Self-awareness is a leadership skill.`,
          },
          {
            title: "Communication and feedback",
            minutes: 15,
            content: `## Clarity prevents confusion

Communicate purpose, expectations, priorities and constraints. Confirm understanding by asking for questions and summarising agreements.

## Constructive feedback

Use specific observations, explain impact and agree next steps. Separate behaviour from identity. Give feedback promptly and privately; praise publicly where appropriate.

## Listening

Listening is not waiting to speak. Paraphrase, ask open questions and test assumptions. Staff who feel heard are more likely to raise risks early.

## Key takeaways
- Specific feedback improves performance.
- Praise and correction both require clarity.
- Listening surfaces problems early.`,
          },
        ],
        knowledgeCheck: {
          title: "Knowledge check: leadership basics",
          questions: [
            {
              type: "mcq",
              prompt: "The best leadership style is:",
              options: [
                "Always directive",
                "Always delegating",
                "Adapted to the situation and the person",
                "Whichever requires least effort",
              ],
              correct: 2,
              explanation: "Situational judgement improves outcomes.",
            },
            {
              type: "true_false",
              prompt: "Feedback is most effective when it is vague and delayed.",
              correct: false,
              explanation: "Specific, timely feedback is more actionable.",
            },
            {
              type: "multi",
              prompt: "Good communication as a leader includes:",
              options: ["Clarity of expectations", "Confirming understanding", "Listening to concerns", "Hiding constraints to avoid questions"],
              correct: [0, 1, 2],
              explanation: "Transparency about constraints builds trust.",
            },
          ],
        },
      },
      {
        title: "Managing Performance",
        description: "Delegation, coaching and appraisal.",
        lessons: [
          {
            title: "Delegation and accountability",
            minutes: 15,
            content: `## Delegate outcomes, not just tasks

Explain the outcome, constraints, authority and deadline. Agree checkpoints rather than hovering. Delegation develops staff and frees leaders for higher-level work.

## Accountability

The delegator remains accountable for the result. Clarify decision rights: what the officer can decide alone, what requires consultation and what requires approval.

## When delegation fails

Assess whether the brief was clear, resources sufficient and capability present. Avoid blaming staff for unclear instructions.

## Key takeaways
- Clarify outcome, authority and checkpoints.
- Accountability cannot be delegated away.
- Diagnose failures before blaming people.`,
          },
          {
            title: "Coaching, appraisal and difficult conversations",
            minutes: 15,
            content: `## Coaching

Ask questions before giving answers: What have you tried? What options do you see? What support do you need? Coaching builds capability and ownership.

## Appraisal

Performance discussions should be evidence-based, regular and developmental. Use agreed objectives, specific examples and a forward-looking plan. Surprises at year-end indicate poor ongoing management.

## Difficult conversations

Prepare facts, choose a private setting, state the issue clearly and listen. Focus on behaviour and impact, agree actions and document outcomes fairly.

## Key takeaways
- Coach to build capability.
- Appraisals need evidence and regularity.
- Difficult conversations are fair when fact-based.`,
          },
        ],
      },
      {
        title: "Leading Change",
        description: "Change, resistance and ethical leadership.",
        lessons: [
          {
            title: "Change management essentials",
            minutes: 15,
            content: `## Why change fails

Change fails when people do not understand the reason, lack capability or see no role for themselves. Leaders must explain the why, involve those affected and provide support.

## A practical sequence

Create urgency, form a guiding coalition, communicate a clear vision, remove obstacles, deliver early wins and embed new practices. Treat resistance as information, not disloyalty.

## Communication rhythm

Repeat the message through multiple channels. Leaders underestimate how much communication change requires.

## Key takeaways
- Explain the why repeatedly.
- Involve people in shaping change.
- Early wins build credibility.`,
          },
          {
            title: "Ethical leadership under pressure",
            minutes: 15,
            content: `## Pressure tests character

Deadlines, targets and political attention can tempt shortcuts. Ethical leaders make the line visible: what will not be done, regardless of pressure.

## Speak-up culture

Staff must be able to raise concerns without fear. Leaders should respond to bad news with curiosity, not retaliation. Psychological safety improves problem detection.

## Legacy

Leadership legacy is measured by the systems and culture left behind: fair decisions, strong records and people who trust the process.

## Key takeaways
- State and model ethical boundaries.
- Reward early reporting of problems.
- Culture is a leadership outcome.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "Effective delegation requires:",
        options: [
          "Vague instructions",
          "Clear outcomes, authority and checkpoints",
          "No follow-up ever",
          "Doing the work yourself",
        ],
        correct: 1,
        explanation: "Clarity about outcome and authority makes delegation work.",
      },
      {
        type: "multi",
        prompt: "Constructive feedback includes:",
        options: ["Specific observations", "Explanation of impact", "Agreed next steps", "Attacks on character"],
        correct: [0, 1, 2],
        explanation: "Focus on behaviour and improvement, not identity.",
      },
      {
        type: "true_false",
        prompt: "A leader remains accountable for work they delegate.",
        correct: true,
        explanation: "Accountability cannot be delegated away.",
      },
      {
        type: "mcq",
        prompt: "Resistance to change is best treated as:",
        options: ["Disloyalty to be punished", "Information about concerns to address", "A reason to cancel change", "Proof the plan is perfect"],
        correct: 1,
        explanation: "Resistance often reveals legitimate risks or communication gaps.",
      },
      {
        type: "fill",
        prompt: "A leadership approach that asks questions to build capability is called ______.",
        correct: ["coaching"],
        explanation: "Coaching develops ownership and capability through questioning.",
      },
      {
        type: "true_false",
        prompt: "Staff should be punished for raising bad news early.",
        correct: false,
        explanation: "Safe escalation improves risk detection and should be encouraged.",
      },
      {
        type: "multi",
        prompt: "Performance appraisals should be:",
        options: ["Evidence-based", "Regular", "Developmental", "Based only on rumours"],
        correct: [0, 1, 2],
        explanation: "Regular, evidence-based and developmental appraisals improve performance.",
      },
      {
        type: "mcq",
        prompt: "Ethical leadership under pressure means:",
        options: [
          "Bending rules to meet targets",
          "Maintaining clear boundaries regardless of pressure",
          "Delegating ethical decisions",
          "Ignoring misconduct by high performers",
        ],
        correct: 1,
        explanation: "Ethical leaders hold the line under pressure.",
      },
    ],
  },
  {
    slug: "strategic-public-relations-advocacy",
    title: "Strategic Public Relations and Anti-Corruption Advocacy",
    summary:
      "Build public trust through credible communication, stakeholder engagement and responsible crisis response.",
    description:
      "This short course covers government public relations, media relations, anti-corruption advocacy, digital communication and crisis response. It emphasises accuracy, ethics and the protection of investigation integrity.",
    category: "public-enlightenment",
    level: "Beginner",
    durationMinutes: 100,
    cpdPoints: 3,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 15,
    objectives: [
      "Plan stakeholder engagement for an anti-corruption initiative",
      "Apply ethical media and digital communication practices",
      "Protect investigation confidentiality in public messaging",
      "Respond to reputational crises with accuracy",
    ],
    instructorStaffId: "P0002",
    modules: [
      {
        title: "Strategic Communication",
        description: "Audiences, messages and channels.",
        lessons: [
          {
            title: "Planning public engagement",
            minutes: 15,
            content: `## Start with the audience

Different audiences need different messages: citizens, civil servants, media, civil society, development partners and staff. Define what you want each audience to know, feel and do.

## Message discipline

A strong message is clear, evidence-based and consistent. Avoid slogans that cannot be supported. Repeat through multiple channels for reach.

## Advocacy

Anti-corruption advocacy combines public education, coalition-building and policy engagement. Build alliances with professional bodies, schools and civil society while protecting institutional neutrality.

## Key takeaways
- Know the audience and desired action.
- Keep messages accurate and consistent.
- Advocacy works best through partnerships.`,
          },
          {
            title: "Media relations and digital communication",
            minutes: 15,
            content: `## Working with the media

Accurate, timely engagement builds credibility. Prepare spokespersons, set ground rules and never mislead journalists. Correct errors promptly and transparently.

## Social media

Digital channels extend reach but amplify errors. Follow records, privacy and security rules. Do not comment on active cases beyond approved statements.

## Confidentiality

Never disclose investigative details that could compromise evidence, endanger sources or prejudice proceedings. Public interest does not excuse procedural harm.

## Key takeaways
- Accuracy is the foundation of trust.
- Digital communication carries legal and ethical risks.
- Case confidentiality overrides publicity.`,
          },
        ],
      },
      {
        title: "Crisis and Reputation",
        description: "Responding with integrity.",
        lessons: [
          {
            title: "Crisis communication principles",
            minutes: 15,
            content: `## Speed, accuracy, empathy

In a crisis, silence allows rumour to fill the gap. Acknowledge the situation, state what is known and what is being done, and commit to updates. Never speculate about guilt.

## Coordination

Use a crisis team with clear roles: fact-finding, messaging, stakeholder contact and legal review. One approved voice prevents contradictions.

## Learning

After the crisis, review response quality and update protocols. Reputation is rebuilt through consistent, accountable behaviour over time.

## Key takeaways
- Acknowledge promptly and accurately.
- Coordinate messaging with legal and investigative colleagues.
- Post-crisis learning strengthens trust.`,
          },
          {
            title: "Ethics of anti-corruption messaging",
            minutes: 15,
            content: `## Presumption of innocence

Public messaging must respect the presumption of innocence. Describing a suspect as guilty before adjudication is unfair and can prejudice proceedings.

## Avoiding sensationalism

Shock tactics can raise awareness but may distort understanding of corruption. Evidence-based explanation builds durable public support.

## Measuring impact

Track reach, understanding and behaviour change, not only impressions. Evaluation improves strategy and demonstrates value.

## Key takeaways
- Protect fairness in public communication.
- Avoid sensationalism that undermines trust.
- Measure understanding and behaviour, not vanity metrics.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "The first step in public engagement planning is to:",
        options: ["Choose a social media platform", "Understand the audience and desired action", "Write a press release", "Print banners"],
        correct: 1,
        explanation: "Audience and objective shape channels and messages.",
      },
      {
        type: "true_false",
        prompt: "Sensational messaging is acceptable if it increases reach.",
        correct: false,
        explanation: "Accuracy and fairness matter more than attention.",
      },
      {
        type: "multi",
        prompt: "Public messaging about active cases must:",
        options: ["Respect the presumption of innocence", "Avoid prejudicing proceedings", "Protect confidential investigative details", "Reveal all evidence for transparency"],
        correct: [0, 1, 2],
        explanation: "Full disclosure of investigative material can prejudice justice.",
      },
      {
        type: "mcq",
        prompt: "In a reputational crisis, the best first response is to:",
        options: ["Stay silent indefinitely", "Acknowledge accurately and commit to updates", "Blame the media", "Delete all records"],
        correct: 1,
        explanation: "Prompt, accurate acknowledgement prevents rumour from dominating.",
      },
      {
        type: "true_false",
        prompt: "Measuring reach alone is sufficient to evaluate an awareness campaign.",
        correct: false,
        explanation: "Understanding and behaviour change matter more than impressions.",
      },
    ],
  },
  {
    slug: "monitoring-evaluation-foundations",
    title: "Monitoring and Evaluation Foundations",
    summary:
      "Design indicators, collect credible data and use evidence to improve institutional performance.",
    description:
      "This short course introduces programme logic, indicators, data-quality standards and evaluation use. It supports officers who plan, monitor or report on institutional learning and anti-corruption programmes.",
    category: "prs",
    level: "Beginner",
    durationMinutes: 100,
    cpdPoints: 3,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 15,
    objectives: [
      "Explain the difference between monitoring and evaluation",
      "Draft SMART indicators",
      "Assess data quality and limitations",
      "Use findings for decision-making",
    ],
    instructorStaffId: "P0002",
    modules: [
      {
        title: "Foundations of M&E",
        description: "Logic, indicators and evidence.",
        lessons: [
          {
            title: "Monitoring, evaluation and programme logic",
            minutes: 15,
            content: `## Two complementary functions

**Monitoring** tracks implementation against plans in real time. **Evaluation** assesses relevance, effectiveness, efficiency and impact at defined points.

## Programme logic

A results chain links inputs, activities, outputs, outcomes and impact. If a training programme buys materials (input), delivers lessons (activity), completes officers (output), improves competence (outcome) and strengthens institutional integrity (impact), indicators should track each level.

## Assumptions

Every results chain rests on assumptions, such as staff availability or data access. State them; they explain why results may diverge from plans.

## Key takeaways
- Monitoring is continuous; evaluation is periodic and judgement-based.
- A results chain clarifies what to measure.
- Assumptions are part of the design.`,
          },
          {
            title: "Designing useful indicators",
            minutes: 15,
            content: `## SMART indicators

Indicators should be Specific, Measurable, Achievable, Relevant and Time-bound. "Improve training" is not an indicator. "80% of target staff complete mandatory training by 31 December" is.

## Quantitative and qualitative

Combine numbers (completion rate, scores) with qualitative evidence (why staff disengage, how behaviour changes). Each answers different questions.

## Avoid distortions

Bad indicators create perverse incentives, such as completing courses quickly without learning. Balance speed with quality.

## Key takeaways
- Indicators must be precise and time-bound.
- Combine numeric and qualitative evidence.
- Watch for gaming and unintended incentives.`,
          },
        ],
      },
      {
        title: "Data and Decision-Making",
        description: "Quality, analysis and use.",
        lessons: [
          {
            title: "Data quality and analysis",
            minutes: 15,
            content: `## Quality dimensions

Assess data for validity, reliability, completeness, timeliness and integrity. A perfect dashboard built on missing records is misleading.

## Triangulation

Use multiple sources: system data, surveys, interviews and observation. Agreement strengthens confidence; divergence reveals questions.

## Visualisation

Charts should clarify, not decorate. Label axes, state periods and avoid misleading scales. Show uncertainty where it matters.

## Key takeaways
- Data quality precedes analysis.
- Triangulate to test conclusions.
- Visuals must be honest and readable.`,
          },
          {
            title: "Using evaluation evidence",
            minutes: 15,
            content: `## From findings to action

Evaluation is valuable only if findings change decisions. Translate evidence into specific recommendations with owners, timelines and resources.

## Communicating uncertainty

Decision-makers need to know how strong the evidence is. Distinguish robust findings from preliminary signals.

## Learning culture

Regular reflection, after-action reviews and open discussion of failures improve performance. Evaluation should be a learning tool, not a blame exercise.

## Key takeaways
- Recommendations need ownership and timelines.
- Communicate confidence honestly.
- Learning requires psychological safety.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "Monitoring is best described as:",
        options: ["Periodic impact assessment", "Continuous tracking of implementation", "External audit only", "Staff appraisal"],
        correct: 1,
        explanation: "Monitoring is ongoing tracking of activities and outputs.",
      },
      {
        type: "multi",
        prompt: "A SMART indicator is:",
        options: ["Specific", "Measurable", "Time-bound", "Deliberately vague"],
        correct: [0, 1, 2],
        explanation: "SMART stands for Specific, Measurable, Achievable, Relevant, Time-bound.",
      },
      {
        type: "true_false",
        prompt: "High completion numbers always prove that learning occurred.",
        correct: false,
        explanation: "Completion measures activity; learning quality requires additional evidence.",
      },
      {
        type: "mcq",
        prompt: "Using multiple data sources to test a finding is called:",
        options: ["Triangulation", "Extrapolation", "Randomisation", "Decoration"],
        correct: 0,
        explanation: "Triangulation increases confidence by combining sources.",
      },
      {
        type: "true_false",
        prompt: "Evaluation findings are useful only if they lead to decisions and action.",
        correct: true,
        explanation: "Impact comes from use, not from reports sitting on shelves.",
      },
    ],
  },
  {
    slug: "public-procurement-essentials",
    title: "Public Procurement Essentials",
    summary:
      "Understand procurement planning, competition, evaluation and integrity controls that prevent corruption.",
    description:
      "This short course explains the public procurement cycle, value-for-money principles, competitive methods, bid evaluation and the red flags of procurement corruption. It is suitable for all officers involved in purchasing, approving or auditing contracts.",
    category: "procurement-supply-chain",
    level: "Beginner",
    durationMinutes: 100,
    cpdPoints: 3,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 15,
    objectives: [
      "Describe the stages of public procurement",
      "Apply competition and value-for-money principles",
      "Identify procurement corruption red flags",
      "Understand segregation-of-duties controls",
    ],
    instructorStaffId: "P0002",
    modules: [
      {
        title: "The Procurement Cycle",
        description: "Planning, competition and award.",
        lessons: [
          {
            title: "Procurement planning and methods",
            minutes: 15,
            content: `## Plan before you buy

Effective procurement starts with a needs assessment, budget confirmation and a procurement plan. Weak planning leads to emergency purchases, which erode competition and oversight.

## Methods and thresholds

Procurement methods depend on value, complexity and the governing Act and regulations. Competitive tendering is the default for significant value; restricted methods require documented justification.

## Value for money

Value for money is not simply the lowest price. It considers fitness for purpose, lifecycle cost, quality and risk. Award criteria must be stated in advance and applied consistently.

## Key takeaways
- Good planning reduces corruption opportunities.
- Competition is a control, not a formality.
- Value for money considers quality and risk.`,
          },
          {
            title: "Evaluation, award and records",
            minutes: 15,
            content: `## Independent evaluation

Bid evaluation should follow published criteria, use a committee with appropriate expertise, and document scores and reasons. Conflicts of interest must be declared and managed.

## Award and contract

The award should follow the evaluation, with clear contract terms, deliverables and payment conditions. Deviations require documented approval.

## Records

Keep the complete procurement file: advertisement, bids, evaluation records, approvals, contract variations and payment records. The file is the primary audit evidence.

## Key takeaways
- Apply criteria consistently and independently.
- Deviations require proper authority.
- The procurement file tells the accountability story.`,
          },
        ],
      },
      {
        title: "Integrity Controls",
        description: "Preventing and detecting corruption.",
        lessons: [
          {
            title: "Segregation of duties and controls",
            minutes: 15,
            content: `## Do not concentrate power

Requiring one officer to request, approve, receive and pay creates opportunities for fraud. Separate initiation, approval, custody and reconciliation.

## Control examples

- independent price benchmarking;
- vendor due diligence and beneficial-ownership checks;
- dual approvals above thresholds;
- goods-received notes signed by someone other than the buyer;
- periodic vendor-rotation and spend analytics.

## Tone at the top

Controls fail if leaders tolerate exceptions. Consistent enforcement signals that integrity rules are real.

## Key takeaways
- Segregate request, approval, custody and payment.
- Controls should be independent and documented.
- Leadership sets the standard.`,
          },
          {
            title: "Procurement red flags",
            minutes: 15,
            content: `## Recognising risk

Common red flags include:

- specifications written to favour one vendor;
- a winning bidder incorporated shortly before the award;
- suspiciously identical bids or shared addresses;
- frequent contract variations without justification;
- emergency procurement for predictable needs;
- delivery accepted without independent inspection;
- one bidder repeatedly winning across units.

## Investigation caution

Red flags indicate risk, not guilt. Investigators must verify through documents, interviews and comparative data before drawing conclusions.

## Key takeaways
- Familiarise yourself with common patterns.
- Treat red flags as enquiry triggers.
- Verify before concluding.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "Value for money in procurement means:",
        options: ["Always choosing the lowest price", "Balancing fitness, cost, quality and risk", "Awarding to a related company", "Avoiding all competition"],
        correct: 1,
        explanation: "Lowest price alone can produce poor lifecycle value.",
      },
      {
        type: "multi",
        prompt: "Which are procurement corruption red flags?",
        options: [
          "Specifications favouring one vendor",
          "Identical bids from different companies",
          "Frequent unexplained contract variations",
          "Independent price benchmarking",
        ],
        correct: [0, 1, 2],
        explanation: "Benchmarking is a control, not a red flag.",
      },
      {
        type: "true_false",
        prompt: "The same officer should request, approve, receive and pay for a purchase to speed up the process.",
        correct: false,
        explanation: "Concentrating duties removes checks and enables fraud.",
      },
      {
        type: "mcq",
        prompt: "A complete procurement file should include:",
        options: [
          "Only the final contract",
          "Advertisement, bids, evaluation, approvals, variations and payments",
          "Only payment receipts",
          "Informal WhatsApp messages only",
        ],
        correct: 1,
        explanation: "The full record supports audit and investigation.",
      },
      {
        type: "true_false",
        prompt: "Emergency procurement is appropriate whenever planning was poor.",
        correct: false,
        explanation: "Emergency methods require genuine urgency and justification; poor planning is not an emergency.",
      },
    ],
  },
  {
    slug: "compliance-risk-management",
    title: "Monitoring, Compliance and Corruption Risk Management",
    summary:
      "Build a practical corruption risk register, compliance monitoring plan and corrective action process.",
    description:
      "This short course teaches officers to identify, assess and treat corruption risks in public institutions, and to run compliance monitoring that produces actionable findings.",
    category: "monitoring-compliance",
    level: "Intermediate",
    durationMinutes: 100,
    cpdPoints: 3,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 15,
    objectives: [
      "Identify corruption risks in institutional processes",
      "Assess risk likelihood and impact",
      "Design compliance monitoring activities",
      "Manage findings and corrective actions",
    ],
    instructorStaffId: "P0002",
    modules: [
      {
        title: "Risk Foundations",
        description: "Identify, assess and treat.",
        lessons: [
          {
            title: "Building a corruption risk register",
            minutes: 15,
            content: `## Start with processes

Corruption risk is best assessed process by process: procurement, recruitment, enforcement, asset management and payment. For each process, identify where discretion, information asymmetry and money interact.

## Risk statements

Write risks as cause-event-effect: "Because vendor due diligence is not performed, a shell company may win contracts, resulting in inflated prices and asset loss."

## Assessment

Rate likelihood and impact, combine into a risk level, and prioritise. Document assumptions and review regularly.

## Key takeaways
- Map processes before listing risks.
- Use clear cause-event-effect statements.
- Prioritise by likelihood and impact.`,
          },
          {
            title: "Treatments and controls",
            minutes: 15,
            content: `## Four treatment options

- **Avoid** the activity or method.
- **Reduce** likelihood or impact through controls.
- **Transfer** risk where appropriate (for example insurance for some asset risks).
- **Accept** low residual risk with monitoring.

## Control design

Preventive controls (segregation, approvals) stop problems; detective controls (audits, analytics) find them. Design controls that are proportionate and testable.

## Residual risk

After treatment, reassess residual risk. Accepting risk should be a documented decision by an accountable officer.

## Key takeaways
- Choose treatments deliberately.
- Use preventive and detective controls together.
- Document residual-risk acceptance.`,
          },
        ],
      },
      {
        title: "Monitoring in Practice",
        description: "Testing, findings and follow-up.",
        lessons: [
          {
            title: "Designing compliance checks",
            minutes: 15,
            content: `## From risk to test

Each significant risk should have a test: sample procurement files, verify approvals, compare vendor registries, review payment patterns, test access logs.

## Sampling

Define population, sample size and method. Document selection so findings can be replicated. Random and risk-based sampling answer different questions.

## Evidence standards

Findings need evidence: what was tested, what was found, the criteria and the impact. Avoid conclusory language unsupported by the file.

## Key takeaways
- Test the risks that matter most.
- Document sampling and evidence.
- Findings need criteria and impact.`,
          },
          {
            title: "Findings, corrective action and follow-up",
            minutes: 15,
            content: `## Writing findings

A good finding states condition (what is), criteria (what should be), cause and effect. It is precise, evidence-referenced and free of personal attacks.

## Corrective action

Agree actions with owners, deadlines and success measures. Distinguish quick fixes from systemic changes.

## Follow-up

Track implementation and verify closure. Unresolved high risks should escalate. Compliance monitoring fails if findings are never closed.

## Key takeaways
- Use condition-criteria-cause-effect.
- Actions need owners and deadlines.
- Verify closure; escalate unresolved risk.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "A corruption risk statement should include:",
        options: ["Only an effect", "Cause, event and effect", "A suspect's name", "A political opinion"],
        correct: 1,
        explanation: "Cause-event-effect structure clarifies the risk pathway.",
      },
      {
        type: "multi",
        prompt: "Risk treatment options include:",
        options: ["Avoid", "Reduce", "Transfer or accept with monitoring", "Ignore without documentation"],
        correct: [0, 1, 2],
        explanation: "Risk acceptance must be documented; ignoring is not treatment.",
      },
      {
        type: "true_false",
        prompt: "Preventive controls stop problems before they occur; detective controls find them afterwards.",
        correct: true,
        explanation: "Both control types are needed in a balanced system.",
      },
      {
        type: "mcq",
        prompt: "A compliance finding is strongest when it includes:",
        options: [
          "Opinion and rumour",
          "Evidence, criteria and impact",
          "Anonymous accusations only",
          "A demand for punishment",
        ],
        correct: 1,
        explanation: "Evidence-based findings withstand challenge and support action.",
      },
      {
        type: "true_false",
        prompt: "Follow-up on corrective actions is optional once a report is issued.",
        correct: false,
        explanation: "Without follow-up, findings do not reduce risk.",
      },
    ],
  },
];

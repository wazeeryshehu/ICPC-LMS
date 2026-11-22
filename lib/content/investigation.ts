import type { CourseSeed } from "./types";

export const investigationCourses: CourseSeed[] = [
  {
    slug: "intelligence-gathering-analysis",
    title: "Intelligence Gathering and Analysis",
    summary:
      "Collect, evaluate, analyse and disseminate intelligence lawfully in support of anti-corruption investigations.",
    description:
      "This course introduces the intelligence cycle, source evaluation, structured analytical techniques and the legal boundaries of intelligence work. It emphasises objective, ethical practice and the disciplined separation of fact, inference and judgment.",
    category: "security-intelligence",
    level: "Intermediate",
    durationMinutes: 195,
    cpdPoints: 6,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 30,
    objectives: [
      "Describe the phases of the intelligence cycle",
      "Evaluate source reliability and information credibility",
      "Apply structured analytic techniques to reduce bias",
      "Respect legal and ethical boundaries in collection and sharing",
    ],
    instructorStaffId: "P0005",
    modules: [
      {
        title: "Intelligence Fundamentals",
        description: "Direction, collection and the intelligence cycle.",
        lessons: [
          {
            title: "The intelligence cycle",
            minutes: 20,
            content: `## A disciplined process

Intelligence work converts raw information into decision-ready knowledge. The cycle is usually described in five phases:

1. **Direction** — define the decision or investigation question.
2. **Collection** — obtain information lawfully from appropriate sources.
3. **Processing** — organise, translate and index information.
4. **Analysis** — evaluate and interpret to produce judgments.
5. **Dissemination** — deliver the right product to the right decision-maker.

The cycle is iterative: new information reopens earlier phases. A good analyst documents each step so conclusions can be audited.

## The commander's question

Collection without direction produces noise. Begin with a clear intelligence requirement: what decision will this support, what do we already know, and what gaps remain?

## Key takeaways
- Start with the decision, not the data.
- Document each phase for auditability.
- Treat the cycle as iterative, not linear.`,
          },
          {
            title: "Sources, collection and evaluation",
            minutes: 20,
            content: `## Source types

Intelligence may come from documents, financial records, open sources, human sources, physical observation and partner agencies. Each carries different reliability and legal conditions.

## The 6x6 evaluation habit

Assess **source reliability** (A–F) and **information credibility** (1–6) separately. A usually reliable source can still pass inaccurate information, and a new source can provide verifiable detail. Record the rationale for each rating.

## Corroboration

Seek independent confirmation across sources and types. Circular reporting — where several sources repeat the same original claim — can create an illusion of corroboration.

## Key takeaways
- Evaluate source and information separately.
- Corroborate with independent sources.
- Guard against circular reporting.`,
          },
        ],
        knowledgeCheck: {
          title: "Knowledge check: the cycle and sources",
          questions: [
            {
              type: "mcq",
              prompt: "The first phase of the intelligence cycle is:",
              options: ["Collection", "Direction", "Dissemination", "Processing"],
              correct: 1,
              explanation: "Direction defines the question and priorities before collection.",
            },
            {
              type: "true_false",
              prompt: "Several sources repeating the same original rumour provides independent corroboration.",
              correct: false,
              explanation: "That is circular reporting, not independent confirmation.",
            },
            {
              type: "multi",
              prompt: "Which actions strengthen source evaluation?",
              options: [
                "Separately rating reliability and credibility",
                "Recording the rationale for ratings",
                "Assuming a familiar source is always right",
                "Seeking independent corroboration",
              ],
              correct: [0, 1, 3],
              explanation: "Familiarity does not guarantee accuracy; rigorous evaluation does.",
            },
          ],
        },
      },
      {
        title: "Structured Analysis",
        description: "Techniques that make reasoning visible.",
        lessons: [
          {
            title: "Structuring analysis and hypotheses",
            minutes: 20,
            content: `## Analysis is not summary

A summary repeats information. Analysis interprets it against alternatives. Analysts should state judgments, confidence levels and the evidence that would change the judgment.

## Analysis of competing hypotheses

List plausible explanations, then assess which evidence is consistent or inconsistent with each. This reduces premature closure on the first attractive theory.

## Confidence language

Use calibrated language: "highly likely", "likely", "possible", "unlikely", defined clearly in institutional guidance. Avoid false certainty.

## Key takeaways
- Compare hypotheses before concluding.
- State confidence and its basis.
- Say what evidence would change your mind.`,
          },
          {
            title: "Cognitive biases and safeguards",
            minutes: 20,
            content: `## Biases that affect investigations

- **Confirmation bias** — seeking evidence that supports an early theory.
- **Anchoring** — over-relying on the first figure or claim.
- **Availability bias** — over-weighting vivid recent cases.
- **Groupthink** — failing to challenge a senior or consensus view.

## Practical safeguards

Assign a devil's advocate, invite dissenting views, use structured checklists, record alternative hypotheses and conduct peer review before dissemination. Awareness alone is weak; process is stronger.

## Key takeaways
- Bias is normal; unmanaged bias is dangerous.
- Process controls beat willpower.
- Seniority is not evidence.`,
          },
        ],
      },
      {
        title: "Legal Boundaries and Sharing",
        description: "Lawful collection and responsible dissemination.",
        lessons: [
          {
            title: "Lawful and ethical collection",
            minutes: 20,
            content: `## Authority first

Every collection method must have a legal basis and proper authorisation. Covert methods, communications data, device access and surveillance require specific legal authority and supervisory approval.

## Open-source intelligence

Open-source collection is not a licence to intrude. Respect platform terms, privacy, copyright and data-protection law. Do not use impersonation or deception without authorisation.

## Ethics

Intelligence work must be necessary and proportionate. Targeting must be based on conduct and evidence, never on protected characteristics. Analysts should challenge unlawful requests through proper channels.

## Key takeaways
- No collection without lawful authority.
- OSINT carries legal and ethical duties too.
- Proportionate targeting rests on conduct, not identity.`,
          },
          {
            title: "Dissemination and inter-agency sharing",
            minutes: 15,
            content: `## Need-to-know

Intelligence products should go only to recipients with a legitimate need and appropriate clearance. Distribution lists, handling caveats and retention rules protect sources and fairness.

## Information sharing

Sharing with partner agencies requires a lawful basis, confidentiality safeguards and accurate records. Share the minimum necessary and label the handling conditions.

## Protecting the process

Leaks, informal sharing and unsecured messaging undermine investigations and can endanger sources. Use approved channels and document dissemination.

## Key takeaways
- Share by need-to-know and least-necessary principles.
- Document sharing decisions and conditions.
- Protect sources and the integrity of proceedings.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "Intelligence direction begins with:",
        options: ["Collecting every available document", "Defining the decision and intelligence requirements", "Publishing conclusions", "Interviewing suspects"],
        correct: 1,
        explanation: "Collection is purposeful only when framed by a clear requirement.",
      },
      {
        type: "multi",
        prompt: "Which are structured analytic safeguards?",
        options: [
          "Analysis of competing hypotheses",
          "Devil's advocacy",
          "Assuming the senior officer is always right",
          "Peer review",
        ],
        correct: [0, 1, 3],
        explanation: "Structured challenge and review reduce bias; deference to rank does not.",
      },
      {
        type: "true_false",
        prompt: "Source reliability and information credibility are the same thing.",
        correct: false,
        explanation: "They are evaluated separately because reliable sources can be wrong on specific items.",
      },
      {
        type: "mcq",
        prompt: "Confirmation bias is best countered by:",
        options: [
          "Ignoring alternative explanations",
          "Actively testing alternatives and contrary evidence",
          "Working alone without review",
          "Relying on intuition",
        ],
        correct: 1,
        explanation: "Deliberate hypothesis testing and peer challenge reduce confirmation bias.",
      },
      {
        type: "fill",
        prompt: "Delivering intelligence to the right decision-maker at the right time is called ______.",
        correct: ["dissemination"],
        explanation: "Dissemination completes the intelligence cycle.",
      },
      {
        type: "true_false",
        prompt: "Open-source information may be collected without regard to privacy, platform terms or data-protection law.",
        correct: false,
        explanation: "Public availability does not remove legal and ethical duties.",
      },
      {
        type: "mcq",
        prompt: "The principle that recipients should receive only what they legitimately need is:",
        options: ["Need-to-know", "Open-by-default", "Public disclosure", "Majority rule"],
        correct: 0,
        explanation: "Need-to-know limits exposure and protects sources.",
      },
      {
        type: "multi",
        prompt: "Responsible dissemination includes:",
        options: [
          "Labeling handling conditions",
          "Documenting recipients",
          "Posting products in public chat groups",
          "Applying least-necessary sharing",
        ],
        correct: [0, 1, 3],
        explanation: "Public chat distribution is uncontrolled and unsafe.",
      },
    ],
  },
  {
    slug: "investigative-report-writing",
    title: "Investigative Report Writing",
    summary:
      "Turn investigative activity into clear, accurate, court-ready reports that withstand scrutiny.",
    description:
      "This practical course teaches officers how to structure investigative reports, separate fact from inference, cite evidence precisely and disclose material limitations. It includes a graded writing assignment reviewed by an instructor.",
    category: "investigation-operations",
    level: "Intermediate",
    durationMinutes: 150,
    cpdPoints: 5,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 20,
    objectives: [
      "Structure a report from complaint to conclusion",
      "Distinguish observation, evidence and inference",
      "Write concise, neutral prose",
      "Apply disclosure and quality-review discipline",
    ],
    instructorStaffId: "P0005",
    modules: [
      {
        title: "Building the Record",
        description: "Notes, evidence and structure.",
        lessons: [
          {
            title: "From field notes to evidential record",
            minutes: 15,
            content: `## Notes are evidence infrastructure

Contemporaneous notes capture what happened before memory reshapes it. Record dates, times, locations, participants, questions asked and answers given. Correct errors with a dated line, not by erasing.

## Referencing exhibits

Assign every document, device and recording a unique reference. In the report, cite the reference rather than paraphrasing vaguely. A reader should be able to move from a conclusion to its supporting exhibit in seconds.

## Chronologies

Build a chronology of events with sources. Chronologies expose gaps and contradictions early, while they can still be investigated.

## Key takeaways
- Record facts contemporaneously.
- Reference every exhibit precisely.
- Use a chronology to test consistency.`,
          },
          {
            title: "Anatomy of an investigative report",
            minutes: 20,
            content: `## Standard structure

1. **Title and case reference**
2. **Executive summary** — findings and status
3. **Background and complaint**
4. **Authority and scope of investigation**
5. **Investigative steps and chronology**
6. **Evidence reviewed**
7. **Findings** — with references
8. **Legal analysis** (where appropriate)
9. **Conclusion and recommendations**
10. **Annexes and exhibits**

## Executive summary discipline

A decision-maker may read only the summary. State what was alleged, what was found, what remains unresolved and what action is recommended, each traceable to the body of the report.

## Key takeaways
- Use a consistent, predictable structure.
- Make the executive summary decision-ready.
- Every finding needs an evidential anchor.`,
          },
        ],
        knowledgeCheck: {
          title: "Knowledge check: report fundamentals",
          questions: [
            {
              type: "mcq",
              prompt: "The main purpose of referencing exhibits is to:",
              options: [
                "Make the report longer",
                "Allow each finding to be traced to supporting evidence",
                "Protect the investigator from criticism",
                "Replace witness interviews",
              ],
              correct: 1,
              explanation: "Precise references make findings verifiable.",
            },
            {
              type: "true_false",
              prompt: "Field notes should be rewritten from memory at the end of an investigation.",
              correct: false,
              explanation: "Contemporaneous notes are stronger; later memory is less reliable.",
            },
            {
              type: "multi",
              prompt: "Which sections belong in a standard report?",
              options: ["Scope and authority", "Findings with evidence references", "Conclusions and recommendations", "An anonymous backchannel for complaints"],
              correct: [0, 1, 2],
              explanation: "Informal backchannels are not part of a formal report.",
            },
          ],
        },
      },
      {
        title: "Writing with Clarity",
        description: "Facts, inference and plain language.",
        lessons: [
          {
            title: "Fact, inference and opinion",
            minutes: 15,
            content: `## Label your epistemic status

- **Fact:** supported by an identified source, e.g. "The bank statement for account 001 shows a transfer of N2,000,000 dated 3 March."
- **Inference:** a reasoned conclusion, e.g. "The timing suggests the payment was connected to the contract award."
- **Opinion:** a value judgment, generally avoided unless invited, e.g. "The officer's conduct was disgraceful."

Mixing these categories lets a reader challenge the whole report when only one inference is weak.

## Language for uncertainty

Use "appears", "is consistent with", "could not be established" precisely. Avoid overstating: "proves", "obviously" and "clearly" often hide thin evidence.

## Key takeaways
- Separate fact, inference and opinion.
- State the evidential basis for each inference.
- Calibrate certainty honestly.`,
          },
          {
            title: "Plain language, tone and audience",
            minutes: 15,
            content: `## Write for the reader

Reports may be read by prosecutors, courts, auditors and oversight bodies. Write in short paragraphs, active voice and plain English. Define technical terms once.

## Neutral tone

Do not editorialise or use loaded labels. Describe conduct rather than character. Avoid speculation about motives unless evidence supports a reasoned inference.

## Formatting that helps

Use headings, numbered paragraphs, tables for money flows and consistent names. Highlight unresolved gaps. A well-formatted report is easier to scrutinise and harder to misread.

## Key takeaways
- Clarity is a form of fairness.
- Describe conduct, not character.
- Help the reader find and test your evidence.`,
          },
        ],
      },
      {
        title: "Accountability and Review",
        description: "Disclosure, quality control and court readiness.",
        lessons: [
          {
            title: "Disclosure and material limitations",
            minutes: 15,
            content: `## Disclose what weakens the case

A credible report does not hide unhelpful evidence. Identify witnesses who were not interviewed, records that could not be obtained and alternative explanations that remain open.

## Avoiding advocacy

Investigators gather evidence; prosecutors decide charges. A report that argues a verdict undermines its own objectivity. Present the strongest evidence and its limits.

## Review trail

Record who reviewed each draft, what changed and why. Version control prevents disputed reports and supports accountability.

## Key takeaways
- Disclosure strengthens credibility.
- Report facts and reasoned findings, not verdicts.
- Keep a version and review trail.`,
          },
          {
            title: "Court-ready writing: a practical drill",
            minutes: 15,
            content: `## Test every paragraph

Ask of each paragraph:

- What is the source?
- Is it fact or inference?
- Would a defence lawyer identify a gap here?
- Is the language precise and neutral?
- Does it help answer the investigation question?

## The one-minute summary

Draft a 100-word summary. If you cannot state the allegation, evidence and status concisely, the report's logic needs work.

## Peer review

Exchange reports with a colleague and review only for clarity, traceability and neutrality. Fresh eyes catch assumptions the author cannot see.

## Key takeaways
- Paragraph-level testing exposes weakness.
- Concision reveals structural clarity.
- Peer review is a quality control, not a formality.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "Which statement is a fact rather than an inference?",
        options: [
          "The officer must have known about the payment.",
          "The contract file lacks a technical evaluation memo.",
          "The officer is obviously corrupt.",
          "The supplier probably bribed the panel.",
        ],
        correct: 1,
        explanation: "The missing memo is directly observable; the others are inferences or opinions.",
      },
      {
        type: "multi",
        prompt: "A credible report should disclose:",
        options: [
          "Alternative explanations not excluded",
          "Records that could not be obtained",
          "Witnesses not interviewed",
          "Only evidence favourable to the complainant",
        ],
        correct: [0, 1, 2],
        explanation: "Balanced disclosure is a marker of credibility.",
      },
      {
        type: "true_false",
        prompt: "Inference should be labelled as fact when the investigator feels confident.",
        correct: false,
        explanation: "Confidence does not convert inference into fact.",
      },
      {
        type: "mcq",
        prompt: "The best language for an unverified link between two events is:",
        options: [
          "This proves collusion",
          "The timing is consistent with a connection",
          "This is obviously corruption",
          "There is no possible doubt",
        ],
        correct: 1,
        explanation: "Calibrated language accurately reflects the state of the evidence.",
      },
      {
        type: "fill",
        prompt: "A dated list of events and their sources is called a ______.",
        correct: ["chronology"],
        explanation: "A chronology exposes gaps and contradictions.",
      },
      {
        type: "true_false",
        prompt: "Peer review of a draft report is mainly about protecting the author from blame.",
        correct: false,
        explanation: "Peer review tests clarity, traceability and neutrality to improve quality.",
      },
    ],
    assignment: {
      title: "Practical assignment: draft an executive summary",
      instructions:
        "Using the scenario described in the question, write a 250–400 word executive summary of an investigative report. State the allegation, the evidence reviewed, your findings (distinguishing fact from inference), unresolved gaps and a recommendation. This is manually graded by an instructor.",
      prompt:
        "Scenario: A complaint alleges that a procurement officer approved a N12 million supply contract without competitive bidding to a company owned by a relative. The file contains the contract, a single quotation, and a company registration extract showing the relative as a director. The officer declined to attend an interview but submitted a written response claiming urgency. Bank records were not available before the report deadline.",
      points: 20,
    },
  },
  {
    slug: "fundamentals-anti-corruption-investigation",
    title: "Fundamentals of Anti-Corruption Investigation",
    summary:
      "A practical framework for receiving complaints, planning cases, gathering evidence and closing investigations to a professional standard.",
    description:
      "This course introduces the end-to-end investigative process: triage, case planning, interviews, documentary and digital evidence, case-file management and prosecution briefs. It stresses lawfulness, fairness and evidential rigour.",
    category: "investigation-operations",
    level: "Beginner",
    durationMinutes: 210,
    cpdPoints: 6,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 30,
    objectives: [
      "Triage complaints and assess jurisdiction",
      "Prepare an investigative plan for a corruption allegation",
      "Collect and corroborate witness, documentary and digital evidence",
      "Maintain a complete case file and prosecution brief",
    ],
    instructorStaffId: "P0005",
    modules: [
      {
        title: "Opening a Case",
        description: "Complaints, triage and planning.",
        lessons: [
          {
            title: "Receiving and triaging complaints",
            minutes: 20,
            content: `## Intake quality determines case quality

Complaints arrive by letter, email, petition, referral or walk-in. Intake staff should capture the complainant's details, the allegation, dates, locations, named persons, supporting documents and any immediate risk to evidence.

## Triage questions

- Does the allegation fall within our mandate?
- Is there enough detail to identify conduct and persons?
- Is urgent action needed to preserve evidence?
- Is there a conflict of interest or safety concern?
- Should the matter be referred to another agency or handled administratively?

## Protecting complainants

Whistleblowers and complainants may face retaliation. Apply confidentiality, need-to-know handling and lawful protection measures. Never disclose identity without a proper basis.

## Key takeaways
- Capture structured, complete intake information.
- Triage jurisdiction, urgency and risk early.
- Protect complainants and sources.`,
          },
          {
            title: "Case planning and investigative strategy",
            minutes: 20,
            content: `## Plan before acting

An investigative plan sets the allegation, scope, legal basis, evidence needed, sequence of steps, resources, risks and review points. It is a living document, updated as evidence emerges.

## Evidence matrix

Map each element to be proved against the evidence that could prove it:

- duty and authority;
- the corrupt act or abuse;
- the benefit or loss;
- intent and knowledge;
- links between suspects and assets.

For each cell, note the source, status and priority. This prevents random collection.

## Resources and review

Assign roles, set milestones and schedule supervisory review. Record key decisions and their reasons.

## Key takeaways
- Plans convert allegations into evidence requirements.
- Use an evidence matrix to guide collection.
- Review and update the plan as facts change.`,
          },
        ],
        knowledgeCheck: {
          title: "Knowledge check: intake and planning",
          questions: [
            {
              type: "multi",
              prompt: "Which factors belong in complaint triage?",
              options: [
                "Jurisdiction over the allegation",
                "Urgency of evidence preservation",
                "The complainant's hairstyle",
                "Conflict-of-interest risk",
              ],
              correct: [0, 1, 3],
              explanation: "Jurisdiction, urgency and integrity risks are proper triage factors.",
            },
            {
              type: "mcq",
              prompt: "An evidence matrix maps:",
              options: [
                "Suspects' social media profiles",
                "Elements to be proved against available or needed evidence",
                "Staff leave schedules",
                "Office floor plans",
              ],
              correct: 1,
              explanation: "It links legal elements to their evidential sources.",
            },
            {
              type: "true_false",
              prompt: "Complainant identity may be shared freely with all interview subjects.",
              correct: false,
              explanation: "Identity is need-to-know and disclosure can endanger complainants.",
            },
          ],
        },
      },
      {
        title: "Gathering Evidence",
        description: "Witnesses, documents and digital material.",
        lessons: [
          {
            title: "Witness interviews that stand up",
            minutes: 20,
            content: `## Preparation

Review documents before interviewing. Prepare open questions about what the witness did, saw, heard and knows. Avoid leading questions that plant answers.

## Conduct

Record the interview with consent or lawful authority. Explain the process, confirm identity and allow the witness to give a free account before detailed questions. Clarify times, amounts and document references.

## Evaluating testimony

Consider opportunity, consistency, motive and corroboration. Record inconsistencies without dismissing the witness. Witnesses may be truthful but mistaken.

## Key takeaways
- Prepare with documents and non-leading questions.
- Record interviews accurately.
- Test testimony against corroboration.`,
          },
          {
            title: "Documentary and digital evidence",
            minutes: 20,
            content: `## Documents

Procurement files, payment records, approval memos and correspondence form the spine of most corruption cases. Obtain originals where possible, record provenance and maintain an exhibit register.

## Digital material

Emails, chat messages, system logs and files can be powerful, but integrity is everything. Use forensic imaging or hash-verified copies, record device details and preserve metadata. Do not open or modify original media unnecessarily.

## Proving the link

A payment record shows money moved; it does not by itself show corruption. Link documents to persons and conduct through approvals, communications, interviews and timing.

## Key takeaways
- Preserve provenance and integrity.
- Hash and document digital copies.
- Evidence matters through connection, not volume.`,
          },
        ],
      },
      {
        title: "Closing the Case",
        description: "Case files, briefs and recommendations.",
        lessons: [
          {
            title: "Case-file management",
            minutes: 15,
            content: `## One authoritative file

Maintain a single indexed case file with sections for correspondence, investigative steps, exhibits, interview records and analysis. Every document gets a reference and page count. Duplicates and working notes must not obscure the official record.

## Security and retention

Store files securely, restrict access and maintain a movement register for physical exhibits. Digital files should be backed up under institutional policy with access logs.

## Disclosure

Identify material that may undermine or assist the case and ensure it is available for disclosure. Hiding weaknesses destroys credibility when they emerge later.

## Key takeaways
- Keep one complete, indexed record.
- Secure and track all exhibits.
- Prepare for disclosure from day one.`,
          },
          {
            title: "Prosecution briefs and recommendations",
            minutes: 15,
            content: `## The brief

A prosecution brief presents the case for a decision: facts, evidence, legal analysis, suspects, charges considered, strengths, weaknesses and recommendations. It should be usable by a prosecutor who has not followed the investigation.

## Alternative outcomes

Not every case should be prosecuted. Recommendations may include administrative discipline, systems reform, referral, further investigation or closure with reasons. Document the rationale.

## Learning loop

After closure, capture lessons: what evidence was hard to obtain, what procedures failed and what controls would prevent recurrence. Feed these into prevention and training.

## Key takeaways
- Briefs must stand alone.
- Recommend the outcome the evidence supports.
- Close cases in a way that improves the institution.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "The first priority after receiving a credible complaint is:",
        options: [
          "Arresting the most senior person named",
          "Triage and planning while preserving urgent evidence",
          "Publishing the allegation",
          "Closing the file",
        ],
        correct: 1,
        explanation: "Structured triage and preservation prevent loss and unlawful action.",
      },
      {
        type: "multi",
        prompt: "An investigative plan should include:",
        options: ["Allegation and scope", "Evidence required", "Risks and review points", "A guaranteed conviction timeline"],
        correct: [0, 1, 2],
        explanation: "Investigations cannot guarantee outcomes; they plan evidence and process.",
      },
      {
        type: "true_false",
        prompt: "Witness interviews should begin with leading questions to save time.",
        correct: false,
        explanation: "Open, non-leading questions protect the reliability of the account.",
      },
      {
        type: "mcq",
        prompt: "The best practice for digital evidence is to:",
        options: [
          "Open original files repeatedly",
          "Create hash-verified forensic copies and document provenance",
          "Rely on screenshots only",
          "Email originals to all investigators",
        ],
        correct: 1,
        explanation: "Hash-verified copies preserve integrity and admissibility.",
      },
      {
        type: "fill",
        prompt: "A register tracking every document or item obtained is called an ______ register.",
        correct: ["exhibit"],
        explanation: "An exhibit register records provenance and custody.",
      },
      {
        type: "true_false",
        prompt: "Material that may weaken the case should be excluded from the file.",
        correct: false,
        explanation: "Disclosure obligations require identifying all material, including weaknesses.",
      },
      {
        type: "mcq",
        prompt: "A prosecution brief should be usable by:",
        options: [
          "Only the original investigator",
          "A prosecutor who has not followed the investigation",
          "The suspect's lawyer only",
          "The media",
        ],
        correct: 1,
        explanation: "A self-contained brief enables independent prosecution decisions.",
      },
      {
        type: "multi",
        prompt: "Possible lawful outcomes of an investigation include:",
        options: ["Prosecution", "Administrative discipline", "Systems reform recommendations", "Ignoring the evidence"],
        correct: [0, 1, 2],
        explanation: "Outcomes must be evidence-based; ignoring evidence is not a legitimate option.",
      },
    ],
  },
  {
    slug: "evidence-collection-preservation",
    title: "Evidence Collection, Handling and Preservation",
    summary:
      "Maintain integrity and chain of custody for physical and digital evidence from seizure to court.",
    description:
      "This course covers evidence principles, chain-of-custody documentation, digital forensic preservation, exhibit handling and courtroom presentation. It equips officers to prevent the avoidable failures that destroy otherwise strong cases.",
    category: "investigation-operations",
    level: "Intermediate",
    durationMinutes: 165,
    cpdPoints: 5,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 25,
    objectives: [
      "Explain provenance, integrity and chain of custody",
      "Seize and preserve digital devices correctly",
      "Handle physical exhibits without contamination",
      "Present evidence confidently and accurately in court",
    ],
    instructorStaffId: "P0005",
    modules: [
      {
        title: "Evidence Principles",
        description: "Integrity, relevance and custody.",
        lessons: [
          {
            title: "Types of evidence and admissibility concepts",
            minutes: 20,
            content: `## Evidence in outline

Evidence may be documentary, testimonial, physical or digital. Courts assess relevance, authenticity and lawful acquisition. Even powerful evidence can lose value if its integrity cannot be demonstrated.

## Authenticity and provenance

Provenance answers: where did this come from, who handled it, and can we show it has not changed? Documentation at the point of collection is more reliable than reconstruction months later.

## Exclusion risks

Unlawful search, coerced statements, broken custody and unverified digital copies create admissibility challenges. Investigators should assume every seizure may be challenged.

## Key takeaways
- Relevance is necessary but not sufficient.
- Prove authenticity through records and witnesses.
- Assume every exhibit will be challenged.`,
          },
          {
            title: "Chain of custody",
            minutes: 20,
            content: `## The custody trail

Every transfer of an exhibit should record: item identifier, description, from whom, to whom, date and time, purpose and signature. Gaps in the trail invite challenges that the item was altered or substituted.

## Packaging and labelling

Package items to prevent contamination or damage. Label with case reference, exhibit number, date, location and collector. Seal packages and record seal numbers.

## Common mistakes

- Collecting without photographs or a scene record.
- Combining items in one bag where trace evidence matters.
- Leaving exhibits unsecured in offices.
- Signing transfers in bulk days later.

## Key takeaways
- Record every custody transfer contemporaneously.
- Package and seal to preserve integrity.
- Small documentation failures become large courtroom problems.`,
          },
        ],
        knowledgeCheck: {
          title: "Knowledge check: principles and custody",
          questions: [
            {
              type: "mcq",
              prompt: "Chain of custody proves:",
              options: [
                "That the suspect is guilty",
                "Who handled an exhibit and when",
                "That the case is complete",
                "That witnesses are truthful",
              ],
              correct: 1,
              explanation: "It documents continuity and integrity of the exhibit.",
            },
            {
              type: "true_false",
              prompt: "A gap in custody records can be filled in from memory weeks later without issue.",
              correct: false,
              explanation: "Late reconstruction weakens reliability and invites challenge.",
            },
            {
              type: "multi",
              prompt: "Good exhibit labelling includes:",
              options: ["Exhibit number", "Date and location", "Collector's identity", "The suspect's opinion of the case"],
              correct: [0, 1, 2],
              explanation: "Objective identification details matter, not opinions.",
            },
          ],
        },
      },
      {
        title: "Digital Evidence",
        description: "Seizure, imaging and verification.",
        lessons: [
          {
            title: "Device seizure and isolation",
            minutes: 20,
            content: `## Before touching the device

Photograph the scene, record device state (on/off, screen), note visible data and identify the device's owner and location. If the device is on, consider network isolation to prevent remote wiping, following policy and lawful authority.

## Do not browse

Investigators should not casually explore a device. Use qualified forensic practitioners to acquire data. Casual browsing changes metadata and can be challenged.

## Authority and documentation

Record the legal basis for seizure, the person from whom it was taken, the time and place, and the device identifiers. Provide a receipt and inventory.

## Key takeaways
- Document the device before seizure.
- Isolate networks where appropriate and lawful.
- Leave examination to qualified practitioners.`,
          },
          {
            title: "Imaging, hashing and preservation",
            minutes: 20,
            content: `## Forensic images

A forensic image is a bit-for-bit copy of storage. The original should be preserved; analysis is performed on verified copies. Hashing (for example SHA-256) produces a digital fingerprint that demonstrates integrity.

## Documentation

Record the tool used, version, examiner, time, source and destination, and both hashes. Store images securely with access logs and backups under policy.

## Cloud and remote data

Cloud accounts introduce jurisdictional and legal issues. Obtain the appropriate legal process and preserve account identifiers and logs. Do not rely on screenshots alone when logs can be preserved.

## Key takeaways
- Image originals; analyse copies.
- Hashes demonstrate integrity.
- Cloud evidence needs lawful process and metadata preservation.`,
          },
        ],
      },
      {
        title: "Handling and Courtroom Presentation",
        description: "From store room to witness box.",
        lessons: [
          {
            title: "Physical evidence handling",
            minutes: 15,
            content: `## Special handling

Documents should be handled by edges and stored flat in archival sleeves. Biological or trace evidence requires specialist collection and storage. Currency should be photographed and counted under proper procedure.

## Storage environment

Use secure, access-controlled storage with movement registers. Protect items from moisture, heat and pests. Conduct periodic inventory checks.

## Disposal and return

At case conclusion, return items to lawful owners or dispose of them under documented authority. Never donate or discard exhibits informally.

## Key takeaways
- Match handling to the evidence type.
- Secure storage includes movement records.
- Final disposal needs documented authority.`,
          },
          {
            title: "Presenting evidence in court",
            minutes: 15,
            content: `## Prepare the exhibit list

Know every exhibit, its reference, provenance and significance. Rehearse explaining the custody trail without notes if possible, and be ready to produce documents.

## Testimony discipline

Answer the question asked, distinguish what you observed from what you were told, and do not overstate expertise. If you do not know, say so. Credibility is built on accuracy, not certainty.

## Handling challenges

If a gap or error is identified, acknowledge it and explain the corrective step. Defensiveness damages credibility more than an honest correction.

## Key takeaways
- Master the exhibit list and custody trail.
- Testify within your knowledge.
- Honesty under challenge strengthens credibility.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "The primary purpose of hashing digital evidence is to:",
        options: ["Compress files", "Demonstrate integrity of the evidence copy", "Hide content", "Speed up court hearings"],
        correct: 1,
        explanation: "A hash is a digital fingerprint that can verify integrity.",
      },
      {
        type: "multi",
        prompt: "Chain-of-custody records should include:",
        options: ["Item identifier", "Transfers with dates and signatures", "Purpose of each transfer", "Informal opinions about guilt"],
        correct: [0, 1, 2],
        explanation: "Custody records document objective continuity and purpose, not opinions.",
      },
      {
        type: "true_false",
        prompt: "Investigators should freely browse a seized phone before forensic imaging.",
        correct: false,
        explanation: "Casual browsing alters metadata and undermines evidentiary integrity.",
      },
      {
        type: "mcq",
        prompt: "The correct approach to original storage media is to:",
        options: [
          "Analyse it directly to save time",
          "Preserve it and analyse a verified forensic copy",
          "Format it after copying",
          "Store it in an open office drawer",
        ],
        correct: 1,
        explanation: "Originals are preserved; analysis happens on verified copies.",
      },
      {
        type: "fill",
        prompt: "The documented sequence of who handled an exhibit is known as the chain of ______.",
        correct: ["custody"],
        explanation: "Chain of custody proves continuity and integrity.",
      },
      {
        type: "true_false",
        prompt: "In court, an investigator should always express absolute certainty even when unsure.",
        correct: false,
        explanation: "Accuracy and candour build credibility; overstatement does not.",
      },
      {
        type: "multi",
        prompt: "Secure exhibit storage should include:",
        options: ["Controlled access", "Movement registers", "Periodic inventory checks", "Unrestricted staff access"],
        correct: [0, 1, 2],
        explanation: "Unrestricted access undermines integrity.",
      },
      {
        type: "mcq",
        prompt: "A likely consequence of an unexplained custody gap is:",
        options: [
          "Automatic conviction",
          "Challenge to the integrity of the exhibit",
          "Faster trial",
          "Closing the court",
        ],
        correct: 1,
        explanation: "Custody gaps invite challenges that the item was altered or substituted.",
      },
    ],
  },
];

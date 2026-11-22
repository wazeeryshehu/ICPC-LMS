import type { CourseSeed } from "./types";

export const legalCourses: CourseSeed[] = [
  {
    slug: "understanding-the-icpc-act",
    title: "Understanding the ICPC Act",
    summary:
      "A practical introduction to the Corrupt Practices and Other Related Offences Act: the Commission's mandate, offences, investigative powers and prevention duties.",
    description:
      "This foundation course introduces officers to the Corrupt Practices and Other Related Offences Act and the constitutional basis of the ICPC's work. It explains how the Commission receives complaints, investigates and prosecutes corruption offences, and how its prevention and public education mandates operate alongside enforcement. The course is demonstration material and must be validated by the Legal Department against the current consolidated Act before publication.",
    category: "legal-services",
    level: "Beginner",
    durationMinutes: 180,
    mandatory: true,
    legalDemo: true,
    cpdPoints: 6,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 25,
    objectives: [
      "Describe the Commission's statutory mandate and institutional structure",
      "Identify the main categories of offences created by the Act",
      "Explain the relationship between investigation, prosecution and prevention",
      "Apply due-process safeguards to a corruption complaint scenario",
    ],
    prerequisites: ["No prior legal qualification required"],
    instructorStaffId: "P0004",
    modules: [
      {
        title: "Foundations of the Commission's Mandate",
        description: "Why the ICPC exists and what the Act empowers it to do.",
        lessons: [
          {
            title: "Historical context and institutional mandate",
            minutes: 15,
            content: `## From policy commitment to statutory mandate

The Corrupt Practices and Other Related Offences Act established the Independent Corrupt Practices and Other Related Offences Commission as Nigeria's principal statutory anti-corruption agency for the public service. The Act responds to a simple institutional problem: corruption weakens public confidence, distorts procurement and deprives citizens of services.

The Commission's mandate is deliberately broad. It receives and investigates complaints, prosecutes offenders, examines the practices and procedures of public bodies, and educates the public against corruption. This combination of **enforcement, prevention and public education** is a defining feature of the ICPC model.

## Institutional structure

The Commission is governed by a board and led by a Chairman, with directors responsible for investigation, prosecution, prevention, asset recovery and administration. Operational work is supported by legal services, intelligence, ICT and finance units.

> Demonstration note: this lesson summarises the Act at a high level only. Before using it for official training, the Legal Department must confirm the current consolidated text and any amendments.

## Key takeaways
- The ICPC is a statutory body with enforcement, prevention and education mandates.
- Its jurisdiction is primarily the public service, though the Act also reaches private persons who deal with public officers corruptly.
- Officers must act within the law at every stage, not only at trial.`,
          },
          {
            title: "Offences under the Act: a working map",
            minutes: 20,
            content: `## Core offence categories

The Act creates offences that can be grouped for investigation purposes into four families:

- **Demand and acceptance of gratification** by public officers, including indirect benefits and benefits to third parties.
- **Offering or giving gratification**, which captures bribe-givers as well as bribe-takers.
- **Fraudulent acquisition and abuse of office**, including dishonesty in the administration of public property.
- **Offences connected with contracts, tenders and the use of office for personal advantage.**

## What makes an offence

Prosecutions generally require proof of the conduct, the corrupt intent and the official status that gives the conduct its public dimension. Investigators should therefore establish the officer's duties, the transaction, the benefit, the connection between the benefit and the act (or intended act), and the documentary trail.

## Practical application

A complaint that a procurement officer received a payment from a supplier should be treated as several potential lines of enquiry: the procurement record, the officer's approvals, the supplier relationship, bank flows and the officer's asset position.

## Key takeaways
- Organise allegations by offence family to structure evidence gathering.
- Official status and duty are evidentiary facts, not assumptions.
- A single complaint may disclose multiple offences and multiple suspects.`,
          },
        ],
        knowledgeCheck: {
          title: "Knowledge check: mandate and offences",
          questions: [
            {
              type: "mcq",
              prompt: "Which combination best describes the ICPC's statutory roles?",
              options: [
                "Enforcement, prevention and public education",
                "Tax collection and customs enforcement",
                "Judicial adjudication and sentencing",
                "Private arbitration and mediation",
              ],
              correct: 0,
              explanation:
                "The Act equips the Commission to investigate and prosecute while also examining public body procedures and educating the public.",
            },
            {
              type: "true_false",
              prompt: "Only the person who offers a bribe can be prosecuted under the Act.",
              correct: false,
              explanation:
                "The Act also reaches the demand and acceptance of gratification by public officers.",
            },
            {
              type: "mcq",
              prompt: "In a procurement bribery complaint, which fact is least useful at the initial triage stage?",
              options: [
                "The officer's role in the procurement",
                "The identity of the supplier",
                "The officer's secondary school attendance record",
                "The payment trail",
              ],
              correct: 2,
              explanation:
                "Duty, relationship and money trail are core evidential threads; unrelated personal history is not a triage priority.",
            },
          ],
        },
      },
      {
        title: "Powers, Procedure and Due Process",
        description: "How investigations and prosecutions must be conducted lawfully.",
        lessons: [
          {
            title: "Investigation and prosecution powers",
            minutes: 20,
            content: `## Powers with boundaries

The Act empowers investigators to receive complaints, invite or interview persons, obtain documents, search premises under lawful authority and build case files for prosecution. These powers are not unlimited. They must be exercised consistently with the Constitution, the Administration of Criminal Justice Act and the Commission's internal procedures.

## Investigative discipline

A credible investigation has three qualities:

- **Documentation** — every step is recorded with dates, authors and sources.
- **Proportionality** — the least intrusive lawful method that answers the question is preferred.
- **Independence** — the investigator follows the evidence, not the complainant's preferred outcome.

## The prosecution decision

Not every proven irregularity is a criminal offence. Prosecutors must assess whether there is a reasonable prospect of conviction, whether prosecution is in the public interest, and whether administrative or disciplinary remedies are more appropriate.

> Demonstration note: statutory powers and procedural requirements must be confirmed against the current Act and applicable criminal procedure legislation.

## Key takeaways
- Authority must be lawfully exercised, documented and reviewable.
- A strong case file connects conduct, duty, benefit and intent.
- Prosecution is a public-interest decision, not automatic.`,
          },
          {
            title: "Rights, fair hearing and the integrity of evidence",
            minutes: 20,
            content: `## Why process matters

Anti-corruption enforcement succeeds only when it is legitimate. Evidence obtained through unlawful detention, coercion or improper search can be excluded, and a conviction obtained unfairly damages institutional credibility.

## Core safeguards

Officers should apply these safeguards as operating rules:

- **Inform suspects of the nature of the allegation** before interviewing them.
- **Respect the right to counsel** and the right to remain silent.
- **Record interviews accurately** and give the interviewee an opportunity to correct the record.
- **Observe detention limits** and obtain judicial oversight where required.
- **Preserve evidence lawfully**, maintaining chain of custody.

## Voluntary statements

A statement is only valuable if it is voluntary. Interviews should be conducted professionally, without threats, inducements or promises. The presence of a legal representative and accurate recording strengthen, rather than weaken, the evidentiary value of a statement.

## Key takeaways
- Fair procedure protects the case as much as the suspect.
- Voluntary, documented statements withstand challenge.
- Investigators must be able to explain every procedural decision.`,
          },
        ],
      },
      {
        title: "Applying the Act: Cases and Prevention",
        description: "Turning legal knowledge into operational judgement.",
        lessons: [
          {
            title: "Case study: contract inflation",
            minutes: 20,
            content: `## Scenario

A tip alleges that a director approved a road maintenance contract at nearly double the market rate in return for a payment from the contractor. The file contains a valid procurement record, but the director skipped the technical evaluation stage and the contractor's company was incorporated weeks before the award.

## Structured analysis

- **Duty:** the director's schedule of duties includes evaluation oversight and approval authority.
- **Conduct:** bypassing evaluation and approving an inflated contract.
- **Benefit:** an unexplained inflow to the director's account after payment.
- **Intent:** timing, concealment and relationship evidence suggest a corrupt arrangement, but each element must be independently verified.

## Investigative plan

Collect the procurement file, evaluation templates, market comparisons, incorporation records, bank statements and interview accounts from evaluation panel members. Preserve digital records of internal communications.

## Key takeaways
- Corruption cases are built from a matrix of duty, conduct, benefit and intent.
- Procedural shortcuts in procurement are powerful circumstantial evidence.
- Corroborate every inference with independent sources.`,
          },
          {
            title: "Prevention, systems review and public education",
            minutes: 15,
            content: `## Beyond prosecution

The Act gives the Commission a prevention mandate: examining the practices and procedures of public bodies and recommending reforms where corruption risks exist. Prevention work addresses the conditions that make corruption possible, not merely individual misconduct.

## Systems review in practice

A review team might examine a ministry's procurement cycle and find:

- approval authority concentrated in one officer;
- no independent price benchmarking;
- weak records of receipt and delivery;
- no vendor due-diligence controls.

The resulting report should be evidence-based, specific and actionable, with owners and timelines for each recommendation.

## Public education

Public education builds the demand side of integrity: citizens who understand how corruption works, how to report it and what protections exist are more willing to report wrongdoing. Awareness campaigns, school programmes and engagement with professional bodies are standard tools.

## Key takeaways
- Prevention targets systems, not only individuals.
- Recommendations must be practical and measurable.
- Public education is a statutory function, not an optional courtesy.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "The ICPC's prevention mandate includes which activity?",
        options: [
          "Sentencing convicted officers",
          "Examining the practices and procedures of public bodies",
          "Handling private commercial arbitration",
          "Tax assessment for contractors",
        ],
        correct: 1,
        explanation:
          "The Commission may review public-body systems and recommend reforms to reduce corruption opportunities.",
      },
      {
        type: "multi",
        prompt: "Which elements are needed to build a bribery case against a public officer?",
        options: [
          "The officer's official duty or position",
          "The transaction or benefit",
          "The officer's primary school records",
          "The connection between the benefit and official conduct",
        ],
        correct: [0, 1, 3],
        explanation:
          "Duty, benefit and the connection between them are core; unrelated personal history is not.",
      },
      {
        type: "true_false",
        prompt: "A suspect may be held indefinitely without judicial oversight provided the investigation is complex.",
        correct: false,
        explanation:
          "Detention limits and judicial oversight apply regardless of case complexity.",
      },
      {
        type: "mcq",
        prompt: "A statement obtained under threat of harm is best described as:",
        options: [
          "Involuntary and evidentially unsafe",
          "Stronger because it is candid",
          "Admissible without question",
          "Irrelevant to the case file",
        ],
        correct: 0,
        explanation:
          "Coerced statements are involuntary and undermine the integrity of the case.",
      },
      {
        type: "fill",
        prompt: "The statutory anti-corruption body discussed in this course is the ______.",
        correct: ["ICPC", "Independent Corrupt Practices and Other Related Offences Commission"],
        explanation:
          "The ICPC is the Commission established by the Corrupt Practices and Other Related Offences Act.",
      },
      {
        type: "true_false",
        prompt: "Every administrative irregularity should automatically lead to a criminal prosecution.",
        correct: false,
        explanation:
          "Prosecutors must assess evidence, public interest and alternative remedies such as discipline or systems reform.",
      },
      {
        type: "mcq",
        prompt: "Which is the best first step after receiving a corruption complaint?",
        options: [
          "Arrest every name mentioned in the complaint",
          "Triage the allegation, verify jurisdiction and plan lawful enquiries",
          "Publish the complaint on social media",
          "Close the file if the suspect is senior",
        ],
        correct: 1,
        explanation:
          "Triage and case planning precede coercive steps and prevent premature or unlawful action.",
      },
      {
        type: "multi",
        prompt: "Which practices strengthen an investigation file?",
        options: [
          "Contemporaneous records of each investigative step",
          "Chain-of-custody maintenance",
          "Reliance on rumours without corroboration",
          "Independent corroboration of key facts",
        ],
        correct: [0, 1, 3],
        explanation:
          "Documentation, custody and corroboration are core file-quality controls.",
      },
    ],
  },
  {
    slug: "aml-cft-essentials",
    title: "Anti-Money Laundering and Counter-Terrorism Financing",
    summary:
      "Understand money laundering mechanics, Nigeria's AML/CFT framework, customer due diligence, suspicious transaction reporting and emerging risks.",
    description:
      "This course explains how criminal proceeds are laundered, the roles of reporting institutions and regulators, and the practical duties of public officers in detecting and reporting suspicious activity. It covers the Money Laundering (Prevention and Prohibition) Act 2022 framework at a conceptual level and must be validated by the Legal Department before official use.",
    category: "legal-services",
    level: "Intermediate",
    durationMinutes: 210,
    legalDemo: true,
    cpdPoints: 7,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 30,
    objectives: [
      "Explain the stages of money laundering",
      "Identify the roles of the NFIU, SCUML and supervisory bodies",
      "Apply customer due diligence and enhanced measures",
      "Recognise when and how to report suspicious transactions",
    ],
    instructorStaffId: "P0004",
    modules: [
      {
        title: "The AML/CFT Framework",
        description: "How laundering works and who regulates it.",
        lessons: [
          {
            title: "Money laundering mechanics",
            minutes: 20,
            content: `## Three classic stages

Money laundering converts the proceeds of crime into assets that appear legitimate. The classic model has three stages:

- **Placement:** criminal cash enters the financial system through deposits, purchases or intermediaries.
- **Layering:** transactions, entities and jurisdictions are used to obscure the source.
- **Integration:** the laundered value re-enters the economy as apparently lawful investment or income.

Real schemes blend stages. A corrupt official may receive funds directly by transfer, purchase property through relatives, then sell at an inflated price to a connected buyer.

## Red flags

Indicators include transactions inconsistent with a customer's profile, structuring to avoid reporting thresholds, unexplained use of intermediaries, rapid movement of funds, and asset purchases with no verifiable source of wealth.

## Key takeaways
- Laundering is about concealing source and ownership, not only moving cash.
- Transaction patterns matter more than individual amounts.
- Asset purchases by proxies are a common public-sector corruption pattern.`,
          },
          {
            title: "Nigeria's legal and institutional framework",
            minutes: 20,
            content: `## Statutory architecture

Nigeria's AML/CFT regime is built on the Money Laundering (Prevention and Prohibition) Act 2022, the Terrorism (Prevention and Prohibition) Act 2022 and supporting regulations. The framework imposes obligations on financial institutions and designated non-financial businesses and professions, and establishes institutions with supervisory and intelligence roles.

## Key institutions

- **NFIU** — the financial intelligence unit that receives, analyses and disseminates suspicious transaction reports.
- **SCUML** — registers and monitors designated non-financial businesses and professions.
- **Supervisory authorities** — central bank, securities regulator, insurance regulator and professional bodies monitor compliance in their sectors.
- **Law enforcement agencies** — investigate predicate offences and laundering, often using financial intelligence.

## Public officers

Public officers are not merely spectators. Procurement, contract and payment roles generate records that investigators rely on, and officers must avoid facilitating concealment through informal arrangements.

> Demonstration note: confirm current statutory obligations and thresholds with the Legal Department and NFIU guidance.

## Key takeaways
- The framework combines prevention, intelligence and enforcement.
- Reporting entities carry statutory reporting duties.
- Financial intelligence is most useful when combined with predicate-offence evidence.`,
          },
        ],
      },
      {
        title: "Prevention Duties and Reporting",
        description: "Customer due diligence and suspicious transaction reporting.",
        lessons: [
          {
            title: "Customer due diligence and beneficial ownership",
            minutes: 20,
            content: `## Know your customer

Customer due diligence (CDD) means identifying customers, verifying identity, understanding the purpose of the relationship and monitoring activity for consistency. Simplified measures may apply to low-risk customers; enhanced due diligence is required for higher-risk situations such as politically exposed persons, complex structures and high-risk jurisdictions.

## Beneficial ownership

A company may be owned through a chain of entities. Beneficial ownership rules aim to identify the real human beings who ultimately own or control the customer. This matters in corruption cases where assets are held through nominees.

## Enhanced measures

For politically exposed persons, institutions should establish source of funds and wealth, obtain senior management approval and conduct closer ongoing monitoring.

## Key takeaways
- Identity verification is the beginning, not the end, of CDD.
- Beneficial ownership analysis defeats nominee arrangements.
- Enhanced measures target higher-risk relationships.`,
          },
          {
            title: "Suspicious transaction reporting",
            minutes: 20,
            content: `## From suspicion to report

A suspicious transaction report (STR) communicates a suspicion — not proven guilt — to the financial intelligence unit. Reporting entities must file reports promptly when they know, suspect or have reasonable grounds to suspect that funds are criminal proceeds or linked to terrorism financing.

## Quality over volume

A useful STR states the facts clearly: who is involved, what happened, when, how much, through which accounts or assets, why the activity is unusual, and what steps the reporter took. Speculation should be identified as such.

## Tipping off and confidentiality

Reporting entities and their staff must not disclose that a report has been made where doing so could prejudice investigation. Internal escalation should follow approved channels with need-to-know access.

## Key takeaways
- Suspicion is enough to report; proof is not required.
- Clear, factual narratives accelerate analysis.
- Confidentiality protects investigations and reporters.`,
          },
        ],
      },
      {
        title: "Investigation and Emerging Risks",
        description: "Following the money and responding to new threats.",
        lessons: [
          {
            title: "Following the money and recovering assets",
            minutes: 20,
            content: `## Financial investigation

A financial investigation asks three questions: where did the money come from, where did it go, and who controls it now? Investigators map accounts, transactions, entities and assets, then test the map against the subject's lawful income.

## Asset recovery tools

Depending on the legal basis and stage of proceedings, tools may include freezing orders, forfeiture, restraint and mutual legal assistance in cross-border cases. Speed matters: assets can be dissipated quickly once a subject learns of an investigation.

## Multi-agency collaboration

AML investigations often require coordination among the police, ICPC, NDLEA, EFCC, NFIU and international counterparts. Information sharing must be lawful, documented and proportionate.

## Key takeaways
- Establish lawful income as a baseline for comparing assets.
- Act early to preserve assets where legal grounds exist.
- Collaboration multiplies capability but requires disciplined information handling.`,
          },
          {
            title: "Virtual assets and terrorism financing",
            minutes: 15,
            content: `## New channels, same risks

Virtual assets can move value quickly across borders and may be used to layer proceeds or raise funds for terrorism. Risks include anonymity-enhanced assets, peer-to-peer transfers, mixers and unregistered exchanges.

## Risk-based response

Institutions should identify virtual-asset exposure, apply enhanced due diligence where appropriate and monitor for patterns such as rapid conversion between crypto and cash, use of unhosted wallets, or transactions linked to high-risk addresses.

## Terrorism financing indicators

Terrorism financing may involve small, dispersed donations or misuse of charities and informal value transfer systems. Indicators should be assessed in context; religion, nationality or ethnicity are never valid risk factors.

## Key takeaways
- Virtual assets are a regulated-risk area, not a loophole.
- Risk-based measures should track the actual channel and behaviour.
- Objective indicators, never identity stereotypes, drive suspicion.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "Which stage of money laundering involves introducing criminal cash into the financial system?",
        options: ["Layering", "Integration", "Placement", "Forfeiture"],
        correct: 2,
        explanation: "Placement is the initial entry of criminal proceeds into the financial system.",
      },
      {
        type: "multi",
        prompt: "Which are classic money-laundering red flags?",
        options: [
          "Transactions inconsistent with the customer's profile",
          "Structuring to avoid reporting thresholds",
          "Asset purchases through unexplained intermediaries",
          "Paying all taxes promptly on verified income",
        ],
        correct: [0, 1, 2],
        explanation: "Profile mismatch, structuring and proxy asset purchases are recognised indicators.",
      },
      {
        type: "mcq",
        prompt: "The Nigerian agency that receives and analyses suspicious transaction reports is the:",
        options: ["NFIU", "SCUML", "FIRS", "NJC"],
        correct: 0,
        explanation: "The NFIU is Nigeria's financial intelligence unit.",
      },
      {
        type: "true_false",
        prompt: "A suspicious transaction report requires proof that a crime has been committed.",
        correct: false,
        explanation: "A reasonable suspicion, not proof, is the reporting threshold.",
      },
      {
        type: "mcq",
        prompt: "Enhanced due diligence is especially required for:",
        options: [
          "All low-value savings accounts",
          "Politically exposed persons and higher-risk relationships",
          "Staff canteen purchases",
          "Customers who prefer cashless payment",
        ],
        correct: 1,
        explanation: "PEPs and other higher-risk relationships trigger enhanced measures.",
      },
      {
        type: "fill",
        prompt: "Identifying the real people who ultimately own or control a customer is called beneficial ______ analysis.",
        correct: ["ownership"],
        explanation: "Beneficial ownership analysis pierces nominee and layered structures.",
      },
      {
        type: "true_false",
        prompt: "Warning a suspect that a suspicious transaction report has been filed may be permissible if the officer trusts the suspect.",
        correct: false,
        explanation: "Tipping off can prejudice investigation and is prohibited.",
      },
      {
        type: "mcq",
        prompt: "A financial investigation generally compares a subject's assets with:",
        options: [
          "Newspaper reports",
          "Lawful and verifiable income",
          "Neighbours' opinions",
          "The number of social media followers",
        ],
        correct: 1,
        explanation: "Unexplained wealth is assessed against lawful income and known liabilities.",
      },
    ],
  },
  {
    slug: "constitution-fundamental-human-rights",
    title: "Nigerian Constitution and Fundamental Human Rights",
    summary:
      "The constitutional foundations of anti-corruption work: supremacy of the Constitution, separation of powers, fundamental rights and lawful limits.",
    description:
      "This course examines how the Constitution of the Federal Republic of Nigeria structures public power and protects fundamental rights, with particular attention to enforcement contexts such as arrest, detention, search, fair hearing and digital privacy. Demonstration material requiring Legal Department validation.",
    category: "legal-services",
    level: "Beginner",
    durationMinutes: 180,
    legalDemo: true,
    cpdPoints: 6,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 25,
    objectives: [
      "Explain constitutional supremacy and separation of powers",
      "Summarise the fundamental rights most relevant to investigations",
      "Apply fair-hearing safeguards in enforcement practice",
      "Assess when limitations on rights are lawful and proportionate",
    ],
    instructorStaffId: "P0004",
    modules: [
      {
        title: "Constitutional Foundations",
        description: "The architecture of public power.",
        lessons: [
          {
            title: "Supremacy and separation of powers",
            minutes: 15,
            content: `## The Constitution as grundnorm

The Constitution of the Federal Republic of Nigeria is the supreme law. Any law or action inconsistent with it is void to the extent of the inconsistency. For anti-corruption agencies, this means statutory powers are read subject to constitutional rights and procedural guarantees.

## Three arms, distinct functions

- **Legislature** makes laws and appropriates funds.
- **Executive** implements laws and administers public institutions.
- **Judiciary** adjudicates disputes and interprets the Constitution.

The separation is not absolute; it is a system of checks and balances. Courts can review executive action; legislatures oversee spending; agencies enforce laws within statutory limits.

## Why it matters operationally

An investigator who understands constitutional structure can anticipate legal challenges, respect institutional boundaries and explain the lawful basis for every action.

## Key takeaways
- All agency powers derive from and are limited by the Constitution.
- Checks and balances constrain arbitrary action.
- Lawful authority must be identifiable and documented.`,
          },
          {
            title: "Fundamental rights in outline",
            minutes: 20,
            content: `## Chapter IV protections

The Constitution's fundamental rights provisions protect, among other things:

- life;
- dignity of the human person;
- personal liberty;
- fair hearing;
- private and family life;
- freedom of thought, conscience and religion;
- freedom of expression and the press;
- peaceful assembly and association;
- freedom of movement;
- freedom from discrimination;
- right to acquire and own property.

## Relevance to anti-corruption work

These rights shape how investigations are conducted. Personal liberty affects arrest and bail. Private life affects searches and data access. Fair hearing affects trial procedure. Property rights affect seizure and forfeiture.

## Enforcement

Courts can enforce fundamental rights through dedicated applications. Agencies should therefore treat constitutional compliance as a case-integrity issue, not a formality.

> Demonstration note: the scope and case law of each right evolve; confirm current judicial interpretation before training use.

## Key takeaways
- Fundamental rights are directly enforceable.
- Investigative actions routinely engage multiple rights.
- Procedural shortcuts create litigation risk and undermine public trust.`,
          },
        ],
      },
      {
        title: "Rights in Operational Context",
        description: "Arrest, detention, privacy and fair hearing.",
        lessons: [
          {
            title: "Arrest, detention and fair hearing",
            minutes: 20,
            content: `## Arrest with lawful authority

Arrest must have a legal basis, be carried out by an authorised person, and be communicated to the suspect in a language they understand. The suspect must be informed of the reason for arrest and of their rights.

## Detention limits

The Constitution and criminal procedure legislation impose time limits and require prompt judicial oversight. Detention must be recorded, justified and reviewed. Administrative convenience is not a lawful basis for extended detention.

## Fair hearing in practice

Fair hearing includes:

- an impartial tribunal;
- adequate notice of the allegation;
- a reasonable opportunity to respond;
- access to counsel;
- interpretation where needed;
- a decision based on evidence.

## Key takeaways
- Every arrest needs a recorded legal basis.
- Detention is time-bound and reviewable.
- Fair hearing begins long before trial in the quality of investigative process.`,
          },
          {
            title: "Privacy, expression and digital rights",
            minutes: 20,
            content: `## Privacy in a digital institution

The constitutional protection of private life extends to digital spaces. Searching devices, accessing email, monitoring communications or obtaining subscriber data requires lawful authority and, in many contexts, a warrant or judicial order.

## Freedom of expression

Expression includes criticism of public institutions. Anti-corruption agencies must distinguish lawful criticism, whistleblowing and journalism from actual obstruction or defamation. Suppressing dissent is both unlawful and strategically damaging.

## Data protection overlay

The Nigeria Data Protection Act 2023 adds specific duties: lawful basis, purpose limitation, data minimisation, security and respect for data-subject rights. Public institutions processing staff and case data are controllers with statutory obligations.

## Key takeaways
- Device and communications access requires a documented lawful basis.
- Criticism is not obstruction.
- NDPA 2023 obligations apply to investigative data holdings.`,
          },
        ],
      },
      {
        title: "Balancing Rights and Enforcement",
        description: "Limits, proportionality and practical judgement.",
        lessons: [
          {
            title: "Limitations and proportionality",
            minutes: 15,
            content: `## Rights are not absolute

Many constitutional rights are subject to limitations designed to protect public safety, public order, morality or the rights of others. The limitation must itself be lawful, reasonable and justifiable in a democratic society.

## Proportionality test

Ask:

1. Is there a legitimate objective?
2. Is the measure rationally connected to that objective?
3. Is it the least restrictive means available?
4. Does the benefit outweigh the intrusion?

## Example

Seizing every phone in an office to find one document is unlikely to satisfy proportionality. Seizing a specific device identified by evidence, with a warrant and a custody record, is far more defensible.

## Key takeaways
- Limitations must be lawful and justifiable.
- Least-restrictive-means reasoning guides operational choices.
- Proportionality protects both rights and evidence quality.`,
          },
          {
            title: "Human rights in investigations: a checklist",
            minutes: 15,
            content: `## Operational checklist

Before any coercive step, confirm:

- **Authority:** which law, warrant or approval authorises this action?
- **Notice:** has the person been told what is happening and why?
- **Recording:** is the action being documented with time, place and participants?
- **Custody:** if property is taken, is there a signed inventory and chain of custody?
- **Review:** who supervises the decision and how can it be challenged?

## Culture and accountability

Rights compliance is strongest when supervisors ask about it routinely and when audits examine files for procedural regularity, not only outcomes. Training, complaints mechanisms and disciplinary consequences reinforce the standard.

## Key takeaways
- Use the authority-notice-recording-custody-review checklist.
- Supervision and audit make rights compliance sustainable.
- Legitimate process strengthens prosecutions.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "The Constitution is best described as:",
        options: [
          "A departmental circular",
          "The supreme law to which other laws must conform",
          "A policy guideline without legal force",
          "A treaty that only binds courts",
        ],
        correct: 1,
        explanation: "The Constitution is supreme; inconsistent laws or actions are void to that extent.",
      },
      {
        type: "multi",
        prompt: "Which are components of fair hearing?",
        options: [
          "Adequate notice of the allegation",
          "An opportunity to respond with counsel",
          "A predetermined outcome favouring the complainant",
          "An impartial decision-maker",
        ],
        correct: [0, 1, 3],
        explanation: "Fair hearing requires notice, opportunity to be heard and impartiality.",
      },
      {
        type: "true_false",
        prompt: "Police or agency custody can be extended indefinitely if the case is high-profile.",
        correct: false,
        explanation: "Detention remains subject to constitutional and statutory time limits and judicial oversight.",
      },
      {
        type: "mcq",
        prompt: "Seizing an entire office's phones to locate one document most directly conflicts with:",
        options: ["The right to property only", "Proportionality and privacy", "The right to education", "Tax law"],
        correct: 1,
        explanation: "Overbroad seizure is difficult to justify as a least-restrictive measure.",
      },
      {
        type: "fill",
        prompt: "The principle that a limitation on a right must be the least intrusive means available is called ______.",
        correct: ["proportionality"],
        explanation: "Proportionality asks whether the measure is necessary and balanced.",
      },
      {
        type: "true_false",
        prompt: "Freedom of expression means public institutions cannot be criticised online.",
        correct: false,
        explanation: "Criticism of public institutions is protected expression, distinct from unlawful obstruction.",
      },
      {
        type: "mcq",
        prompt: "Accessing a suspect's personal email account should be based on:",
        options: [
          "A hunch and verbal instruction",
          "Lawful authority such as a warrant or judicial order",
          "The investigator's seniority",
          "Consent of a colleague",
        ],
        correct: 1,
        explanation: "Digital privacy requires a documented legal basis and proper authorisation.",
      },
      {
        type: "multi",
        prompt: "Which elements belong on a pre-coercive-action rights checklist?",
        options: [
          "Identifying the legal authority",
          "Notifying the affected person",
          "Documenting the action and any property taken",
          "Ignoring supervisory review to save time",
        ],
        correct: [0, 1, 2],
        explanation: "Authority, notice and documentation (with review) are core safeguards.",
      },
    ],
  },
];

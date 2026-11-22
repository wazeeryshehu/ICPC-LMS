import type { CourseSeed } from "./types";

export const digitalCourses: CourseSeed[] = [
  {
    slug: "cybersecurity-awareness-public-officers",
    title: "Cybersecurity Awareness for Public Officers",
    summary:
      "Practical defences against phishing, password attacks, data leakage and everyday cyber risks in government institutions.",
    description:
      "This mandatory awareness course equips ICPC officers with the habits that prevent most cyber incidents: recognising phishing and social engineering, protecting credentials with multi-factor authentication, handling official data safely, working securely off-site and reporting incidents quickly. It aligns with institutional security policy and the Nigeria Data Protection Act 2023.",
    category: "ict-digital",
    level: "Beginner",
    durationMinutes: 120,
    mandatory: true,
    cpdPoints: 4,
    passMark: 70,
    maxAttempts: 3,
    examMinutes: 20,
    objectives: [
      "Recognise phishing, smishing and social-engineering attempts",
      "Apply strong authentication and password habits",
      "Handle official information and devices securely",
      "Report cyber incidents through the correct channels",
    ],
    instructorStaffId: "P0003",
    modules: [
      {
        title: "Threats and Everyday Hygiene",
        description: "The attacks you are most likely to encounter.",
        lessons: [
          {
            title: "Phishing, smishing and social engineering",
            minutes: 15,
            content: `## Why attackers target people

Most breaches begin with a person, not a firewall. Attackers exploit urgency, authority and curiosity to persuade staff to click links, open attachments or disclose information.

## Common forms

- **Phishing email:** a message impersonating a colleague, bank, vendor or government portal.
- **Smishing:** fraudulent SMS with links or callback numbers.
- **Vishing:** phone calls requesting passwords, codes or remote access.
- **Business email compromise:** a spoofed or compromised mailbox instructs a payment or data disclosure.
- **Pretexting:** a fabricated scenario, such as an "ICT audit", used to obtain access.

## How to verify

Check the sender's full address, hover over links before clicking, and confirm unusual requests through a separate trusted channel. Legitimate IT staff never ask for your password or one-time code.

> If a message creates urgency to bypass procedure, treat that urgency as a warning sign.

## Key takeaways
- Verify identity through a second channel.
- Never disclose passwords or OTPs.
- Report suspicious messages even if you did not click.`,
          },
          {
            title: "Passwords, MFA and account safety",
            minutes: 15,
            content: `## Passphrases beat predictable passwords

Use long passphrases or a password manager. Never reuse an official password on personal sites, and never share credentials. The strongest password is useless if it is reused after a third-party breach.

## Multi-factor authentication

MFA adds a second factor such as an authenticator app or hardware key. Prefer app-based or hardware factors over SMS where available. Approve an MFA prompt only when you initiated the login.

## Lockout and recovery

Report lost devices immediately. Do not store passwords in notes, spreadsheets or chat messages. Use the official recovery process rather than informal workarounds.

## Key takeaways
- Unique, long credentials for every account.
- MFA blocks most credential-based attacks.
- Speed of reporting limits damage.`,
          },
        ],
        knowledgeCheck: {
          title: "Knowledge check: everyday threats",
          questions: [
            {
              type: "mcq",
              prompt: "An email marked urgent asks you to confirm your password via a link. The safest action is to:",
              options: [
                "Click and enter the password quickly",
                "Reply with your password",
                "Verify separately with IT and report the message",
                "Forward it to colleagues to ask their opinion",
              ],
              correct: 2,
              explanation: "Verify through a trusted channel and report; never submit credentials via a link.",
            },
            {
              type: "true_false",
              prompt: "An ICT officer may legitimately ask for your one-time authentication code.",
              correct: false,
              explanation: "Legitimate IT staff do not need your OTP or password.",
            },
            {
              type: "multi",
              prompt: "Which practices improve account safety?",
              options: [
                "Using a unique passphrase per account",
                "Enabling multi-factor authentication",
                "Sharing passwords with a trusted colleague",
                "Reporting a lost device immediately",
              ],
              correct: [0, 1, 3],
              explanation: "Uniqueness, MFA and prompt reporting reduce risk; sharing passwords never does.",
            },
          ],
        },
      },
      {
        title: "Working Securely",
        description: "Data handling, devices and remote work.",
        lessons: [
          {
            title: "Email, data handling and classification",
            minutes: 15,
            content: `## Share only what is necessary

Official information should be shared on a need-to-know basis. Before sending a file, confirm the recipient, the classification and whether the channel is approved.

## Practical rules

- Use official accounts for official work.
- Encrypt or use approved secure transfer for sensitive files.
- Avoid sending case data to personal email or messaging apps.
- Check attachments for unintended recipients before sending.
- Lock your screen when leaving your desk.

## Data minimisation

Collect and retain only what the task requires. Excess personal data creates both security and data-protection risk. When in doubt, consult the information security or data protection officer.

## Key takeaways
- Verify recipient and classification before sharing.
- Personal channels are not approved for official data.
- Minimising data reduces exposure.`,
          },
          {
            title: "Devices, browsing and remote work",
            minutes: 15,
            content: `## Device hygiene

Keep operating systems and applications updated, use approved antivirus, and avoid installing unlicensed software. USB devices from unknown sources should never be connected.

## Safe browsing

Look for correct domain names, avoid pirated software and streaming sites, and do not bypass security warnings. Public Wi-Fi is unsuitable for sensitive work unless a trusted VPN is used with institutional approval.

## Working away from the office

Use institution-issued devices where possible, keep screens shielded in public, and avoid discussing sensitive cases where you can be overheard. Lock devices and report theft promptly.

## Key takeaways
- Update, patch and avoid unknown media.
- Do not bypass security controls.
- Remote work does not relax data-handling rules.`,
          },
        ],
      },
      {
        title: "Responding to Incidents",
        description: "Detect early, report fast, contain damage.",
        lessons: [
          {
            title: "Recognising and reporting incidents",
            minutes: 15,
            content: `## What counts as an incident?

Suspicious logins, malware alerts, lost devices, accidental data disclosure, ransomware messages or unusual system behaviour all qualify. Report early even if you are unsure; triage is the security team's job.

## Reporting steps

1. Stop using the affected device for sensitive work.
2. Do not delete evidence or attempt informal fixes.
3. Note what happened, when and what you observed.
4. Contact the ICT security desk through the approved channel.

## No-blame reporting

Fast reporting saves institutions. Staff should not fear punishment for honest mistakes; concealment, however, turns a contained incident into a crisis.

## Key takeaways
- Report suspicion quickly through official channels.
- Preserve evidence rather than deleting it.
- Honest, prompt reporting is protected behaviour.`,
          },
          {
            title: "Institutional policy and legal duties",
            minutes: 15,
            content: `## Policy as protection

Institutional security policies translate legal duties into daily practice. They cover acceptable use, access control, incident response, backup and retention. Following policy protects officers and the Commission.

## Data protection connection

Under the Nigeria Data Protection Act 2023, organisations must secure personal data and respond appropriately to breaches. A personal-data breach may trigger notification duties and requires documented assessment.

## Continuous improvement

After incidents, institutions should conduct reviews, update controls and share lessons through training. Security is a cycle, not a one-off project.

## Key takeaways
- Policies exist to make secure behaviour repeatable.
- Personal-data breaches have legal consequences.
- Post-incident review strengthens the whole institution.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "Which behaviour most increases risk of account compromise?",
        options: [
          "Using a unique passphrase",
          "Reusing the same password across personal and official accounts",
          "Enabling an authenticator app",
          "Locking your screen when away",
        ],
        correct: 1,
        explanation: "Password reuse turns unrelated breaches into account takeovers.",
      },
      {
        type: "multi",
        prompt: "Which are signs of a phishing attempt?",
        options: [
          "Urgent demands to bypass procedure",
          "A lookalike domain name",
          "A request for your OTP",
          "A normal internal memo from a known address with no links",
        ],
        correct: [0, 1, 2],
        explanation: "Urgency, spoofed domains and OTP requests are classic indicators.",
      },
      {
        type: "true_false",
        prompt: "You should delete suspicious emails immediately to protect your mailbox.",
        correct: false,
        explanation: "Report first and preserve evidence; deletion can hinder investigation.",
      },
      {
        type: "mcq",
        prompt: "The safest way to transfer a sensitive case file is:",
        options: [
          "Personal email",
          "A social media direct message",
          "An approved secure channel or encrypted transfer",
          "A public USB drive borrowed from a cybercafé",
        ],
        correct: 2,
        explanation: "Sensitive data must move through approved, secure channels.",
      },
      {
        type: "fill",
        prompt: "Adding a second verification factor such as an authenticator app is known as multi-______ authentication.",
        correct: ["factor"],
        explanation: "Multi-factor authentication requires more than one independent factor.",
      },
      {
        type: "true_false",
        prompt: "Installing unlicensed software from the internet is acceptable if it improves productivity.",
        correct: false,
        explanation: "Unlicensed downloads are a common malware vector and breach policy.",
      },
      {
        type: "mcq",
        prompt: "After discovering a compromised device, you should first:",
        options: [
          "Continue working to meet deadlines",
          "Report through the official channel and stop sensitive work on the device",
          "Factory reset the device yourself",
          "Email the incident to all staff",
        ],
        correct: 1,
        explanation: "Contain and report; do not destroy evidence or continue sensitive work.",
      },
      {
        type: "mcq",
        prompt: "Public Wi-Fi should be used for sensitive work only when:",
        options: [
          "The connection is free",
          "No one else is nearby",
          "An approved VPN or secure access method is used",
          "The work is urgent",
        ],
        correct: 2,
        explanation: "Untrusted networks require approved protection such as an institutional VPN.",
      },
      {
        type: "true_false",
        prompt: "The Nigeria Data Protection Act 2023 has no relevance to cybersecurity practice.",
        correct: false,
        explanation: "The NDPA imposes security and breach-handling duties on data controllers.",
      },
      {
        type: "multi",
        prompt: "Good incident-reporting behaviour includes:",
        options: [
          "Reporting quickly even if unsure",
          "Preserving evidence",
          "Hiding the mistake to avoid embarrassment",
          "Following the official escalation path",
        ],
        correct: [0, 1, 3],
        explanation: "Prompt, honest and evidence-preserving reporting limits harm.",
      },
    ],
  },
  {
    slug: "data-protection-privacy-management",
    title: "Data Protection and Privacy Management",
    summary:
      "Apply Nigeria Data Protection Act 2023 principles to the handling of staff, case and learning records in a public institution.",
    description:
      "This course translates data-protection principles into institutional practice: lawful bases, data-subject rights, security safeguards, breach response and governance. It is designed for officers who handle personal data in case files, HR records, procurement and digital systems.",
    category: "ict-digital",
    level: "Intermediate",
    durationMinutes: 150,
    cpdPoints: 5,
    passMark: 60,
    maxAttempts: 3,
    examMinutes: 25,
    objectives: [
      "Explain the NDPA 2023 principles and lawful bases",
      "Respond effectively to data-subject requests",
      "Apply security and breach-notification duties",
      "Build privacy into projects and vendor relationships",
    ],
    instructorStaffId: "P0003",
    modules: [
      {
        title: "Foundations of Data Protection",
        description: "Principles, lawful bases and accountability.",
        lessons: [
          {
            title: "Core principles under the NDPA 2023",
            minutes: 20,
            content: `## Why personal data needs rules

Personal data belongs to the individual even when an institution holds it. Data-protection law ensures processing is transparent, purposeful and secure, while allowing institutions to carry out legitimate functions.

## Core principles

- **Lawfulness, fairness and transparency**
- **Purpose limitation** — collect for specified, legitimate purposes
- **Data minimisation** — collect only what is necessary
- **Accuracy** — keep records correct and up to date
- **Storage limitation** — retain only as long as needed
- **Integrity and confidentiality** — protect with appropriate security
- **Accountability** — demonstrate compliance

## Public institutions

The NDPA does not prevent lawful public functions; it requires that personal data be processed within a lawful basis and protected throughout its lifecycle.

## Key takeaways
- Principles apply across collection, use, storage and deletion.
- Accountability means being able to show compliance.
- Data minimisation reduces both legal and security risk.`,
          },
          {
            title: "Lawful bases, consent and public interest",
            minutes: 20,
            content: `## Six lawful bases

Processing must rely on one of the lawful bases recognised by the NDPA, including consent, contract, legal obligation, vital interests, public interest and legitimate interests. Public authorities must assess these carefully; consent is rarely the best basis for statutory functions.

## Consent quality

Valid consent is freely given, specific, informed and unambiguous. Bundled consent, silence or pre-ticked boxes are not valid. Consent can be withdrawn, so systems should support that where consent is the chosen basis.

## Documenting the basis

For each processing activity, record what data is collected, why, which basis applies, who receives it and how long it is kept. This record supports accountability and makes reviews easier.

## Key takeaways
- Choose the lawful basis before collecting data.
- Consent must be genuine and withdrawable.
- Documenting purpose and basis is a compliance control.`,
          },
        ],
        knowledgeCheck: {
          title: "Knowledge check: principles and bases",
          questions: [
            {
              type: "mcq",
              prompt: "Collecting a national ID number 'just in case it is useful later' breaches:",
              options: ["Purpose limitation and minimisation", "Freedom of movement", "Procurement rules", "Tax neutrality"],
              correct: 0,
              explanation: "Data should be collected for specified, necessary purposes.",
            },
            {
              type: "true_false",
              prompt: "Pre-ticked boxes provide valid consent under the NDPA.",
              correct: false,
              explanation: "Consent must be an affirmative, informed choice.",
            },
            {
              type: "multi",
              prompt: "Which are NDPA principles?",
              options: [
                "Storage limitation",
                "Accuracy",
                "Integrity and confidentiality",
                "Unlimited retention for convenience",
              ],
              correct: [0, 1, 2],
              explanation: "Unlimited retention conflicts with storage limitation.",
            },
          ],
        },
      },
      {
        title: "Operational Duties",
        description: "Rights, security and breaches.",
        lessons: [
          {
            title: "Data-subject rights in practice",
            minutes: 15,
            content: `## The rights toolkit

Data subjects may seek access to their data, correction of inaccurate data, deletion in defined circumstances, restriction of processing, portability and objection to certain processing. Requests must be handled within statutory timelines and through a documented process.

## Handling a request

1. Verify identity.
2. Log the request and its deadline.
3. Locate all relevant records, including backups and shared drives.
4. Apply any lawful exemptions and explain them.
5. Respond clearly and retain the correspondence.

## Common pitfalls

Informal chat requests, unclear ownership and unindexed files delay responses. A central intake channel and a records map make compliance manageable.

## Key takeaways
- Rights requests need identity verification and deadlines.
- Search all systems, not just the most obvious one.
- Document decisions and exemptions.`,
          },
          {
            title: "Security safeguards and breach response",
            minutes: 20,
            content: `## Appropriate security

The NDPA requires technical and organisational measures appropriate to risk: access control, encryption, logging, staff training, secure disposal and supplier oversight. Security is proportionate to sensitivity and volume.

## Responding to a breach

A personal-data breach is a security incident that leads to accidental or unlawful destruction, loss, alteration or disclosure. Response steps:

- contain the breach;
- assess risk to affected persons;
- notify the Data Protection Commission and data subjects where required;
- document the incident and remedial actions;
- review controls to prevent recurrence.

## Learning from breaches

Root-cause analysis should distinguish human error, process weakness and technical failure. Remedies should address the underlying cause rather than only the symptom.

## Key takeaways
- Security measures follow risk, not fashion.
- Breach response is assessed, documented and time-bound.
- Fix root causes, not just incidents.`,
          },
        ],
      },
      {
        title: "Privacy Governance",
        description: "Impact assessments, records and third parties.",
        lessons: [
          {
            title: "Assessments and records of processing",
            minutes: 15,
            content: `## Data protection impact assessment

A DPIA is a structured assessment of a project's privacy risks and mitigations. It is especially important for large-scale monitoring, sensitive data, new technology and profiling-like activities.

## What a DPIA covers

- the nature and purpose of processing;
- the data and individuals affected;
- necessity and proportionality;
- risks to rights and freedoms;
- mitigations and residual risk;
- sign-off and review.

## Records of processing

Maintain an inventory of processing activities. It helps answer rights requests, supports audits and prevents invisible data sprawl.

## Key takeaways
- Assess privacy risk before deployment.
- DPIAs make risks visible and manageable.
- Processing inventories are the backbone of accountability.`,
          },
          {
            title: "Vendors, cloud and cross-border transfers",
            minutes: 15,
            content: `## Third parties process your risk

Outsourcing does not outsource accountability. Contracts should specify purpose, security, breach notification, sub-processors, audit rights and deletion on exit.

## Cloud services

Confirm where data is stored, who can access it and how encryption keys are managed. Review default settings and retention. Public institutions should assess national requirements and approved hosting arrangements.

## Cross-border transfers

Transfers outside Nigeria require an adequate legal basis and safeguards under the NDPA. Document the assessment and the protections applied.

## Key takeaways
- Vendor contracts must address data protection explicitly.
- Cloud settings and access need active governance.
- Cross-border transfers require documented safeguards.`,
          },
        ],
      },
    ],
    finalExam: [
      {
        type: "mcq",
        prompt: "The primary Nigerian law governing personal-data processing is the:",
        options: ["Freedom of Information Act", "Nigeria Data Protection Act 2023", "Procurement Act", "Evidence Act"],
        correct: 1,
        explanation: "The NDPA 2023 is Nigeria's principal data-protection statute.",
      },
      {
        type: "multi",
        prompt: "Which are data-protection principles?",
        options: ["Purpose limitation", "Data minimisation", "Accuracy", "Unlimited retention"],
        correct: [0, 1, 2],
        explanation: "Retention must be limited to what is necessary.",
      },
      {
        type: "true_false",
        prompt: "Consent is the only lawful basis for processing personal data under the NDPA.",
        correct: false,
        explanation: "Several lawful bases exist, including legal obligation and public interest.",
      },
      {
        type: "mcq",
        prompt: "A staff member asks for a copy of the personal data held about them. This is a:",
        options: ["Data-subject access request", "Procurement query", "Criminal appeal", "Freedom of the press claim"],
        correct: 0,
        explanation: "Access is a core data-subject right requiring a verified, documented response.",
      },
      {
        type: "fill",
        prompt: "A structured assessment of a project's privacy risks is called a data protection ______ assessment.",
        correct: ["impact"],
        explanation: "A DPIA identifies risks and mitigations before deployment.",
      },
      {
        type: "true_false",
        prompt: "Outsourcing data processing to a vendor removes the institution's accountability.",
        correct: false,
        explanation: "Accountability remains with the controller; contracts must impose protections.",
      },
      {
        type: "multi",
        prompt: "Which measures help secure personal data?",
        options: [
          "Access control and logging",
          "Encryption",
          "Secure disposal of records",
          "Sharing credentials among team members",
        ],
        correct: [0, 1, 2],
        explanation: "Credential sharing undermines accountability and access control.",
      },
      {
        type: "mcq",
        prompt: "After a personal-data breach, a sound first step is to:",
        options: [
          "Ignore it if no one complains",
          "Contain the breach and assess the risk",
          "Delete all relevant logs",
          "Post the affected data online",
        ],
        correct: 1,
        explanation: "Containment and risk assessment drive lawful breach response.",
      },
    ],
  },
];

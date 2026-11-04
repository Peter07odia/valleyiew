/**
 * Patient policy content for /clinic-policies, /service-fees and
 * /patient-rights-and-responsibilities.
 *
 * Wording follows the original valleyviewmedical.ca policy pages. If a question
 * for the clinic is ever added here, start it with "CONFIRM:" — the test in
 * src/data/patient-policies.test.ts fails while any page shows that text, so it
 * can't go live by accident.
 */

export type InlineText = string | { text: string; href: string }
export type Paragraph = InlineText[]

export interface PolicySection {
  id: string
  title: string
  paragraphs: Paragraph[]
}

export const CLINIC_POLICIES_INTRO =
  "Important information for our patients. If you have a question about any of these policies, please contact your clinic."

export const CLINIC_POLICIES: PolicySection[] = [
  {
    id: "health-cards",
    title: "Health Cards",
    paragraphs: [
      [
        "Please bring a valid, up-to-date provincial health card to every visit. Our front desk will ask to see it at check-in.",
      ],
      [
        "If you can’t present a valid health card, you may be charged for your visit according to our ",
        { text: "Uninsured Service Fees", href: "/service-fees" },
        ". If you show a valid health card within 30 days of your visit, we will refund what you paid, minus an administrative fee.",
      ],
      [
        "Under Ontario Ministry of Health policy, a valid provincial health card (from Ontario or any other province) is required for every visit.",
      ],
      [
        "Keeping your health card up to date helps you keep access to care and protects against fraud. If your card is lost, stolen or damaged, please contact the Ministry of Health and Long-Term Care information line at ",
        { text: "1-800-664-8998", href: "tel:18006648998" },
        ". If your address or name has changed, visit or contact your local OHIP office.",
      ],
    ],
  },
  {
    id: "uninsured-services",
    title: "Uninsured Services",
    paragraphs: [
      [
        "OHIP covers medically necessary services. Services it does not cover are called uninsured services, and we charge a fee for them. Examples include prescription renewals without an appointment, driver’s medicals and third-party examinations, missed appointments, sick notes for work or school, forms for insurance, legal or employment purposes, and copying or transferring medical records. See our ",
        { text: "Uninsured Service Fees", href: "/service-fees" },
        " page for current fees.",
      ],
    ],
  },
  {
    id: "test-results",
    title: "Test Results",
    paragraphs: [
      [
        "Our medical team reviews every test result. Because of the high volume of results, we do not contact patients about normal results. We will contact you if a result is abnormal or needs a follow-up visit.",
      ],
      [
        "If you would like to discuss your results with your doctor, please book a follow-up appointment one to two weeks after your tests. Allow at least 48 hours for blood work and at least 72 hours for x-rays and other tests.",
      ],
    ],
  },
  {
    id: "respectful-workplace",
    title: "Respectful Workplace",
    paragraphs: [
      [
        "We have zero tolerance for abuse or mistreatment of staff, patients, physicians or anyone in our clinics. This includes intimidation, condescending language and manipulation. Incidents will be recorded, and depending on how serious they are, may lead to ending the patient relationship or involving the authorities.",
      ],
    ],
  },
  {
    id: "medical-appointments",
    title: "Medical Appointments",
    paragraphs: [
      [
        "When you book, please tell our staff the reason for your visit so we can plan the schedule. Appointments are usually 15 minutes. Your doctor will focus on your main concern and may book a follow-up visit for other issues. This helps us keep wait times down for everyone.",
      ],
    ],
  },
  {
    id: "patient-check-in",
    title: "Patient Check-In",
    paragraphs: [
      [
        "Before your first visit, we will ask you to complete a registration form with your name, date of birth, address, phone number and health card details. These forms are confidential and are securely shredded after your visit.",
      ],
    ],
  },
  {
    id: "prescription-renewal",
    title: "Prescription Renewal",
    paragraphs: [
      [
        "Prescriptions are normally reviewed at your appointments. Before each visit, please check how many refills you have left. If you will need a renewal before your next appointment, book one at least two weeks before your medication runs out.",
      ],
      [
        "New medications and dose changes always need an appointment. Prescriptions for narcotics, controlled medications, sedatives and antibiotics are never renewed by phone or fax and need an appointment with your doctor.",
      ],
      [
        "We do not refill narcotics or controlled medications. We recommend contacting the provider who first prescribed them for refills.",
      ],
      [
        "If you run out of medication without having made an appointment, our walk-in clinic can provide a one-time short supply at the request of your pharmacy. Please allow up to 48 hours for the prescription to be sent to your pharmacy. Only existing, current prescriptions are eligible.",
      ],
      [
        "A prescription renewal without an appointment is not covered by OHIP and may be charged as listed in our ",
        { text: "Uninsured Service Fees", href: "/service-fees" },
        ".",
      ],
    ],
  },
  {
    id: "cancellation-late-arrival",
    title: "Cancellation and Late Arrival",
    paragraphs: [
      [
        "If you need to cancel, please give us at least 24 hours’ notice so we can offer your appointment to another patient. If you are running late or have an emergency, please call your clinic as soon as possible.",
      ],
    ],
  },
  {
    id: "no-show-fee",
    title: "No-Show Fee",
    paragraphs: [
      [
        "If you miss an appointment without giving at least 24 hours’ notice, you will be charged a $40 no-show fee. Three or more missed appointments may lead to ending the patient relationship, at your physician’s discretion.",
      ],
    ],
  },
  {
    id: "vacation-sick-coverage",
    title: "Vacation and Sick Coverage",
    paragraphs: [
      [
        "If your doctor is away because of illness, vacation or continuing education, another qualified physician in our clinic may see you. Your medical history is in our electronic medical record, so the covering doctor can provide continuity of care.",
      ],
    ],
  },
]

export const SERVICE_FEES_INTRO =
  "These services are not covered by OHIP. Fees depend on the service, and complex requests may cost more. Fees are approximate and may vary, so please ask your clinic’s front desk for the exact fee before your visit."

export interface ServiceFee {
  service: string
  fee: string
}

export interface ServiceFeeGroup {
  id: string
  title: string
  fees: ServiceFee[]
}

// Grouped for easier scanning; every fee and amount is unchanged from the approved list.
export const SERVICE_FEE_GROUPS: ServiceFeeGroup[] = [
  {
    id: "notes-letters",
    title: "Notes and letters",
    fees: [
      { service: "Sick note or doctor’s letter", fee: "$25 to $50" },
      { service: "Daycare note", fee: "$25 to $50" },
      { service: "Prescription for massage or physiotherapy", fee: "$30 to $50" },
    ],
  },
  {
    id: "forms",
    title: "Forms",
    fees: [
      { service: "Form completion (depends on form)", fee: "$40 to $80" },
      { service: "Attending physician statement", fee: "$50 to $150" },
      { service: "Chiropractic, orthotics or compression stockings form", fee: "$30 to $60" },
      { service: "CRA tax credit form", fee: "$45 to $85" },
      { service: "Long-term disability form", fee: "$100 to $150" },
      { service: "Short-term disability form", fee: "$60 to $100" },
      { service: "Disability tax credit form", fee: "$85 to $120" },
      { service: "Immunization form", fee: "$25 to $50" },
      { service: "FAF form", fee: "$40 to $80" },
    ],
  },
  {
    id: "exams-visits",
    title: "Exams and visits",
    fees: [
      { service: "Driver’s medical exam", fee: "$125 to $200" },
      { service: "MTO physical and form", fee: "$120 to $180" },
      { service: "Non-OHIP visit", fee: "$100 to $160" },
    ],
  },
  {
    id: "tests-procedures",
    title: "Tests and procedures",
    fees: [
      { service: "TB test", fee: "$40 to $60" },
      { service: "TB read", fee: "$20 to $40" },
      { service: "Ear flushing", fee: "$30 to $50 per ear" },
      { service: "Wart or skin tag removal (1 to 3)", fee: "$10 to $30" },
      { service: "Wart or skin tag removal (4 to 5)", fee: "$50 to $80" },
    ],
  },
  {
    id: "medical-records",
    title: "Medical records",
    fees: [
      { service: "Medical records request", fee: "$50 to $100" },
      { service: "Chart copy (first 20 pages)", fee: "$0.25 per page after 20" },
    ],
  },
  {
    id: "missed-appointments",
    title: "Missed appointments",
    fees: [{ service: "No-show fee", fee: "$40 to $80" }],
  },
]

export const PATIENT_RIGHTS_INTRO =
  "At Valleyview Medical Centre, we respect the rights of every patient. We also ask every patient to help us give the best care to you and to everyone who visits our clinics."

export interface PatientRight {
  heading: string
  body: Paragraph
}

export const PATIENT_RIGHTS: PatientRight[] = [
  {
    heading: "Safety and respect",
    body: [
      "You will receive respectful, compassionate care that does not discriminate and that respects your values, beliefs and safety. If something unexpected happens during your care, we will tell you and involve you in any changes to your care.",
    ],
  },
  {
    heading: "Taking part in your care",
    body: [
      "You have the right to know who your healthcare providers are, to receive clear information about your diagnosis and treatment, to make choices about your care, to seek a second opinion, and to be told about any research projects.",
    ],
  },
  {
    heading: "Privacy",
    body: [
      "You have the right to privacy and confidentiality, to control your personal information, to see your health record and ask for corrections, and to have your information kept secure. See our ",
      { text: "Privacy Policy", href: "/privacy-policy" },
      ".",
    ],
  },
]

export const PATIENT_RESPONSIBILITIES_INTRO = "We ask every patient to:"

export const PATIENT_RESPONSIBILITIES: string[] = [
  "Be open and honest about your health history, including past and current illnesses, allergies, medications and family health history.",
  "Arrive on time, or give at least 24 hours’ notice if you need to cancel or reschedule.",
  "Treat our staff, other patients and visitors with consideration and respect.",
  "Not smoke on clinic premises.",
  "Take reasonable care of your health, and follow the advice your healthcare providers give you.",
  "Ask questions about anything you don’t understand, and tell us what matters to you in your care.",
]

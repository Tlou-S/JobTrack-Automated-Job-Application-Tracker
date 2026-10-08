export const applicationStatuses = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];
export type ApplicationPriority = "LOW" | "MEDIUM" | "HIGH";

export type JobApplication = {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  salary: string;
  applicationDate: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  jobUrl: string;
  contactPerson: string;
  notes: string;
  interviewDate?: string;
};

const storageKey = "jobtrack_applications_v1";

const sampleApplications: JobApplication[] = [
  {
    id: "application-1",
    jobTitle: "Graduate Software Engineer",
    company: "Northstar Labs",
    location: "Cape Town, South Africa",
    employmentType: "Full-time",
    salary: "R28,000 - R34,000 / month",
    applicationDate: "2026-09-29",
    status: "INTERVIEW",
    priority: "HIGH",
    jobUrl: "https://careers.northstarlabs.example/graduate-engineer",
    contactPerson: "Maya Jacobs",
    notes: "Technical interview with the platform team. Review the take-home project.",
    interviewDate: "2026-10-14T10:30:00",
  },
  {
    id: "application-2",
    jobTitle: "Junior Data Analyst",
    company: "Cape Meridian Bank",
    location: "Cape Town, South Africa",
    employmentType: "Hybrid",
    salary: "R24,000 - R30,000 / month",
    applicationDate: "2026-10-02",
    status: "SCREENING",
    priority: "HIGH",
    jobUrl: "https://careers.capemeridian.example/data-analyst",
    contactPerson: "Thabo Ndlovu",
    notes: "Recruiter requested an updated academic transcript.",
  },
  {
    id: "application-3",
    jobTitle: "Product Design Intern",
    company: "Fieldwork Studio",
    location: "Remote",
    employmentType: "Internship",
    salary: "R12,000 / month",
    applicationDate: "2026-10-04",
    status: "APPLIED",
    priority: "MEDIUM",
    jobUrl: "https://jobs.fieldwork.example/product-design-intern",
    contactPerson: "",
    notes: "Tailored portfolio to include the campus navigation project.",
  },
  {
    id: "application-4",
    jobTitle: "Business Analyst Graduate Programme",
    company: "Kopano Consulting",
    location: "Johannesburg, South Africa",
    employmentType: "Graduate programme",
    salary: "R26,000 / month",
    applicationDate: "2026-09-20",
    status: "OFFER",
    priority: "HIGH",
    jobUrl: "https://careers.kopano.example/graduate-analyst",
    contactPerson: "Lerato Maseko",
    notes: "Offer received. Compare relocation allowance before Friday.",
  },
  {
    id: "application-5",
    jobTitle: "Marketing Assistant",
    company: "Brightside Creative",
    location: "Cape Town, South Africa",
    employmentType: "Full-time",
    salary: "R18,000 - R22,000 / month",
    applicationDate: "2026-09-15",
    status: "REJECTED",
    priority: "LOW",
    jobUrl: "https://brightside.example/careers/marketing-assistant",
    contactPerson: "",
    notes: "Declined after first-round interview. Ask for feedback next week.",
  },
  {
    id: "application-6",
    jobTitle: "Cloud Support Associate",
    company: "Pinecone Systems",
    location: "Remote, South Africa",
    employmentType: "Full-time",
    salary: "R22,000 - R27,000 / month",
    applicationDate: "2026-10-07",
    status: "SAVED",
    priority: "MEDIUM",
    jobUrl: "https://jobs.pinecone.example/cloud-support",
    contactPerson: "",
    notes: "Check certification requirements before applying.",
  },
];

export function loadApplications(): JobApplication[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return sampleApplications;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as JobApplication[]) : sampleApplications;
  } catch {
    return sampleApplications;
  }
}

export function saveApplications(applications: JobApplication[]) {
  localStorage.setItem(storageKey, JSON.stringify(applications));
}

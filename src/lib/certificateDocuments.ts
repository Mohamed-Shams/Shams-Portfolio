/**
 * Original certificate files copied byte-for-byte from the older
 * Mohamed-Shams/shams-systems repository. These are public documents
 * already used by the portfolio owner, not generated placeholder PDFs.
 *
 * Keep the filenames unchanged so historical links remain functional.
 */
export type CertificateDocument = {
  id: string;
  title: string;
  titleAr: string;
  issuer: string;
  pdf: string;
  brand?: string;
};

export const certificateDocuments: CertificateDocument[] = [
  {
    id: "ignition-core",
    title: "Ignition Core Certified",
    titleAr: "اعتماد Ignition Core",
    issuer: "Inductive Automation",
    pdf: "/certificates/Ignition_Core_Certificate.pdf",
    brand: "ignition",
  },
  {
    id: "ignition-83",
    title: "Ignition 8.3 Credential",
    titleAr: "اعتماد Ignition 8.3",
    issuer: "Inductive Automation",
    pdf: "/certificates/Ignition_8.3_Credential_Certificate.pdf",
    brand: "ignition",
  },
  {
    id: "ignition-81",
    title: "Ignition 8.1 Credential",
    titleAr: "اعتماد Ignition 8.1",
    issuer: "Inductive Automation",
    pdf: "/certificates/Ignition_8.1_Credential_Certificate.pdf",
    brand: "ignition",
  },
  {
    id: "aws-ai",
    title: "AWS Certified AI Practitioner",
    titleAr: "شهادة AWS لممارس الذكاء الاصطناعي",
    issuer: "Amazon Web Services",
    pdf: "/certificates/AWS_Certified_AI_Practitioner.pdf",
    brand: "aws",
  },
  {
    id: "dataiku-ml",
    title: "Dataiku ML Practitioner",
    titleAr: "ممارس التعلم الآلي Dataiku",
    issuer: "Dataiku",
    pdf: "/certificates/Dataiku_ML_Practitioner.pdf",
    brand: "dataiku",
  },
  {
    id: "dataiku-advanced",
    title: "Dataiku Advanced Designer",
    titleAr: "مصمم Dataiku المتقدم",
    issuer: "Dataiku",
    pdf: "/certificates/Dataiku_Advanced_Designer.pdf",
    brand: "dataiku",
  },
  {
    id: "dataiku-core",
    title: "Dataiku Core Designer",
    titleAr: "مصمم Dataiku الأساسي",
    issuer: "Dataiku",
    pdf: "/certificates/Dataiku_Core_Designer.pdf",
    brand: "dataiku",
  },
  {
    id: "machinfy",
    title: "Machinfy Data Science & AI Program",
    titleAr: "برنامج Machinfy لعلوم البيانات والذكاء الاصطناعي",
    issuer: "Machinfy Academy",
    pdf: "/certificates/Machinfy_Certification.pdf",
  },
  {
    id: "cloudera",
    title: "GEN-110: Cloudera Essentials",
    titleAr: "أساسيات Cloudera GEN-110",
    issuer: "Cloudera",
    pdf: "/certificates/GEN-110_Cloudera_Essentials.pdf",
  },
  {
    id: "formula-student",
    title: "Formula Student EV UK 2023",
    titleAr: "فورمولا ستيودنت للسيارات الكهربائية – المملكة المتحدة 2023",
    issuer: "Formula Student / Menofia Racing Team",
    pdf: "/certificates/Formula_Student_EV_UK_2023.pdf",
  },
];

export const certificateLinksByCard: Record<string, string[]> = {
  "Ignition Core Certified": ["ignition-core"],
  "AWS Certified AI Practitioner": ["aws-ai"],
  "Dataiku Core & Advanced Designer Certified": ["dataiku-core", "dataiku-advanced"],
  "Dataiku ML Practitioner Certified": ["dataiku-ml"],
  "Data Science & AI Course": ["machinfy"],
  "GEN-110: Cloudera Essentials": ["cloudera"],
};

import { pgTable, serial, text, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskLevelEnum = pgEnum("risk_level", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const recommendedActionEnum = pgEnum("recommended_action", [
  "SELF_CARE",
  "SCHEDULE_CONSULTATION",
  "HOSPITAL_VISIT",
  "EMERGENCY_RESPONSE",
]);
export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHER"]);
export const reportTypeEnum = pgEnum("report_type", ["SOAP", "JSON"]);

export const caseStatusEnum = pgEnum("case_status", [
  "REPORT_RECEIVED",
  "ANALYZED",
  "CASE_CREATED",
  "ROUTED_TO_HOSPITAL",
  "RECEIVED_BY_HOSPITAL",
  "ASSIGNED_TO_DOCTOR",
  "DIAGNOSIS_IN_PROGRESS",
  "COMPLETED",
]);

export const casesTable = pgTable("clinical_cases", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  age: integer("age").notNull(),
  gender: genderEnum("gender").notNull(),
  chiefComplaint: text("chief_complaint").notNull(),
  symptoms: jsonb("symptoms").notNull().$type<string[]>(),
  vitalSigns: jsonb("vital_signs").$type<{
    temperature?: number;
    heartRate?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  } | null>(),
  medicalHistory: text("medical_history"),
  currentMedications: text("current_medications"),
  reportType: reportTypeEnum("report_type").notNull(),
  rawReport: text("raw_report"),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  recommendedAction: recommendedActionEnum("recommended_action").notNull(),
  riskFactors: jsonb("risk_factors").notNull().$type<string[]>(),
  briefEnglish: text("brief_english").notNull(),
  briefArabic: text("brief_arabic").notNull(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  caseStatus: caseStatusEnum("case_status").notNull().default("CASE_CREATED"),
  assignedDoctorId: integer("assigned_doctor_id"),
  diagnosisNotes: text("diagnosis_notes"),
  recommendedDepartment: text("recommended_department"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCase = z.infer<typeof insertCaseSchema>;
export type ClinicalCase = typeof casesTable.$inferSelect;

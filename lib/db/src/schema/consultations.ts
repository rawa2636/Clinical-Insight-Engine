import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
  numeric,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { casesTable } from "./cases";

export const consultationStatusEnum = pgEnum("consultation_status", [
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const specialtyEnum = pgEnum("specialty", [
  "GENERAL",
  "CARDIOLOGY",
  "PULMONOLOGY",
  "NEUROLOGY",
  "INTERNAL_MEDICINE",
  "EMERGENCY_MEDICINE",
  "PEDIATRICS",
  "ORTHOPEDICS",
  "DERMATOLOGY",
  "PSYCHIATRY",
]);

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  specialty: specialtyEnum("specialty").notNull(),
  specialtyLabelEn: text("specialty_label_en").notNull(),
  specialtyLabelAr: text("specialty_label_ar").notNull(),
  qualifications: text("qualifications").notNull(),
  experience: integer("experience").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
  avatarInitials: text("avatar_initials").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  consultationFeeUsd: numeric("consultation_fee_usd", {
    precision: 6,
    scale: 2,
  }).notNull(),
  languages: jsonb("languages").notNull().$type<string[]>(),
});

export const consultationsTable = pgTable("consultations", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id")
    .notNull()
    .references(() => casesTable.id),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctorsTable.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: consultationStatusEnum("status").notNull().default("SCHEDULED"),
  patientNotes: text("patient_notes"),
  preferredLanguage: text("preferred_language").default("EN"),
  meetingRoomId: text("meeting_room_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConsultationSchema = createInsertSchema(
  consultationsTable
).omit({ id: true, createdAt: true });

export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultationsTable.$inferSelect;
export type Doctor = typeof doctorsTable.$inferSelect;

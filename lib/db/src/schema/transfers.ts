import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { casesTable } from "./cases";

export const transferStatusEnum = pgEnum("transfer_status", [
  "PENDING",
  "ACCEPTED",
  "IN_TRANSIT",
  "ARRIVED",
  "REJECTED",
  "CANCELLED",
]);

export const transferDirectionEnum = pgEnum("transfer_direction", [
  "OUTGOING",
  "INCOMING",
]);

export const transportMethodEnum = pgEnum("transport_method", [
  "AMBULANCE",
  "AIR_AMBULANCE",
  "PRIVATE_VEHICLE",
  "HOSPITAL_TRANSPORT",
]);

export const hospitalsTable = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  specialties: jsonb("specialties").notNull().$type<string[]>(),
  isAvailable: text("is_available").notNull().default("true"),
  level: text("level").notNull().default("TERTIARY"),
});

export const transfersTable = pgTable("hospital_transfers", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => casesTable.id),
  direction: transferDirectionEnum("direction").notNull(),
  fromHospitalId: integer("from_hospital_id")
    .notNull()
    .references(() => hospitalsTable.id),
  toHospitalId: integer("to_hospital_id")
    .notNull()
    .references(() => hospitalsTable.id),
  patientName: text("patient_name").notNull(),
  patientAge: integer("patient_age").notNull(),
  patientGender: text("patient_gender").notNull(),
  chiefComplaint: text("chief_complaint").notNull(),
  riskLevel: text("risk_level").notNull(),
  transportMethod: transportMethodEnum("transport_method").notNull(),
  clinicalSummary: text("clinical_summary").notNull(),
  specialRequirements: text("special_requirements"),
  estimatedArrival: timestamp("estimated_arrival"),
  status: transferStatusEnum("status").notNull().default("PENDING"),
  rejectionReason: text("rejection_reason"),
  transferCode: text("transfer_code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTransferSchema = createInsertSchema(transfersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type Transfer = typeof transfersTable.$inferSelect;
export type Hospital = typeof hospitalsTable.$inferSelect;

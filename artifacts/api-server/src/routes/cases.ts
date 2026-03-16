import { Router, type IRouter, type Request, type Response } from "express";
import { db, casesTable, doctorsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { analyzeRisk, generateBriefEnglish, generateBriefArabic, recommendDepartment } from "../lib/riskEngine.js";

const router: IRouter = Router();

router.get("/cases", async (_req: Request, res: Response) => {
  try {
    const cases = await db
      .select()
      .from(casesTable)
      .orderBy(desc(casesTable.createdAt));
    res.json(cases);
  } catch (err) {
    console.error("Error listing cases:", err);
    res.status(500).json({ error: "Failed to retrieve cases" });
  }
});

router.get("/cases/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid case ID" });
      return;
    }
    const [caseRecord] = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.id, id));
    if (!caseRecord) {
      res.status(404).json({ error: "Case not found" });
      return;
    }
    let assignedDoctor = null;
    if (caseRecord.assignedDoctorId) {
      const [doc] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, caseRecord.assignedDoctorId));
      if (doc) {
        assignedDoctor = { ...doc, rating: parseFloat(doc.rating), consultationFeeUsd: parseFloat(doc.consultationFeeUsd) };
      }
    }
    res.json({ ...caseRecord, assignedDoctor });
  } catch (err) {
    console.error("Error getting case:", err);
    res.status(500).json({ error: "Failed to retrieve case" });
  }
});

router.post("/cases", async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      patientName: string;
      age: number;
      gender: "MALE" | "FEMALE" | "OTHER";
      chiefComplaint: string;
      symptoms: string[];
      vitalSigns?: {
        temperature?: number;
        heartRate?: number;
        bloodPressureSystolic?: number;
        bloodPressureDiastolic?: number;
        oxygenSaturation?: number;
        respiratoryRate?: number;
      };
      medicalHistory?: string;
      currentMedications?: string;
      reportType: "SOAP" | "JSON";
      rawReport?: string;
    };

    if (
      !body.patientName ||
      !body.age ||
      !body.gender ||
      !body.chiefComplaint ||
      !Array.isArray(body.symptoms) ||
      !body.reportType
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const analysis = analyzeRisk({
      symptoms: body.symptoms,
      chiefComplaint: body.chiefComplaint,
      age: body.age,
      vitalSigns: body.vitalSigns,
      medicalHistory: body.medicalHistory,
    });

    const recommendedDepartment = recommendDepartment(body.symptoms, body.chiefComplaint, analysis.riskLevel);

    const briefEnglish = generateBriefEnglish({
      patientName: body.patientName,
      age: body.age,
      gender: body.gender,
      chiefComplaint: body.chiefComplaint,
      symptoms: body.symptoms,
      riskLevel: analysis.riskLevel,
      recommendedAction: analysis.recommendedAction,
      riskFactors: analysis.riskFactors,
      vitalSigns: body.vitalSigns,
      medicalHistory: body.medicalHistory,
    });

    const briefArabic = generateBriefArabic({
      patientName: body.patientName,
      age: body.age,
      gender: body.gender,
      chiefComplaint: body.chiefComplaint,
      symptoms: body.symptoms,
      riskLevel: analysis.riskLevel,
      recommendedAction: analysis.recommendedAction,
      riskFactors: analysis.riskFactors,
      vitalSigns: body.vitalSigns,
      medicalHistory: body.medicalHistory,
    });

    const [newCase] = await db
      .insert(casesTable)
      .values({
        patientName: body.patientName,
        age: body.age,
        gender: body.gender,
        chiefComplaint: body.chiefComplaint,
        symptoms: body.symptoms,
        vitalSigns: body.vitalSigns ?? null,
        medicalHistory: body.medicalHistory,
        currentMedications: body.currentMedications,
        reportType: body.reportType,
        rawReport: body.rawReport,
        riskLevel: analysis.riskLevel,
        recommendedAction: analysis.recommendedAction,
        riskFactors: analysis.riskFactors,
        briefEnglish,
        briefArabic,
        acknowledged: false,
        caseStatus: "CASE_CREATED",
        recommendedDepartment,
      })
      .returning();

    res.status(201).json(newCase);
  } catch (err) {
    console.error("Error creating case:", err);
    res.status(500).json({ error: "Failed to create case" });
  }
});

router.post("/cases/:id/acknowledge", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid case ID" });
      return;
    }
    const [updated] = await db
      .update(casesTable)
      .set({ acknowledged: true, updatedAt: new Date() })
      .where(eq(casesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Case not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("Error acknowledging case:", err);
    res.status(500).json({ error: "Failed to acknowledge case" });
  }
});

router.post("/cases/:id/assign-doctor", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid case ID" });
      return;
    }
    const body = req.body as { doctorId: number };
    if (!body.doctorId) {
      res.status(400).json({ error: "doctorId is required" });
      return;
    }
    const [doctor] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, body.doctorId));
    if (!doctor) {
      res.status(404).json({ error: "Doctor not found" });
      return;
    }
    const [updated] = await db
      .update(casesTable)
      .set({ assignedDoctorId: body.doctorId, caseStatus: "ASSIGNED_TO_DOCTOR", updatedAt: new Date() })
      .where(eq(casesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Case not found" });
      return;
    }
    res.json({
      ...updated,
      assignedDoctor: { ...doctor, rating: parseFloat(doctor.rating), consultationFeeUsd: parseFloat(doctor.consultationFeeUsd) },
    });
  } catch (err) {
    console.error("Error assigning doctor:", err);
    res.status(500).json({ error: "Failed to assign doctor" });
  }
});

router.post("/cases/:id/diagnosis", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid case ID" });
      return;
    }
    const body = req.body as { diagnosisNotes: string; status?: "DIAGNOSIS_IN_PROGRESS" | "COMPLETED" };
    if (!body.diagnosisNotes) {
      res.status(400).json({ error: "diagnosisNotes is required" });
      return;
    }
    const newStatus = body.status ?? "DIAGNOSIS_IN_PROGRESS";
    const [updated] = await db
      .update(casesTable)
      .set({ diagnosisNotes: body.diagnosisNotes, caseStatus: newStatus, updatedAt: new Date() })
      .where(eq(casesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Case not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("Error updating diagnosis:", err);
    res.status(500).json({ error: "Failed to update diagnosis" });
  }
});

router.post("/cases/:id/update-status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid case ID" });
      return;
    }
    const body = req.body as { caseStatus: string };
    if (!body.caseStatus) {
      res.status(400).json({ error: "caseStatus is required" });
      return;
    }
    const [updated] = await db
      .update(casesTable)
      .set({ caseStatus: body.caseStatus as any, updatedAt: new Date() })
      .where(eq(casesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Case not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.delete("/cases/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid case ID" });
      return;
    }
    const [deleted] = await db
      .delete(casesTable)
      .where(eq(casesTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Case not found" });
      return;
    }
    res.json({ success: true, message: "Case deleted successfully" });
  } catch (err) {
    console.error("Error deleting case:", err);
    res.status(500).json({ error: "Failed to delete case" });
  }
});

export default router;

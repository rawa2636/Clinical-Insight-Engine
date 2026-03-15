import { Router, type IRouter, type Request, type Response } from "express";
import { db, doctorsTable, consultationsTable, casesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

const router: IRouter = Router();

router.get("/doctors", async (_req: Request, res: Response) => {
  try {
    const doctors = await db.select().from(doctorsTable).orderBy(doctorsTable.id);
    res.json(
      doctors.map((d) => ({
        ...d,
        rating: parseFloat(d.rating),
        consultationFeeUsd: parseFloat(d.consultationFeeUsd),
      }))
    );
  } catch (err) {
    console.error("Error listing doctors:", err);
    res.status(500).json({ error: "Failed to retrieve doctors" });
  }
});

router.get("/consultations", async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select({
        consultation: consultationsTable,
        doctor: doctorsTable,
        patientName: casesTable.patientName,
      })
      .from(consultationsTable)
      .leftJoin(doctorsTable, eq(consultationsTable.doctorId, doctorsTable.id))
      .leftJoin(casesTable, eq(consultationsTable.caseId, casesTable.id))
      .orderBy(desc(consultationsTable.scheduledAt));

    const result = rows.map((r) => ({
      ...r.consultation,
      doctor: r.doctor
        ? {
            ...r.doctor,
            rating: parseFloat(r.doctor.rating),
            consultationFeeUsd: parseFloat(r.doctor.consultationFeeUsd),
          }
        : null,
      patientName: r.patientName ?? "Unknown Patient",
    }));
    res.json(result);
  } catch (err) {
    console.error("Error listing consultations:", err);
    res.status(500).json({ error: "Failed to retrieve consultations" });
  }
});

router.get("/consultations/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid consultation ID" });
      return;
    }
    const [row] = await db
      .select({
        consultation: consultationsTable,
        doctor: doctorsTable,
        patientName: casesTable.patientName,
      })
      .from(consultationsTable)
      .leftJoin(doctorsTable, eq(consultationsTable.doctorId, doctorsTable.id))
      .leftJoin(casesTable, eq(consultationsTable.caseId, casesTable.id))
      .where(eq(consultationsTable.id, id));

    if (!row) {
      res.status(404).json({ error: "Consultation not found" });
      return;
    }
    res.json({
      ...row.consultation,
      doctor: row.doctor
        ? {
            ...row.doctor,
            rating: parseFloat(row.doctor.rating),
            consultationFeeUsd: parseFloat(row.doctor.consultationFeeUsd),
          }
        : null,
      patientName: row.patientName ?? "Unknown Patient",
    });
  } catch (err) {
    console.error("Error getting consultation:", err);
    res.status(500).json({ error: "Failed to retrieve consultation" });
  }
});

router.post("/consultations", async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      caseId: number;
      doctorId: number;
      scheduledAt: string;
      patientNotes?: string;
      preferredLanguage?: string;
    };

    if (!body.caseId || !body.doctorId || !body.scheduledAt) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const meetingRoomId = `room-${randomBytes(4).toString("hex").toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    const [newConsultation] = await db
      .insert(consultationsTable)
      .values({
        caseId: body.caseId,
        doctorId: body.doctorId,
        scheduledAt: new Date(body.scheduledAt),
        status: "SCHEDULED",
        patientNotes: body.patientNotes,
        preferredLanguage: body.preferredLanguage ?? "EN",
        meetingRoomId,
      })
      .returning();

    const [row] = await db
      .select({
        consultation: consultationsTable,
        doctor: doctorsTable,
        patientName: casesTable.patientName,
      })
      .from(consultationsTable)
      .leftJoin(doctorsTable, eq(consultationsTable.doctorId, doctorsTable.id))
      .leftJoin(casesTable, eq(consultationsTable.caseId, casesTable.id))
      .where(eq(consultationsTable.id, newConsultation.id));

    res.status(201).json({
      ...row.consultation,
      doctor: row.doctor
        ? {
            ...row.doctor,
            rating: parseFloat(row.doctor.rating),
            consultationFeeUsd: parseFloat(row.doctor.consultationFeeUsd),
          }
        : null,
      patientName: row.patientName ?? "Unknown Patient",
    });
  } catch (err) {
    console.error("Error creating consultation:", err);
    res.status(500).json({ error: "Failed to book consultation" });
  }
});

router.post("/consultations/:id/cancel", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid consultation ID" });
      return;
    }
    const [updated] = await db
      .update(consultationsTable)
      .set({ status: "CANCELLED" })
      .where(eq(consultationsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Consultation not found" });
      return;
    }
    const [row] = await db
      .select({
        consultation: consultationsTable,
        doctor: doctorsTable,
        patientName: casesTable.patientName,
      })
      .from(consultationsTable)
      .leftJoin(doctorsTable, eq(consultationsTable.doctorId, doctorsTable.id))
      .leftJoin(casesTable, eq(consultationsTable.caseId, casesTable.id))
      .where(eq(consultationsTable.id, id));
    res.json({
      ...row.consultation,
      doctor: row.doctor
        ? {
            ...row.doctor,
            rating: parseFloat(row.doctor.rating),
            consultationFeeUsd: parseFloat(row.doctor.consultationFeeUsd),
          }
        : null,
      patientName: row.patientName ?? "Unknown Patient",
    });
  } catch (err) {
    console.error("Error cancelling consultation:", err);
    res.status(500).json({ error: "Failed to cancel consultation" });
  }
});

router.get("/consultations/:id/join", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid consultation ID" });
      return;
    }
    const [consultation] = await db
      .select()
      .from(consultationsTable)
      .where(eq(consultationsTable.id, id));
    if (!consultation) {
      res.status(404).json({ error: "Consultation not found" });
      return;
    }
    if (consultation.status === "CANCELLED") {
      res.status(400).json({ error: "Consultation is cancelled" });
      return;
    }
    res.json({
      consultationId: consultation.id,
      meetingRoomId: consultation.meetingRoomId,
      joinUrl: `https://meet.hospital-intel.app/room/${consultation.meetingRoomId}`,
      status: consultation.status,
    });
  } catch (err) {
    console.error("Error getting join info:", err);
    res.status(500).json({ error: "Failed to get join info" });
  }
});

export default router;

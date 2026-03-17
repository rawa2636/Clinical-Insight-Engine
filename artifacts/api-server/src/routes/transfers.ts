import { Router, type IRouter, type Request, type Response } from "express";
import { db, hospitalsTable, transfersTable, casesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

const router: IRouter = Router();

function generateTransferCode(): string {
  return `TRF-${randomBytes(3).toString("hex").toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

async function enrichTransfer(transfer: typeof transfersTable.$inferSelect) {
  const [fromHospital] = await db
    .select()
    .from(hospitalsTable)
    .where(eq(hospitalsTable.id, transfer.fromHospitalId));
  const [toHospital] = await db
    .select()
    .from(hospitalsTable)
    .where(eq(hospitalsTable.id, transfer.toHospitalId));
  return { ...transfer, fromHospital, toHospital };
}

router.get("/hospitals", async (_req: Request, res: Response) => {
  try {
    const hospitals = await db.select().from(hospitalsTable).orderBy(hospitalsTable.id);
    res.json(hospitals);
  } catch (err) {
    console.error("Error listing hospitals:", err);
    res.status(500).json({ error: "Failed to retrieve hospitals" });
  }
});

router.get("/transfers", async (_req: Request, res: Response) => {
  try {
    const transfers = await db
      .select()
      .from(transfersTable)
      .orderBy(desc(transfersTable.createdAt));

    const enriched = await Promise.all(transfers.map(enrichTransfer));
    res.json(enriched);
  } catch (err) {
    console.error("Error listing transfers:", err);
    res.status(500).json({ error: "Failed to retrieve transfers" });
  }
});

router.get("/transfers/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid transfer ID" }); return; }
    const [transfer] = await db.select().from(transfersTable).where(eq(transfersTable.id, id));
    if (!transfer) { res.status(404).json({ error: "Transfer not found" }); return; }
    res.json(await enrichTransfer(transfer));
  } catch (err) {
    console.error("Error getting transfer:", err);
    res.status(500).json({ error: "Failed to retrieve transfer" });
  }
});

router.post("/transfers", async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      caseId?: number;
      direction: "OUTGOING" | "INCOMING";
      toHospitalId?: number;
      fromHospitalId?: number;
      patientName: string;
      patientAge: number;
      patientGender: string;
      chiefComplaint: string;
      riskLevel: string;
      transportMethod: "AMBULANCE" | "AIR_AMBULANCE" | "PRIVATE_VEHICLE" | "HOSPITAL_TRANSPORT";
      clinicalSummary: string;
      specialRequirements?: string;
      estimatedArrival?: string;
    };

    if (!body.direction || !body.patientName || !body.chiefComplaint || !body.riskLevel || !body.transportMethod) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (!body.fromHospitalId || !body.toHospitalId) {
      res.status(400).json({ error: "fromHospitalId and toHospitalId are required" });
      return;
    }

    const fromHospitalId = body.fromHospitalId;
    const toHospitalId = body.toHospitalId;

    const [newTransfer] = await db
      .insert(transfersTable)
      .values({
        caseId: body.caseId ?? null,
        direction: body.direction,
        fromHospitalId,
        toHospitalId,
        patientName: body.patientName,
        patientAge: body.patientAge,
        patientGender: body.patientGender,
        chiefComplaint: body.chiefComplaint,
        riskLevel: body.riskLevel,
        transportMethod: body.transportMethod,
        clinicalSummary: body.clinicalSummary,
        specialRequirements: body.specialRequirements,
        estimatedArrival: body.estimatedArrival ? new Date(body.estimatedArrival) : undefined,
        status: "PENDING",
        transferCode: generateTransferCode(),
      })
      .returning();

    res.status(201).json(await enrichTransfer(newTransfer));
  } catch (err) {
    console.error("Error creating transfer:", err);
    res.status(500).json({ error: "Failed to create transfer" });
  }
});

router.post("/transfers/:id/accept", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid transfer ID" }); return; }

    const [updated] = await db
      .update(transfersTable)
      .set({ status: "ACCEPTED", updatedAt: new Date() })
      .where(eq(transfersTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Transfer not found" }); return; }

    if (updated.direction === "INCOMING") {
      await db.insert(casesTable).values({
        patientName: updated.patientName,
        age: updated.patientAge,
        gender: updated.patientGender as "MALE" | "FEMALE" | "OTHER",
        chiefComplaint: updated.chiefComplaint,
        symptoms: [updated.chiefComplaint],
        vitalSigns: null,
        medicalHistory: `Transferred from hospital. Transfer code: ${updated.transferCode}`,
        reportType: "SOAP",
        riskLevel: updated.riskLevel as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        recommendedAction: updated.riskLevel === "CRITICAL" ? "EMERGENCY_RESPONSE" : updated.riskLevel === "HIGH" ? "HOSPITAL_VISIT" : "SCHEDULE_CONSULTATION",
        riskFactors: [`Transferred case — ${updated.riskLevel} risk`, `Transfer code: ${updated.transferCode}`],
        briefEnglish: `Incoming transfer from hospital. Patient: ${updated.patientName}. ${updated.clinicalSummary}`,
        briefArabic: `حالة واردة من مستشفى أخرى. المريض: ${updated.patientName}. ${updated.clinicalSummary}`,
        acknowledged: false,
        caseStatus: "RECEIVED_BY_HOSPITAL",
      });
    }
    if (updated.direction === "OUTGOING" && updated.caseId) {
      await db.update(casesTable).set({ caseStatus: "ROUTED_TO_HOSPITAL", updatedAt: new Date() }).where(eq(casesTable.id, updated.caseId));
    }

    res.json(await enrichTransfer(updated));
  } catch (err) {
    console.error("Error accepting transfer:", err);
    res.status(500).json({ error: "Failed to accept transfer" });
  }
});

router.post("/transfers/:id/reject", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid transfer ID" }); return; }
    const body = req.body as { reason?: string };

    const [updated] = await db
      .update(transfersTable)
      .set({ status: "REJECTED", rejectionReason: body.reason ?? "No capacity", updatedAt: new Date() })
      .where(eq(transfersTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Transfer not found" }); return; }
    res.json(await enrichTransfer(updated));
  } catch (err) {
    console.error("Error rejecting transfer:", err);
    res.status(500).json({ error: "Failed to reject transfer" });
  }
});

router.post("/transfers/:id/in-transit", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid transfer ID" }); return; }
    const [updated] = await db
      .update(transfersTable)
      .set({ status: "IN_TRANSIT", updatedAt: new Date() })
      .where(eq(transfersTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Transfer not found" }); return; }
    if (updated.caseId) {
      await db.update(casesTable)
        .set({ caseStatus: "ROUTED_TO_HOSPITAL", updatedAt: new Date() })
        .where(eq(casesTable.id, updated.caseId));
    }
    res.json(await enrichTransfer(updated));
  } catch (err) {
    console.error("Error updating transfer:", err);
    res.status(500).json({ error: "Failed to update transfer" });
  }
});

router.post("/transfers/:id/arrived", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid transfer ID" }); return; }
    const [updated] = await db
      .update(transfersTable)
      .set({ status: "ARRIVED", updatedAt: new Date() })
      .where(eq(transfersTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Transfer not found" }); return; }
    if (updated.caseId) {
      await db.update(casesTable)
        .set({ caseStatus: "RECEIVED_BY_HOSPITAL", updatedAt: new Date() })
        .where(eq(casesTable.id, updated.caseId));
    }
    res.json(await enrichTransfer(updated));
  } catch (err) {
    console.error("Error updating transfer:", err);
    res.status(500).json({ error: "Failed to update transfer" });
  }
});

router.post("/transfers/:id/cancel", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid transfer ID" }); return; }
    const [updated] = await db
      .update(transfersTable)
      .set({ status: "CANCELLED", updatedAt: new Date() })
      .where(eq(transfersTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Transfer not found" }); return; }
    res.json(await enrichTransfer(updated));
  } catch (err) {
    console.error("Error cancelling transfer:", err);
    res.status(500).json({ error: "Failed to cancel transfer" });
  }
});

export default router;

import { Router, type IRouter, type Request, type Response } from "express";
import { db, hospitalsTable } from "@workspace/db";
import { asc, isNotNull } from "drizzle-orm";

const router: IRouter = Router();

const TELEMEDICINE_REDUCTION = 10;

router.get("/referral-pathway", async (_req: Request, res: Response) => {
  try {
    const facilities = await db
      .select()
      .from(hospitalsTable)
      .where(isNotNull(hospitalsTable.pathwayOrder))
      .orderBy(asc(hospitalsTable.pathwayOrder));

    res.json({
      telemedicineReduction: TELEMEDICINE_REDUCTION,
      facilities,
      totalDistanceKm:
        facilities.reduce((acc, f) => acc + (f.distanceToNext ?? 0), 0),
    });
  } catch (err) {
    console.error("Error fetching referral pathway:", err);
    res.status(500).json({ error: "Failed to retrieve referral pathway" });
  }
});

router.post(
  "/referral-pathway/simulate",
  async (req: Request, res: Response) => {
    try {
      const { initialRisk } = req.body as { initialRisk: number };
      if (typeof initialRisk !== "number" || initialRisk < 0 || initialRisk > 100) {
        res.status(400).json({ error: "initialRisk must be a number between 0 and 100" });
        return;
      }

      const facilities = await db
        .select()
        .from(hospitalsTable)
        .where(isNotNull(hospitalsTable.pathwayOrder))
        .orderBy(asc(hospitalsTable.pathwayOrder));

      let currentRisk = initialRisk;
      const steps: {
        stage: string;
        nameAr: string;
        nameEn: string;
        city: string;
        level: string;
        riskBefore: number;
        riskAfter: number;
        reduction: number;
        distanceToNext: number;
      }[] = [];

      const afterTelemedicine = Math.max(currentRisk - TELEMEDICINE_REDUCTION, 0);
      steps.push({
        stage: "telemedicine",
        nameAr: "الاستشارة عن بعد",
        nameEn: "Telemedicine Consultation",
        city: "-",
        level: "TELEMEDICINE",
        riskBefore: currentRisk,
        riskAfter: afterTelemedicine,
        reduction: TELEMEDICINE_REDUCTION,
        distanceToNext: 0,
      });
      currentRisk = afterTelemedicine;

      for (const f of facilities) {
        const reduction = f.riskReduction ?? 0;
        const riskAfter = Math.max(currentRisk - reduction, 0);
        steps.push({
          stage: `facility_${f.id}`,
          nameAr: f.nameAr,
          nameEn: f.nameEn,
          city: f.city,
          level: f.level,
          riskBefore: currentRisk,
          riskAfter,
          reduction,
          distanceToNext: f.distanceToNext ?? 0,
        });
        currentRisk = riskAfter;
      }

      res.json({
        initialRisk,
        finalRisk: currentRisk,
        totalReduction: initialRisk - currentRisk,
        steps,
      });
    } catch (err) {
      console.error("Error simulating referral pathway:", err);
      res.status(500).json({ error: "Failed to simulate referral pathway" });
    }
  }
);

export default router;

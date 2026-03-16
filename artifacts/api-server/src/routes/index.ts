import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import consultationsRouter from "./consultations";
import transfersRouter from "./transfers";
import pathwayRouter from "./pathway";

const router: IRouter = Router();

router.use(healthRouter);
router.use(casesRouter);
router.use(consultationsRouter);
router.use(transfersRouter);
router.use(pathwayRouter);

export default router;

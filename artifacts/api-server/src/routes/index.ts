import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import consultationsRouter from "./consultations";
import transfersRouter from "./transfers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(casesRouter);
router.use(consultationsRouter);
router.use(transfersRouter);

export default router;

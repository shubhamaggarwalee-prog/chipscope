import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chipscopeRouter from "./chipscope";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chipscopeRouter);

export default router;

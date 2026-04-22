import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import collectionsRouter from "./collections";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import newsletterRouter from "./newsletter";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(collectionsRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(newsletterRouter);
router.use(authRouter);

export default router;

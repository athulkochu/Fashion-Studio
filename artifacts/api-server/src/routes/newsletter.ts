import { Router, type IRouter } from "express";
import { db, newsletterTable } from "@workspace/db";
import { SubscribeNewsletterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/newsletter", async (req, res): Promise<void> => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.message });
    return;
  }
  await db
    .insert(newsletterTable)
    .values({ email: parsed.data.email })
    .onConflictDoNothing({ target: newsletterTable.email });
  res.json({ message: "Welcome to Lumière. Check your inbox shortly." });
});

export default router;

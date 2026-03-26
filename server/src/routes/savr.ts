import { Router } from "express";
import { z } from "zod/v4";
import { analyzeFund } from "../services/savrInsightEngine";
import { FUNDS } from "../data/funds";

const router = Router();

router.get("/funds", (_req, res) => {
  res.json(FUNDS);
});

const savrSchema = z.object({
  fundName: z.string().min(1),
  currentFee: z.number().positive(),
  savrFee: z.number().positive(),
  balance: z.number().positive(),
});

router.post("/analyze", async (req, res) => {
  const result = savrSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid request", details: result.error.issues });
    return;
  }

  try {
    const analysis = await analyzeFund(result.data);
    res.json(analysis);
  } catch (error: any) {
    console.error("SAVR analysis failed:", error);
    res.status(500).json({ error: "Analysis failed", message: error.message });
  }
});

export default router;

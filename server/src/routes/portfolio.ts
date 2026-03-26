import { Router } from "express";
import { z } from "zod/v4";
import { getPortfolio, updatePortfolio } from "../services/portfolioStore";

const router = Router();

const holdingSchema = z.object({
  ticker: z.string().min(1).max(20),
  shares: z.number().positive(),
  avgCostBasis: z.number().positive(),
  name: z.string().optional(),
  currency: z.enum(["USD", "SEK"]).default("USD"),
});

const updateSchema = z.object({
  holdings: z.array(holdingSchema).min(1),
});

router.get("/", (_req, res) => {
  res.json(getPortfolio());
});

router.put("/", (req, res) => {
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid portfolio data", details: result.error.issues });
    return;
  }
  const portfolio = updatePortfolio(result.data.holdings);
  res.json(portfolio);
});

export default router;

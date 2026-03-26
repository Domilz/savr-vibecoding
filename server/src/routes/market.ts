import { Router } from "express";
import { getCacheStatus, getUsdToSek } from "../services/alphaVantage";

const router = Router();

router.get("/cache-status", (_req, res) => {
  res.json(getCacheStatus());
});

router.get("/exchange-rate", async (_req, res) => {
  try {
    const rate = await getUsdToSek();
    res.json({ usdToSek: rate });
  } catch (error: any) {
    res.json({ usdToSek: 10.5 }); // fallback
  }
});

export default router;

import { Router } from "express";
import { generateBriefing } from "../services/briefingOrchestrator";

const router = Router();

router.post("/generate", async (_req, res) => {
  try {
    const briefing = await generateBriefing();
    res.json(briefing);
  } catch (error: any) {
    console.error("Briefing generation failed:", error);
    res.status(500).json({
      error: "Failed to generate briefing",
      message: error.message || "Unknown error",
    });
  }
});

export default router;

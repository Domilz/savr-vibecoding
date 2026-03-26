import { Router } from "express";
import { z } from "zod/v4";
import { getWatchlists, createWatchlist, deleteWatchlist, addToWatchlist, removeFromWatchlist } from "../services/watchlistStore";

const router = Router();

const itemSchema = z.object({
  ticker: z.string().min(1),
  name: z.string().min(1),
  currency: z.enum(["USD", "SEK"]),
});

const createSchema = z.object({
  name: z.string().min(1),
  items: z.array(itemSchema),
  createdBy: z.enum(["user", "ai"]).default("user"),
});

const addItemsSchema = z.object({
  items: z.array(itemSchema).min(1),
});

router.get("/", (_req, res) => {
  res.json(getWatchlists());
});

router.post("/", (req, res) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid request", details: result.error.issues });
    return;
  }
  const wl = createWatchlist(result.data.name, result.data.items, result.data.createdBy);
  res.json(wl);
});

router.delete("/:id", (req, res) => {
  const ok = deleteWatchlist(req.params.id);
  if (!ok) {
    res.status(404).json({ error: "Watchlist not found" });
    return;
  }
  res.json({ success: true });
});

router.post("/:id/items", (req, res) => {
  const result = addItemsSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid request", details: result.error.issues });
    return;
  }
  const wl = addToWatchlist(req.params.id, result.data.items);
  if (!wl) {
    res.status(404).json({ error: "Watchlist not found" });
    return;
  }
  res.json(wl);
});

router.delete("/:id/items/:ticker", (req, res) => {
  const wl = removeFromWatchlist(req.params.id, req.params.ticker);
  if (!wl) {
    res.status(404).json({ error: "Watchlist not found" });
    return;
  }
  res.json(wl);
});

export default router;

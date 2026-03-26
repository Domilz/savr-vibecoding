import express from "express";
import cors from "cors";
import path from "path";
import { config, validateConfig } from "./config";
import portfolioRoutes from "./routes/portfolio";
import briefingRoutes from "./routes/briefing";
import marketRoutes from "./routes/market";
import chatRoutes from "./routes/chat";
import savrRoutes from "./routes/savr";
import watchlistRoutes from "./routes/watchlist";

validateConfig();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/portfolio", portfolioRoutes);
app.use("/api/briefing", briefingRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/savr", savrRoutes);
app.use("/api/watchlists", watchlistRoutes);

// Serve built frontend in production
const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`);
});

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
  ALPHAVANTAGE_API_KEY: process.env.ALPHAVANTAGE_API_KEY || "",
  PORT: parseInt(process.env.PORT || "3001", 10),
};

export function validateConfig() {
  if (!config.ANTHROPIC_API_KEY || config.ANTHROPIC_API_KEY === "your_anthropic_api_key_here") {
    console.warn("WARNING: ANTHROPIC_API_KEY is not set. AI features will not work.");
  }
  if (!config.ALPHAVANTAGE_API_KEY || config.ALPHAVANTAGE_API_KEY === "your_alphavantage_api_key_here") {
    console.warn("WARNING: ALPHAVANTAGE_API_KEY is not set. Market data features will not work.");
  }
}

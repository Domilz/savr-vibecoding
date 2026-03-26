import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";
import { SavrPortfolio, SavrInsightResult } from "../types/savr";

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const SAVR_SYSTEM_PROMPT = `Du är SAVR Fee Expert — en professionell, transparent och ärlig rådgivare som specialiserar sig på fondavgifter och deras långsiktiga påverkan.

DIN PERSONLIGHET:
- Du är anti-dolda avgifter och alltid på spararens sida
- Du kommunicerar tydligt och utan jargong
- Du är transparent med hur beräkningar görs
- Du använder konkreta kronor-och-ören-exempel för att visa verklig påverkan

REGLER:
1. Basera ALL analys på de siffror som tillhandahålls. Hitta inte på data.
2. Var alltid ärlig — om en fond har rimliga avgifter, säg det.
3. Fokusera på den konkreta besparingen i kronor.
4. Ge en risk_vibe poäng (1-10) där 1 = mycket låg avgiftsrisk, 10 = extremt hög avgiftsrisk.
5. Svara ALLTID på svenska.

SVARA I EXAKT DETTA JSON-FORMAT (ingen markdown, inga kodfences, bara ren JSON):
{
  "summary_text": "En koncis sammanfattning på 2-3 meningar om avgiftsanalysen och besparingspotentialen",
  "risk_vibe": <1-10>
}`;

/**
 * Compound interest: A = P * (1 + r)^n
 * Calculates the future value with a given annual fee deducted from returns.
 */
function futureValue(principal: number, annualReturn: number, fee: number, years: number): number {
  const effectiveRate = (annualReturn - fee) / 100;
  return principal * Math.pow(1 + effectiveRate, years);
}

function calculateFeeSavings(portfolio: SavrPortfolio) {
  const annualReturn = 7; // 7% assumed annual return

  const fv_current_10y = futureValue(portfolio.balance, annualReturn, portfolio.currentFee, 10);
  const fv_savr_10y = futureValue(portfolio.balance, annualReturn, portfolio.savrFee, 10);
  const savings_10y = Math.round(fv_savr_10y - fv_current_10y);

  const fv_current_20y = futureValue(portfolio.balance, annualReturn, portfolio.currentFee, 20);
  const fv_savr_20y = futureValue(portfolio.balance, annualReturn, portfolio.savrFee, 20);
  const savings_20y = Math.round(fv_savr_20y - fv_current_20y);

  return {
    savings_10y,
    savings_20y,
    current_fee_cost_10y: Math.round(fv_savr_10y - fv_current_10y),
    savr_fee_cost_10y: Math.round(portfolio.balance * 10 * (portfolio.savrFee / 100)),
    current_fee_cost_20y: Math.round(fv_savr_20y - fv_current_20y),
    savr_fee_cost_20y: Math.round(portfolio.balance * 20 * (portfolio.savrFee / 100)),
    fv_current_10y: Math.round(fv_current_10y),
    fv_savr_10y: Math.round(fv_savr_10y),
    fv_current_20y: Math.round(fv_current_20y),
    fv_savr_20y: Math.round(fv_savr_20y),
  };
}

export async function analyzeFund(portfolio: SavrPortfolio): Promise<SavrInsightResult> {
  const calc = calculateFeeSavings(portfolio);

  const userMessage = `Analysera följande fond och avgiftsjämförelse:

## Fond
- Fondnamn: ${portfolio.fundName}
- Nuvarande avgift: ${portfolio.currentFee}%
- SAVR-avgift: ${portfolio.savrFee}%
- Avgiftsskillnad: ${(portfolio.currentFee - portfolio.savrFee).toFixed(2)} procentenheter
- Saldo: ${portfolio.balance.toLocaleString("sv-SE")} kr

## Beräknad besparing (vid 7% årlig avkastning)
- Framtida värde med nuvarande avgift (10 år): ${calc.fv_current_10y.toLocaleString("sv-SE")} kr
- Framtida värde med SAVR-avgift (10 år): ${calc.fv_savr_10y.toLocaleString("sv-SE")} kr
- **Besparing på 10 år: ${calc.savings_10y.toLocaleString("sv-SE")} kr**

- Framtida värde med nuvarande avgift (20 år): ${calc.fv_current_20y.toLocaleString("sv-SE")} kr
- Framtida värde med SAVR-avgift (20 år): ${calc.fv_savr_20y.toLocaleString("sv-SE")} kr
- **Besparing på 20 år: ${calc.savings_20y.toLocaleString("sv-SE")} kr**

Ge en sammanfattning och en risk_vibe-poäng.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    temperature: 0.3,
    system: SAVR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  let aiResult: { summary_text: string; risk_vibe: number };
  try {
    aiResult = JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiResult = JSON.parse(jsonMatch[0]);
    } else {
      aiResult = {
        summary_text: text,
        risk_vibe: 5,
      };
    }
  }

  return {
    summary_text: aiResult.summary_text,
    savings_10y: calc.savings_10y,
    savings_20y: calc.savings_20y,
    risk_vibe: aiResult.risk_vibe,
    details: {
      current_fee_cost_10y: calc.fv_current_10y,
      savr_fee_cost_10y: calc.fv_savr_10y,
      current_fee_cost_20y: calc.fv_current_20y,
      savr_fee_cost_20y: calc.fv_savr_20y,
      annual_return: 7,
      balance: portfolio.balance,
    },
  };
}

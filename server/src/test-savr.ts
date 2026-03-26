import { analyzeFund } from "./services/savrInsightEngine";

async function main() {
  console.log("=== SAVR Insight Engine Test ===\n");

  const testPortfolio = {
    fundName: "Swedbank Robur Technology",
    currentFee: 1.25,
    savrFee: 0.98,
    balance: 500000,
  };

  console.log("Input:");
  console.log(`  Fund: ${testPortfolio.fundName}`);
  console.log(`  Current fee: ${testPortfolio.currentFee}%`);
  console.log(`  SAVR fee: ${testPortfolio.savrFee}%`);
  console.log(`  Balance: ${testPortfolio.balance.toLocaleString("sv-SE")} kr`);
  console.log(`  Fee difference: ${(testPortfolio.currentFee - testPortfolio.savrFee).toFixed(2)} procentenheter`);
  console.log("\nCalling Claude 3.5 Haiku...\n");

  try {
    const result = await analyzeFund(testPortfolio);

    console.log("=== Result ===\n");
    console.log(`Summary: ${result.summary_text}\n`);
    console.log(`Savings (10 years): ${result.savings_10y.toLocaleString("sv-SE")} kr`);
    console.log(`Savings (20 years): ${result.savings_20y.toLocaleString("sv-SE")} kr`);
    console.log(`Risk Vibe: ${result.risk_vibe}/10\n`);
    console.log("Details:");
    console.log(`  FV with current fee (10y): ${result.details.current_fee_cost_10y.toLocaleString("sv-SE")} kr`);
    console.log(`  FV with SAVR fee (10y):    ${result.details.savr_fee_cost_10y.toLocaleString("sv-SE")} kr`);
    console.log(`  FV with current fee (20y): ${result.details.current_fee_cost_20y.toLocaleString("sv-SE")} kr`);
    console.log(`  FV with SAVR fee (20y):    ${result.details.savr_fee_cost_20y.toLocaleString("sv-SE")} kr`);
    console.log(`  Assumed annual return: ${result.details.annual_return}%`);

    console.log("\n=== Full JSON ===");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n✓ Test passed");
  } catch (error) {
    console.error("\n✗ Test failed:", error);
    process.exit(1);
  }
}

main();

export interface FundData {
  id: string;
  name: string;
  category: string;
  savrFee: number; // SAVR discounted fee (%)
  avanzaFee: number; // Standard fee on Avanza (%)
  nordnetFee: number; // Standard fee on Nordnet (%)
}

// Approximate fees for PoC — based on publicly available data as of early 2026.
// SAVR typically offers ~50% discount on actively managed funds,
// less discount on already-cheap index funds.
export const FUNDS: FundData[] = [
  {
    id: "swedbank-robur-technology",
    name: "Swedbank Robur Technology",
    category: "Teknikfond",
    savrFee: 1.06,
    avanzaFee: 1.38,
    nordnetFee: 1.25,
  },
  {
    id: "swedbank-robur-ny-teknik",
    name: "Swedbank Robur Ny Teknik",
    category: "Teknikfond",
    savrFee: 1.09,
    avanzaFee: 1.42,
    nordnetFee: 1.26,
  },
  {
    id: "lansforsakringar-global-index",
    name: "Länsförsäkringar Global Indexnära",
    category: "Global indexfond",
    savrFee: 0.19,
    avanzaFee: 0.22,
    nordnetFee: 0.22,
  },
  {
    id: "seb-sverige-index",
    name: "SEB Sverige Indexfond",
    category: "Sverige indexfond",
    savrFee: 0.11,
    avanzaFee: 0.24,
    nordnetFee: 0.24,
  },
  {
    id: "handelsbanken-global-index",
    name: "Handelsbanken Global Index Criteria",
    category: "Global indexfond",
    savrFee: 0.2,
    avanzaFee: 0.4,
    nordnetFee: 0.4,
  },
  {
    id: "spiltan-investmentbolag",
    name: "Spiltan Aktiefond Investmentbolag",
    category: "Sverige aktiefond",
    savrFee: 0.17,
    avanzaFee: 0.22,
    nordnetFee: 0.22,
  },
  {
    id: "swedbank-robur-access-global",
    name: "Swedbank Robur Access Global",
    category: "Global aktiefond",
    savrFee: 0.6,
    avanzaFee: 1.2,
    nordnetFee: 1.2,
  },
  {
    id: "ohman-global-hallbar",
    name: "Öhman Global Hållbar",
    category: "Global aktiefond",
    savrFee: 0.71,
    avanzaFee: 1.41,
    nordnetFee: 1.41,
  },
  {
    id: "dnb-teknologi",
    name: "DNB Teknologi",
    category: "Teknikfond",
    savrFee: 0.72,
    avanzaFee: 1.42,
    nordnetFee: 1.42,
  },
  {
    id: "carnegie-sverigefond",
    name: "Carnegie Sverigefond",
    category: "Sverige aktiefond",
    savrFee: 0.72,
    avanzaFee: 1.44,
    nordnetFee: 1.44,
  },
  {
    id: "skandia-time-global",
    name: "Skandia Time Global",
    category: "Global aktiefond",
    savrFee: 0.7,
    avanzaFee: 1.4,
    nordnetFee: 1.4,
  },
  {
    id: "enter-sverige",
    name: "Enter Sverige",
    category: "Sverige aktiefond",
    savrFee: 0.78,
    avanzaFee: 1.55,
    nordnetFee: 1.55,
  },
];

import { useState } from "react";
import type { Holding } from "../../types";

interface Props {
  holdings: Holding[];
  onAdd: (holding: Holding) => Promise<void>;
  onRemove: (ticker: string) => Promise<void>;
  onUpdate: (holdings: Holding[]) => Promise<void>;
}

export function PortfolioTable({ holdings, onAdd, onRemove, onUpdate }: Props) {
  const [newTicker, setNewTicker] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newCost, setNewCost] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editShares, setEditShares] = useState("");
  const [editCost, setEditCost] = useState("");

  const handleAdd = async () => {
    if (!newTicker || !newShares || !newCost) return;
    await onAdd({
      ticker: newTicker.toUpperCase().trim(),
      shares: parseFloat(newShares),
      avgCostBasis: parseFloat(newCost),
      currency: newTicker.toUpperCase().endsWith(".STO") ? "SEK" : "USD",
    });
    setNewTicker("");
    setNewShares("");
    setNewCost("");
  };

  const handleSaveEdit = async (idx: number) => {
    const updated = [...holdings];
    updated[idx] = {
      ...updated[idx],
      shares: parseFloat(editShares),
      avgCostBasis: parseFloat(editCost),
    };
    await onUpdate(updated);
    setEditIdx(null);
  };

  const startEdit = (idx: number) => {
    setEditIdx(idx);
    setEditShares(holdings[idx].shares.toString());
    setEditCost(holdings[idx].avgCostBasis.toString());
  };

  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="pb-2 font-medium">Ticker</th>
            <th className="pb-2 font-medium">Shares</th>
            <th className="pb-2 font-medium">Avg Cost</th>
            <th className="pb-2 font-medium w-16"></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h, idx) => (
            <tr key={h.ticker} className="border-b border-gray-100">
              <td className="py-2 font-semibold text-gray-900">{h.ticker}</td>
              {editIdx === idx ? (
                <>
                  <td className="py-2">
                    <input
                      type="number"
                      value={editShares}
                      onChange={(e) => setEditShares(e.target.value)}
                      className="w-16 px-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      className="w-20 px-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="py-2 flex gap-1">
                    <button onClick={() => handleSaveEdit(idx)} className="text-green-600 hover:text-green-800 text-xs">Save</button>
                    <button onClick={() => setEditIdx(null)} className="text-gray-400 hover:text-gray-600 text-xs">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 text-gray-700">{h.shares}</td>
                  <td className="py-2 text-gray-700">${h.avgCostBasis.toFixed(2)}</td>
                  <td className="py-2 flex gap-1">
                    <button onClick={() => startEdit(idx)} className="text-blue-500 hover:text-blue-700 text-xs">Edit</button>
                    <button onClick={() => onRemove(h.ticker)} className="text-red-400 hover:text-red-600 text-xs">Del</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-1 pt-2">
        <input
          placeholder="AAPL"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
        />
        <input
          placeholder="Qty"
          type="number"
          value={newShares}
          onChange={(e) => setNewShares(e.target.value)}
          className="w-14 px-2 py-1 border border-gray-300 rounded text-sm"
        />
        <input
          placeholder="Cost"
          type="number"
          value={newCost}
          onChange={(e) => setNewCost(e.target.value)}
          className="w-18 px-2 py-1 border border-gray-300 rounded text-sm"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          +
        </button>
      </div>
    </div>
  );
}

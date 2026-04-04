import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { storage } from "../data/storage";
import type { Billing } from "../types";

export default function OutwardBillingPage() {
  const [search, setSearch] = useState("");
  const [editMap, setEditMap] = useState<Record<string, Partial<Billing>>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const rows = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    const clients = storage.getClients();
    const billingAll = storage.getBilling();
    return clients
      .filter(
        (c) =>
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.pan.toLowerCase().includes(search.toLowerCase()),
      )
      .map((c) => {
        const b = billingAll.find((x) => x.clientId === c.id) || {
          id: "",
          clientId: c.id,
          taxYear: c.taxYear,
          billAmount: 0,
          receipt: 0,
          balance: 0,
          outwardStatus: "Pending" as Billing["outwardStatus"],
          updatedAt: "",
        };
        return { client: c, billing: b };
      });
  }, [search, refreshKey]);

  const getVal = (clientId: string, billing: Billing) => ({
    ...billing,
    ...editMap[clientId],
  });

  const handleChange = (
    clientId: string,
    field: keyof Billing,
    value: string | number,
  ) => {
    setEditMap((m) => {
      const current = m[clientId] || {};
      const updated = { ...current, [field]: value };
      if (field === "billAmount" || field === "receipt") {
        const bill =
          field === "billAmount"
            ? Number(value)
            : Number(current.billAmount || 0);
        const rec =
          field === "receipt" ? Number(value) : Number(current.receipt || 0);
        updated.balance = bill - rec;
      }
      return { ...m, [clientId]: updated };
    });
  };

  const handleSave = (clientId: string, existingBilling: Billing) => {
    const edits = editMap[clientId] || {};
    const allBilling = storage.getBilling();
    const merged: Billing = {
      ...existingBilling,
      ...edits,
      balance:
        Number(edits.billAmount ?? existingBilling.billAmount) -
        Number(edits.receipt ?? existingBilling.receipt),
      updatedAt: new Date().toISOString(),
    };
    if (existingBilling.id) {
      storage.saveBilling(
        allBilling.map((b) => (b.clientId === clientId ? merged : b)),
      );
    } else {
      storage.saveBilling([...allBilling, { ...merged, id: storage.uid() }]);
    }
    setEditMap((m) => {
      const n = { ...m };
      delete n[clientId];
      return n;
    });
    setSaved(clientId);
    setTimeout(() => setSaved(null), 2000);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-4">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "#6B1A2B" }}>
            <tr>
              {[
                "Client",
                "PAN",
                "Tax Year",
                "Bill Amount (₹)",
                "Receipt (₹)",
                "Balance (₹)",
                "Outward Status",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-3 px-4 text-white font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No clients found
                </td>
              </tr>
            )}
            {rows.map(({ client, billing }) => {
              const val = getVal(client.id, billing);
              return (
                <tr
                  key={client.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-2 px-4 font-medium">{client.name}</td>
                  <td className="py-2 px-4 font-mono text-xs">{client.pan}</td>
                  <td className="py-2 px-4">{client.taxYear}</td>
                  <td className="py-2 px-3">
                    <Input
                      type="number"
                      value={val.billAmount || ""}
                      onChange={(e) =>
                        handleChange(client.id, "billAmount", e.target.value)
                      }
                      className="w-28 h-8 text-sm"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      type="number"
                      value={val.receipt || ""}
                      onChange={(e) =>
                        handleChange(client.id, "receipt", e.target.value)
                      }
                      className="w-28 h-8 text-sm"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 px-4 font-medium">
                    <span
                      className={
                        Number(val.balance) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      ₹
                      {(
                        Number(val.billAmount || 0) - Number(val.receipt || 0)
                      ).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <Select
                      value={val.outwardStatus || "Pending"}
                      onValueChange={(v) =>
                        handleChange(client.id, "outwardStatus", v)
                      }
                    >
                      <SelectTrigger className="w-28 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Ready">Ready</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2 px-3">
                    <Button
                      size="sm"
                      onClick={() => handleSave(client.id, billing)}
                      style={{
                        background: saved === client.id ? "#16a34a" : "#6B1A2B",
                      }}
                      className="text-white h-8"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

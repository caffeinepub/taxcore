import { r as reactExports, s as storage, j as jsxRuntimeExports, I as Input, B as Button } from "./index-DmhpSTE0.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Csc2TguB.js";
import { S as Search } from "./search-BvA7-WF-.js";
import { S as Save } from "./save-B2Z_lTj_.js";
function OutwardBillingPage() {
  const [search, setSearch] = reactExports.useState("");
  const [editMap, setEditMap] = reactExports.useState({});
  const [saved, setSaved] = reactExports.useState(null);
  const [refreshKey, setRefreshKey] = reactExports.useState(0);
  const rows = reactExports.useMemo(() => {
    const clients = storage.getClients();
    const billingAll = storage.getBilling();
    return clients.filter(
      (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.pan.toLowerCase().includes(search.toLowerCase())
    ).map((c) => {
      const b = billingAll.find((x) => x.clientId === c.id) || {
        id: "",
        clientId: c.id,
        taxYear: c.taxYear,
        billAmount: 0,
        receipt: 0,
        balance: 0,
        outwardStatus: "Pending",
        updatedAt: ""
      };
      return { client: c, billing: b };
    });
  }, [search, refreshKey]);
  const getVal = (clientId, billing) => ({
    ...billing,
    ...editMap[clientId]
  });
  const handleChange = (clientId, field, value) => {
    setEditMap((m) => {
      const current = m[clientId] || {};
      const updated = { ...current, [field]: value };
      if (field === "billAmount" || field === "receipt") {
        const bill = field === "billAmount" ? Number(value) : Number(current.billAmount || 0);
        const rec = field === "receipt" ? Number(value) : Number(current.receipt || 0);
        updated.balance = bill - rec;
      }
      return { ...m, [clientId]: updated };
    });
  };
  const handleSave = (clientId, existingBilling) => {
    const edits = editMap[clientId] || {};
    const allBilling = storage.getBilling();
    const merged = {
      ...existingBilling,
      ...edits,
      balance: Number(edits.billAmount ?? existingBilling.billAmount) - Number(edits.receipt ?? existingBilling.receipt),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (existingBilling.id) {
      storage.saveBilling(
        allBilling.map((b) => b.clientId === clientId ? merged : b)
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
    setTimeout(() => setSaved(null), 2e3);
    setRefreshKey((k) => k + 1);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-64", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search client...",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          className: "pl-9"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "var(--theme-primary, #6B1A2B)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
        "Client",
        "PAN",
        "Tax Year",
        "Bill Amount (₹)",
        "Receipt (₹)",
        "Balance (₹)",
        "Outward Status",
        "Action"
      ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "th",
        {
          className: "text-left py-3 px-4 text-white font-medium",
          children: h
        },
        h
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "py-8 text-center text-gray-400", children: "No clients found" }) }),
        rows.map(({ client, billing }) => {
          const val = getVal(client.id, billing);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              className: "border-b last:border-0 hover:bg-gray-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-4 font-medium", children: client.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-4 font-mono text-xs", children: client.pan }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-4", children: client.taxYear }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    value: val.billAmount || "",
                    onChange: (e) => handleChange(client.id, "billAmount", e.target.value),
                    className: "w-28 h-8 text-sm",
                    placeholder: "0"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    value: val.receipt || "",
                    onChange: (e) => handleChange(client.id, "receipt", e.target.value),
                    className: "w-28 h-8 text-sm",
                    placeholder: "0"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-4 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: Number(val.balance) > 0 ? "text-red-600" : "text-green-600",
                    children: [
                      "₹",
                      (Number(val.billAmount || 0) - Number(val.receipt || 0)).toLocaleString()
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: val.outwardStatus || "Pending",
                    onValueChange: (v) => handleChange(client.id, "outwardStatus", v),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Pending", children: "Pending" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Ready", children: "Ready" })
                      ] })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    onClick: () => handleSave(client.id, billing),
                    style: {
                      background: saved === client.id ? "#16a34a" : "var(--theme-primary, #6B1A2B)"
                    },
                    className: "text-white h-8",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3.5 h-3.5" })
                  }
                ) })
              ]
            },
            client.id
          );
        })
      ] })
    ] }) })
  ] });
}
export {
  OutwardBillingPage as default
};

import { r as reactExports, o as onStorageChange, s as storage, W as getFilingStatus, j as jsxRuntimeExports, I as Input, C as CircleCheckBig, u as ue } from "./index-BC4bIN54.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-DeH4EJUo.js";
import { D as DatePickerInput } from "./DatePickerInput-BNnHPmC4.js";
import { g as getTaxYears } from "./taxYears-JUInSDi_.js";
import { S as Search } from "./search-L6h1TjTg.js";
import { P as Pen } from "./pen-BsIktdpG.js";
const TAX_YEARS = ["All", ...getTaxYears()];
const ITR_FORMS = [
  "ITR-1",
  "ITR-2",
  "ITR-3",
  "ITR-4",
  "ITR-5",
  "ITR-6",
  "ITR-7"
];
const FILING_STATUS_OPTIONS = [
  "Pending",
  "Pending for E-verification",
  "E-Verified"
];
function AckNumberCell({
  value,
  onSave
}) {
  const [editing, setEditing] = reactExports.useState(false);
  const [localVal, setLocalVal] = reactExports.useState(value);
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    var _a;
    if (editing) (_a = inputRef.current) == null ? void 0 : _a.focus();
  }, [editing]);
  const commit = () => {
    if (localVal && !/^\d{15}$/.test(localVal)) {
      ue.error("Ack number must be 15 digits");
      setLocalVal(value);
      setEditing(false);
      return;
    }
    onSave(localVal);
    setEditing(false);
  };
  if (editing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        ref: inputRef,
        value: localVal,
        onChange: (e) => setLocalVal(e.target.value.replace(/\D/g, "").slice(0, 15)),
        onBlur: commit,
        onKeyDown: (e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setLocalVal(value);
            setEditing(false);
          }
        },
        inputMode: "numeric",
        maxLength: 15,
        className: "w-36 font-mono text-xs h-7"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: () => setEditing(true),
      className: "flex items-center gap-1 text-xs font-mono group hover:text-blue-600",
      title: "Click to edit",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: value || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300 italic", children: "Click to enter" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-3 h-3 text-gray-300 group-hover:text-blue-500 flex-shrink-0" })
      ]
    }
  );
}
function WorkProcessingPage({ user }) {
  const [search, setSearch] = reactExports.useState("");
  const [filterStatus, setFilterStatus] = reactExports.useState("All");
  const [filterYear, setFilterYear] = reactExports.useState("All");
  const [refreshKey, setRefreshKey] = reactExports.useState(0);
  const refresh = reactExports.useCallback(() => setRefreshKey((k) => k + 1), []);
  reactExports.useEffect(() => {
    const unsub = onStorageChange(refresh);
    return unsub;
  }, [refresh]);
  const rows = reactExports.useMemo(() => {
    const clients = storage.getClients();
    const work = storage.getWork();
    return work.map((w) => {
      const client = clients.find((c) => c.id === w.clientId);
      const fs = getFilingStatus(w);
      return {
        ...w,
        filingStatusDerived: fs,
        clientName: (client == null ? void 0 : client.name) || "-",
        pan: (client == null ? void 0 : client.pan) || "-"
      };
    }).filter((r) => {
      const matchSearch = !search || r.clientName.toLowerCase().includes(search.toLowerCase()) || r.pan.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "All" || r.status === filterStatus;
      const matchYear = filterYear === "All" || r.taxYear === filterYear;
      return matchSearch && matchStatus && matchYear;
    });
  }, [search, filterStatus, filterYear, refreshKey]);
  const updateWork = (workId, changes, auditField, oldValue, newValue) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    const clients = storage.getClients();
    const client = clients.find((c) => c.id === work.clientId);
    const clientName = (client == null ? void 0 : client.name) || "Unknown";
    storage.saveWork(
      allWork.map(
        (w) => w.id === workId ? { ...w, ...changes, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : w
      )
    );
    if (user) {
      storage.addAuditLog({
        id: storage.uid(),
        userId: user.id,
        userName: user.name,
        action: `Updated ${auditField}`,
        clientId: work.clientId,
        clientName,
        fieldChanged: auditField,
        oldValue,
        newValue,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  };
  const handleFilingStatusChange = (workId, newStatus) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    const oldStatus = getFilingStatus(work);
    if (oldStatus === newStatus) return;
    const eVerified = newStatus === "E-Verified";
    updateWork(
      workId,
      { filingStatus: newStatus, eVerified },
      "Filing Status",
      oldStatus,
      newStatus || ""
    );
    if (newStatus === "E-Verified") {
      ue.success("Marked as E-Verified", {
        description: "Client removed from deadline alerts."
      });
    } else {
      ue.success(`Filing status updated to: ${newStatus}`);
    }
  };
  const handleItrFormChange = (workId, newForm) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    updateWork(
      workId,
      { itrForm: newForm },
      "ITR Form",
      work.itrForm || "-",
      newForm
    );
    ue.success(`ITR Form updated to ${newForm}`);
  };
  const handleAckNumberSave = (workId, newAck) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    updateWork(
      workId,
      { ackNumber: newAck },
      "Acknowledgement Number",
      work.ackNumber || "-",
      newAck || "-"
    );
    if (newAck) ue.success("Acknowledgement number saved");
  };
  const handleFilingDateChange = (workId, newDate) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    updateWork(
      workId,
      { filingDate: newDate },
      "Filing Date",
      work.filingDate || "-",
      newDate || "-"
    );
  };
  const filingStatusBadge = (status) => {
    if (status === "E-Verified")
      return "bg-green-100 text-green-700 border border-green-200";
    if (status === "Pending for E-verification")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-orange-100 text-orange-700 border border-orange-200";
  };
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search client, PAN...",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "pl-9 w-56",
            "data-ocid": "work.search_input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", "data-ocid": "work.filter.select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "All", children: "All Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Pending", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "In Progress", children: "In Progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Filed", children: "Filed" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterYear, onValueChange: setFilterYear, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TAX_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "#6B1A2B" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
        "Client",
        "PAN",
        "Tax Year",
        "Work Status",
        "ITR Form",
        "Ack Number",
        "Filing Date",
        "Filing Status"
      ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "th",
        {
          className: "text-left py-3 px-3 text-white font-medium text-xs",
          children: h
        },
        h
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "py-8 text-center text-gray-400", children: "No work records found" }) }),
        rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            "data-ocid": `work.item.${i + 1}`,
            className: `border-b last:border-0 hover:bg-gray-50 transition-colors duration-150 ${i % 2 === 0 ? "" : "bg-gray-50/30"} ${row.filingStatusDerived === "E-Verified" ? "bg-green-50/40" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 font-medium text-xs", children: row.clientName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 font-mono text-xs", children: row.pan }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-xs", children: row.taxYear }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `px-2 py-0.5 rounded-full text-xs font-medium ${row.status === "Filed" ? "bg-green-100 text-green-700" : row.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`,
                  children: row.status
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: row.itrForm || "",
                  onValueChange: (v) => handleItrFormChange(row.id, v),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectTrigger,
                      {
                        className: "h-7 text-xs w-24 border-dashed",
                        "data-ocid": `work.toggle.${i + 1}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ITR_FORMS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: f, className: "text-xs", children: f }, f)) })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                AckNumberCell,
                {
                  value: row.ackNumber || "",
                  onSave: (v) => handleAckNumberSave(row.id, v)
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                DatePickerInput,
                {
                  value: row.filingDate || "",
                  onChange: (v) => handleFilingDateChange(row.id, v),
                  placeholder: "DD-MM-YYYY",
                  maxDate: today,
                  className: "w-44"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: row.filingStatusDerived,
                  onValueChange: (v) => handleFilingStatusChange(
                    row.id,
                    v
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectTrigger,
                      {
                        className: `h-7 text-xs w-44 ${filingStatusBadge(row.filingStatusDerived)}`,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FILING_STATUS_OPTIONS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectItem,
                      {
                        value: s || "Pending",
                        className: "text-xs",
                        children: s === "E-Verified" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3 h-3 text-green-600" }),
                          "E-Verified"
                        ] }) : s
                      },
                      s
                    )) })
                  ]
                }
              ) })
            ]
          },
          row.id
        ))
      ] })
    ] }) })
  ] });
}
export {
  WorkProcessingPage as default
};

import { r as reactExports, o as onStorageChange, a2 as getFilingStatus, j as jsxRuntimeExports, I as Input, C as CircleCheckBig, s as storage, u as ue } from "./index-tQjtucpU.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-PlKyG8Is.js";
import { D as DatePickerInput } from "./DatePickerInput-B3hpLgSK.js";
import { g as getTaxYears } from "./taxYears-JUInSDi_.js";
import { S as Search } from "./search-CvURZINP.js";
import { L as Lock } from "./lock-kCog6o9z.js";
import { P as Pen } from "./pen-szqUinDh.js";
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
function deriveFilingDateFromAck(digits) {
  if (digits.length !== 15) return null;
  const last6 = digits.slice(9, 15);
  const dd = last6.slice(0, 2);
  const mm = last6.slice(2, 4);
  const yy = last6.slice(4, 6);
  const yyyy = `20${yy}`;
  const dayNum = Number(dd);
  const monthNum = Number(mm);
  const yearNum = Number(yyyy);
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 2e3 || yearNum > 2099) {
    return null;
  }
  const dt = new Date(yearNum, monthNum - 1, dayNum);
  if (dt.getFullYear() !== yearNum || dt.getMonth() !== monthNum - 1 || dt.getDate() !== dayNum) {
    return null;
  }
  return `${dd}-${mm}-${yyyy}`;
}
function daysUntil(ddmmyyyy) {
  if (!ddmmyyyy) return null;
  const parts = ddmmyyyy.split("-");
  if (parts.length !== 3) return null;
  const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  d.setHours(0, 0, 0, 0);
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((d.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
}
function dueDateUrgencyClass(days, eVerified) {
  if (eVerified || days === null) return "";
  if (days < 0) return "text-red-700 font-semibold";
  if (days <= 5) return "text-red-600 font-semibold";
  if (days <= 10) return "text-amber-600 font-semibold";
  return "";
}
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
        className: "w-36 font-mono text-xs h-7",
        style: { border: "2px solid #6B1414" }
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
function DueDateCell({
  value,
  taxYear,
  eVerified,
  onSave
}) {
  const [editing, setEditing] = reactExports.useState(false);
  const [localVal, setLocalVal] = reactExports.useState(value);
  const minDate = reactExports.useMemo(() => {
    const parts = taxYear == null ? void 0 : taxYear.split("-");
    if (parts && parts.length === 2) {
      const endYear = Number(parts[1]);
      const d = new Date(endYear, 2, 31);
      d.setDate(d.getDate() + 1);
      return d;
    }
    return void 0;
  }, [taxYear]);
  const commit = () => {
    if (!localVal) {
      onSave("");
      setEditing(false);
      return;
    }
    const parts = localVal.split("-");
    if (parts.length !== 3) {
      ue.error("Due Date must be in DD-MM-YYYY format");
      setLocalVal(value);
      setEditing(false);
      return;
    }
    if (minDate) {
      const tyParts = taxYear.split("-");
      const endYear = Number(tyParts[1]);
      const dueDt = new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0])
      );
      dueDt.setHours(0, 0, 0, 0);
      const taxYearEnd = new Date(endYear, 2, 31);
      taxYearEnd.setHours(0, 0, 0, 0);
      if (dueDt <= taxYearEnd) {
        ue.error(
          `Due Date must be after 31-03-${endYear} (end of Tax Year ${taxYear})`
        );
        setLocalVal(value);
        setEditing(false);
        return;
      }
    }
    onSave(localVal);
    setEditing(false);
  };
  const days = daysUntil(value);
  const urgencyClass = dueDateUrgencyClass(days, eVerified);
  if (editing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[160px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DatePickerInput,
        {
          value: localVal,
          onChange: (v) => setLocalVal(v),
          placeholder: "DD-MM-YYYY",
          minDate
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: commit,
            className: "text-xs px-2 py-0.5 rounded text-white",
            style: { background: "var(--theme-primary, #6B1414)" },
            children: "Save"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setLocalVal(value);
              setEditing(false);
            },
            className: "text-xs px-2 py-0.5 rounded border text-gray-600",
            children: "Cancel"
          }
        )
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: () => {
        setLocalVal(value);
        setEditing(true);
      },
      className: `flex items-center gap-1 text-xs group hover:text-blue-600 ${urgencyClass}`,
      title: value ? days === null ? "Click to edit due date" : days < 0 ? `Overdue by ${Math.abs(days)} day(s) — click to edit` : `${days} day(s) remaining — click to edit` : "Click to set due date",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: value ? "font-mono" : "text-gray-300 italic", children: value || "Set date" }),
        value && days !== null && !eVerified && days <= 10 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `ml-1 text-[10px] px-1 rounded-full font-bold ${days < 0 ? "bg-red-100 text-red-700" : days <= 5 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`,
            children: days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`
          }
        ),
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
      const displayStatus = w.status === "Filed" ? "Completed" : w.status;
      return {
        ...w,
        status: displayStatus,
        filingStatusDerived: fs,
        clientName: (client == null ? void 0 : client.name) || "-",
        pan: (client == null ? void 0 : client.pan) || "-",
        dueDate: (client == null ? void 0 : client.dueDate) || "",
        hasAck: !!(w.ackNumber && /^\d{15}$/.test(w.ackNumber)),
        isEVerified: fs === "E-Verified",
        clientRef: client
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
        userRole: user.role,
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
  const handleStatusChange = (workId, newStatus) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    const oldStatus = work.status === "Filed" ? "Completed" : work.status;
    if (oldStatus === newStatus) return;
    updateWork(
      workId,
      { status: newStatus },
      "Work Status",
      oldStatus,
      newStatus
    );
    ue.success(`Work status updated to: ${newStatus}`);
  };
  const handleFilingStatusChange = (workId, newStatus, hasAck) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    if (hasAck && newStatus === "Pending") {
      ue.error(
        'Acknowledgement number is entered. Status must be "Pending for E-verification" or "E-Verified".'
      );
      return;
    }
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
    var _a;
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    const derivedDate = deriveFilingDateFromAck(newAck);
    const changes = { ackNumber: newAck };
    const currentStatus = getFilingStatus(work);
    if (derivedDate) {
      const tyParts = (_a = work.taxYear) == null ? void 0 : _a.split("-");
      if (tyParts && tyParts.length === 2) {
        const endYear = Number(tyParts[1]);
        const taxYearEndDate = new Date(endYear, 2, 31);
        taxYearEndDate.setHours(0, 0, 0, 0);
        const fdParts = derivedDate.split("-");
        if (fdParts.length === 3) {
          const filingDt = new Date(
            Number(fdParts[2]),
            Number(fdParts[1]) - 1,
            Number(fdParts[0])
          );
          filingDt.setHours(0, 0, 0, 0);
          if (filingDt <= taxYearEndDate) {
            ue.error("Invalid Filing Date", {
              description: `Filing Date ${derivedDate} must be after 31-03-${endYear} (end of Tax Year ${work.taxYear}). Please check the Acknowledgement Number.`
            });
            return;
          }
        }
      }
      changes.filingDate = derivedDate;
      if (currentStatus !== "E-Verified") {
        changes.filingStatus = "Pending for E-verification";
        changes.eVerified = false;
      }
    } else {
      if (currentStatus !== "E-Verified") {
        changes.filingStatus = "Pending";
        changes.filingDate = "";
        changes.eVerified = false;
      }
    }
    updateWork(
      workId,
      changes,
      "Acknowledgement Number",
      work.ackNumber || "-",
      newAck || "-"
    );
    if (newAck) {
      if (derivedDate) {
        ue.success("Acknowledgement number saved", {
          description: `Filing date auto-set to ${derivedDate}`
        });
      } else {
        ue.success("Acknowledgement number saved");
      }
    }
  };
  const handleDueDateSave = (_workId, clientRef, newDueDate) => {
    if (!clientRef) return;
    const oldDueDate = clientRef.dueDate || "-";
    if (oldDueDate === newDueDate) return;
    const allClients = storage.getClients();
    storage.saveClients(
      allClients.map(
        (c) => c.id === clientRef.id ? { ...c, dueDate: newDueDate } : c
      )
    );
    if (user) {
      storage.addAuditLog({
        id: storage.uid(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "Updated Due Date",
        clientId: clientRef.id,
        clientName: clientRef.name,
        fieldChanged: "Due Date",
        oldValue: oldDueDate,
        newValue: newDueDate || "-",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    ue.success(`Due date updated to ${newDueDate || "(cleared)"}`);
  };
  const filingStatusBadge = (status) => {
    if (status === "E-Verified")
      return "bg-green-100 text-green-700 border border-green-200";
    if (status === "Pending for E-verification")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-orange-100 text-orange-700 border border-orange-200";
  };
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Completed", children: "Completed" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterYear, onValueChange: setFilterYear, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TAX_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: "var(--theme-primary, #6B1A2B)" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
        "Client",
        "PAN",
        "Tax Year",
        "Due Date",
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
        rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 9, className: "py-8 text-center text-gray-400", children: "No work records found" }) }),
        rows.map((row, i) => {
          const dueDays = daysUntil(row.dueDate);
          const rowUrgent = !row.isEVerified && dueDays !== null && dueDays <= 10;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              "data-ocid": `work.item.${i + 1}`,
              className: `border-b last:border-0 hover:bg-gray-50 transition-colors duration-150 ${row.filingStatusDerived === "E-Verified" ? "bg-green-50/40" : rowUrgent && dueDays < 0 ? "bg-red-50/40" : rowUrgent && dueDays <= 5 ? "bg-red-50/20" : rowUrgent ? "bg-amber-50/30" : i % 2 === 0 ? "" : "bg-gray-50/30"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 font-medium text-xs", children: row.clientName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 font-mono text-xs", children: row.pan }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-xs", children: row.taxYear }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DueDateCell,
                  {
                    value: row.dueDate,
                    taxYear: row.taxYear,
                    eVerified: row.isEVerified,
                    onSave: (v) => handleDueDateSave(row.id, row.clientRef, v)
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: row.status,
                    onValueChange: (v) => handleStatusChange(row.id, v),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectTrigger,
                        {
                          className: `h-7 text-xs w-32 ${row.status === "Completed" ? "bg-green-100 text-green-700 border-green-200" : row.status === "In Progress" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-orange-100 text-orange-700 border-orange-200"}`,
                          "data-ocid": `work.status.${i + 1}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Pending", className: "text-xs", children: "Pending" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "In Progress", className: "text-xs", children: "In Progress" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Completed", className: "text-xs", children: "Completed" })
                      ] })
                    ]
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
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs font-mono text-gray-700", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3 h-3 text-gray-400 shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: row.filingDate || "—" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: row.filingStatusDerived,
                    onValueChange: (v) => handleFilingStatusChange(
                      row.id,
                      v,
                      row.hasAck
                    ),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        SelectTrigger,
                        {
                          className: `h-7 text-xs w-44 ${filingStatusBadge(row.filingStatusDerived)}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        !row.hasAck && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Pending", className: "text-xs", children: "Pending" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          SelectItem,
                          {
                            value: "Pending for E-verification",
                            className: "text-xs",
                            children: "Pending for E-verification"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "E-Verified", className: "text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3 h-3 text-green-600" }),
                          "E-Verified"
                        ] }) })
                      ] })
                    ]
                  }
                ) })
              ]
            },
            row.id
          );
        })
      ] })
    ] }) })
  ] });
}
export {
  WorkProcessingPage as default
};

import { c as createLucideIcon, s as storage, j as jsxRuntimeExports, Z as Download, B as Button } from "./index-DZAeQoEb.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M8 13h2", key: "yr2amv" }],
  ["path", { d: "M14 13h2", key: "un5t4a" }],
  ["path", { d: "M8 17h2", key: "2yhykz" }],
  ["path", { d: "M14 17h2", key: "10kma7" }]
];
const FileSpreadsheet = createLucideIcon("file-spreadsheet", __iconNode);
function escapeCell(val) {
  const str = val == null ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
function toCsvRows(headers, rows) {
  const headerRow = headers.map(escapeCell).join(",");
  const dataRows = rows.map(
    (row) => headers.map((h) => escapeCell(row[h])).join(",")
  );
  return [headerRow, ...dataRows].join("\r\n");
}
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
function ExportPage() {
  const getDateStr = () => (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN").replace(/\//g, "-");
  const handleExportExcel = () => {
    const clients = storage.getClients();
    const documents = storage.getDocuments();
    const work = storage.getWork();
    const billing = storage.getBilling();
    const auditLogs = storage.getAuditLogs();
    const getHOI = (c) => {
      if (c.headOfIncome) return c.headOfIncome;
      const legacy = c.sourceOfIncome;
      if (legacy === "Salary") return "Salaried";
      if (legacy === "Other") return "Salaried";
      return legacy || "Salaried";
    };
    const totalClients = clients.length;
    const allWork = work;
    const filedCount = allWork.filter((w) => w.status === "Filed").length;
    const pendingCount = allWork.filter(
      (w) => w.status === "Pending" || w.status === "In Progress"
    ).length;
    const eVerifiedCount = allWork.filter(
      (w) => w.eVerified || w.filingStatus === "E-Verified"
    ).length;
    const pendingEVerif = allWork.filter(
      (w) => w.filingStatus === "Pending for E-verification"
    ).length;
    const readyForDelivery = billing.filter(
      (b) => b.outwardStatus === "Ready"
    ).length;
    const totalBilled = billing.reduce((s, b) => s + b.billAmount, 0);
    const totalReceived = billing.reduce((s, b) => s + b.receipt, 0);
    const totalBalance = billing.reduce((s, b) => s + b.balance, 0);
    const dashboardRows = [
      { Metric: "Total Clients", Value: totalClients },
      { Metric: "Work Pending / In Progress", Value: pendingCount },
      { Metric: "ITR Filed", Value: filedCount },
      { Metric: "E-Verified", Value: eVerifiedCount },
      { Metric: "Pending for E-verification", Value: pendingEVerif },
      { Metric: "Ready for Delivery", Value: readyForDelivery },
      { Metric: "", Value: "" },
      { Metric: "=== BILLING SUMMARY ===", Value: "" },
      { Metric: "Total Billed (₹)", Value: totalBilled },
      { Metric: "Total Received (₹)", Value: totalReceived },
      { Metric: "Total Balance (₹)", Value: totalBalance },
      { Metric: "", Value: "" },
      {
        Metric: "Generated On",
        Value: (/* @__PURE__ */ new Date()).toLocaleString("en-IN")
      }
    ];
    const clientHeaders = [
      "Name",
      "PAN",
      "Head of Income",
      "Business Name",
      "Category",
      "Tax Year",
      "Due Date",
      "Client Type",
      "Mobile",
      "Email",
      "Created At"
    ];
    const clientRows = clients.map((c) => ({
      Name: c.name,
      PAN: c.pan,
      "Head of Income": getHOI(c),
      "Business Name": c.businessName || "-",
      Category: c.clientCategory,
      "Tax Year": c.taxYear,
      "Due Date": c.dueDate,
      "Client Type": c.clientType,
      Mobile: c.mobile,
      Email: c.email || "-",
      "Created At": new Date(c.createdAt).toLocaleDateString("en-IN")
    }));
    const workHeaders = [
      "Client Name",
      "PAN",
      "Tax Year",
      "Work Status",
      "ITR Form",
      "Acknowledgement Number",
      "Filing Date",
      "Filing Status"
    ];
    const workRows = work.map((w) => {
      const client = clients.find((c) => c.id === w.clientId);
      const fs = w.filingStatus ?? (w.eVerified ? "E-Verified" : "Pending");
      return {
        "Client Name": (client == null ? void 0 : client.name) || "-",
        PAN: (client == null ? void 0 : client.pan) || "-",
        "Tax Year": w.taxYear,
        "Work Status": w.status,
        "ITR Form": w.itrForm || "-",
        "Acknowledgement Number": w.ackNumber || "-",
        "Filing Date": w.filingDate || "-",
        "Filing Status": fs
      };
    });
    const docHeaders = [
      "Client Name",
      "PAN",
      "Date",
      "Mode",
      "Status",
      "Remarks"
    ];
    const docRows = documents.map((d) => {
      const client = clients.find((c) => c.id === d.clientId);
      return {
        "Client Name": (client == null ? void 0 : client.name) || "-",
        PAN: (client == null ? void 0 : client.pan) || "-",
        Date: d.date,
        Mode: d.mode,
        Status: d.status,
        Remarks: d.remarks || "-"
      };
    });
    const billingHeaders = [
      "Client Name",
      "PAN",
      "Tax Year",
      "Bill Amount (₹)",
      "Receipt (₹)",
      "Balance (₹)",
      "Outward Status"
    ];
    const billingRows = billing.map((b) => {
      const client = clients.find((c) => c.id === b.clientId);
      return {
        "Client Name": (client == null ? void 0 : client.name) || "-",
        PAN: (client == null ? void 0 : client.pan) || "-",
        "Tax Year": b.taxYear,
        "Bill Amount (₹)": b.billAmount,
        "Receipt (₹)": b.receipt,
        "Balance (₹)": b.balance,
        "Outward Status": b.outwardStatus
      };
    });
    const auditHeaders = [
      "Timestamp",
      "User",
      "Action",
      "Client",
      "Field Changed",
      "Old Value",
      "New Value"
    ];
    const auditRows = auditLogs.map((a) => ({
      Timestamp: new Date(a.timestamp).toLocaleString("en-IN"),
      User: a.userName,
      Action: a.action,
      Client: a.clientName,
      "Field Changed": a.fieldChanged,
      "Old Value": a.oldValue,
      "New Value": a.newValue
    }));
    const sections = [
      {
        title: "TAXCORE EXPORT REPORT",
        subtitle: `Generated: ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN")}`,
        isSummary: true
      },
      {
        title: "=== 1. DASHBOARD SUMMARY ===",
        headers: ["Metric", "Value"],
        rows: dashboardRows
      },
      {
        title: "=== 2. CLIENT MASTER ===",
        headers: clientHeaders,
        rows: clientRows
      },
      {
        title: "=== 3. WORK PROCESSING ===",
        headers: workHeaders,
        rows: workRows
      },
      {
        title: "=== 4. DOCUMENT INWARD ===",
        headers: docHeaders,
        rows: docRows
      },
      {
        title: "=== 5. OUTWARD & BILLING ===",
        headers: billingHeaders,
        rows: billingRows
      },
      {
        title: "=== 6. AUDIT LOG ===",
        headers: auditHeaders,
        rows: auditRows
      }
    ];
    const lines = [
      "TAXCORE ITR WORKFLOW MANAGEMENT SYSTEM",
      `Export Date: ${(/* @__PURE__ */ new Date()).toLocaleString("en-IN")}`,
      ""
    ];
    for (const section of sections) {
      if (section.isSummary) continue;
      lines.push(section.title);
      lines.push(toCsvRows(section.headers, section.rows));
      lines.push("");
      lines.push("");
    }
    downloadBlob(
      lines.join("\r\n"),
      `TaxCore_Export_${getDateStr()}.csv`,
      "text/csv"
    );
  };
  const handleExportClients = () => {
    const clients = storage.getClients();
    const getHOI = (c) => {
      if (c.headOfIncome) return c.headOfIncome;
      const legacy = c.sourceOfIncome;
      if (legacy === "Salary") return "Salaried";
      return legacy || "Salaried";
    };
    const headers = [
      "Name",
      "PAN",
      "Head of Income",
      "Business Name",
      "Category",
      "Tax Year",
      "Due Date",
      "Mobile",
      "Email"
    ];
    const rows = clients.map((c) => ({
      Name: c.name,
      PAN: c.pan,
      "Head of Income": getHOI(c),
      "Business Name": c.businessName || "-",
      Category: c.clientCategory,
      "Tax Year": c.taxYear,
      "Due Date": c.dueDate,
      Mobile: c.mobile,
      Email: c.email || "-"
    }));
    downloadBlob(
      toCsvRows(headers, rows),
      `TaxCore_Clients_${getDateStr()}.csv`,
      "text/csv"
    );
  };
  const handleExportAudit = () => {
    const logs = storage.getAuditLogs();
    const headers = [
      "Timestamp",
      "User",
      "Action",
      "Client",
      "Field Changed",
      "Old Value",
      "New Value"
    ];
    const rows = logs.map((a) => ({
      Timestamp: new Date(a.timestamp).toLocaleString("en-IN"),
      User: a.userName,
      Action: a.action,
      Client: a.clientName,
      "Field Changed": a.fieldChanged,
      "Old Value": a.oldValue,
      "New Value": a.newValue
    }));
    downloadBlob(
      toCsvRows(headers, rows),
      `TaxCore_AuditLog_${getDateStr()}.csv`,
      "text/csv"
    );
  };
  const stats = {
    clients: storage.getClients().length,
    work: storage.getWork().length,
    docs: storage.getDocuments().length,
    billing: storage.getBilling().length,
    audit: storage.getAuditLogs().length
  };
  const exportOptions = [
    {
      id: "full",
      title: "Full Export (All Data)",
      description: "Dashboard summary + Client Master + Work Processing + Document Inward + Billing + Audit Log",
      icon: FileSpreadsheet,
      color: "#6B1A2B",
      bg: "rgba(107,26,43,0.05)",
      border: "rgba(107,26,43,0.2)",
      action: handleExportExcel,
      label: "Export All to CSV",
      badge: `${stats.clients + stats.work + stats.docs + stats.billing} records`
    },
    {
      id: "clients",
      title: "Client Master",
      description: "All client details including head of income, business name, tax year, due date",
      icon: Download,
      color: "#2563EB",
      bg: "rgba(37,99,235,0.05)",
      border: "rgba(37,99,235,0.2)",
      action: handleExportClients,
      label: "Export Clients",
      badge: `${stats.clients} clients`
    },
    {
      id: "audit",
      title: "Audit Log",
      description: "Full activity trail: user actions, field changes, timestamps",
      icon: Download,
      color: "#7C3AED",
      bg: "rgba(124,58,237,0.05)",
      border: "rgba(124,58,237,0.2)",
      action: handleExportAudit,
      label: "Export Audit Log",
      badge: `${stats.audit} entries`
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold mb-1", style: { color: "#6B1A2B" }, children: "Export Data" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Download your TaxCore data as CSV files. Each export includes all records in structured format." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: exportOptions.map((opt) => {
      const Icon = opt.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-lg border p-4 flex items-center justify-between gap-4",
          style: { background: opt.bg, borderColor: opt.border },
          "data-ocid": `export.${opt.id}.panel`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  style: { background: `${opt.color}15` },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5", style: { color: opt.color } })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "font-semibold text-sm",
                      style: { color: opt.color },
                      children: opt.title
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-xs px-1.5 py-0.5 rounded-full font-medium",
                      style: {
                        background: `${opt.color}18`,
                        color: opt.color
                      },
                      children: opt.badge
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: opt.description })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: opt.action,
                size: "sm",
                className: "flex-shrink-0 text-white",
                style: { background: opt.color },
                "data-ocid": `export.${opt.id}.button`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5 mr-1" }),
                  opt.label
                ]
              }
            )
          ]
        },
        opt.id
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "rounded-lg border p-3 text-xs text-gray-500",
        style: { background: "#f9f7f4", borderColor: "rgba(107,26,43,0.1)" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-700 mb-1", children: "Export Notes:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-0.5 list-disc list-inside", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Files are downloaded as CSV format (opens in Excel, Google Sheets)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Full export contains all sections in a single file with clear section headers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Data is exported as currently stored \\u2014 no data is modified" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "File name includes today\\u2019s date for easy reference" })
          ] })
        ]
      }
    )
  ] });
}
export {
  ExportPage as default
};

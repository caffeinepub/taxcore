import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { storage } from "../data/storage";
import { getHeadOfIncome } from "../types";

function escapeCell(val: unknown): string {
  const str = val == null ? "" : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRows(headers: string[], rows: Record<string, unknown>[]): string {
  const headerRow = headers.map(escapeCell).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => escapeCell(row[h])).join(","),
  );
  return [headerRow, ...dataRows].join("\r\n");
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ExportPage() {
  const getDateStr = () =>
    new Date().toLocaleDateString("en-IN").replace(/\//g, "-");

  const handleExportExcel = () => {
    const clients = storage.getClients();
    const documents = storage.getDocuments();
    const work = storage.getWork();
    const billing = storage.getBilling();
    const auditLogs = storage.getAuditLogs();

    const getHOI = (c: (typeof clients)[0]) => {
      return getHeadOfIncome(c as any);
    };

    // === DASHBOARD SUMMARY ===
    const filedCount = work.filter(
      (w) =>
        w.filingStatus === "E-Verified" ||
        w.filingStatus === "Pending for E-verification",
    ).length;
    const pendingCount = work.filter(
      (w) => w.status === "Pending" || w.status === "In Progress",
    ).length;
    const eVerifiedCount = work.filter(
      (w) => w.eVerified || w.filingStatus === "E-Verified",
    ).length;
    const pendingEVerif = work.filter(
      (w) => w.filingStatus === "Pending for E-verification",
    ).length;
    const readyForDelivery = billing.filter(
      (b) => b.outwardStatus === "Ready",
    ).length;
    const totalBilled = billing.reduce((s, b) => s + b.billAmount, 0);
    const totalReceived = billing.reduce((s, b) => s + b.receipt, 0);
    const totalBalance = billing.reduce((s, b) => s + b.balance, 0);

    const dashboardRows = [
      { Metric: "Total Clients", Value: clients.length },
      { Metric: "Work Pending / In Progress", Value: pendingCount },
      { Metric: "ITR Filed (E-Verified + Pending E-verif)", Value: filedCount },
      { Metric: "E-Verified", Value: eVerifiedCount },
      { Metric: "Pending for E-verification", Value: pendingEVerif },
      { Metric: "Ready for Delivery", Value: readyForDelivery },
      { Metric: "", Value: "" },
      { Metric: "=== BILLING SUMMARY ===", Value: "" },
      { Metric: "Total Billed (\u20b9)", Value: totalBilled },
      { Metric: "Total Received (\u20b9)", Value: totalReceived },
      { Metric: "Total Balance (\u20b9)", Value: totalBalance },
      { Metric: "", Value: "" },
      { Metric: "Generated On", Value: new Date().toLocaleString("en-IN") },
    ];

    // === CLIENT MASTER ===
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
      "Created At",
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
      "Created At": new Date(c.createdAt).toLocaleDateString("en-IN"),
    }));

    // Head-of-income grouped sections
    const hoiGroups: Record<string, typeof clientRows> = {
      Salaried: [],
      Business: [],
      Agricultural: [],
      "Capital Gain": [],
    };
    for (const row of clientRows) {
      const hoi = row["Head of Income"];
      if (hoiGroups[hoi]) hoiGroups[hoi].push(row);
      else hoiGroups.Salaried.push(row);
    }

    // === WORK PROCESSING ===
    const workHeaders = [
      "Client Name",
      "PAN",
      "Tax Year",
      "Work Status",
      "ITR Form",
      "Return Type",
      "Acknowledgement Number",
      "Filing Date",
      "Filing Status",
      "Remark",
    ];
    const workRows = work.map((w) => {
      const client = clients.find((c) => c.id === w.clientId);
      const fs = w.filingStatus ?? (w.eVerified ? "E-Verified" : "Pending");
      return {
        "Client Name": client?.name || "-",
        PAN: client?.pan || "-",
        "Tax Year": w.taxYear,
        "Work Status": w.status,
        "ITR Form": w.itrForm || "-",
        "Return Type": w.returnType || "Original",
        "Acknowledgement Number": w.ackNumber || "-",
        "Filing Date": w.filingDate || "-",
        "Filing Status": fs,
        Remark: w.remark || "-",
      };
    });

    // === DOCUMENT INWARD ===
    const docHeaders = [
      "Client Name",
      "PAN",
      "Date",
      "Mode",
      "Status",
      "Remarks",
    ];
    const docRows = documents.map((d) => {
      const client = clients.find((c) => c.id === d.clientId);
      return {
        "Client Name": client?.name || "-",
        PAN: client?.pan || "-",
        Date: d.date,
        Mode: d.mode,
        Status: d.status,
        Remarks: d.remarks || "-",
      };
    });

    // === OUTWARD & BILLING ===
    const billingHeaders = [
      "Client Name",
      "PAN",
      "Tax Year",
      "Bill Amount (\u20b9)",
      "Receipt (\u20b9)",
      "Balance (\u20b9)",
      "Outward Status",
    ];
    const billingRows = billing.map((b) => {
      const client = clients.find((c) => c.id === b.clientId);
      return {
        "Client Name": client?.name || "-",
        PAN: client?.pan || "-",
        "Tax Year": b.taxYear,
        "Bill Amount (\u20b9)": b.billAmount,
        "Receipt (\u20b9)": b.receipt,
        "Balance (\u20b9)": b.balance,
        "Outward Status": b.outwardStatus,
      };
    });

    // === AUDIT LOG ===
    const auditHeaders = [
      "Timestamp",
      "User",
      "Action",
      "Client",
      "Field Changed",
      "Old Value",
      "New Value",
    ];
    const auditRows = auditLogs.map((a) => ({
      Timestamp: new Date(a.timestamp).toLocaleString("en-IN"),
      User: a.userName,
      Action: a.action,
      Client: a.clientName,
      "Field Changed": a.fieldChanged,
      "Old Value": a.oldValue,
      "New Value": a.newValue,
    }));

    const lines: string[] = [
      "TAXCORE ITR WORKFLOW MANAGEMENT SYSTEM",
      `Export Date: ${new Date().toLocaleString("en-IN")}`,
      "",
      "=== 1. DASHBOARD SUMMARY ===",
      toCsvRows(
        ["Metric", "Value"],
        dashboardRows as Record<string, unknown>[],
      ),
      "",
      "",
      "=== 2. CLIENT MASTER (ALL) ===",
      toCsvRows(clientHeaders, clientRows as Record<string, unknown>[]),
      "",
      "",
      "=== 2A. CLIENT MASTER: SALARIED ===",
      toCsvRows(clientHeaders, hoiGroups.Salaried as Record<string, unknown>[]),
      "",
      "",
      "=== 2B. CLIENT MASTER: BUSINESS ===",
      toCsvRows(clientHeaders, hoiGroups.Business as Record<string, unknown>[]),
      "",
      "",
      "=== 2C. CLIENT MASTER: AGRICULTURAL ===",
      toCsvRows(
        clientHeaders,
        hoiGroups.Agricultural as Record<string, unknown>[],
      ),
      "",
      "",
      "=== 2D. CLIENT MASTER: CAPITAL GAIN ===",
      toCsvRows(
        clientHeaders,
        hoiGroups["Capital Gain"] as Record<string, unknown>[],
      ),
      "",
      "",
      "=== 3. WORK PROCESSING ===",
      toCsvRows(workHeaders, workRows as Record<string, unknown>[]),
      "",
      "",
      "=== 4. DOCUMENT INWARD ===",
      toCsvRows(docHeaders, docRows as Record<string, unknown>[]),
      "",
      "",
      "=== 5. OUTWARD & BILLING ===",
      toCsvRows(billingHeaders, billingRows as Record<string, unknown>[]),
      "",
      "",
      "=== 6. AUDIT LOG ===",
      toCsvRows(auditHeaders, auditRows as Record<string, unknown>[]),
    ];

    downloadBlob(
      lines.join("\r\n"),
      `TaxCore_FullExport_${getDateStr()}.csv`,
      "text/csv",
    );
  };

  const handleExportITRFiled = () => {
    const clients = storage.getClients();
    const work = storage.getWork();

    const filedWork = work.filter(
      (w) =>
        w.filingStatus === "E-Verified" ||
        w.filingStatus === "Pending for E-verification",
    );

    const headers = [
      "Client Name",
      "PAN",
      "Tax Year",
      "ITR Form",
      "Return Type",
      "Acknowledgement Number",
      "Filing Date",
      "Filing Status",
      "Remark",
    ];
    const rows = filedWork.map((w) => {
      const client = clients.find((c) => c.id === w.clientId);
      return {
        "Client Name": client?.name || "-",
        PAN: client?.pan || "-",
        "Tax Year": w.taxYear,
        "ITR Form": w.itrForm || "-",
        "Return Type": w.returnType || "Original",
        "Acknowledgement Number": w.ackNumber || "-",
        "Filing Date": w.filingDate || "-",
        "Filing Status": w.filingStatus || "-",
        Remark: w.remark || "-",
      };
    }) as Record<string, unknown>[];

    downloadBlob(
      toCsvRows(headers, rows),
      `TaxCore_ITRFiled_${getDateStr()}.csv`,
      "text/csv",
    );
  };

  const handleExportPendingWork = () => {
    const clients = storage.getClients();
    const work = storage.getWork();

    const pendingWork = work.filter(
      (w) => w.status === "Pending" || w.status === "In Progress",
    );

    const headers = [
      "Client Name",
      "PAN",
      "Tax Year",
      "Head of Income",
      "Due Date",
      "Work Status",
      "ITR Form",
      "Return Type",
      "Remark",
    ];
    const rows = pendingWork.map((w) => {
      const client = clients.find((c) => c.id === w.clientId);
      return {
        "Client Name": client?.name || "-",
        PAN: client?.pan || "-",
        "Tax Year": w.taxYear,
        "Head of Income": client ? getHeadOfIncome(client as any) : "-",
        "Due Date": client?.dueDate || "-",
        "Work Status": w.status,
        "ITR Form": w.itrForm || "-",
        "Return Type": w.returnType || "Original",
        Remark: w.remark || "-",
      };
    }) as Record<string, unknown>[];

    downloadBlob(
      toCsvRows(headers, rows),
      `TaxCore_PendingWork_${getDateStr()}.csv`,
      "text/csv",
    );
  };

  const handleExportClients = () => {
    const clients = storage.getClients();
    const headers = [
      "Name",
      "PAN",
      "Head of Income",
      "Business Name",
      "Category",
      "Tax Year",
      "Due Date",
      "Mobile",
      "Email",
    ];
    const rows = clients.map((c) => ({
      Name: c.name,
      PAN: c.pan,
      "Head of Income": getHeadOfIncome(c as any),
      "Business Name": c.businessName || "-",
      Category: c.clientCategory,
      "Tax Year": c.taxYear,
      "Due Date": c.dueDate,
      Mobile: c.mobile,
      Email: c.email || "-",
    })) as Record<string, unknown>[];
    downloadBlob(
      toCsvRows(headers, rows),
      `TaxCore_Clients_${getDateStr()}.csv`,
      "text/csv",
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
      "New Value",
    ];
    const rows = logs.map((a) => ({
      Timestamp: new Date(a.timestamp).toLocaleString("en-IN"),
      User: a.userName,
      Action: a.action,
      Client: a.clientName,
      "Field Changed": a.fieldChanged,
      "Old Value": a.oldValue,
      "New Value": a.newValue,
    })) as Record<string, unknown>[];
    downloadBlob(
      toCsvRows(headers, rows),
      `TaxCore_AuditLog_${getDateStr()}.csv`,
      "text/csv",
    );
  };

  const work = storage.getWork();
  const stats = {
    clients: storage.getClients().length,
    work: work.length,
    docs: storage.getDocuments().length,
    billing: storage.getBilling().length,
    audit: storage.getAuditLogs().length,
    itrFiled: work.filter(
      (w) =>
        w.filingStatus === "E-Verified" ||
        w.filingStatus === "Pending for E-verification",
    ).length,
    pendingWork: work.filter(
      (w) => w.status === "Pending" || w.status === "In Progress",
    ).length,
  };

  const exportOptions = [
    {
      id: "full",
      title: "Full Export (All Data)",
      description:
        "Dashboard summary + Client Master (head-wise grouped) + Work Processing + Document Inward + Billing + Audit Log",
      icon: FileSpreadsheet,
      color: "var(--theme-primary, #6B1A2B)",
      bg: "rgba(107,26,43,0.05)",
      border: "rgba(107,26,43,0.2)",
      action: handleExportExcel,
      label: "Export All to CSV",
      badge: `${stats.clients + stats.work + stats.docs + stats.billing} records`,
    },
    {
      id: "itr-filed",
      title: "ITR Filed Report",
      description:
        "Clients with E-Verified or Pending for E-verification status — with ITR form, return type, ack number",
      icon: Download,
      color: "#16A34A",
      bg: "rgba(22,163,74,0.05)",
      border: "rgba(22,163,74,0.2)",
      action: handleExportITRFiled,
      label: "Export ITR Filed",
      badge: `${stats.itrFiled} filed`,
    },
    {
      id: "pending-work",
      title: "Pending Work Report",
      description:
        "Clients with Pending or In Progress work status — with due date, head of income, ITR form",
      icon: Download,
      color: "#D97706",
      bg: "rgba(217,119,6,0.05)",
      border: "rgba(217,119,6,0.2)",
      action: handleExportPendingWork,
      label: "Export Pending Work",
      badge: `${stats.pendingWork} pending`,
    },
    {
      id: "clients",
      title: "Client Master",
      description:
        "All client details including head of income, business name, tax year, due date",
      icon: Download,
      color: "#2563EB",
      bg: "rgba(37,99,235,0.05)",
      border: "rgba(37,99,235,0.2)",
      action: handleExportClients,
      label: "Export Clients",
      badge: `${stats.clients} clients`,
    },
    {
      id: "audit",
      title: "Audit Log",
      description:
        "Full activity trail: user actions, field changes, timestamps",
      icon: Download,
      color: "#7C3AED",
      bg: "rgba(124,58,237,0.05)",
      border: "rgba(124,58,237,0.2)",
      action: handleExportAudit,
      label: "Export Audit Log",
      badge: `${stats.audit} entries`,
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2
          className="text-lg font-semibold mb-1"
          style={{ color: "var(--theme-primary, #6B1A2B)" }}
        >
          Export Data
        </h2>
        <p className="text-sm text-gray-500">
          Download your TaxCore data as CSV files. Full export includes
          head-of-income grouped sheets.
        </p>
      </div>

      <div className="space-y-3">
        {exportOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              className="rounded-lg border p-4 flex items-center justify-between gap-4"
              style={{ background: opt.bg, borderColor: opt.border }}
              data-ocid={`export.${opt.id}.panel`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${opt.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: opt.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: opt.color }}
                    >
                      {opt.title}
                    </p>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: `${opt.color}18`, color: opt.color }}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </div>
              <Button
                onClick={opt.action}
                size="sm"
                className="flex-shrink-0 text-white"
                style={{ background: opt.color }}
                data-ocid={`export.${opt.id}.button`}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                {opt.label}
              </Button>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-lg border p-3 text-xs text-gray-500"
        style={{ background: "#f9f7f4", borderColor: "rgba(107,26,43,0.1)" }}
      >
        <p className="font-medium text-gray-700 mb-1">Export Notes:</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>Files download as CSV (opens in Excel, Google Sheets)</li>
          <li>
            Full export groups Client Master by Head of Income in separate
            sections
          </li>
          <li>ITR Filed = E-Verified + Pending for E-verification</li>
          <li>File name includes today\u2019s date for easy reference</li>
        </ul>
      </div>
    </div>
  );
}

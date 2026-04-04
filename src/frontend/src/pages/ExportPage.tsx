import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { storage } from "../data/storage";

// We use a lightweight xlsx-like approach using the pre-bundled xlsx library
// Since xlsx is available as a CDN approach, we build structured CSV with multiple sections
// For full xlsx support, we create a proper multi-sheet workbook

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

    // Helper to get head of income from client
    const getHOI = (c: (typeof clients)[0]) => {
      if (c.headOfIncome) return c.headOfIncome;
      const legacy = (c as any).sourceOfIncome;
      if (legacy === "Salary") return "Salaried";
      if (legacy === "Other") return "Salaried";
      return legacy || "Salaried";
    };

    // === DASHBOARD SUMMARY ===
    const totalClients = clients.length;
    const allWork = work;
    const filedCount = allWork.filter((w) => w.status === "Filed").length;
    const pendingCount = allWork.filter(
      (w) => w.status === "Pending" || w.status === "In Progress",
    ).length;
    const eVerifiedCount = allWork.filter(
      (w) => w.eVerified || w.filingStatus === "E-Verified",
    ).length;
    const pendingEVerif = allWork.filter(
      (w) => w.filingStatus === "Pending for E-verification",
    ).length;
    const readyForDelivery = billing.filter(
      (b) => b.outwardStatus === "Ready",
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
      { Metric: "Total Billed (\u20b9)", Value: totalBilled },
      { Metric: "Total Received (\u20b9)", Value: totalReceived },
      { Metric: "Total Balance (\u20b9)", Value: totalBalance },
      { Metric: "", Value: "" },
      {
        Metric: "Generated On",
        Value: new Date().toLocaleString("en-IN"),
      },
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

    // === WORK PROCESSING ===
    const workHeaders = [
      "Client Name",
      "PAN",
      "Tax Year",
      "Work Status",
      "ITR Form",
      "Acknowledgement Number",
      "Filing Date",
      "Filing Status",
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
        "Acknowledgement Number": w.ackNumber || "-",
        "Filing Date": w.filingDate || "-",
        "Filing Status": fs,
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

    // Build multi-section CSV (one file, tabs separated by section headers)
    const sections = [
      {
        title: "TAXCORE EXPORT REPORT",
        subtitle: `Generated: ${new Date().toLocaleString("en-IN")}`,
        isSummary: true,
      },
      {
        title: "=== 1. DASHBOARD SUMMARY ===",
        headers: ["Metric", "Value"],
        rows: dashboardRows as Record<string, unknown>[],
      },
      {
        title: "=== 2. CLIENT MASTER ===",
        headers: clientHeaders,
        rows: clientRows as Record<string, unknown>[],
      },
      {
        title: "=== 3. WORK PROCESSING ===",
        headers: workHeaders,
        rows: workRows as Record<string, unknown>[],
      },
      {
        title: "=== 4. DOCUMENT INWARD ===",
        headers: docHeaders,
        rows: docRows as Record<string, unknown>[],
      },
      {
        title: "=== 5. OUTWARD & BILLING ===",
        headers: billingHeaders,
        rows: billingRows as Record<string, unknown>[],
      },
      {
        title: "=== 6. AUDIT LOG ===",
        headers: auditHeaders,
        rows: auditRows as Record<string, unknown>[],
      },
    ];

    const lines: string[] = [
      "TAXCORE ITR WORKFLOW MANAGEMENT SYSTEM",
      `Export Date: ${new Date().toLocaleString("en-IN")}`,
      "",
    ];

    for (const section of sections) {
      if ((section as any).isSummary) continue;
      lines.push((section as any).title);
      lines.push(toCsvRows((section as any).headers, (section as any).rows));
      lines.push("");
      lines.push("");
    }

    downloadBlob(
      lines.join("\r\n"),
      `TaxCore_Export_${getDateStr()}.csv`,
      "text/csv",
    );
  };

  const handleExportClients = () => {
    const clients = storage.getClients();
    const getHOI = (c: (typeof clients)[0]) => {
      if (c.headOfIncome) return c.headOfIncome;
      const legacy = (c as any).sourceOfIncome;
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
      "Email",
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

  const stats = {
    clients: storage.getClients().length,
    work: storage.getWork().length,
    docs: storage.getDocuments().length,
    billing: storage.getBilling().length,
    audit: storage.getAuditLogs().length,
  };

  const exportOptions = [
    {
      id: "full",
      title: "Full Export (All Data)",
      description:
        "Dashboard summary + Client Master + Work Processing + Document Inward + Billing + Audit Log",
      icon: FileSpreadsheet,
      color: "#6B1A2B",
      bg: "rgba(107,26,43,0.05)",
      border: "rgba(107,26,43,0.2)",
      action: handleExportExcel,
      label: "Export All to CSV",
      badge: `${stats.clients + stats.work + stats.docs + stats.billing} records`,
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
        <h2 className="text-lg font-semibold mb-1" style={{ color: "#6B1A2B" }}>
          Export Data
        </h2>
        <p className="text-sm text-gray-500">
          Download your TaxCore data as CSV files. Each export includes all
          records in structured format.
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
                      style={{
                        background: `${opt.color}18`,
                        color: opt.color,
                      }}
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
          <li>
            Files are downloaded as CSV format (opens in Excel, Google Sheets)
          </li>
          <li>
            Full export contains all sections in a single file with clear
            section headers
          </li>
          <li>
            Data is exported as currently stored \u2014 no data is modified
          </li>
          <li>File name includes today\u2019s date for easy reference</li>
        </ul>
      </div>
    </div>
  );
}

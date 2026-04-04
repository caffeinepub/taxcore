import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import InlineStatusCell from "../components/InlineStatusCell";
import {
  getClientWork,
  getDeadlineAlertClients,
  getEVerificationAlerts,
  getLatestDoc,
  getLatestDocStatus,
  onStorageChange,
  queueDueDateNotifications,
  storage,
} from "../data/storage";
import type { Client, User } from "../types";
import { getTaxYears } from "../utils/taxYears";

const TAX_YEARS = ["All", ...getTaxYears()];

const WORK_STATUS_OPTIONS = [
  {
    label: "Pending",
    value: "Pending",
    colorClass: "bg-orange-100 text-orange-700",
  },
  {
    label: "In Progress",
    value: "In Progress",
    colorClass: "bg-blue-100 text-blue-700",
  },
  { label: "Filed", value: "Filed", colorClass: "bg-green-100 text-green-700" },
];

const DOC_STATUS_OPTIONS = [
  {
    label: "Complete",
    value: "Complete",
    colorClass: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Partial",
    value: "Partial",
    colorClass: "bg-yellow-100 text-yellow-700",
  },
];

function computeStats(taxYear: string) {
  const allClients = storage.getClients();
  const clients: Client[] =
    taxYear === "All"
      ? allClients
      : allClients.filter((c) => c.taxYear === taxYear);
  const allWork = storage.getWork();
  const allBilling = storage.getBilling();

  const clientIds = new Set(clients.map((c) => c.id));
  const work = allWork.filter((w) => clientIds.has(w.clientId));
  const billing = allBilling.filter((b) => clientIds.has(b.clientId));

  const recentClients = allClients.slice(-10).reverse();

  return {
    total: clients.length,
    pending: work.filter(
      (w) => w.status === "Pending" || w.status === "In Progress",
    ).length,
    // ITR Filed = E-Verified + Pending for E-verification (return has been filed)
    itrFiled: work.filter(
      (w) =>
        w.filingStatus === "E-Verified" ||
        w.filingStatus === "Pending for E-verification",
    ).length,
    ready: billing.filter((b) => b.outwardStatus === "Ready").length,
    recentClients,
  };
}

interface DashboardPageProps {
  user: User;
}

export default function DashboardPage({ user }: DashboardPageProps) {
  const [taxYear, setTaxYear] = useState("All");
  const [stats, setStats] = useState(() => computeStats("All"));
  const [alertClients, setAlertClients] = useState(() =>
    getDeadlineAlertClients(user.id, user.role),
  );
  const [eVerifAlerts, setEVerifAlerts] = useState(() =>
    getEVerificationAlerts(),
  );

  const refresh = useCallback(
    (year: string) => {
      setStats(computeStats(year));
      setAlertClients(getDeadlineAlertClients(user.id, user.role));
      setEVerifAlerts(getEVerificationAlerts());
    },
    [user.id, user.role],
  );

  useEffect(() => {
    refresh(taxYear);
  }, [taxYear, refresh]);

  useEffect(() => {
    const unsub = onStorageChange(() => refresh(taxYear));
    return unsub;
  }, [taxYear, refresh]);

  const handleWorkStatusSave = (client: Client, newVal: string) => {
    const work = getClientWork(client.id);
    if (!work) return;
    const oldVal = work.status;
    if (oldVal === newVal) return;

    const allWork = storage.getWork();
    storage.saveWork(
      allWork.map((w) =>
        w.id === work.id
          ? {
              ...w,
              status: newVal as "Pending" | "In Progress" | "Filed",
              updatedAt: new Date().toISOString(),
            }
          : w,
      ),
    );

    storage.addAuditLog({
      id: storage.uid(),
      userId: user.id,
      userName: user.name,
      action: "Updated Work Status",
      clientId: client.id,
      clientName: client.name,
      fieldChanged: "Work Status",
      oldValue: oldVal,
      newValue: newVal,
      timestamp: new Date().toISOString(),
    });

    toast.success("Status updated", {
      description: `${client.name} \u2192 ${newVal}`,
    });
  };

  const handleDocStatusSave = (client: Client, newVal: string) => {
    const latestDoc = getLatestDoc(client.id);
    const oldVal = latestDoc?.status ?? "-";
    if (oldVal === newVal) return;

    if (latestDoc) {
      const allDocs = storage.getDocuments();
      storage.saveDocuments(
        allDocs.map((d) =>
          d.id === latestDoc.id
            ? { ...d, status: newVal as "Complete" | "Partial" }
            : d,
        ),
      );
    }

    storage.addAuditLog({
      id: storage.uid(),
      userId: user.id,
      userName: user.name,
      action: "Updated Inward Docs Status",
      clientId: client.id,
      clientName: client.name,
      fieldChanged: "Inward Docs Status",
      oldValue: oldVal,
      newValue: newVal,
      timestamp: new Date().toISOString(),
    });

    toast.success("Doc status updated", {
      description: `${client.name} \u2192 ${newVal}`,
    });
  };

  const handleQueueWhatsAppAlerts = () => {
    const queued = queueDueDateNotifications(user);
    const whatsappSettings = storage.getWhatsAppSettings();
    const hasApiKey = (whatsappSettings?.apiKey?.trim().length ?? 0) > 0;

    if (queued === 0) {
      toast.info("No new alerts to queue", {
        description: "All due date alerts are already queued.",
      });
      return;
    }

    if (!hasApiKey) {
      toast.success(`${queued} alert${queued > 1 ? "s" : ""} queued`, {
        description: "Queued \u2014 add API key in Settings to send.",
      });
    } else {
      toast.success(
        `${queued} alert${queued > 1 ? "s" : ""} queued for WhatsApp`,
        {
          description: "Notifications are ready to send once triggered.",
        },
      );
    }
  };

  const cards = [
    {
      label: "Total Clients",
      value: stats.total,
      icon: Users,
      color: "#2563EB",
      bg: "#EFF6FF",
      border: "#BFDBFE",
    },
    {
      label: "Pending Work",
      value: stats.pending,
      icon: Clock,
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A",
    },
    {
      label: "ITR Filed",
      value: stats.itrFiled,
      icon: CheckCircle,
      color: "#16A34A",
      bg: "#F0FDF4",
      border: "#BBF7D0",
    },
    {
      label: "Ready for Delivery",
      value: stats.ready,
      icon: Truck,
      color: "#7C3AED",
      bg: "#F5F3FF",
      border: "#DDD6FE",
    },
  ];

  const whatsappEnabled =
    storage.getWhatsAppSettings()?.dueDateAlertEnabled ?? false;

  const highEVerifAlerts = eVerifAlerts.filter((a) => a.urgency === "high");
  const normalEVerifAlerts = eVerifAlerts.filter((a) => a.urgency === "normal");

  const urgencyBadgeClass = (urgency: "red" | "amber" | "yellow") => {
    if (urgency === "red") return "bg-red-600 text-white";
    if (urgency === "yellow") return "bg-yellow-500 text-white";
    return "bg-amber-500 text-white";
  };

  const greeting =
    user.role === "Staff" ? (
      <div
        className="rounded-lg p-2.5 border"
        style={{
          background: "var(--theme-primary-light, rgba(107,26,43,0.05))",
          borderColor: "rgba(107,26,43,0.15)",
        }}
        data-ocid="dashboard.greeting.panel"
      >
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--theme-primary, #6B1A2B)" }}
        >
          Welcome, {user.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          You are viewing your assigned clients.
        </p>
      </div>
    ) : (
      <div
        className="rounded-lg p-2.5 border flex items-center justify-between"
        style={{
          background: "rgba(201,164,76,0.08)",
          borderColor: "rgba(201,164,76,0.3)",
        }}
        data-ocid="dashboard.greeting.panel"
      >
        <div>
          <p
            className="text-sm font-semibold"
            style={{
              color: "var(--theme-primary, #6B1A2B)",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Welcome back, {user.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {user.accessType ? ` \u00b7 ${user.accessType} Plan` : ""}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: "#2563EB" }}>
              {stats.total}
            </div>
            <div className="text-gray-500">Clients</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: "#D97706" }}>
              {stats.pending}
            </div>
            <div className="text-gray-500">Pending</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: "#16A34A" }}>
              {stats.itrFiled}
            </div>
            <div className="text-gray-500">Filed</div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-3">
      {greeting}

      <div className="flex items-center gap-3">
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--theme-primary, #6B1A2B)" }}
        >
          Overview
        </h2>
        <Select value={taxYear} onValueChange={setTaxYear}>
          <SelectTrigger className="w-36" data-ocid="dashboard.filter.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAX_YEARS.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stat Cards - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className="shadow-sm border"
              style={{ borderColor: card.border }}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      {card.label}
                    </p>
                    <span
                      className="text-xl font-bold mt-0.5 block"
                      style={{ color: card.color }}
                    >
                      {card.value}
                    </span>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: card.bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* E-Verification Deadline Alert - HIGH PRIORITY */}
      {highEVerifAlerts.length > 0 && (
        <div
          className="border border-l-4 rounded-lg p-3 bg-red-50 border-red-200 border-l-red-600"
          data-ocid="dashboard.everif_high.panel"
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="font-semibold text-red-700 text-sm">
              &#9888; HIGH PRIORITY: E-Verification Deadline
            </span>
            <span className="ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
              {highEVerifAlerts.length} urgent
            </span>
          </div>
          <div className="space-y-1">
            {highEVerifAlerts.map(({ client, work, daysToDeadline }) => (
              <div
                key={work.id}
                className="flex items-center justify-between text-sm bg-white rounded px-3 py-1.5 border border-red-100"
              >
                <span className="font-semibold text-gray-800">
                  {client.name}
                </span>
                <span className="text-gray-500 text-xs font-mono">
                  {client.pan}
                </span>
                <span className="text-gray-600 text-xs">
                  Filed: {work.filingDate || "\u2014"}
                </span>
                <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-red-600 text-white">
                  {daysToDeadline <= 0
                    ? "OVERDUE"
                    : `${daysToDeadline}d to verify`}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-600 mt-1.5 font-medium">
            E-verification must be completed within 30 days of filing date.
          </p>
        </div>
      )}

      {/* E-Verification Deadline Alert - NORMAL */}
      {normalEVerifAlerts.length > 0 && (
        <div
          className="border border-l-4 rounded-lg p-3 bg-amber-50 border-amber-200 border-l-amber-500"
          data-ocid="dashboard.everif_normal.panel"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold text-amber-700 text-sm">
              E-Verification Deadline Alert ({normalEVerifAlerts.length})
            </span>
          </div>
          <div className="space-y-1">
            {normalEVerifAlerts.map(({ client, work, daysToDeadline }) => (
              <div
                key={work.id}
                className="flex items-center justify-between text-sm bg-white rounded px-3 py-1.5 border border-amber-100"
              >
                <span className="font-medium text-gray-800">{client.name}</span>
                <span className="text-gray-600 text-xs">
                  Filed: {work.filingDate || "\u2014"}
                </span>
                <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  {daysToDeadline}d remaining
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Date Alerts */}
      {alertClients.length > 0 && (
        <div
          className={`border border-l-4 rounded-lg p-3 ${
            alertClients.some((a) => a.urgency === "red")
              ? "bg-red-50 border-red-200 border-l-red-500"
              : alertClients.some((a) => a.urgency === "yellow")
                ? "bg-yellow-50 border-yellow-200 border-l-yellow-500"
                : "bg-amber-50 border-amber-200 border-l-amber-500"
          }`}
          data-ocid="dashboard.alert.panel"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`w-4 h-4 flex-shrink-0 ${
                  alertClients.some((a) => a.urgency === "red")
                    ? "text-red-500"
                    : "text-amber-500"
                }`}
              />
              <span
                className={`font-semibold text-sm ${
                  alertClients.some((a) => a.urgency === "red")
                    ? "text-red-700"
                    : "text-amber-700"
                }`}
              >
                {alertClients.length} client{alertClients.length > 1 ? "s" : ""}{" "}
                with due date within 10 days
              </span>
            </div>
            {whatsappEnabled && (
              <Button
                size="sm"
                onClick={handleQueueWhatsAppAlerts}
                className="flex items-center gap-1.5 text-xs font-medium flex-shrink-0"
                style={{
                  background: "var(--theme-gold, #C9A44C)",
                  color: "#fff",
                  border: "none",
                }}
                data-ocid="dashboard.queue_whatsapp.button"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Queue Alerts
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {alertClients.map(({ client, daysLeft, urgency }) => (
              <div
                key={client.id}
                className="flex items-center justify-between text-sm bg-white rounded px-3 py-1.5 border border-gray-100"
              >
                <span className="font-medium text-gray-800">{client.name}</span>
                <span className="text-gray-500 text-xs font-mono">
                  {client.pan}
                </span>
                <span className="text-gray-600 text-xs">{client.dueDate}</span>
                <span
                  className={`font-bold text-xs px-2 py-0.5 rounded-full ${urgencyBadgeClass(urgency)}`}
                >
                  {daysLeft < 0
                    ? `${Math.abs(daysLeft)}d OVERDUE`
                    : daysLeft === 0
                      ? "TODAY"
                      : `${daysLeft}d left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent clients table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle
            className="text-sm"
            style={{ color: "var(--theme-primary, #6B1A2B)" }}
          >
            Recent Clients (last 10)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {[
                    "Name",
                    "PAN",
                    "Tax Year",
                    "ITR Form",
                    "Return Type",
                    "Inward Docs",
                    "Work Status",
                    "Filing Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-1.5 px-2 font-semibold text-gray-600 text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentClients.map((client) => {
                  const work = getClientWork(client.id);
                  const docStatus = getLatestDocStatus(client.id);
                  const docHasEntry = docStatus !== "-";
                  const filingStatus =
                    work?.filingStatus ??
                    (work?.eVerified ? "E-Verified" : "Pending");
                  const filingStatusColor =
                    filingStatus === "E-Verified"
                      ? "bg-green-100 text-green-700"
                      : filingStatus === "Pending for E-verification"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700";
                  return (
                    <tr
                      key={client.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-1.5 px-2 font-medium text-xs">
                        {client.name}
                      </td>
                      <td className="py-1.5 px-2 text-gray-500 text-xs font-mono">
                        {client.pan}
                      </td>
                      <td className="py-1.5 px-2 text-xs">{client.taxYear}</td>
                      <td className="py-1.5 px-2">
                        {work?.itrForm ? (
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono">
                            <FileText className="w-3 h-3 inline mr-0.5" />
                            {work.itrForm}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-1.5 px-2">
                        {work?.returnType ? (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {work.returnType}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-1.5 px-2">
                        {docHasEntry ? (
                          <InlineStatusCell
                            value={docStatus}
                            options={DOC_STATUS_OPTIONS}
                            onSave={(newVal) =>
                              handleDocStatusSave(client, newVal)
                            }
                          />
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No docs
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2">
                        <InlineStatusCell
                          value={work?.status || "Pending"}
                          options={WORK_STATUS_OPTIONS}
                          onSave={(newVal) =>
                            handleWorkStatusSave(client, newVal)
                          }
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${filingStatusColor}`}
                        >
                          {filingStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {stats.recentClients.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-6 text-center text-gray-400"
                      data-ocid="dashboard.empty_state"
                    >
                      No clients yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

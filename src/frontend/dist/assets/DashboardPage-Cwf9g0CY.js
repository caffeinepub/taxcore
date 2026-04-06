import { c as createLucideIcon, r as reactExports, g as getDeadlineAlertClients, b as getEVerificationAlerts, s as storage, o as onStorageChange, U as Users, C as CircleCheckBig, S as ShieldCheck, j as jsxRuntimeExports, R as RefreshCw, d as ShieldAlert, B as Button, e as getClientWork, f as getLatestDocStatus, h as refreshFromCanister, u as ue, i as getLatestDoc, q as queueDueDateNotifications } from "./index-Bbpuaoqh.js";
import { C as Card, a as CardContent, M as MessageSquare, b as CardHeader, c as CardTitle } from "./card-CyFhcCUF.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Dvak3eOm.js";
import { T as TriangleAlert, I as InlineStatusCell } from "./InlineStatusCell-R6nftjSz.js";
import { g as getTaxYears } from "./taxYears-JUInSDi_.js";
import "./index-D-Dd41sT.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
];
const Clock = createLucideIcon("clock", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m14.5 12.5-5 5", key: "b62r18" }],
  ["path", { d: "m9.5 12.5 5 5", key: "1rk7el" }]
];
const FileX = createLucideIcon("file-x", __iconNode);
const TAX_YEARS = ["All", ...getTaxYears()];
const WORK_STATUS_OPTIONS = [
  {
    label: "Pending",
    value: "Pending",
    colorClass: "bg-orange-100 text-orange-700"
  },
  {
    label: "In Progress",
    value: "In Progress",
    colorClass: "bg-blue-100 text-blue-700"
  },
  {
    label: "Completed",
    value: "Completed",
    colorClass: "bg-green-100 text-green-700"
  }
];
const DOC_STATUS_OPTIONS = [
  {
    label: "Complete",
    value: "Complete",
    colorClass: "bg-emerald-100 text-emerald-700"
  },
  {
    label: "Partial",
    value: "Partial",
    colorClass: "bg-yellow-100 text-yellow-700"
  }
];
function computeStats(taxYear, userId, userRole) {
  let allClients = storage.getClients();
  if (userRole === "Staff") {
    allClients = allClients.filter((c) => c.createdBy === userId);
  }
  const clients = taxYear === "All" ? allClients : allClients.filter((c) => c.taxYear === taxYear);
  const allWork = storage.getWork();
  const allBilling = storage.getBilling();
  const clientIds = new Set(clients.map((c) => c.id));
  const work = allWork.filter((w) => clientIds.has(w.clientId));
  const billing = allBilling.filter((b) => clientIds.has(b.clientId));
  const recentClients = allClients.slice(-10).reverse();
  const pending = work.filter(
    (w) => w.status === "Pending" || w.status === "In Progress"
  ).length;
  const pendingITR = work.filter(
    (w) => !w.filingStatus || w.filingStatus === "Pending"
  ).length;
  const itrFiled = work.filter(
    (w) => w.filingStatus === "E-Verified" || w.filingStatus === "Pending for E-verification"
  ).length;
  const pendingForVerification = work.filter(
    (w) => w.filingStatus === "Pending for E-verification"
  ).length;
  return {
    total: clients.length,
    pending,
    pendingITR,
    itrFiled,
    pendingForVerification,
    ready: billing.filter((b) => b.outwardStatus === "Ready").length,
    recentClients
  };
}
function DashboardPage({ user }) {
  var _a;
  const [taxYear, setTaxYear] = reactExports.useState("All");
  const [stats, setStats] = reactExports.useState(
    () => computeStats("All", user.id, user.role)
  );
  const [alertClients, setAlertClients] = reactExports.useState(
    () => getDeadlineAlertClients(user.id, user.role)
  );
  const [eVerifAlerts, setEVerifAlerts] = reactExports.useState(
    () => getEVerificationAlerts()
  );
  const [isRefreshing, setIsRefreshing] = reactExports.useState(false);
  const [cardsLoading, setCardsLoading] = reactExports.useState(
    storage.getClients().length === 0 && storage.getWork().length === 0
  );
  const refresh = reactExports.useCallback(
    (year) => {
      setStats(computeStats(year, user.id, user.role));
      setAlertClients(getDeadlineAlertClients(user.id, user.role));
      setEVerifAlerts(getEVerificationAlerts());
    },
    [user.id, user.role]
  );
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFromCanister();
      refresh(taxYear);
    } finally {
      setIsRefreshing(false);
    }
  };
  reactExports.useEffect(() => {
    refresh(taxYear);
  }, [taxYear, refresh]);
  reactExports.useEffect(() => {
    const unsub = onStorageChange(() => {
      setCardsLoading(false);
      refresh(taxYear);
    });
    if (storage.getClients().length > 0 || storage.getWork().length > 0) {
      setCardsLoading(false);
    }
    return unsub;
  }, [taxYear, refresh]);
  const handleWorkStatusSave = (client, newVal) => {
    const work = getClientWork(client.id);
    if (!work) return;
    const oldVal = work.status;
    if (oldVal === newVal) return;
    const allWork = storage.getWork();
    storage.saveWork(
      allWork.map(
        (w) => w.id === work.id ? {
          ...w,
          status: newVal,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        } : w
      )
    );
    storage.addAuditLog({
      id: storage.uid(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "Updated Work Status",
      clientId: client.id,
      clientName: client.name,
      fieldChanged: "Work Status",
      oldValue: oldVal,
      newValue: newVal,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    ue.success("Status updated", {
      description: `${client.name} → ${newVal}`
    });
  };
  const handleDocStatusSave = (client, newVal) => {
    const latestDoc = getLatestDoc(client.id);
    const oldVal = (latestDoc == null ? void 0 : latestDoc.status) ?? "-";
    if (oldVal === newVal) return;
    if (latestDoc) {
      const allDocs = storage.getDocuments();
      storage.saveDocuments(
        allDocs.map(
          (d) => d.id === latestDoc.id ? { ...d, status: newVal } : d
        )
      );
    }
    storage.addAuditLog({
      id: storage.uid(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "Updated Inward Docs Status",
      clientId: client.id,
      clientName: client.name,
      fieldChanged: "Inward Docs Status",
      oldValue: oldVal,
      newValue: newVal,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    ue.success("Doc status updated", {
      description: `${client.name} → ${newVal}`
    });
  };
  const handleQueueWhatsAppAlerts = () => {
    var _a2;
    const queued = queueDueDateNotifications();
    const whatsappSettings = storage.getWhatsAppSettings();
    const hasApiKey = (((_a2 = whatsappSettings == null ? void 0 : whatsappSettings.apiKey) == null ? void 0 : _a2.trim().length) ?? 0) > 0;
    if (queued === 0) {
      ue.info("No new alerts to queue", {
        description: "All due date alerts are already queued."
      });
      return;
    }
    if (!hasApiKey) {
      ue.success(`${queued} alert${queued > 1 ? "s" : ""} queued`, {
        description: "Queued — add API key in Settings to send."
      });
    } else {
      ue.success(
        `${queued} alert${queued > 1 ? "s" : ""} queued for WhatsApp`,
        {
          description: "Notifications are ready to send once triggered."
        }
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
      border: "#BFDBFE"
    },
    {
      label: "Pending Work",
      value: stats.pending,
      icon: Clock,
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A"
    },
    {
      label: "Pending ITR Filed",
      value: stats.pendingITR,
      icon: FileX,
      color: "#EA580C",
      bg: "#FFF7ED",
      border: "#FED7AA"
    },
    {
      label: "Completed",
      value: stats.itrFiled,
      icon: CircleCheckBig,
      color: "#16A34A",
      bg: "#F0FDF4",
      border: "#BBF7D0"
    },
    {
      label: "Pending for Verification",
      value: stats.pendingForVerification,
      icon: ShieldCheck,
      color: "#4F46E5",
      bg: "#EEF2FF",
      border: "#C7D2FE"
    }
  ];
  const whatsappEnabled = ((_a = storage.getWhatsAppSettings()) == null ? void 0 : _a.dueDateAlertEnabled) ?? false;
  const highEVerifAlerts = eVerifAlerts.filter((a) => a.urgency === "high");
  const normalEVerifAlerts = eVerifAlerts.filter((a) => a.urgency === "normal");
  const urgencyBadgeClass = (urgency) => {
    if (urgency === "red") return "bg-red-600 text-white";
    if (urgency === "yellow") return "bg-yellow-500 text-white";
    return "bg-amber-500 text-white";
  };
  const greeting = user.role === "Staff" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-lg p-2.5 border",
      style: {
        background: "var(--theme-primary-light, rgba(107,26,43,0.05))",
        borderColor: "rgba(107,26,43,0.15)"
      },
      "data-ocid": "dashboard.greeting.panel",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "p",
          {
            className: "text-sm font-semibold",
            style: { color: "var(--theme-primary, #6B1A2B)" },
            children: [
              "Welcome, ",
              user.name
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "You are viewing your assigned clients." })
      ]
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-lg p-2.5 border flex items-center justify-between",
      style: {
        background: "rgba(201,164,76,0.08)",
        borderColor: "rgba(201,164,76,0.3)"
      },
      "data-ocid": "dashboard.greeting.panel",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "p",
            {
              className: "text-sm font-semibold",
              style: {
                color: "var(--theme-primary, #6B1A2B)",
                fontFamily: "'Playfair Display', Georgia, serif"
              },
              children: [
                "Welcome back, ",
                user.name
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [
            (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            }),
            user.accessType ? ` · ${user.accessType} Plan` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex items-center gap-4 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg", style: { color: "#2563EB" }, children: stats.total }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500", children: "Clients" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-8 bg-gray-200" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg", style: { color: "#D97706" }, children: stats.pending }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500", children: "Pending" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-8 bg-gray-200" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg", style: { color: "#16A34A" }, children: stats.itrFiled }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-500", children: "Completed" })
          ] })
        ] })
      ]
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    greeting,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h2",
        {
          className: "text-base font-semibold",
          style: { color: "var(--theme-primary, #6B1A2B)" },
          children: "Overview"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: taxYear, onValueChange: setTaxYear, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36", "data-ocid": "dashboard.filter.select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TAX_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleRefresh,
          disabled: isRefreshing,
          className: "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition",
          title: "Refresh from server",
          "data-ocid": "dashboard.refresh.button",
          children: [
            isRefreshing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin",
                style: {
                  borderColor: "var(--theme-primary, #6B1A2B)",
                  borderTopColor: "transparent"
                }
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 text-gray-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: isRefreshing ? "Refreshing…" : "Refresh" })
          ]
        }
      )
    ] }),
    cardsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid grid-cols-2 lg:grid-cols-5 gap-2.5",
        "data-ocid": "dashboard.loading_state",
        children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-lg border bg-white p-3 shadow-sm animate-pulse",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 bg-gray-200 rounded w-3/4 mb-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 bg-gray-200 rounded w-1/3" })
            ]
          },
          i
        ))
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-5 gap-2.5", children: cards.map((card) => {
      const Icon = card.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          className: "shadow-sm border",
          style: { borderColor: card.border },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 font-medium", children: card.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-xl font-bold mt-0.5 block",
                  style: { color: card.color },
                  children: card.value
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-8 h-8 rounded-lg flex items-center justify-center",
                style: { background: card.bg },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4", style: { color: card.color } })
              }
            )
          ] }) })
        },
        card.label
      );
    }) }),
    stats.pendingITR > stats.pending && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "border border-l-4 rounded-lg p-3 bg-amber-50 border-amber-300 border-l-amber-500",
        "data-ocid": "dashboard.consistency_alert.panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-600 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-amber-700 text-sm", children: "⚠ Data Inconsistency Alert" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mt-1.5", children: [
            "Pending ITR Filed (",
            stats.pendingITR,
            ") cannot exceed Pending Work (",
            stats.pending,
            "). Please review Work Processing records to ensure data accuracy."
          ] })
        ]
      }
    ),
    highEVerifAlerts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "border border-l-4 rounded-lg p-3 bg-red-50 border-red-200 border-l-red-600",
        "data-ocid": "dashboard.everif_high.panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-4 h-4 text-red-600 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-red-700 text-sm", children: "⚠ HIGH PRIORITY: E-Verification Deadline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold", children: [
              highEVerifAlerts.length,
              " urgent"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: highEVerifAlerts.map(({ client, work, daysToDeadline }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between text-sm bg-white rounded px-3 py-1.5 border border-red-100",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-800", children: client.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs font-mono", children: client.pan }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-600 text-xs", children: [
                  "Filed: ",
                  work.filingDate || "—"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-xs px-2 py-0.5 rounded-full bg-red-600 text-white", children: daysToDeadline <= 0 ? "OVERDUE" : `${daysToDeadline}d to verify` })
              ]
            },
            work.id
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-1.5 font-medium", children: "E-verification must be completed within 30 days of filing date." })
        ]
      }
    ),
    normalEVerifAlerts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "border border-l-4 rounded-lg p-3 bg-amber-50 border-amber-200 border-l-amber-500",
        "data-ocid": "dashboard.everif_normal.panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-4 h-4 text-amber-600 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-amber-700 text-sm", children: [
              "E-Verification Deadline Alert (",
              normalEVerifAlerts.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: normalEVerifAlerts.map(({ client, work, daysToDeadline }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between text-sm bg-white rounded px-3 py-1.5 border border-amber-100",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-800", children: client.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-600 text-xs", children: [
                  "Filed: ",
                  work.filingDate || "—"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white", children: [
                  daysToDeadline,
                  "d remaining"
                ] })
              ]
            },
            work.id
          )) })
        ]
      }
    ),
    alertClients.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `border border-l-4 rounded-lg p-3 ${alertClients.some((a) => a.urgency === "red") ? "bg-red-50 border-red-200 border-l-red-500" : alertClients.some((a) => a.urgency === "yellow") ? "bg-yellow-50 border-yellow-200 border-l-yellow-500" : "bg-amber-50 border-amber-200 border-l-amber-500"}`,
        "data-ocid": "dashboard.alert.panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TriangleAlert,
                {
                  className: `w-4 h-4 flex-shrink-0 ${alertClients.some((a) => a.urgency === "red") ? "text-red-500" : "text-amber-500"}`
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: `font-semibold text-sm ${alertClients.some((a) => a.urgency === "red") ? "text-red-700" : "text-amber-700"}`,
                  children: [
                    alertClients.length,
                    " client",
                    alertClients.length > 1 ? "s" : "",
                    " ",
                    "with due date within 10 days"
                  ]
                }
              )
            ] }),
            whatsappEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                onClick: handleQueueWhatsAppAlerts,
                className: "flex items-center gap-1.5 text-xs font-medium flex-shrink-0",
                style: {
                  background: "var(--theme-gold, #C9A44C)",
                  color: "#fff",
                  border: "none"
                },
                "data-ocid": "dashboard.queue_whatsapp.button",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-3.5 h-3.5" }),
                  "Queue Alerts"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: alertClients.map(({ client, daysLeft, urgency }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between text-sm bg-white rounded px-3 py-1.5 border border-gray-100",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-800", children: client.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500 text-xs font-mono", children: client.pan }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 text-xs", children: client.dueDate }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `font-bold text-xs px-2 py-0.5 rounded-full ${urgencyBadgeClass(urgency)}`,
                    children: daysLeft < 0 ? `${Math.abs(daysLeft)}d OVERDUE` : daysLeft === 0 ? "TODAY" : `${daysLeft}d left`
                  }
                )
              ]
            },
            client.id
          )) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2 pt-3 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardTitle,
        {
          className: "text-sm",
          style: { color: "var(--theme-primary, #6B1A2B)" },
          children: "Recent Clients (last 10)"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "px-3 pb-3 pt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: [
          "Name",
          "PAN",
          "Tax Year",
          "ITR Form",
          "Return Type",
          "Inward Docs",
          "Work Status",
          "Filing Status"
        ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "th",
          {
            className: "text-left py-1.5 px-2 font-semibold text-gray-600 text-xs",
            children: h
          },
          h
        )) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          stats.recentClients.map((client) => {
            const work = getClientWork(client.id);
            const docStatus = getLatestDocStatus(client.id);
            const docHasEntry = docStatus !== "-";
            const filingStatus = (work == null ? void 0 : work.filingStatus) ?? ((work == null ? void 0 : work.eVerified) ? "E-Verified" : "Pending");
            const filingStatusColor = filingStatus === "E-Verified" ? "bg-green-100 text-green-700" : filingStatus === "Pending for E-verification" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700";
            const workStatusDisplay = (work == null ? void 0 : work.status) === "Filed" ? "Completed" : (work == null ? void 0 : work.status) || "Pending";
            const workStatusOptions = WORK_STATUS_OPTIONS;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                className: "border-b last:border-0 hover:bg-gray-50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2 font-medium text-xs", children: client.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2 text-gray-500 text-xs font-mono", children: client.pan }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2 text-xs", children: client.taxYear }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2", children: (work == null ? void 0 : work.itrForm) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3 h-3 inline mr-0.5" }),
                    work.itrForm
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-300", children: "\\u2014" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2", children: (work == null ? void 0 : work.returnType) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600", children: work.returnType }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-300", children: "\\u2014" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2", children: docHasEntry ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    InlineStatusCell,
                    {
                      value: docStatus,
                      options: DOC_STATUS_OPTIONS,
                      onSave: (newVal) => handleDocStatusSave(client, newVal)
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 italic", children: "No docs" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    InlineStatusCell,
                    {
                      value: workStatusDisplay,
                      options: workStatusOptions,
                      onSave: (newVal) => handleWorkStatusSave(client, newVal)
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `px-1.5 py-0.5 rounded-full text-xs font-medium ${filingStatusColor}`,
                      children: filingStatus
                    }
                  ) })
                ]
              },
              client.id
            );
          }),
          stats.recentClients.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "td",
            {
              colSpan: 8,
              className: "py-6 text-center text-gray-400",
              "data-ocid": "dashboard.empty_state",
              children: "No clients yet"
            }
          ) })
        ] })
      ] }) }) })
    ] })
  ] });
}
export {
  DashboardPage as default
};

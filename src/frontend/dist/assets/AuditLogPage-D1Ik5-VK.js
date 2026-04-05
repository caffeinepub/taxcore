import { r as reactExports, s as storage, o as onStorageChange, j as jsxRuntimeExports } from "./index-DmhpSTE0.js";
function toLocalDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function exportToCSV(entries) {
  const header = [
    "Time",
    "Action By",
    "Role",
    "Client",
    "Field Changed",
    "Old Value",
    "New Value"
  ];
  const rows = entries.map((e) => [
    new Date(e.timestamp).toLocaleString("en-IN"),
    e.userName,
    e.userRole || "-",
    e.clientName,
    e.fieldChanged,
    e.oldValue || "-",
    e.newValue
  ]);
  const csv = [header, ...rows].map(
    (row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-log-${toLocalDateInputValue(/* @__PURE__ */ new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
function AuditLogPage({ user }) {
  const isOwner = user.role === "Owner";
  const allUsers = reactExports.useMemo(() => storage.getUsers(), []);
  const filterForOwner = (logs) => {
    if (!isOwner) return logs;
    return logs.filter((l) => {
      if (l.userId === user.id) return true;
      const actor = allUsers.find((u) => u.id === l.userId);
      if (actor && actor.role === "Staff") return true;
      return false;
    });
  };
  const [allLogs, setAllLogs] = reactExports.useState(() => {
    const logs = storage.getAuditLogs().slice().reverse();
    return filterForOwner(logs);
  });
  const today = toLocalDateInputValue(/* @__PURE__ */ new Date());
  const defaultFrom = toLocalDateInputValue(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)
  );
  const [fromDate, setFromDate] = reactExports.useState(defaultFrom);
  const [toDate, setToDate] = reactExports.useState(today);
  const [userFilter, setUserFilter] = reactExports.useState("All");
  reactExports.useEffect(() => {
    const unsub = onStorageChange(() => {
      const logs = storage.getAuditLogs().slice().reverse();
      const currentUsers = storage.getUsers();
      if (!isOwner) {
        setAllLogs(logs);
        return;
      }
      setAllLogs(
        logs.filter((l) => {
          if (l.userId === user.id) return true;
          const actor = currentUsers.find((u) => u.id === l.userId);
          return (actor == null ? void 0 : actor.role) === "Staff";
        })
      );
    });
    return unsub;
  }, [isOwner, user.id]);
  const userNames = reactExports.useMemo(() => {
    const names = [...new Set(allLogs.map((l) => l.userName))];
    return ["All", ...names.sort()];
  }, [allLogs]);
  const filteredLogs = reactExports.useMemo(() => {
    return allLogs.filter((entry) => {
      const ts = new Date(entry.timestamp);
      const from = fromDate ? /* @__PURE__ */ new Date(`${fromDate}T00:00:00`) : null;
      const to = toDate ? /* @__PURE__ */ new Date(`${toDate}T23:59:59`) : null;
      if (from && ts < from) return false;
      if (to && ts > to) return false;
      if (userFilter !== "All" && entry.userName !== userFilter) return false;
      return true;
    });
  }, [allLogs, fromDate, toDate, userFilter]);
  const getRoleBadge = (entry) => {
    if (entry.userRole) return entry.userRole;
    const actor = allUsers.find((u) => u.id === entry.userId);
    return (actor == null ? void 0 : actor.role) || "";
  };
  const getRoleBadgeStyle = (role) => {
    if (role === "Owner") return { background: "#f3e6ec", color: "#7a1f2b" };
    if (role === "Staff") return { background: "#e6f0fa", color: "#1a4a7a" };
    return { background: "#f5f5f5", color: "#555" };
  };
  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return iso;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "audit-from",
              className: "text-xs font-semibold text-gray-500 uppercase tracking-wide",
              children: "From"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "audit-from",
              type: "date",
              value: fromDate,
              max: toDate || today,
              onChange: (e) => setFromDate(e.target.value),
              className: "border rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1",
              style: { borderColor: "#c9a44c", minWidth: 130 }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "audit-to",
              className: "text-xs font-semibold text-gray-500 uppercase tracking-wide",
              children: "To"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "audit-to",
              type: "date",
              value: toDate,
              min: fromDate,
              max: today,
              onChange: (e) => setToDate(e.target.value),
              className: "border rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1",
              style: { borderColor: "#c9a44c", minWidth: 130 }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "label",
          {
            htmlFor: "audit-user",
            className: "text-xs font-semibold text-gray-500 uppercase tracking-wide",
            children: "Filter by User"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            id: "audit-user",
            value: userFilter,
            onChange: (e) => setUserFilter(e.target.value),
            className: "border rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none",
            style: { borderColor: "#c9a44c", minWidth: 150 },
            children: userNames.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n, children: n }, n))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400 self-end pb-1", children: [
        filteredLogs.length,
        " ",
        filteredLogs.length === 1 ? "entry" : "entries"
      ] }),
      filteredLogs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => exportToCSV(filteredLogs),
          className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold border transition-colors",
          style: {
            borderColor: "#c9a44c",
            color: "#7a1f2b",
            background: "#fdf8f0"
          },
          "data-ocid": "audit-log.export_csv_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "svg",
              {
                width: "14",
                height: "14",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                "aria-hidden": "true",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("title", { children: "Download" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points: "7 10 12 15 17 10" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
                ]
              }
            ),
            "Export CSV"
          ]
        }
      ),
      allLogs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            if (confirm("Clear all audit log entries? This cannot be undone.")) {
              storage.clearAuditLogs();
            }
          },
          className: "text-xs px-3 py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors",
          "data-ocid": "audit-log.delete_button",
          children: "Clear Log"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "bg-white rounded-lg shadow-sm border overflow-x-auto",
        "data-ocid": "audit-log.table",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Time", "Action By", "Client", "Field Changed", "Change"].map(
            (h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "th",
              {
                className: "text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide",
                style: { color: "#c9a44c" },
                children: h
              },
              h
            )
          ) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
            filteredLogs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "td",
              {
                colSpan: 5,
                className: "py-12 text-center text-gray-400",
                "data-ocid": "audit-log.empty_state",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "📋" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: allLogs.length === 0 ? "No audit entries yet. Changes made via inline editing will appear here." : "No entries match the selected filters." })
                ] })
              }
            ) }),
            filteredLogs.map((entry, i) => {
              const roleBadge = getRoleBadge(entry);
              const roleStyle = getRoleBadgeStyle(roleBadge);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "tr",
                {
                  "data-ocid": `audit-log.item.${i + 1}`,
                  className: `border-b last:border-0 hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4 text-xs text-gray-500 whitespace-nowrap", children: formatTime(entry.timestamp) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-800", children: entry.userName }),
                      roleBadge && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "text-xs px-1.5 py-0.5 rounded-full font-medium",
                          style: roleStyle,
                          children: roleBadge
                        }
                      )
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "font-medium",
                        style: { color: "var(--theme-primary, #6B1A2B)" },
                        children: entry.clientName
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600", children: entry.fieldChanged }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium", children: entry.oldValue || "–" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "→" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium", children: entry.newValue })
                    ] }) })
                  ]
                },
                entry.id
              );
            })
          ] })
        ] })
      }
    )
  ] });
}
export {
  AuditLogPage as default
};

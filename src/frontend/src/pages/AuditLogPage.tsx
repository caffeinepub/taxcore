import { useEffect, useMemo, useState } from "react";
import { onStorageChange, storage } from "../data/storage";
import type { AuditLogEntry, User } from "../types";

function toLocalDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function exportToCSV(entries: AuditLogEntry[]) {
  const header = [
    "Time",
    "Action By",
    "Role",
    "Client",
    "Field Changed",
    "Old Value",
    "New Value",
  ];
  const rows = entries.map((e) => [
    new Date(e.timestamp).toLocaleString("en-IN"),
    e.userName,
    e.userRole || "-",
    e.clientName,
    e.fieldChanged,
    e.oldValue || "-",
    e.newValue,
  ]);
  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-log-${toLocalDateInputValue(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface AuditLogPageProps {
  user: User;
}

export default function AuditLogPage({ user }: AuditLogPageProps) {
  const isOwner = user.role === "Owner";

  // Get all non-admin users so we can look up roles by userId
  const allUsers = useMemo(() => storage.getUsers(), []);

  // Owner sees their own entries + all staff entries (not Super Admin)
  // Super Admin sees all entries
  const filterForOwner = (logs: AuditLogEntry[]) => {
    if (!isOwner) return logs;
    return logs.filter((l) => {
      // Always include owner's own entries
      if (l.userId === user.id) return true;
      // Include staff entries (not Super Admin)
      const actor = allUsers.find((u) => u.id === l.userId);
      if (actor && actor.role === "Staff") return true;
      return false;
    });
  };

  const [allLogs, setAllLogs] = useState<AuditLogEntry[]>(() => {
    const logs = storage.getAuditLogs().slice().reverse();
    return filterForOwner(logs);
  });

  const today = toLocalDateInputValue(new Date());
  const defaultFrom = toLocalDateInputValue(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  );
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(today);
  const [userFilter, setUserFilter] = useState("All");

  useEffect(() => {
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
          return actor?.role === "Staff";
        }),
      );
    });
    return unsub;
    // biome-ignore lint/correctness/useExhaustiveDependencies: stable
  }, [isOwner, user.id]);

  // Build user filter list from visible logs
  const userNames = useMemo(() => {
    const names = [...new Set(allLogs.map((l) => l.userName))];
    return ["All", ...names.sort()];
  }, [allLogs]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter((entry) => {
      const ts = new Date(entry.timestamp);
      const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
      const to = toDate ? new Date(`${toDate}T23:59:59`) : null;
      if (from && ts < from) return false;
      if (to && ts > to) return false;
      if (userFilter !== "All" && entry.userName !== userFilter) return false;
      return true;
    });
  }, [allLogs, fromDate, toDate, userFilter]);

  // Determine role badge for a log entry
  const getRoleBadge = (entry: AuditLogEntry) => {
    if (entry.userRole) return entry.userRole;
    const actor = allUsers.find((u) => u.id === entry.userId);
    return actor?.role || "";
  };

  const getRoleBadgeStyle = (role: string) => {
    if (role === "Owner") return { background: "#f3e6ec", color: "#7a1f2b" };
    if (role === "Staff") return { background: "#e6f0fa", color: "#1a4a7a" };
    return { background: "#f5f5f5", color: "#555" };
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <label
              htmlFor="audit-from"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              From
            </label>
            <input
              id="audit-from"
              type="date"
              value={fromDate}
              max={toDate || today}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1"
              style={{ borderColor: "#c9a44c", minWidth: 130 }}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <label
              htmlFor="audit-to"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
            >
              To
            </label>
            <input
              id="audit-to"
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1"
              style={{ borderColor: "#c9a44c", minWidth: 130 }}
            />
          </div>
        </div>

        {/* User filter -- Owner sees own + staff; Super Admin sees all */}
        <div className="flex flex-col gap-0.5">
          <label
            htmlFor="audit-user"
            className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            Filter by User
          </label>
          <select
            id="audit-user"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm text-gray-700 focus:outline-none"
            style={{ borderColor: "#c9a44c", minWidth: 150 }}
          >
            {userNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Result count */}
        <span className="text-xs text-gray-400 self-end pb-1">
          {filteredLogs.length}{" "}
          {filteredLogs.length === 1 ? "entry" : "entries"}
        </span>

        {/* CSV Export */}
        {filteredLogs.length > 0 && (
          <button
            type="button"
            onClick={() => exportToCSV(filteredLogs)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold border transition-colors"
            style={{
              borderColor: "#c9a44c",
              color: "#7a1f2b",
              background: "#fdf8f0",
            }}
            data-ocid="audit-log.export_csv_button"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <title>Download</title>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        )}

        {/* Clear Log */}
        {allLogs.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (
                confirm("Clear all audit log entries? This cannot be undone.")
              ) {
                storage.clearAuditLogs();
              }
            }}
            className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            data-ocid="audit-log.delete_button"
          >
            Clear Log
          </button>
        )}
      </div>

      <div
        className="bg-white rounded-lg shadow-sm border overflow-x-auto"
        data-ocid="audit-log.table"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              {["Time", "Action By", "Client", "Field Changed", "Change"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide"
                    style={{ color: "#c9a44c" }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-gray-400"
                  data-ocid="audit-log.empty_state"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">📋</span>
                    <span className="text-sm">
                      {allLogs.length === 0
                        ? "No audit entries yet. Changes made via inline editing will appear here."
                        : "No entries match the selected filters."}
                    </span>
                  </div>
                </td>
              </tr>
            )}
            {filteredLogs.map((entry, i) => {
              const roleBadge = getRoleBadge(entry);
              const roleStyle = getRoleBadgeStyle(roleBadge);
              return (
                <tr
                  key={entry.id}
                  data-ocid={`audit-log.item.${i + 1}`}
                  className={`border-b last:border-0 hover:bg-gray-50 ${
                    i % 2 === 0 ? "" : "bg-gray-50/30"
                  }`}
                >
                  <td className="py-2.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(entry.timestamp)}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-gray-800">
                        {entry.userName}
                      </span>
                      {roleBadge && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={roleStyle}
                        >
                          {roleBadge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className="font-medium"
                      style={{ color: "var(--theme-primary, #6B1A2B)" }}
                    >
                      {entry.clientName}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {entry.fieldChanged}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium">
                        {entry.oldValue || "–"}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                        {entry.newValue}
                      </span>
                    </span>
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

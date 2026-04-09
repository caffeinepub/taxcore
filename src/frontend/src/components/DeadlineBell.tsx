import { Bell, CheckCircle, ShieldAlert, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getDeadlineAlertClients,
  getEVerificationAlerts,
  onStorageChange,
  storage,
} from "../data/storage";
import type { Page, User } from "../types";

interface DeadlineBellProps {
  user: User;
  onNavigate: (page: Page) => void;
}

const WORKFLOW_STAGE_LABELS: Record<string, string> = {
  Pending: "Pending",
  "In Progress": "Processing",
  Filed: "Completed",
  Completed: "Completed",
};

// ─── Trial upgrade alert type ─────────────────────────────────────────────────

interface TrialUpgradeAlert {
  firmId: string;
  firmName: string;
  ownerName: string;
  clientCount: number;
}

function getTrialUpgradeAlerts(): TrialUpgradeAlert[] {
  const firms = storage.getFirmAccounts();
  const users = storage.getUsers();
  const clients = storage.getClients();
  const result: TrialUpgradeAlert[] = [];

  for (const firm of firms) {
    if (firm.accessType !== "Trial") continue;
    if (!firm.isActive) continue;
    const ownerUser = users.find(
      (u) =>
        u.email.toLowerCase() === firm.email.toLowerCase() &&
        u.role === "Owner",
    );
    const clientCount = ownerUser
      ? clients.filter((c) => c.createdBy === ownerUser.id).length
      : 0;
    // Show alert when firm has reached or exceeded the 5-client trial limit
    if (clientCount >= 5) {
      result.push({
        firmId: firm.id,
        firmName: firm.firmName,
        ownerName: firm.ownerName,
        clientCount,
      });
    }
  }

  return result.sort((a, b) => b.clientCount - a.clientCount);
}

export default function DeadlineBell({ user, onNavigate }: DeadlineBellProps) {
  const isSuperAdmin = user.role === "Super Admin";
  const [isOpen, setIsOpen] = useState(false);

  // Super Admin: trial upgrade alerts
  const [trialAlerts, setTrialAlerts] = useState<TrialUpgradeAlert[]>(() =>
    isSuperAdmin ? getTrialUpgradeAlerts() : [],
  );

  // Owner/Staff: deadline alerts
  const [alerts, setAlerts] = useState(() =>
    isSuperAdmin ? [] : getDeadlineAlertClients(user.id, user.role),
  );
  const [eVerifAlerts, setEVerifAlerts] = useState(() =>
    isSuperAdmin ? [] : getEVerificationAlerts(),
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Refresh alerts on any storage change
  useEffect(() => {
    const refresh = () => {
      if (isSuperAdmin) {
        setTrialAlerts(getTrialUpgradeAlerts());
      } else {
        setAlerts(getDeadlineAlertClients(user.id, user.role));
        setEVerifAlerts(getEVerificationAlerts());
      }
    };
    refresh();
    const unsub = onStorageChange(refresh);
    return unsub;
  }, [user.id, user.role, isSuperAdmin]);

  // Close on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // ── Super Admin bell ──────────────────────────────────────────────────────────
  if (isSuperAdmin) {
    const count = trialAlerts.length;
    const hasAlerts = count > 0;

    return (
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="relative p-2 rounded-full transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1"
          aria-label={`Trial upgrade alerts${hasAlerts ? ` - ${count} firms at limit` : ""}`}
          data-ocid="header.bell.button"
        >
          <Bell
            className={`w-5 h-5 transition-all duration-200 ${hasAlerts ? "text-amber-600" : "text-gray-400"}`}
          />
          {hasAlerts && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] rounded-full text-[10px] font-bold flex items-center justify-center px-0.5 leading-none bg-amber-500 text-white animate-pulse">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
            style={{
              zIndex: 50,
              animation: "dropdownOpen 0.18s ease-out forwards",
            }}
            data-ocid="header.bell.popover"
          >
            <style>{`
              @keyframes dropdownOpen {
                from { opacity: 0; transform: scale(0.95) translateY(-4px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>

            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ background: "#7c5a00" }}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-300" />
                <span className="text-white font-semibold text-sm">
                  Trial Firms at Client Limit
                </span>
                {hasAlerts && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                    {count}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-0.5 rounded"
                aria-label="Close"
                data-ocid="header.bell.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {trialAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                  <p className="text-gray-600 font-medium text-sm">
                    No trial firms at the limit
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    All trial firms have room to add more clients
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {trialAlerts.map((alert) => (
                    <li
                      key={alert.firmId}
                      className="px-4 py-3 hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {alert.firmName}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {alert.ownerName}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            {alert.clientCount} clients
                          </span>
                          <p className="text-[10px] text-amber-600 mt-0.5 font-medium">
                            Upgrade needed
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t px-4 py-2.5 bg-amber-50">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm font-medium text-amber-800 transition-colors"
                data-ocid="header.bell.clients_link"
              >
                Manage Firm Plans →
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Owner / Staff bell (existing behavior) ────────────────────────────────────

  const totalCount =
    alerts.length + eVerifAlerts.filter((a) => a.urgency === "high").length;
  const hasRedAlerts = alerts.some((a) => a.urgency === "red");
  const hasHighEVerif = eVerifAlerts.some((a) => a.urgency === "high");
  const hasAlerts = totalCount > 0;

  const top5Due = alerts.slice(0, 5);
  const top3EVerif = eVerifAlerts.slice(0, 3);

  const badgeClass =
    hasRedAlerts || hasHighEVerif
      ? "bg-red-600 text-white"
      : "bg-amber-500 text-white";

  const handleNavigateToClients = () => {
    setIsOpen(false);
    onNavigate("clients");
  };

  const urgencyPillClass = (urgency: "red" | "amber" | "yellow") => {
    if (urgency === "red")
      return "bg-red-100 text-red-700 border border-red-200";
    if (urgency === "yellow")
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    return "bg-amber-100 text-amber-700 border border-amber-200";
  };

  return (
    <div className="relative" style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-full transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1"
        style={{ focusRingColor: "#6B1A2B" } as React.CSSProperties}
        aria-label={`Deadline alerts${hasAlerts ? ` - ${totalCount} urgent` : ""}`}
        data-ocid="header.bell.button"
      >
        <Bell
          className={`w-5 h-5 transition-all duration-200 ${
            hasAlerts ? "text-gray-700" : "text-gray-400"
          } ${(hasRedAlerts || hasHighEVerif) && !isOpen ? "bell-ring" : ""}`}
        />

        {/* Badge */}
        {hasAlerts && (
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] rounded-full text-[10px] font-bold flex items-center justify-center px-0.5 leading-none ${badgeClass} ${
              hasRedAlerts || hasHighEVerif ? "animate-pulse" : ""
            }`}
          >
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>

      {/* Bell ring animation */}
      <style>{`
        @keyframes bellRing {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(-15deg); }
          20% { transform: rotate(15deg); }
          30% { transform: rotate(-12deg); }
          40% { transform: rotate(12deg); }
          50% { transform: rotate(-8deg); }
          60% { transform: rotate(8deg); }
          70% { transform: rotate(-4deg); }
          80% { transform: rotate(4deg); }
          90% { transform: rotate(-2deg); }
          100% { transform: rotate(0deg); }
        }
        .bell-ring {
          animation: bellRing 1.2s ease-in-out;
          transform-origin: top center;
        }
      `}</style>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{
            zIndex: 50,
            animation: "dropdownOpen 0.18s ease-out forwards",
          }}
          data-ocid="header.bell.popover"
        >
          <style>{`
            @keyframes dropdownOpen {
              from { opacity: 0; transform: scale(0.95) translateY(-4px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ background: "#6B1A2B" }}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">
                Deadline Alerts
              </span>
              {hasAlerts && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    hasRedAlerts || hasHighEVerif
                      ? "bg-red-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {totalCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-0.5 rounded"
              aria-label="Close"
              data-ocid="header.bell.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* No alerts */}
            {top5Due.length === 0 && top3EVerif.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                <p className="text-gray-600 font-medium text-sm">
                  No pending deadline alerts
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  All clients are on track
                </p>
              </div>
            ) : (
              <>
                {/* Due date alerts */}
                {top5Due.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-gray-50 border-b">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Due Date Alerts
                      </p>
                    </div>
                    <ul className="divide-y divide-gray-50">
                      {top5Due.map(
                        ({ client, daysLeft, urgency, workStatus }) => (
                          <li
                            key={client.id}
                            className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">
                                  {client.name}
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5 font-mono">
                                  {client.pan}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span
                                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${urgencyPillClass(urgency)}`}
                                  >
                                    {daysLeft < 0
                                      ? `${Math.abs(daysLeft)}d OVERDUE`
                                      : daysLeft === 0
                                        ? "DUE TODAY"
                                        : `${daysLeft}d left`}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                    {WORKFLOW_STAGE_LABELS[workStatus] ||
                                      workStatus}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <p className="text-xs text-gray-500">
                                  {client.dueDate}
                                </p>
                                <div
                                  className={`w-2 h-2 rounded-full mt-1 ml-auto ${
                                    urgency === "red"
                                      ? "bg-red-500"
                                      : urgency === "yellow"
                                        ? "bg-yellow-500"
                                        : "bg-amber-400"
                                  }`}
                                />
                              </div>
                            </div>
                          </li>
                        ),
                      )}
                    </ul>
                  </>
                )}

                {/* E-Verification alerts */}
                {top3EVerif.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-blue-50 border-b border-t">
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3 h-3 text-blue-600" />
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                          E-Verification Pending
                        </p>
                      </div>
                    </div>
                    <ul className="divide-y divide-gray-50">
                      {top3EVerif.map(
                        ({ client, work, daysToDeadline, urgency }) => (
                          <li
                            key={work.id}
                            className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">
                                  {client.name}
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">
                                  Filed: {work.filingDate || "—"}
                                </p>
                              </div>
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                  urgency === "high"
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : "bg-amber-100 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {daysToDeadline <= 0
                                  ? "EXPIRED"
                                  : `${daysToDeadline}d to verify`}
                              </span>
                            </div>
                          </li>
                        ),
                      )}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer link */}
          <div className="border-t px-4 py-2.5 bg-gray-50">
            <button
              type="button"
              onClick={handleNavigateToClients}
              className="w-full text-center text-sm font-medium transition-colors duration-150"
              style={{ color: "#6B1A2B" }}
              data-ocid="header.bell.clients_link"
            >
              View All Clients →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

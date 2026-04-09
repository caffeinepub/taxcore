import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDownCircle,
  Building2,
  CheckCircle,
  Eye,
  LayoutDashboard,
  Plus,
  Search,
  ShieldCheck,
  Star,
  UserCircle,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";
import { onStorageChange, saveUsersNow, storage } from "../data/storage";
import type { AuditLogEntry, FirmAccount, User } from "../types";

const ADMIN_PROFILE_COMPLETE_KEY = "taxcore_admin_profile_complete";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatLastLogin(iso: string | undefined): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function addAdminAuditLog(action: string): void {
  const entry: AuditLogEntry = {
    id: storage.uid(),
    userId: "super-admin",
    userName: "Administrator",
    userRole: "Super Admin",
    action,
    clientId: "",
    clientName: "",
    fieldChanged: "",
    oldValue: "",
    newValue: "",
    timestamp: new Date().toISOString(),
  };
  storage.addAuditLog(entry);
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color }}>
          {value}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ─── View Details Modal ────────────────────────────────────────────────────────

function FirmDetailsModal({
  firm,
  onClose,
}: {
  firm: FirmAccount | null;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  if (!firm) return null;

  const users = storage.getUsers();
  const clients = storage.getClients();

  // Find owner user
  const ownerUser = users.find(
    (u) =>
      u.email.toLowerCase() === firm.email.toLowerCase() && u.role === "Owner",
  );
  const totalClients = clients.filter(
    (c) => ownerUser && c.createdBy === ownerUser.id,
  ).length;
  const totalStaff = ownerUser
    ? users.filter((u) => u.firmOwnerId === ownerUser.id && u.role === "Staff")
        .length
    : 0;

  return (
    <Dialog open={!!firm} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm" data-ocid="super-admin.details_modal">
        <DialogHeader>
          <DialogTitle
            style={{ color: theme.primary }}
            className="flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            Firm Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 flex items-center gap-1.5">
            🔒 Firm name is locked and cannot be changed after creation.
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Firm Name
              </span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {firm.firmName}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Owner Name
              </span>
              <p className="font-semibold text-gray-800 mt-0.5">
                {firm.ownerName}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Email
              </span>
              <p className="text-gray-700 mt-0.5 break-all">{firm.email}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Mobile
              </span>
              <p className="text-gray-700 mt-0.5">{firm.mobile}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Plan
              </span>
              <div className="mt-0.5">
                {firm.accessType === "Full" ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Paid
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    Trial
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Status
              </span>
              <div className="mt-0.5">
                {firm.isActive ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    Disabled
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Total Clients
              </span>
              <p className="font-bold text-gray-800 mt-0.5">{totalClients}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                Total Staff
              </span>
              <p className="font-bold text-gray-800 mt-0.5">{totalStaff}</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Last Login
            </span>
            <p className="text-sm text-gray-700 mt-0.5">
              {formatLastLogin(firm.lastLogin)}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Registered On
            </span>
            <p className="text-sm text-gray-700 mt-0.5">
              {new Date(firm.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <Button
            onClick={onClose}
            className="w-full text-white mt-2"
            style={{ background: theme.primary }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"dashboard" | "firms">(
    "dashboard",
  );
  const [refreshKey, setRefreshKey] = useState(0);

  // ─── Profile completeness state ───────────────────────────────────────────
  // Show a full-screen profile setup if the admin still has the default name "Admin"
  // AND the localStorage flag has not been set to "true" yet.
  // Re-derive from refreshKey so it stays in sync with background canister syncs.
  const adminUser: User | null = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    return storage.getUsers().find((u) => u.role === "Super Admin") ?? null;
  }, [refreshKey]);

  function isAdminProfileComplete(): boolean {
    // If localStorage flag is set, skip setup screen
    if (localStorage.getItem(ADMIN_PROFILE_COMPLETE_KEY) === "true")
      return true;
    // If the admin has a real name (not default "Admin"), mark complete and skip
    if (
      adminUser?.name &&
      adminUser.name.trim() !== "" &&
      adminUser.name.trim() !== "Admin"
    ) {
      localStorage.setItem(ADMIN_PROFILE_COMPLETE_KEY, "true");
      return true;
    }
    return false;
  }

  const [profileSetupDone, setProfileSetupDone] = useState(() =>
    isAdminProfileComplete(),
  );
  const [profileName, setProfileName] = useState(
    adminUser?.name && adminUser.name !== "Admin" ? adminUser.name : "",
  );
  const [profileNameError, setProfileNameError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Re-check profile completeness when adminUser changes (e.g. after canister sync)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only check when adminUser identity changes
  useEffect(() => {
    if (!profileSetupDone) {
      const done =
        localStorage.getItem(ADMIN_PROFILE_COMPLETE_KEY) === "true" ||
        !!(
          adminUser?.name &&
          adminUser.name.trim() !== "" &&
          adminUser.name.trim() !== "Admin"
        );
      if (done) {
        localStorage.setItem(ADMIN_PROFILE_COMPLETE_KEY, "true");
        setProfileSetupDone(true);
      }
    }
  }, [adminUser, profileSetupDone]);

  // ─── URL hash param helpers ───────────────────────────────────────────────

  function getHashParams(): URLSearchParams {
    const hash = window.location.hash; // e.g. "#/super-admin?plan=Trial&status=active"
    const qIdx = hash.indexOf("?");
    if (qIdx === -1) return new URLSearchParams();
    return new URLSearchParams(hash.slice(qIdx + 1));
  }

  function setHashParam(key: string, value: string): void {
    const hash = window.location.hash;
    const qIdx = hash.indexOf("?");
    const base = qIdx === -1 ? hash : hash.slice(0, qIdx);
    const params = getHashParams();
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    const newHash = qs ? `${base}?${qs}` : base;
    window.history.replaceState(null, "", newHash);
  }

  // Filters — initialised from URL hash params so they survive refresh
  const [planFilter, setPlanFilter] = useState<"all" | "Trial" | "Full">(() => {
    const v = getHashParams().get("plan");
    return v === "Trial" || v === "Full" ? v : "all";
  });
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "disabled"
  >(() => {
    const v = getHashParams().get("status");
    return v === "active" || v === "disabled" ? v : "all";
  });
  const [searchQuery, setSearchQuery] = useState("");

  function handlePlanFilterChange(v: "all" | "Trial" | "Full") {
    setPlanFilter(v);
    setHashParam("plan", v);
  }

  function handleStatusFilterChange(v: "all" | "active" | "disabled") {
    setStatusFilter(v);
    setHashParam("status", v);
  }

  // Modals
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewFirm, setViewFirm] = useState<FirmAccount | null>(null);

  // Add firm form
  const [form, setForm] = useState({
    ownerName: "",
    firmName: "",
    email: "",
    mobile: "",
    password: "",
    accessType: "Trial" as "Trial" | "Full",
  });
  const [formError, setFormError] = useState("");

  // Subscribe to storage changes for auto-refresh
  useEffect(() => {
    const unsub = onStorageChange(() => setRefreshKey((k) => k + 1));
    return unsub;
  }, []);

  const firms = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    return storage.getFirmAccounts();
  }, [refreshKey]);

  const users = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    return storage.getUsers();
  }, [refreshKey]);

  const clients = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    return storage.getClients();
  }, [refreshKey]);

  // ─── Computed stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalActiveUsers = users.filter(
      (u) => u.role !== "Super Admin" && u.isActive !== false,
    ).length;
    return {
      totalFirms: firms.length,
      totalActiveUsers,
      trialFirms: firms.filter((f) => f.accessType === "Trial").length,
      paidFirms: firms.filter((f) => f.accessType === "Full").length,
    };
  }, [firms, users]);

  // ─── Filtered firms ──────────────────────────────────────────────────────────

  const filteredFirms = useMemo(() => {
    return firms.filter((f) => {
      if (planFilter !== "all" && f.accessType !== planFilter) return false;
      if (statusFilter === "active" && !f.isActive) return false;
      if (statusFilter === "disabled" && f.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !f.firmName.toLowerCase().includes(q) &&
          !f.ownerName.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [firms, planFilter, statusFilter, searchQuery]);

  // ─── Helper: get client count for a firm ─────────────────────────────────────

  function getFirmClientCount(firm: FirmAccount): number {
    const ownerUser = users.find(
      (u) =>
        u.email.toLowerCase() === firm.email.toLowerCase() &&
        u.role === "Owner",
    );
    if (!ownerUser) return 0;
    return clients.filter((c) => c.createdBy === ownerUser.id).length;
  }

  // ─── Handlers ────────────────────────────────────────────────────────────────

  function handleCreate() {
    setFormError("");
    if (!form.ownerName.trim()) return setFormError("Owner name is required.");
    if (!form.firmName.trim()) return setFormError("Firm name is required.");
    if (!form.email.trim()) return setFormError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setFormError("Invalid email format.");
    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile))
      return setFormError("Mobile must be exactly 10 digits.");
    if (!form.password.trim() || form.password.length < 6)
      return setFormError("Password must be at least 6 characters.");

    const allUsers = storage.getUsers();
    if (
      allUsers.find((u) => u.email.toLowerCase() === form.email.toLowerCase())
    ) {
      return setFormError("An account with this email already exists.");
    }
    if (allUsers.find((u) => u.mobile && u.mobile === form.mobile.trim())) {
      return setFormError("An account with this mobile number already exists.");
    }

    const newFirm: FirmAccount = {
      id: storage.uid(),
      ownerName: form.ownerName.trim(),
      firmName: form.firmName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      accessType: form.accessType,
      isActive: true,
      createdAt: new Date().toISOString(),
      clientCount: 0,
    };
    // Update local cache and localStorage immediately
    storage.saveFirmAccounts([...firms, newFirm]);

    const newUser: User = {
      id: storage.uid(),
      email: form.email.trim(),
      password: form.password,
      name: form.ownerName.trim(),
      mobile: form.mobile.trim(),
      role: "Owner",
      isActive: true,
      accessType: form.accessType,
    };
    // Immediately write both users and firm accounts to canister so the new
    // firm is visible in the admin panel on all devices at next poll cycle.
    const updatedUsers = [...allUsers, newUser];
    saveUsersNow(updatedUsers).catch(() => {
      storage.saveUsers(updatedUsers);
    });
    addAdminAuditLog(`Firm "${form.firmName.trim()}" created by Administrator`);

    setForm({
      ownerName: "",
      firmName: "",
      email: "",
      mobile: "",
      password: "",
      accessType: "Trial",
    });
    setFormError("");
    setShowAddForm(false);
    toast.success("Firm account created successfully.");
  }

  function handleToggleActive(id: string) {
    const firmAcc = firms.find((f) => f.id === id);
    if (!firmAcc) return;
    const nowActive = !firmAcc.isActive;
    const updatedFirms = firms.map((f) =>
      f.id === id ? { ...f, isActive: nowActive } : f,
    );
    storage.saveFirmAccounts(updatedFirms);

    const allUsers = storage.getUsers();
    const updatedUsers = allUsers.map((u) =>
      u.email.toLowerCase() === firmAcc.email.toLowerCase()
        ? { ...u, isActive: nowActive }
        : u,
    );
    // Immediate canister write so the activation/deactivation is cross-device instant
    saveUsersNow(updatedUsers).catch(() => {
      storage.saveUsers(updatedUsers);
    });
    addAdminAuditLog(
      `Firm "${firmAcc.firmName}" ${nowActive ? "activated" : "deactivated"} by Administrator`,
    );
    toast.success(
      `Firm ${nowActive ? "activated" : "deactivated"} successfully.`,
    );
  }

  async function handleSaveProfile() {
    const trimmedName = profileName.trim();
    if (!trimmedName) {
      setProfileNameError("Name is required.");
      return;
    }
    if (trimmedName.length < 2) {
      setProfileNameError("Name must be at least 2 characters.");
      return;
    }
    if (trimmedName === "Admin") {
      setProfileNameError("Please enter your real name, not 'Admin'.");
      return;
    }
    setSavingProfile(true);
    setProfileNameError("");
    try {
      const allUsers = storage.getUsers();
      const updatedUsers = allUsers.map((u) =>
        u.role === "Super Admin" ? { ...u, name: trimmedName } : u,
      );
      await saveUsersNow(updatedUsers).catch(() =>
        storage.saveUsers(updatedUsers),
      );
      // Mark profile as complete in localStorage so this device skips setup next login
      localStorage.setItem(ADMIN_PROFILE_COMPLETE_KEY, "true");
      // Refresh key triggers adminUser useMemo to re-derive the updated user
      setRefreshKey((k) => k + 1);
      setProfileSetupDone(true);
      addAdminAuditLog("Administrator updated profile name");
      toast.success("Profile saved. Welcome to the Administrator Panel!");
    } finally {
      setSavingProfile(false);
    }
  }

  function handleUpgradeToPaid(id: string) {
    const firmAcc = firms.find((f) => f.id === id);
    if (!firmAcc || firmAcc.accessType === "Full") return;
    const updatedFirms = firms.map((f) =>
      f.id === id ? { ...f, accessType: "Full" as const } : f,
    );
    storage.saveFirmAccounts(updatedFirms);

    const allUsers = storage.getUsers();
    const updatedUsers = allUsers.map((u) =>
      u.email.toLowerCase() === firmAcc.email.toLowerCase()
        ? { ...u, accessType: "Full" as const }
        : u,
    );
    // Immediate canister write so the upgrade is cross-device instant
    saveUsersNow(updatedUsers).catch(() => {
      storage.saveUsers(updatedUsers);
    });
    addAdminAuditLog(
      `Firm "${firmAcc.firmName}" upgraded to Paid plan by Administrator`,
    );
    toast.success("Firm upgraded to Paid plan.");
  }

  function handleDowngradeToTrial(id: string) {
    const firmAcc = firms.find((f) => f.id === id);
    if (!firmAcc || firmAcc.accessType === "Trial") return;
    const updatedFirms = firms.map((f) =>
      f.id === id ? { ...f, accessType: "Trial" as const } : f,
    );
    storage.saveFirmAccounts(updatedFirms);

    const allUsers = storage.getUsers();
    const updatedUsers = allUsers.map((u) =>
      u.email.toLowerCase() === firmAcc.email.toLowerCase()
        ? { ...u, accessType: "Trial" as const }
        : u,
    );
    // Immediate canister write so the downgrade is cross-device instant
    saveUsersNow(updatedUsers).catch(() => {
      storage.saveUsers(updatedUsers);
    });
    addAdminAuditLog(
      `Firm "${firmAcc.firmName}" downgraded to Trial plan by Administrator`,
    );
    toast.success("Firm downgraded to Trial plan. 5-client limit restored.");
  }

  // ─── Dashboard Tab ────────────────────────────────────────────────────────────

  const dashboardContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Firms"
          value={stats.totalFirms}
          icon={<Building2 className="w-5 h-5" />}
          color={theme.primary}
        />
        <StatCard
          label="Total Active Users"
          value={stats.totalActiveUsers}
          icon={<Users className="w-5 h-5" />}
          color="#16a34a"
        />
        <StatCard
          label="Trial Users"
          value={stats.trialFirms}
          icon={<Star className="w-5 h-5" />}
          color="#d97706"
        />
        <StatCard
          label="Paid Users"
          value={stats.paidFirms}
          icon={<CheckCircle className="w-5 h-5" />}
          color="#7c3aed"
        />
      </div>

      {/* Summary section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
            Plan Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-sm text-gray-600">Trial Firms</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 rounded-full bg-amber-200"
                  style={{
                    width:
                      stats.totalFirms > 0
                        ? `${(stats.trialFirms / stats.totalFirms) * 80}px`
                        : "0px",
                  }}
                />
                <span className="text-sm font-bold text-gray-800">
                  {stats.trialFirms}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Paid Firms</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 rounded-full bg-green-200"
                  style={{
                    width:
                      stats.totalFirms > 0
                        ? `${(stats.paidFirms / stats.totalFirms) * 80}px`
                        : "0px",
                  }}
                />
                <span className="text-sm font-bold text-gray-800">
                  {stats.paidFirms}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
            Firm Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">Active Firms</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {firms.filter((f) => f.isActive).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-sm text-gray-600">Disabled Firms</span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {firms.filter((f) => !f.isActive).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Firm Management Tab ───────────────────────────────────────────────────────

  const firmManagementContent = (
    <div className="space-y-4">
      {/* Filter + Search bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by firm or owner name…"
            className="pl-9 bg-white"
            data-ocid="super-admin.search_input"
          />
        </div>
        <Select
          value={planFilter}
          onValueChange={(v: "all" | "Trial" | "Full") =>
            handlePlanFilterChange(v)
          }
        >
          <SelectTrigger
            className="w-36 bg-white"
            data-ocid="super-admin.plan_filter"
          >
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="Trial">Trial</SelectItem>
            <SelectItem value="Full">Paid</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v: "all" | "active" | "disabled") =>
            handleStatusFilterChange(v)
          }
        >
          <SelectTrigger
            className="w-40 bg-white"
            data-ocid="super-admin.status_filter"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setForm({
              ownerName: "",
              firmName: "",
              email: "",
              mobile: "",
              password: "",
              accessType: "Trial",
            });
            setFormError("");
            setShowAddForm(true);
          }}
          style={{ background: theme.primary }}
          className="text-white flex-shrink-0"
          data-ocid="super-admin.primary_button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Firm
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {filteredFirms.length === 0 ? (
          <div
            className="text-center py-16 text-gray-400"
            data-ocid="super-admin.empty_state"
          >
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-25" />
            <p className="font-medium">
              {firms.length === 0
                ? "No firm accounts yet."
                : "No firms match your filters."}
            </p>
            {firms.length === 0 && (
              <p className="text-sm mt-1">
                Click "Add Firm" to create the first one.
              </p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm" data-ocid="super-admin.table">
            <thead style={{ background: theme.primary }}>
              <tr>
                {[
                  "Firm Name",
                  "Owner Name",
                  "Email",
                  "Mobile",
                  "Plan",
                  "Status",
                  "Clients",
                  "Last Login",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-white font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFirms.map((f, i) => {
                const clientCount = getFirmClientCount(f);
                return (
                  <tr
                    key={f.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                    data-ocid={`super-admin.item.${i + 1}`}
                  >
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Building2
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: theme.primary }}
                        />
                        <span className="truncate max-w-[140px]">
                          {f.firmName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {f.ownerName}
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-[160px] truncate">
                      {f.email}
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {f.mobile}
                    </td>
                    <td className="py-3 px-4">
                      {f.accessType === "Full" ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-semibold text-xs px-2 py-0.5">
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-semibold text-xs px-2 py-0.5">
                          Trial
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {f.isActive ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-semibold text-xs px-2 py-0.5">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 font-semibold text-xs px-2 py-0.5">
                          Disabled
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-gray-700">
                      {clientCount}
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap text-xs">
                      {formatLastLogin(f.lastLogin)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {/* Activate / Deactivate */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(f.id)}
                          title={
                            f.isActive ? "Deactivate Firm" : "Activate Firm"
                          }
                          className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                            f.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                          data-ocid={`super-admin.toggle_button.${i + 1}`}
                        >
                          {f.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>

                        {/* Plan toggle — always visible, bi-directional */}
                        {f.accessType === "Trial" ? (
                          <button
                            type="button"
                            onClick={() => handleUpgradeToPaid(f.id)}
                            title="Upgrade to Paid"
                            className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                            data-ocid={`super-admin.upgrade_button.${i + 1}`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDowngradeToTrial(f.id)}
                            title="Downgrade to Trial"
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                            data-ocid={`super-admin.downgrade_button.${i + 1}`}
                          >
                            <ArrowDownCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setViewFirm(f)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          data-ocid={`super-admin.view_button.${i + 1}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────────

  // ── Profile setup screen (enforced — cannot be dismissed until name is set) ──
  if (!profileSetupDone) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          className="w-full max-w-sm rounded-2xl border shadow-lg p-8"
          style={{
            background: "#FFFDF7",
            borderColor: "rgba(201,168,76,0.35)",
          }}
          data-ocid="super-admin.profile_setup_screen"
        >
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ background: `${theme.primary}18` }}
            >
              <UserCircle
                className="w-8 h-8"
                style={{ color: theme.primary }}
              />
            </div>
            <h2 className="text-xl font-bold" style={{ color: theme.primary }}>
              Welcome, Administrator!
            </h2>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Before you access the panel, please set your display name.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-name-input">Your Full Name *</Label>
              <Input
                id="admin-name-input"
                data-ocid="super-admin.profile_name_input"
                value={profileName}
                onChange={(e) => {
                  setProfileName(e.target.value);
                  if (profileNameError) setProfileNameError("");
                }}
                placeholder="e.g. Ramesh Sharma"
                className="mt-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveProfile();
                }}
              />
              {profileNameError && (
                <p className="text-xs text-red-600 mt-1">{profileNameError}</p>
              )}
            </div>
            <Button
              data-ocid="super-admin.profile_save_button"
              className="w-full text-white"
              style={{ background: theme.primary }}
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "Saving…" : "Save & Continue to Admin Panel"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: theme.primary }}
        >
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: theme.primary }}>
            Administrator Panel
          </h1>
          <p className="text-xs text-gray-500">
            Manage firms, plans, and system controls
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "dashboard"
              ? "border-current"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          style={
            activeTab === "dashboard"
              ? { color: theme.primary, borderColor: theme.primary }
              : {}
          }
          data-ocid="super-admin.tab_dashboard"
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("firms")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "firms"
              ? "border-current"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          style={
            activeTab === "firms"
              ? { color: theme.primary, borderColor: theme.primary }
              : {}
          }
          data-ocid="super-admin.tab_firms"
        >
          <Building2 className="w-4 h-4" />
          Firm Management
          {firms.length > 0 && (
            <span
              className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: theme.primary }}
            >
              {firms.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "dashboard" ? dashboardContent : firmManagementContent}

      {/* Add Firm Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-md" data-ocid="super-admin.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: theme.primary }}>
              Add New Firm Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Firm Name *</Label>
                <Input
                  value={form.firmName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firmName: e.target.value }))
                  }
                  placeholder="ABC & Associates"
                  className="mt-1"
                  data-ocid="super-admin.input"
                />
              </div>
              <div>
                <Label>Owner Name *</Label>
                <Input
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ownerName: e.target.value }))
                  }
                  placeholder="CA Ramesh Gupta"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="owner@firm.com"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Mobile * (10 digits)</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={form.mobile}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setForm((f) => ({ ...f, mobile: digits }));
                  }}
                  placeholder="9876543210"
                  maxLength={10}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Access Type *</Label>
                <Select
                  value={form.accessType}
                  onValueChange={(v: "Trial" | "Full") =>
                    setForm((f) => ({ ...f, accessType: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trial">Trial (5 clients)</SelectItem>
                    <SelectItem value="Full">Paid (Unlimited)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Login Password *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Min. 6 characters"
                className="mt-1"
              />
            </div>
            {formError && (
              <p
                className="text-red-600 text-sm bg-red-50 rounded p-2"
                data-ocid="super-admin.error_state"
              >
                {formError}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleCreate}
                style={{ background: theme.primary }}
                className="text-white flex-1"
                data-ocid="super-admin.submit_button"
              >
                Create Account
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError("");
                }}
                className="flex-1"
                data-ocid="super-admin.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <FirmDetailsModal firm={viewFirm} onClose={() => setViewFirm(null)} />
    </div>
  );
}

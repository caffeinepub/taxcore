import { d as createLucideIcon, a7 as useTheme, r as reactExports, s as storage, o as onStorageChange, j as jsxRuntimeExports, U as Users, C as CircleCheckBig, I as Input, B as Button, b as Eye, S as ShieldCheck, a8 as LayoutDashboard, D as Dialog, t as DialogContent, v as DialogHeader, x as DialogTitle, L as Label, a5 as saveUsersNow, u as ue } from "./index-tCszq4kq.js";
import { B as Badge } from "./badge-R2GzaKoK.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BG7hvqo8.js";
import { S as Search } from "./search-BwFYVWzd.js";
import { P as Plus } from "./plus-Dp42ifSS.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", key: "1b4qmf" }],
  ["path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", key: "i71pzd" }],
  ["path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", key: "10jefs" }],
  ["path", { d: "M10 6h4", key: "1itunk" }],
  ["path", { d: "M10 10h4", key: "tcdvrf" }],
  ["path", { d: "M10 14h4", key: "kelpxr" }],
  ["path", { d: "M10 18h4", key: "1ulq68" }]
];
const Building2 = createLucideIcon("building-2", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
];
const Star = createLucideIcon("star", __iconNode);
function formatLastLogin(iso) {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}
function addAdminAuditLog(action) {
  const entry = {
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
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  storage.addAuditLog(entry);
}
function StatCard({
  label,
  value,
  icon,
  color
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0",
        style: { background: `${color}18`, color },
        children: icon
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", style: { color }, children: value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500 mt-0.5", children: label })
    ] })
  ] });
}
function FirmDetailsModal({
  firm,
  onClose
}) {
  const { theme } = useTheme();
  if (!firm) return null;
  const users = storage.getUsers();
  const clients = storage.getClients();
  const ownerUser = users.find(
    (u) => u.email.toLowerCase() === firm.email.toLowerCase() && u.role === "Owner"
  );
  const totalClients = clients.filter(
    (c) => ownerUser && c.createdBy === ownerUser.id
  ).length;
  const totalStaff = ownerUser ? users.filter((u) => u.firmOwnerId === ownerUser.id && u.role === "Staff").length : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!firm, onOpenChange: () => onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", "data-ocid": "super-admin.details_modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogTitle,
      {
        style: { color: theme.primary },
        className: "flex items-center gap-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4" }),
          "Firm Details"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 flex items-center gap-1.5", children: "🔒 Firm name is locked and cannot be changed after creation." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase tracking-wide", children: "Firm Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-800 mt-0.5", children: firm.firmName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase tracking-wide", children: "Owner Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-800 mt-0.5", children: firm.ownerName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase tracking-wide", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 mt-0.5 break-all", children: firm.email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase tracking-wide", children: "Mobile" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 mt-0.5", children: firm.mobile })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase tracking-wide", children: "Plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5", children: firm.accessType === "Full" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700", children: "Paid" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700", children: "Trial" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5", children: firm.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700", children: "Active" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700", children: "Disabled" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase tracking-wide", children: "Total Clients" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-gray-800 mt-0.5", children: totalClients })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase tracking-wide", children: "Total Staff" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-gray-800 mt-0.5", children: totalStaff })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase tracking-wide", children: "Last Login" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 mt-0.5", children: formatLastLogin(firm.lastLogin) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 uppercase tracking-wide", children: "Registered On" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 mt-0.5", children: new Date(firm.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: onClose,
          className: "w-full text-white mt-2",
          style: { background: theme.primary },
          children: "Close"
        }
      )
    ] })
  ] }) });
}
function SuperAdminPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = reactExports.useState(
    "dashboard"
  );
  const [refreshKey, setRefreshKey] = reactExports.useState(0);
  const adminUser = reactExports.useMemo(() => {
    return storage.getUsers().find((u) => u.role === "Super Admin") ?? null;
  }, [refreshKey]);
  const isProfileIncomplete = !(adminUser == null ? void 0 : adminUser.name) || adminUser.name.trim() === "Admin";
  const [showProfileBanner, setShowProfileBanner] = reactExports.useState(true);
  const [editingProfile, setEditingProfile] = reactExports.useState(false);
  const [profileName, setProfileName] = reactExports.useState((adminUser == null ? void 0 : adminUser.name) ?? "");
  const [profileNameError, setProfileNameError] = reactExports.useState("");
  const [savingProfile, setSavingProfile] = reactExports.useState(false);
  function getHashParams() {
    const hash = window.location.hash;
    const qIdx = hash.indexOf("?");
    if (qIdx === -1) return new URLSearchParams();
    return new URLSearchParams(hash.slice(qIdx + 1));
  }
  function setHashParam(key, value) {
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
  const [planFilter, setPlanFilter] = reactExports.useState(() => {
    const v = getHashParams().get("plan");
    return v === "Trial" || v === "Full" ? v : "all";
  });
  const [statusFilter, setStatusFilter] = reactExports.useState(() => {
    const v = getHashParams().get("status");
    return v === "active" || v === "disabled" ? v : "all";
  });
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  function handlePlanFilterChange(v) {
    setPlanFilter(v);
    setHashParam("plan", v);
  }
  function handleStatusFilterChange(v) {
    setStatusFilter(v);
    setHashParam("status", v);
  }
  const [showAddForm, setShowAddForm] = reactExports.useState(false);
  const [viewFirm, setViewFirm] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    ownerName: "",
    firmName: "",
    email: "",
    mobile: "",
    password: "",
    accessType: "Trial"
  });
  const [formError, setFormError] = reactExports.useState("");
  reactExports.useEffect(() => {
    const unsub = onStorageChange(() => setRefreshKey((k) => k + 1));
    return unsub;
  }, []);
  const firms = reactExports.useMemo(() => {
    return storage.getFirmAccounts();
  }, [refreshKey]);
  const users = reactExports.useMemo(() => {
    return storage.getUsers();
  }, [refreshKey]);
  const clients = reactExports.useMemo(() => {
    return storage.getClients();
  }, [refreshKey]);
  const stats = reactExports.useMemo(() => {
    const totalActiveUsers = users.filter(
      (u) => u.role !== "Super Admin" && u.isActive !== false
    ).length;
    return {
      totalFirms: firms.length,
      totalActiveUsers,
      trialFirms: firms.filter((f) => f.accessType === "Trial").length,
      paidFirms: firms.filter((f) => f.accessType === "Full").length
    };
  }, [firms, users]);
  const filteredFirms = reactExports.useMemo(() => {
    return firms.filter((f) => {
      if (planFilter !== "all" && f.accessType !== planFilter) return false;
      if (statusFilter === "active" && !f.isActive) return false;
      if (statusFilter === "disabled" && f.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!f.firmName.toLowerCase().includes(q) && !f.ownerName.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [firms, planFilter, statusFilter, searchQuery]);
  function getFirmClientCount(firm) {
    const ownerUser = users.find(
      (u) => u.email.toLowerCase() === firm.email.toLowerCase() && u.role === "Owner"
    );
    if (!ownerUser) return 0;
    return clients.filter((c) => c.createdBy === ownerUser.id).length;
  }
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
    if (allUsers.find((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      return setFormError("An account with this email already exists.");
    }
    if (allUsers.find((u) => u.mobile && u.mobile === form.mobile.trim())) {
      return setFormError("An account with this mobile number already exists.");
    }
    const newFirm = {
      id: storage.uid(),
      ownerName: form.ownerName.trim(),
      firmName: form.firmName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      accessType: form.accessType,
      isActive: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      clientCount: 0
    };
    storage.saveFirmAccounts([...firms, newFirm]);
    const newUser = {
      id: storage.uid(),
      email: form.email.trim(),
      password: form.password,
      name: form.ownerName.trim(),
      mobile: form.mobile.trim(),
      role: "Owner",
      isActive: true,
      accessType: form.accessType
    };
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
      accessType: "Trial"
    });
    setFormError("");
    setShowAddForm(false);
    ue.success("Firm account created successfully.");
  }
  function handleToggleActive(id) {
    const firmAcc = firms.find((f) => f.id === id);
    if (!firmAcc) return;
    const nowActive = !firmAcc.isActive;
    const updatedFirms = firms.map(
      (f) => f.id === id ? { ...f, isActive: nowActive } : f
    );
    storage.saveFirmAccounts(updatedFirms);
    const allUsers = storage.getUsers();
    const updatedUsers = allUsers.map(
      (u) => u.email.toLowerCase() === firmAcc.email.toLowerCase() ? { ...u, isActive: nowActive } : u
    );
    saveUsersNow(updatedUsers).catch(() => {
      storage.saveUsers(updatedUsers);
    });
    addAdminAuditLog(
      `Firm "${firmAcc.firmName}" ${nowActive ? "activated" : "deactivated"} by Administrator`
    );
    ue.success(
      `Firm ${nowActive ? "activated" : "deactivated"} successfully.`
    );
  }
  async function handleSaveProfile() {
    if (!profileName.trim()) {
      setProfileNameError("Name is required.");
      return;
    }
    if (profileName.trim().length < 2) {
      setProfileNameError("Name must be at least 2 characters.");
      return;
    }
    setSavingProfile(true);
    setProfileNameError("");
    try {
      const allUsers = storage.getUsers();
      const updatedUsers = allUsers.map(
        (u) => u.role === "Super Admin" ? { ...u, name: profileName.trim() } : u
      );
      await saveUsersNow(updatedUsers).catch(
        () => storage.saveUsers(updatedUsers)
      );
      setRefreshKey((k) => k + 1);
      setEditingProfile(false);
      addAdminAuditLog("Administrator updated profile name");
      ue.success("Profile updated successfully.");
    } finally {
      setSavingProfile(false);
    }
  }
  function handleUpgradeToPaid(id) {
    const firmAcc = firms.find((f) => f.id === id);
    if (!firmAcc || firmAcc.accessType === "Full") return;
    const updatedFirms = firms.map(
      (f) => f.id === id ? { ...f, accessType: "Full" } : f
    );
    storage.saveFirmAccounts(updatedFirms);
    const allUsers = storage.getUsers();
    const updatedUsers = allUsers.map(
      (u) => u.email.toLowerCase() === firmAcc.email.toLowerCase() ? { ...u, accessType: "Full" } : u
    );
    saveUsersNow(updatedUsers).catch(() => {
      storage.saveUsers(updatedUsers);
    });
    addAdminAuditLog(
      `Firm "${firmAcc.firmName}" upgraded to Paid plan by Administrator`
    );
    ue.success("Firm upgraded to Paid plan.");
  }
  const dashboardContent = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Total Firms",
          value: stats.totalFirms,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-5 h-5" }),
          color: theme.primary
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Total Active Users",
          value: stats.totalActiveUsers,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5" }),
          color: "#16a34a"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Trial Users",
          value: stats.trialFirms,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-5 h-5" }),
          color: "#d97706"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Paid Users",
          value: stats.paidFirms,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-5 h-5" }),
          color: "#7c3aed"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-100 shadow-sm p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide", children: "Plan Distribution" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-amber-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "Trial Firms" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-2 rounded-full bg-amber-200",
                  style: {
                    width: stats.totalFirms > 0 ? `${stats.trialFirms / stats.totalFirms * 80}px` : "0px"
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-gray-800", children: stats.trialFirms })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "Paid Firms" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-2 rounded-full bg-green-200",
                  style: {
                    width: stats.totalFirms > 0 ? `${stats.paidFirms / stats.totalFirms * 80}px` : "0px"
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-gray-800", children: stats.paidFirms })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border border-gray-100 shadow-sm p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide", children: "Firm Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-green-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "Active Firms" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-gray-800", children: firms.filter((f) => f.isActive).length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-red-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "Disabled Firms" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-gray-800", children: firms.filter((f) => !f.isActive).length })
          ] })
        ] })
      ] })
    ] })
  ] });
  const firmManagementContent = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[180px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: "Search by firm or owner name…",
            className: "pl-9 bg-white",
            "data-ocid": "super-admin.search_input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: planFilter,
          onValueChange: (v) => handlePlanFilterChange(v),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectTrigger,
              {
                className: "w-36 bg-white",
                "data-ocid": "super-admin.plan_filter",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Plan" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Plans" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Trial", children: "Trial" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Full", children: "Paid" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: statusFilter,
          onValueChange: (v) => handleStatusFilterChange(v),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectTrigger,
              {
                className: "w-40 bg-white",
                "data-ocid": "super-admin.status_filter",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "disabled", children: "Disabled" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            setForm({
              ownerName: "",
              firmName: "",
              email: "",
              mobile: "",
              password: "",
              accessType: "Trial"
            });
            setFormError("");
            setShowAddForm(true);
          },
          style: { background: theme.primary },
          className: "text-white flex-shrink-0",
          "data-ocid": "super-admin.primary_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            " Add Firm"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto", children: filteredFirms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "text-center py-16 text-gray-400",
        "data-ocid": "super-admin.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-12 h-12 mx-auto mb-3 opacity-25" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: firms.length === 0 ? "No firm accounts yet." : "No firms match your filters." }),
          firms.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: 'Click "Add Firm" to create the first one.' })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", "data-ocid": "super-admin.table", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { style: { background: theme.primary }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: [
        "Firm Name",
        "Owner Name",
        "Email",
        "Mobile",
        "Plan",
        "Status",
        "Clients",
        "Last Login",
        "Actions"
      ].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "th",
        {
          className: "text-left py-3 px-4 text-white font-medium whitespace-nowrap",
          children: h
        },
        h
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredFirms.map((f, i) => {
        const clientCount = getFirmClientCount(f);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors",
            "data-ocid": `super-admin.item.${i + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4 font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Building2,
                  {
                    className: "w-4 h-4 flex-shrink-0",
                    style: { color: theme.primary }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[140px]", children: f.firmName })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4 whitespace-nowrap", children: f.ownerName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4 text-gray-500 max-w-[160px] truncate", children: f.email }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4 text-gray-500 whitespace-nowrap", children: f.mobile }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4", children: f.accessType === "Full" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700 hover:bg-green-100 border-0 font-semibold text-xs px-2 py-0.5", children: "Paid" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-semibold text-xs px-2 py-0.5", children: "Trial" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4", children: f.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-700 hover:bg-green-100 border-0 font-semibold text-xs px-2 py-0.5", children: "Active" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-red-100 text-red-700 hover:bg-red-100 border-0 font-semibold text-xs px-2 py-0.5", children: "Disabled" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4 text-center font-semibold text-gray-700", children: clientCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4 text-gray-500 whitespace-nowrap text-xs", children: formatLastLogin(f.lastLogin) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleToggleActive(f.id),
                    title: f.isActive ? "Deactivate Firm" : "Activate Firm",
                    className: `p-1.5 rounded-lg text-xs font-medium transition-colors ${f.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`,
                    "data-ocid": `super-admin.toggle_button.${i + 1}`,
                    children: f.isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4" })
                  }
                ),
                f.accessType === "Trial" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleUpgradeToPaid(f.id),
                    title: "Upgrade to Paid",
                    className: "p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors",
                    "data-ocid": `super-admin.upgrade_button.${i + 1}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setViewFirm(f),
                    title: "View Details",
                    className: "p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors",
                    "data-ocid": `super-admin.view_button.${i + 1}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
                  }
                )
              ] }) })
            ]
          },
          f.id
        );
      }) })
    ] }) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-9 h-9 rounded-lg flex items-center justify-center",
          style: { background: theme.primary },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 text-white" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", style: { color: theme.primary }, children: "Administrator Panel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Manage firms, plans, and system controls" })
      ] })
    ] }),
    isProfileIncomplete && showProfileBanner && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "super-admin.profile_banner",
        className: "rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3",
        style: {
          background: "rgba(201,168,76,0.08)",
          borderColor: "rgba(201,168,76,0.4)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg flex-shrink-0", children: "👤" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", style: { color: "#7a4f03" }, children: "Complete your Administrator profile" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: "Set your display name so the system shows your identity correctly." })
            ] })
          ] }),
          editingProfile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 sm:w-64 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "super-admin.profile_name_input",
                  value: profileName,
                  onChange: (e) => {
                    setProfileName(e.target.value);
                    if (profileNameError) setProfileNameError("");
                  },
                  placeholder: "Your full name",
                  className: "h-8 text-sm",
                  autoFocus: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  "data-ocid": "super-admin.profile_save_button",
                  size: "sm",
                  className: "text-white h-8 px-3 flex-shrink-0",
                  style: { background: theme.primary },
                  onClick: handleSaveProfile,
                  disabled: savingProfile,
                  children: savingProfile ? "…" : "Save"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "h-8 px-2 flex-shrink-0",
                  onClick: () => {
                    setEditingProfile(false);
                    setProfileName((adminUser == null ? void 0 : adminUser.name) ?? "");
                    setProfileNameError("");
                  },
                  children: "✕"
                }
              )
            ] }),
            profileNameError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: profileNameError })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": "super-admin.profile_edit_button",
                size: "sm",
                className: "text-white h-8",
                style: { background: theme.primary },
                onClick: () => {
                  setProfileName((adminUser == null ? void 0 : adminUser.name) ?? "");
                  setEditingProfile(true);
                },
                children: "Update Profile"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "text-gray-400 hover:text-gray-600 text-lg leading-none",
                "aria-label": "Dismiss profile banner",
                onClick: () => setShowProfileBanner(false),
                children: "×"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("dashboard"),
          className: `flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "dashboard" ? "border-current" : "border-transparent text-gray-500 hover:text-gray-700"}`,
          style: activeTab === "dashboard" ? { color: theme.primary, borderColor: theme.primary } : {},
          "data-ocid": "super-admin.tab_dashboard",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "w-4 h-4" }),
            "Dashboard"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("firms"),
          className: `flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "firms" ? "border-current" : "border-transparent text-gray-500 hover:text-gray-700"}`,
          style: activeTab === "firms" ? { color: theme.primary, borderColor: theme.primary } : {},
          "data-ocid": "super-admin.tab_firms",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4" }),
            "Firm Management",
            firms.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold text-white",
                style: { background: theme.primary },
                children: firms.length
              }
            )
          ]
        }
      )
    ] }),
    activeTab === "dashboard" ? dashboardContent : firmManagementContent,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showAddForm, onOpenChange: setShowAddForm, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", "data-ocid": "super-admin.dialog", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { style: { color: theme.primary }, children: "Add New Firm Account" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Firm Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.firmName,
                onChange: (e) => setForm((f) => ({ ...f, firmName: e.target.value })),
                placeholder: "ABC & Associates",
                className: "mt-1",
                "data-ocid": "super-admin.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Owner Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.ownerName,
                onChange: (e) => setForm((f) => ({ ...f, ownerName: e.target.value })),
                placeholder: "CA Ramesh Gupta",
                className: "mt-1"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "email",
              value: form.email,
              onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })),
              placeholder: "owner@firm.com",
              className: "mt-1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mobile * (10 digits)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "tel",
                inputMode: "numeric",
                value: form.mobile,
                onChange: (e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm((f) => ({ ...f, mobile: digits }));
                },
                placeholder: "9876543210",
                maxLength: 10,
                className: "mt-1"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Access Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.accessType,
                onValueChange: (v) => setForm((f) => ({ ...f, accessType: v })),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Trial", children: "Trial (5 clients)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Full", children: "Paid (Unlimited)" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Login Password *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "password",
              value: form.password,
              onChange: (e) => setForm((f) => ({ ...f, password: e.target.value })),
              placeholder: "Min. 6 characters",
              className: "mt-1"
            }
          )
        ] }),
        formError && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "text-red-600 text-sm bg-red-50 rounded p-2",
            "data-ocid": "super-admin.error_state",
            children: formError
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleCreate,
              style: { background: theme.primary },
              className: "text-white flex-1",
              "data-ocid": "super-admin.submit_button",
              children: "Create Account"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              onClick: () => {
                setShowAddForm(false);
                setFormError("");
              },
              className: "flex-1",
              "data-ocid": "super-admin.cancel_button",
              children: "Cancel"
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FirmDetailsModal, { firm: viewFirm, onClose: () => setViewFirm(null) })
  ] });
}
export {
  SuperAdminPage as default
};

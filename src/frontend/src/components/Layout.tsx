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
  Briefcase,
  ClipboardList,
  Download,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Pencil,
  Receipt,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";
import { refreshFromCanister, storage } from "../data/storage";
import { type Page, THEMES, type User } from "../types";
import DeadlineBell from "./DeadlineBell";

const ownerNavItems: {
  id: Page;
  label: string;
  icon: React.ElementType;
  ownerOnly?: boolean;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    ownerOnly: true,
  },
  { id: "clients", label: "Client Master", icon: Users },
  { id: "work-processing", label: "Work Processing", icon: Briefcase },
  { id: "billing", label: "Outward & Billing", icon: Receipt, ownerOnly: true },
  {
    id: "user-management",
    label: "User Management",
    icon: UserCog,
    ownerOnly: true,
  },
  { id: "audit-log", label: "Audit Log", icon: ClipboardList, ownerOnly: true },
  { id: "export", label: "Export", icon: Download },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    ownerOnly: true,
  },
];

const superAdminNavItems: {
  id: Page;
  label: string;
  icon: React.ElementType;
}[] = [{ id: "super-admin", label: "Administrator Panel", icon: ShieldCheck }];

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

export const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  clients: "Client Master",
  "client-detail": "Client Detail",
  "work-processing": "Work Processing",
  billing: "Outward & Billing",
  "user-management": "User Management",
  export: "Export Data",
  "super-admin": "Administrator Panel",
  "audit-log": "Audit Log",
  settings: "Settings",
};

function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    name: user.name,
    mobile: user.mobile || "",
    email: user.email,
  });
  const [pwForm, setPwForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [profileError, setProfileError] = useState("");
  const [pwError, setPwError] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNextPw, setShowNextPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleSaveProfile = () => {
    setProfileError("");
    if (!form.name.trim()) return setProfileError("Name is required.");
    if (form.mobile && !/^\d{10}$/.test(form.mobile))
      return setProfileError("Mobile must be 10 digits.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setProfileError("Invalid email format.");

    const users = storage.getUsers();
    const updated = users.map((u) =>
      u.id === user.id
        ? {
            ...u,
            name: form.name.trim(),
            mobile: form.mobile.trim(),
            email: form.email.trim(),
          }
        : u,
    );
    storage.saveUsers(updated);
    const updatedUser = {
      ...user,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
    };
    storage.setCurrentUser(updatedUser);
    toast.success("Profile updated successfully");
    onOpenChange(false);
  };

  const handleChangePassword = () => {
    setPwError("");
    if (!pwForm.current) return setPwError("Current password is required.");
    const users = storage.getUsers();
    const thisUser = users.find((u) => u.id === user.id);
    if (thisUser?.password !== pwForm.current)
      return setPwError("Current password is incorrect.");
    if (!pwForm.next || pwForm.next.length < 6)
      return setPwError("New password must be at least 6 characters.");
    if (pwForm.next !== pwForm.confirm)
      return setPwError("Passwords do not match.");
    storage.saveUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, password: pwForm.next } : u,
      ),
    );
    storage.setCurrentUser({ ...user, password: pwForm.next });
    setPwForm({ current: "", next: "", confirm: "" });
    toast.success("Password changed successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" data-ocid="profile.dialog">
        <DialogHeader>
          <DialogTitle style={{ color: theme.primary }}>
            Edit Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-3">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="mt-1"
                data-ocid="profile.input"
              />
            </div>
            <div>
              <Label>Mobile (10 digits)</Label>
              <Input
                type="tel"
                inputMode="numeric"
                value={form.mobile}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                placeholder="Enter 10-digit mobile"
                maxLength={10}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            {profileError && (
              <p
                className="text-red-600 text-xs bg-red-50 rounded p-2"
                data-ocid="profile.error_state"
              >
                {profileError}
              </p>
            )}
            <Button
              onClick={handleSaveProfile}
              style={{ background: theme.primary }}
              className="text-white w-full"
              data-ocid="profile.save_button"
            >
              Save Profile
            </Button>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Change Password
            </p>
            <div className="space-y-3">
              <div>
                <Label>Current Password *</Label>
                <div className="relative mt-1">
                  <Input
                    type={showCurrentPw ? "text" : "password"}
                    value={pwForm.current}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, current: e.target.value }))
                    }
                    placeholder="Current password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showCurrentPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <Label>New Password *</Label>
                <div className="relative mt-1">
                  <Input
                    type={showNextPw ? "text" : "password"}
                    value={pwForm.next}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, next: e.target.value }))
                    }
                    placeholder="Min. 6 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNextPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showNextPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <Label>Confirm New Password *</Label>
                <div className="relative mt-1">
                  <Input
                    type={showConfirmPw ? "text" : "password"}
                    value={pwForm.confirm}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, confirm: e.target.value }))
                    }
                    placeholder="Re-enter new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {pwError && (
                <p className="text-red-600 text-xs bg-red-50 rounded p-2">
                  {pwError}
                </p>
              )}
              <Button
                onClick={handleChangePassword}
                variant="outline"
                className="w-full"
                data-ocid="profile.submit_button"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Layout({
  currentPage,
  onNavigate,
  user,
  onLogout,
  children,
}: LayoutProps) {
  const isOwner = user.role === "Owner";
  const isSuperAdmin = user.role === "Super Admin";
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme, setTheme } = useTheme();

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await refreshFromCanister();
      toast.success("Data refreshed from server.");
      window.dispatchEvent(
        new CustomEvent("taxcore-storage-change", {
          detail: { key: "refresh" },
        }),
      );
    } catch {
      toast.error("Refresh failed. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const navItems = isSuperAdmin ? superAdminNavItems : ownerNavItems;
  const roleDisplayLabel = isSuperAdmin ? "Administrator" : user.role;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col"
        style={{ background: theme.primary }}
      >
        {/* Brand */}
        <div
          className="px-5 py-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/taxcore-logo.jpeg"
              alt="TaxCore"
              className="h-9 w-auto rounded-lg object-contain flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            {/* Fallback logo icon — shown only when image fails */}
            <div
              className="w-9 h-9 rounded-lg items-center justify-center flex-shrink-0"
              style={{
                background: theme.logoIconBg,
                display: "none",
              }}
            >
              <Shield
                className="w-5 h-5"
                style={{ color: theme.logoIconText }}
              />
            </div>
            <div>
              <div
                className="text-white font-bold text-lg"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                TaxCore
              </div>
              <div className="text-xs" style={{ color: theme.subtitle }}>
                {isSuperAdmin ? "Administrator" : "ITR Tracker"}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            if (
              !isSuperAdmin &&
              (item as { ownerOnly?: boolean }).ownerOnly &&
              !isOwner
            )
              return null;
            const Icon = item.icon;
            const isActive =
              currentPage === item.id ||
              (item.id === "clients" && currentPage === "client-detail");
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all"
                data-ocid={`nav.${item.id}.link`}
                style={{
                  background: isActive ? theme.activeHighlight : "transparent",
                  color: isActive
                    ? theme.activeNavText
                    : "rgba(255,255,255,0.55)",
                  borderLeft: isActive
                    ? `3px solid ${theme.activeNavBorder}`
                    : "3px solid transparent",
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: isActive
                      ? theme.activeNavText
                      : "rgba(255,255,255,0.45)",
                  }}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Theme Switcher */}
        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <p
            className="text-xs mb-2 font-medium"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Color Theme
          </p>
          <div className="flex items-center gap-2">
            {Object.values(THEMES).map((t) => (
              <button
                type="button"
                key={t.key}
                title={t.label}
                onClick={() => setTheme(t.key)}
                className="w-7 h-7 rounded-full transition-all flex-shrink-0"
                style={{
                  background: t.primary,
                  border:
                    theme.key === t.key
                      ? "2px solid #fff"
                      : "2px solid rgba(255,255,255,0.3)",
                  transform: theme.key === t.key ? "scale(1.15)" : "scale(1)",
                  boxShadow:
                    theme.key === t.key
                      ? "0 0 0 1px rgba(255,255,255,0.5)"
                      : "none",
                }}
              />
            ))}
          </div>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {THEMES[theme.key].label}
          </p>
        </div>

        {/* Secure Cloud badge */}
        <div className="px-4 pb-2">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            <ShieldCheck
              className="w-3 h-3 flex-shrink-0"
              style={{ color: theme.gold }}
            />
            <span>Secure Cloud &middot; Auto Backup</span>
          </div>
        </div>

        {/* User row */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEditProfile(true)}
              title="Edit Profile"
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 hover:opacity-80 transition-opacity"
              style={{
                background: theme.avatarBg,
                color: theme.avatarText,
              }}
              data-ocid="nav.profile.button"
            >
              {initials}
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {user.name}
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfile(true)}
                className="text-xs flex items-center gap-0.5 hover:opacity-80 transition-opacity"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {roleDisplayLabel}
                <Pencil className="w-2.5 h-2.5 ml-0.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Logout"
              className="p-1 rounded transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}
              data-ocid="nav.logout.button"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ background: "#F5F3EE" }}
      >
        {/* Top nav bar */}
        <header
          className="bg-white px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid #EDE8DC" }}
        >
          <div>
            <h1
              className="text-xl"
              style={{
                color: theme.pageTitleColor,
                fontWeight: 600,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {pageTitles[currentPage]}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#AAA" }}>
              TaxCore &rsaquo; {pageTitles[currentPage]}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh data from server"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all hover:opacity-90 disabled:opacity-60"
              style={{
                background: theme.primary,
                color: "#fff",
                border: "none",
                cursor: isRefreshing ? "not-allowed" : "pointer",
              }}
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? "animate-spin" : ""}
              />
              {isRefreshing ? "Syncing…" : "Refresh"}
            </button>
            <DeadlineBell user={user} onNavigate={onNavigate} />
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        <footer
          className="bg-white border-t px-6 py-2 flex items-center justify-end"
          style={{ borderColor: "#EDE8DC" }}
        >
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} TaxCore &mdash; A complete
            workflow tool for tax professionals
          </p>
        </footer>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        user={user}
        open={showEditProfile}
        onOpenChange={setShowEditProfile}
      />
    </div>
  );
}

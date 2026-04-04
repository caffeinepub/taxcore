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
  LayoutDashboard,
  LogOut,
  Pencil,
  Receipt,
  Settings,
  Shield,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";
import { storage } from "../data/storage";
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
          <DialogTitle style={{ color: "var(--theme-primary, #6B1A2B)" }}>
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
              style={{ background: "var(--theme-primary, #6B1A2B)" }}
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
                <Input
                  type="password"
                  value={pwForm.current}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, current: e.target.value }))
                  }
                  placeholder="Current password"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>New Password *</Label>
                <Input
                  type="password"
                  value={pwForm.next}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, next: e.target.value }))
                  }
                  placeholder="Min. 6 characters"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Confirm New Password *</Label>
                <Input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) =>
                    setPwForm((f) => ({ ...f, confirm: e.target.value }))
                  }
                  placeholder="Re-enter new password"
                  className="mt-1"
                />
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
  const { theme, setTheme } = useTheme();
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
            <div
              className="w-9 h-9 rounded-lg items-center justify-center flex-shrink-0"
              style={{ background: "#C9A84C", display: "none" }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div
                className="text-white font-bold text-lg"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                TaxCore
              </div>
              <div
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
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
                  background: isActive
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                  borderLeft: isActive
                    ? "2px solid #C9A84C"
                    : "2px solid transparent",
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{
                    color: isActive ? "#C9A84C" : "rgba(255,255,255,0.5)",
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
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {THEMES[theme.key].label}
          </p>
        </div>

        {/* Secure Cloud badge */}
        <div className="px-4 pb-2">
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <ShieldCheck
              className="w-3 h-3 flex-shrink-0"
              style={{ color: "#C9A84C" }}
            />
            <span>Secure Cloud \u00b7 Auto Backup</span>
          </div>
        </div>

        {/* User */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEditProfile(true)}
              title="Edit Profile"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hover:opacity-80 transition-opacity"
              style={{ background: "#C9A84C" }}
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

      {/* Main */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ background: "#FAF7F2" }}
      >
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div>
            <h1
              className="text-xl font-semibold"
              style={{
                color: "var(--theme-primary, #6B1A2B)",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {pageTitles[currentPage]}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              TaxCore &rsaquo; {pageTitles[currentPage]}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
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

        <footer className="bg-white border-t px-6 py-2 flex items-center justify-end">
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

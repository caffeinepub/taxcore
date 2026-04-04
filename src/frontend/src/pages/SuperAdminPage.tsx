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
  Building2,
  CheckCircle,
  Plus,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { storage } from "../data/storage";
import type { FirmAccount, User } from "../types";

export default function SuperAdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState({
    ownerName: "",
    firmName: "",
    email: "",
    mobile: "",
    password: "",
    accessType: "Trial" as "Trial" | "Full",
  });
  const [formError, setFormError] = useState("");

  const firms = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    return storage.getFirmAccounts();
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleCreate = () => {
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

    // Check duplicate email across users
    const users = storage.getUsers();
    if (users.find((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
      return setFormError("An account with this email already exists.");
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
    storage.saveFirmAccounts([...firms, newFirm]);

    // Also create an Owner user account
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
    storage.saveUsers([...users, newUser]);

    setForm({
      ownerName: "",
      firmName: "",
      email: "",
      mobile: "",
      password: "",
      accessType: "Trial",
    });
    setShowForm(false);
    refresh();
  };

  const handleToggleActive = (id: string) => {
    const updated = firms.map((f) =>
      f.id === id ? { ...f, isActive: !f.isActive } : f,
    );
    storage.saveFirmAccounts(updated);

    // Sync user active status
    const firmAcc = firms.find((f) => f.id === id);
    if (firmAcc) {
      const users = storage.getUsers();
      const updatedUsers = users.map((u) =>
        u.email.toLowerCase() === firmAcc.email.toLowerCase()
          ? { ...u, isActive: !firmAcc.isActive }
          : u,
      );
      storage.saveUsers(updatedUsers);
    }
    refresh();
  };

  const handleToggleAccess = (id: string) => {
    const updated = firms.map((f) =>
      f.id === id
        ? { ...f, accessType: f.accessType === "Trial" ? "Full" : "Trial" }
        : f,
    ) as FirmAccount[];
    storage.saveFirmAccounts(updated);

    // Sync user access type
    const firmAcc = firms.find((f) => f.id === id);
    if (firmAcc) {
      const users = storage.getUsers();
      const newAccess: "Trial" | "Full" =
        firmAcc.accessType === "Trial" ? "Full" : "Trial";
      const updatedUsers = users.map((u) =>
        u.email.toLowerCase() === firmAcc.email.toLowerCase()
          ? { ...u, accessType: newAccess }
          : u,
      );
      storage.saveUsers(updatedUsers);
    }
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this firm account? This cannot be undone.")) return;
    const firmAcc = firms.find((f) => f.id === id);
    storage.saveFirmAccounts(firms.filter((f) => f.id !== id));
    // Remove associated user
    if (firmAcc) {
      const users = storage.getUsers();
      storage.saveUsers(
        users.filter(
          (u) => u.email.toLowerCase() !== firmAcc.email.toLowerCase(),
        ),
      );
    }
    refresh();
  };

  const stats = {
    total: firms.length,
    active: firms.filter((f) => f.isActive).length,
    trial: firms.filter((f) => f.accessType === "Trial").length,
    full: firms.filter((f) => f.accessType === "Full").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Firms", value: stats.total, color: "#6B1A2B" },
          { label: "Active", value: stats.active, color: "#16a34a" },
          { label: "Trial", value: stats.trial, color: "#d97706" },
          { label: "Full Access", value: stats.full, color: "#7c3aed" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-lg p-4 shadow-sm border text-center"
          >
            <div className="text-3xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" style={{ color: "#6B1A2B" }} />
          <h2 className="text-lg font-semibold" style={{ color: "#6B1A2B" }}>
            Firm Accounts
          </h2>
        </div>
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
            setShowForm(true);
          }}
          style={{ background: "#6B1A2B" }}
          className="text-white"
          data-ocid="super-admin.primary_button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Firm Account
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        {firms.length === 0 ? (
          <div
            className="text-center py-16 text-gray-400"
            data-ocid="super-admin.empty_state"
          >
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No firm accounts yet.</p>
            <p className="text-sm mt-1">
              Click &ldquo;Add Firm Account&rdquo; to create the first one.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm" data-ocid="super-admin.table">
            <thead style={{ background: "#6B1A2B" }}>
              <tr>
                {[
                  "Firm Name",
                  "Owner",
                  "Email",
                  "Mobile",
                  "Access",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-white font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {firms.map((f, i) => (
                <tr
                  key={f.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                  data-ocid={`super-admin.item.${i + 1}`}
                >
                  <td className="py-2.5 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <Building2
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "#6B1A2B" }}
                      />
                      {f.firmName}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">{f.ownerName}</td>
                  <td className="py-2.5 px-4 text-gray-500">{f.email}</td>
                  <td className="py-2.5 px-4 text-gray-500">{f.mobile}</td>
                  <td className="py-2.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleAccess(f.id)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        f.accessType === "Full"
                          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      }`}
                      title="Click to toggle Trial / Full"
                    >
                      {f.accessType}
                    </button>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        f.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {f.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(f.id)}
                        title={f.isActive ? "Deactivate" : "Activate"}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        {f.isActive ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(f.id)}
                        title="Delete"
                        className="p-1 rounded hover:bg-red-100 text-red-400"
                        data-ocid={`super-admin.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Firm Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md" data-ocid="super-admin.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "#6B1A2B" }}>
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
                    <SelectItem value="Full">Full (Unlimited)</SelectItem>
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
                style={{ background: "#6B1A2B" }}
                className="text-white flex-1"
                data-ocid="super-admin.submit_button"
              >
                Create Account
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
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
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Plus, Trash2, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { storage } from "../data/storage";
import type { User } from "../types";

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function UserManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    mobile: "",
  });
  const [formError, setFormError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const currentUser = storage.getCurrentUser();

  const { ownerUser, staffUsers } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    const users = storage.getUsers();
    // Only show Owner and Staff -- hide Administrator (Super Admin)
    const visible = users.filter(
      (u) => u.role === "Owner" || u.role === "Staff",
    );
    const ownerUser = visible.find((u) => u.role === "Owner") || null;
    const staffUsers = visible.filter((u) => u.role === "Staff");
    return { ownerUser, staffUsers };
  }, [refreshKey]);

  // All visible users for duplicate check
  const allUsers = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    return storage.getUsers();
  }, [refreshKey]);

  const handleAdd = () => {
    setFormError("");
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!form.email.trim() || !isValidEmail(form.email))
      return setFormError("Please enter a valid email address.");
    if (form.mobile && !/^\d{10}$/.test(form.mobile))
      return setFormError("Mobile must be exactly 10 digits.");
    if (!form.password.trim() || form.password.length < 6)
      return setFormError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword)
      return setFormError("Passwords do not match.");
    if (
      allUsers.find((u) => u.email.toLowerCase() === form.email.toLowerCase())
    ) {
      return setFormError("A user with this email already exists.");
    }
    const newUser: User = {
      id: storage.uid(),
      email: form.email.trim(),
      password: form.password,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      role: "Staff",
      isActive: true,
    };
    storage.saveUsers([...allUsers, newUser]);
    setForm({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      mobile: "",
    });
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = (id: string) => {
    if (currentUser?.id === id)
      return alert("Cannot delete the currently logged-in user.");
    const target = allUsers.find((u) => u.id === id);
    if (target?.role === "Owner")
      return alert("Cannot delete the Owner account.");
    if (target?.role === "Super Admin")
      return alert("Cannot delete the Administrator account.");
    if (!confirm("Delete this staff user?")) return;
    storage.saveUsers(allUsers.filter((u) => u.id !== id));
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-5">
      {/* Owner Card */}
      {ownerUser && (
        <div
          className="bg-white rounded-lg border p-4 shadow-sm"
          data-ocid="user-management.panel"
        >
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4" style={{ color: "#C9A44C" }} />
            <h3 className="font-semibold text-sm" style={{ color: "#6B1A2B" }}>
              Owner Account
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: "#6B1A2B" }}
            >
              {ownerUser.name[0].toUpperCase()}
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium">{ownerUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-700">{ownerUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mobile</p>
                <p className="font-medium">
                  {ownerUser.mobile || (
                    <span className="text-gray-300 italic">Not set</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <Crown className="w-3 h-3" />
                  Owner
                </span>
              </div>
              {ownerUser.accessType && (
                <div>
                  <p className="text-xs text-gray-500">Plan</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      ownerUser.accessType === "Full"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {ownerUser.accessType}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff section header + add button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: "#6B1A2B" }}>
          Staff Members ({staffUsers.length})
        </h3>
        <Button
          onClick={() => {
            setForm({
              email: "",
              password: "",
              confirmPassword: "",
              name: "",
              mobile: "",
            });
            setFormError("");
            setShowForm(true);
          }}
          style={{ background: "#6B1A2B" }}
          className="text-white"
          data-ocid="user-management.primary_button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Staff User
        </Button>
      </div>

      <div
        className="bg-white rounded-lg shadow-sm border overflow-x-auto"
        data-ocid="user-management.table"
      >
        <table className="w-full text-sm">
          <thead style={{ background: "#6B1A2B" }}>
            <tr>
              {["Name", "Email", "Mobile", "Role", "Actions"].map((h) => (
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
            {staffUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-400"
                  data-ocid="user-management.empty_state"
                >
                  No staff users yet. Add your first staff member.
                </td>
              </tr>
            )}
            {staffUsers.map((u, i) => (
              <tr
                key={u.id}
                className="border-b last:border-0 hover:bg-gray-50"
                data-ocid={`user-management.item.${i + 1}`}
              >
                <td className="py-2.5 px-4 font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "#6B1A2B" }}
                    >
                      {u.name[0].toUpperCase()}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="py-2.5 px-4 text-gray-500">{u.email}</td>
                <td className="py-2.5 px-4 text-gray-500">
                  {u.mobile || <span className="text-gray-300 italic">—</span>}
                </td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Staff
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(u.id)}
                    className="p-1 rounded hover:bg-red-100 text-red-400"
                    data-ocid={`user-management.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm" data-ocid="user-management.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "#6B1A2B" }}>
              Add Staff User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Name *</Label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Staff member name"
                className="mt-1"
                data-ocid="user-management.input"
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
                placeholder="staff@firm.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Mobile (10 digits, optional)</Label>
              <Input
                type="tel"
                inputMode="numeric"
                value={form.mobile}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm((f) => ({ ...f, mobile: digits }));
                }}
                placeholder="Enter 10-digit mobile"
                maxLength={10}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Minimum 6 characters"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Confirm Password *</Label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                placeholder="Re-enter password"
                className="mt-1"
              />
            </div>
            {formError && (
              <p
                className="text-red-600 text-sm bg-red-50 rounded p-2"
                data-ocid="user-management.error_state"
              >
                {formError}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleAdd}
                style={{ background: "#6B1A2B" }}
                className="text-white flex-1"
                data-ocid="user-management.submit_button"
              >
                Create Staff
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
                data-ocid="user-management.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note about future features */}
      <div className="text-xs text-gray-400 text-center pt-2">
        <UserCheck className="w-3.5 h-3.5 inline mr-1" />
        Staff users have limited access. Option to update mobile and email
        coming in a future update.
      </div>
    </div>
  );
}

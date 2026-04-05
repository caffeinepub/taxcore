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
  AlertTriangle,
  Bell,
  Edit2,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import DatePickerInput from "../components/DatePickerInput";
import InlineStatusCell from "../components/InlineStatusCell";
import {
  getHeadOfIncome as getClientHeadOfIncome,
  getClientWork,
  getDaysUntilDue,
  getDueAlertClients,
  getLatestDoc,
  getLatestDocStatus,
  getPanCategory,
  onStorageChange,
  storage,
} from "../data/storage";
import type { Client, WorkProcessing } from "../types";
import { getCurrentTaxYear, getTaxYears } from "../utils/taxYears";

const TAX_YEARS = getTaxYears();
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const WORK_STATUS_OPTIONS = [
  {
    label: "Pending",
    value: "Pending",
    colorClass: "bg-orange-100 text-orange-700",
  },
  {
    label: "In Progress",
    value: "In Progress",
    colorClass: "bg-blue-100 text-blue-700",
  },
  {
    label: "Completed",
    value: "Completed",
    colorClass: "bg-green-100 text-green-700",
  },
];

const DOC_STATUS_OPTIONS = [
  {
    label: "Complete",
    value: "Complete",
    colorClass: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Partial",
    value: "Partial",
    colorClass: "bg-yellow-100 text-yellow-700",
  },
];

const HEAD_OF_INCOME_OPTIONS = [
  "Salaried",
  "Business",
  "Agricultural",
  "Capital Gain",
] as const;

type HeadOfIncomeType = (typeof HEAD_OF_INCOME_OPTIONS)[number];

interface Props {
  onViewClient: (client: Client) => void;
  currentUserId: string;
}

export default function ClientMasterPage({
  onViewClient,
  currentUserId,
}: Props) {
  const currentUser = storage.getCurrentUser();
  const TRIAL_LIMIT = 5;
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [formError, setFormError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [alertClients, setAlertClients] = useState(() => getDueAlertClients());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    setAlertClients(getDueAlertClients());
    const unsub = onStorageChange(() => setAlertClients(getDueAlertClients()));
    return unsub;
  }, []);

  const [form, setForm] = useState({
    name: "",
    pan: "",
    mobile: "",
    email: "",
    clientType: "Existing" as "Existing" | "New",
    headOfIncome: "Salaried" as HeadOfIncomeType,
    businessName: "",
    taxYear: getCurrentTaxYear(),
    dueDate: "",
  });

  const clients = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    let list = storage.getClients();
    if (filterYear !== "All")
      list = list.filter((c) => c.taxYear === filterYear);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.pan.toLowerCase().includes(q) ||
          c.mobile.includes(q),
      );
    }
    return list;
  }, [search, filterYear, refreshKey]);

  const getCurrentUserName = () => {
    return (
      storage.getUsers().find((u) => u.id === currentUserId)?.name || "Unknown"
    );
  };

  const openAdd = () => {
    // Trial limit check
    if (currentUser?.accessType === "Trial") {
      const ownerClients = storage.getClients().filter((c) => {
        return currentUser.role === "Owner"
          ? true // owner sees all; limit applies to firm total
          : c.createdBy === currentUser.id;
      });
      if (ownerClients.length >= TRIAL_LIMIT) {
        setShowUpgradeModal(true);
        return;
      }
    }
    setEditClient(null);
    setForm({
      name: "",
      pan: "",
      mobile: "",
      email: "",
      clientType: "Existing",
      headOfIncome: "Salaried",
      businessName: "",
      taxYear: getCurrentTaxYear(),
      dueDate: "",
    });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (c: Client) => {
    setEditClient(c);
    setForm({
      name: c.name,
      pan: c.pan,
      mobile: c.mobile,
      email: c.email,
      clientType: c.clientType,
      headOfIncome:
        (getClientHeadOfIncome(c) as HeadOfIncomeType) || "Salaried",
      businessName: c.businessName,
      taxYear: c.taxYear,
      dueDate: c.dueDate,
    });
    setFormError("");
    setShowForm(true);
  };

  const validateDate = (d: string): boolean => {
    if (!d) return false;
    const parts = d.split("-");
    if (parts.length !== 3) return false;
    const [dd, mm, yyyy] = parts;
    const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return !Number.isNaN(dt.getTime()) && dt.getFullYear() === Number(yyyy);
  };

  const handleSave = () => {
    setFormError("");
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!PAN_REGEX.test(form.pan.toUpperCase()))
      return setFormError("Invalid PAN format (e.g. ABCDE1234F).");
    if (!/^\d{10}$/.test(form.mobile))
      return setFormError("Mobile must be exactly 10 digits.");
    if (!form.taxYear) return setFormError("Tax Year is required.");
    if (!validateDate(form.dueDate))
      return setFormError("Due Date must be in DD-MM-YYYY format.");
    // Validate Due Date is after tax year end (31 March of end year)
    if (form.taxYear && validateDate(form.dueDate)) {
      const endYear = Number(form.taxYear.split("-")[1]);
      const taxYearEnd = new Date(endYear, 2, 31); // March 31 of end year
      const dueParts = form.dueDate.split("-");
      const dueDate = new Date(
        Number(dueParts[2]),
        Number(dueParts[1]) - 1,
        Number(dueParts[0]),
      );
      if (dueDate <= taxYearEnd)
        return setFormError(
          `Due Date must be after 31-03-${endYear} (end of tax year ${form.taxYear}).`,
        );
    }

    const pan = form.pan.toUpperCase();
    const allClients = storage.getClients();
    const dup = allClients.find(
      (c) =>
        c.pan.toUpperCase() === pan &&
        c.taxYear === form.taxYear &&
        c.id !== editClient?.id,
    );
    if (dup)
      return setFormError(
        "A client with this PAN and Tax Year already exists. To file a Revised or Updated return, open the existing client and update the Return Type in Work Processing.",
      );

    if (editClient) {
      const updated: Client = {
        ...editClient,
        name: form.name,
        pan,
        mobile: form.mobile,
        email: form.email,
        clientType: form.clientType,
        headOfIncome: form.headOfIncome,
        businessName: form.headOfIncome === "Business" ? form.businessName : "",
        taxYear: form.taxYear,
        dueDate: form.dueDate,
        clientCategory: getPanCategory(pan),
      };
      storage.saveClients(
        allClients.map((c) => (c.id === editClient.id ? updated : c)),
      );
    } else {
      const newClient: Client = {
        id: storage.uid(),
        name: form.name,
        pan,
        mobile: form.mobile,
        email: form.email,
        clientType: form.clientType,
        headOfIncome: form.headOfIncome,
        businessName: form.headOfIncome === "Business" ? form.businessName : "",
        taxYear: form.taxYear,
        dueDate: form.dueDate,
        clientCategory: getPanCategory(pan),
        createdAt: new Date().toISOString(),
        createdBy: currentUserId,
      };
      storage.saveClients([...allClients, newClient]);
      // Auto-create work processing
      const work = storage.getWork();
      const wp: WorkProcessing = {
        id: storage.uid(),
        clientId: newClient.id,
        taxYear: form.taxYear,
        status: "Pending",
        itrForm: "",
        ackNumber: "",
        filingDate: "",
        filingStatus: "Pending",
        updatedAt: new Date().toISOString(),
      };
      storage.saveWork([...work, wp]);
    }

    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this client and all related data?")) return;
    storage.saveClients(storage.getClients().filter((c) => c.id !== id));
    storage.saveWork(storage.getWork().filter((w) => w.clientId !== id));
    storage.saveDocuments(
      storage.getDocuments().filter((d) => d.clientId !== id),
    );
    storage.saveBilling(storage.getBilling().filter((b) => b.clientId !== id));
    setRefreshKey((k) => k + 1);
  };

  const handleWorkStatusSave = (client: Client, newVal: string) => {
    const work = getClientWork(client.id);
    if (!work) return;
    const oldVal = work.status === "Filed" ? "Completed" : work.status;
    if (oldVal === newVal) return;

    const allWork = storage.getWork();
    storage.saveWork(
      allWork.map((w) =>
        w.id === work.id
          ? {
              ...w,
              status: newVal as WorkProcessing["status"],
              updatedAt: new Date().toISOString(),
            }
          : w,
      ),
    );

    storage.addAuditLog({
      id: storage.uid(),
      userId: currentUserId,
      userName: getCurrentUserName(),
      action: "Updated Work Status",
      clientId: client.id,
      clientName: client.name,
      fieldChanged: "Work Status",
      oldValue: oldVal,
      newValue: newVal,
      timestamp: new Date().toISOString(),
    });

    toast.success("Status updated", {
      description: `${client.name} \u2192 ${newVal}`,
    });

    setRefreshKey((k) => k + 1);
  };

  const handleDocStatusSave = (client: Client, newVal: string) => {
    const latestDoc = getLatestDoc(client.id);
    const oldVal = latestDoc?.status ?? "-";
    if (oldVal === newVal) return;

    if (latestDoc) {
      const allDocs = storage.getDocuments();
      storage.saveDocuments(
        allDocs.map((d) =>
          d.id === latestDoc.id
            ? { ...d, status: newVal as "Complete" | "Partial" }
            : d,
        ),
      );
    }

    storage.addAuditLog({
      id: storage.uid(),
      userId: currentUserId,
      userName: getCurrentUserName(),
      action: "Updated Inward Docs Status",
      clientId: client.id,
      clientName: client.name,
      fieldChanged: "Inward Docs Status",
      oldValue: oldVal,
      newValue: newVal,
      timestamp: new Date().toISOString(),
    });

    toast.success("Doc status updated", {
      description: `${client.name} \u2192 ${newVal}`,
    });

    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-4">
      {/* Priority Alert Banner */}
      {!alertDismissed && alertClients.length > 0 && (
        <div
          data-ocid="clients.alert.panel"
          className="relative rounded-lg shadow-md p-4 mb-4 border"
          style={{
            background: "rgba(220,38,38,0.05)",
            borderColor: "rgba(220,38,38,0.25)",
            borderLeft: "4px solid #dc2626",
          }}
        >
          <button
            type="button"
            onClick={() => setAlertDismissed(true)}
            className="absolute top-2 right-2 p-1 rounded hover:bg-red-100 text-gray-400"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-red-700">
              {alertClients.length} client{alertClients.length > 1 ? "s" : ""}{" "}
              with urgent due dates
            </span>
          </div>
          <ul className="space-y-1">
            {alertClients.map(({ client, daysLeft }) => (
              <li key={client.id} className="flex items-center gap-2 text-sm">
                <AlertTriangle
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    daysLeft < 0
                      ? "text-yellow-500"
                      : daysLeft <= 5
                        ? "text-red-500"
                        : "text-amber-500"
                  }`}
                />
                <span className="font-medium">{client.name}</span>
                <span className="text-gray-500 font-mono text-xs">
                  {client.pan}
                </span>
                <span className="text-gray-600">Due: {client.dueDate}</span>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                    daysLeft < 0
                      ? "bg-yellow-100 text-yellow-700"
                      : daysLeft <= 5
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {daysLeft < 0
                    ? `${Math.abs(daysLeft)}d overdue`
                    : daysLeft === 0
                      ? "Due today"
                      : `${daysLeft}d left`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters & Add Button */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search name, PAN, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
              data-ocid="clients.search_input"
            />
          </div>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-36" data-ocid="clients.filter.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Years</SelectItem>
              {TAX_YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={openAdd}
          style={{ background: "var(--theme-primary, #6B1A2B)" }}
          className="text-white"
          data-ocid="clients.primary_button"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Client
        </Button>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-lg shadow-sm border overflow-x-auto"
        data-ocid="clients.table"
      >
        <table className="w-full text-sm">
          <thead style={{ background: "var(--theme-primary, #6B1A2B)" }}>
            <tr>
              {[
                "Name",
                "PAN",
                "Head of Income",
                "Business Name",
                "Tax Year",
                "Due Date",
                "Doc Status",
                "Work Status",
                "Work Remark",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-3 px-3 text-white font-medium text-xs"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="py-10 text-center text-gray-400"
                  data-ocid="clients.empty_state"
                >
                  No clients found. Add your first client.
                </td>
              </tr>
            )}
            {clients.map((client, i) => {
              const days = getDaysUntilDue(client.dueDate);
              const isAlert = days !== null && days <= 10;
              const latestDoc = getLatestDocStatus(client.id);
              const work = getClientWork(client.id);
              const docHasEntry = latestDoc !== "-";
              const headOfIncome = getClientHeadOfIncome(client);
              // Normalize legacy "Filed" to "Completed" for display
              const workStatusDisplay =
                work?.status === "Filed"
                  ? "Completed"
                  : work?.status || "Pending";
              const alertRowClass =
                days !== null && days < 0
                  ? "bg-yellow-50 border-l-4 border-l-yellow-400"
                  : isAlert && days !== null && days <= 5
                    ? "bg-red-50 border-l-4 border-l-red-500"
                    : isAlert
                      ? "bg-amber-50 border-l-4 border-l-amber-400"
                      : "";
              return (
                <tr
                  key={client.id}
                  data-ocid={`clients.item.${i + 1}`}
                  className={`border-b last:border-0 hover:bg-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/30"} ${alertRowClass}`}
                >
                  <td className="py-2.5 px-3 font-medium">
                    <button
                      type="button"
                      onClick={() => onViewClient(client)}
                      className="hover:underline"
                      style={{ color: "var(--theme-primary, #6B1A2B)" }}
                    >
                      {client.name}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs">
                    {client.pan}
                  </td>
                  <td className="py-2.5 px-3 text-xs">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        headOfIncome === "Business"
                          ? "bg-purple-100 text-purple-700"
                          : headOfIncome === "Salaried"
                            ? "bg-blue-100 text-blue-700"
                            : headOfIncome === "Agricultural"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {headOfIncome}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-600">
                    {headOfIncome === "Business" && client.businessName ? (
                      client.businessName
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs">{client.taxYear}</td>
                  <td className="py-2.5 px-3">
                    <span className="flex items-center gap-1">
                      {isAlert && (
                        <AlertTriangle
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            days !== null && days < 0
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        />
                      )}
                      <span
                        className={`text-xs ${
                          days !== null && days < 0
                            ? "text-yellow-600 font-semibold"
                            : isAlert
                              ? "text-red-600 font-semibold"
                              : ""
                        }`}
                      >
                        {client.dueDate}
                      </span>
                      {isAlert && days !== null && (
                        <span
                          className={`text-xs ${
                            days < 0 ? "text-yellow-500" : "text-red-500"
                          }`}
                        >
                          ({days < 0 ? `${Math.abs(days)}d ago` : `${days}d`})
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {docHasEntry ? (
                      <InlineStatusCell
                        value={latestDoc}
                        options={DOC_STATUS_OPTIONS}
                        onSave={(newVal) => handleDocStatusSave(client, newVal)}
                      />
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No docs
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <InlineStatusCell
                      value={workStatusDisplay}
                      options={WORK_STATUS_OPTIONS}
                      onSave={(newVal) => handleWorkStatusSave(client, newVal)}
                    />
                  </td>
                  <td className="py-2.5 px-3 max-w-[160px]">
                    {work?.remark ? (
                      <span
                        className="text-xs text-gray-700 italic block truncate"
                        title={work.remark}
                      >
                        {work.remark}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onViewClient(client)}
                        title="View"
                        className="p-1 rounded hover:bg-gray-200 text-gray-500"
                        data-ocid={`clients.item.${i + 1}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(client)}
                        title="Edit"
                        className="p-1 rounded hover:bg-gray-200 text-gray-500"
                        data-ocid={`clients.edit_button.${i + 1}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(client.id)}
                        title="Delete"
                        className="p-1 rounded hover:bg-red-100 text-red-400"
                        data-ocid={`clients.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="clients.dialog"
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--theme-primary, #6B1A2B)" }}>
              {editClient ? "Edit Client" : "Add New Client"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Full name"
                  className="mt-1"
                  data-ocid="clients.input"
                />
              </div>
              <div>
                <Label>PAN *</Label>
                <Input
                  value={form.pan}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pan: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="mt-1 font-mono uppercase"
                />
              </div>
              <div>
                <Label>Mobile * (10 digits)</Label>
                <Input
                  value={form.mobile}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="Enter 10-digit mobile"
                  type="tel"
                  inputMode="numeric"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="email@example.com (optional)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Client Type</Label>
                <Select
                  value={form.clientType}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      clientType: v as "Existing" | "New",
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Existing">Existing</SelectItem>
                    <SelectItem value="New">New</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Head of Income</Label>
                <Select
                  value={form.headOfIncome}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      headOfIncome: v as HeadOfIncomeType,
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEAD_OF_INCOME_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.headOfIncome === "Business" && (
                <div className="col-span-2">
                  <Label>Business Name *</Label>
                  <Input
                    value={form.businessName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, businessName: e.target.value }))
                    }
                    placeholder="Business / firm name"
                    className="mt-1"
                  />
                </div>
              )}
              <div>
                <Label>Tax Year *</Label>
                <Select
                  value={form.taxYear}
                  onValueChange={(v) => setForm((f) => ({ ...f, taxYear: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date * (DD-MM-YYYY)</Label>
                <DatePickerInput
                  value={form.dueDate}
                  onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))}
                  placeholder="DD-MM-YYYY"
                  className="mt-1"
                />
              </div>
            </div>
            {formError && (
              <p
                className="text-red-600 text-sm bg-red-50 rounded p-2"
                data-ocid="clients.error_state"
              >
                {formError}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                style={{ background: "var(--theme-primary, #6B1A2B)" }}
                className="text-white flex-1"
                data-ocid="clients.submit_button"
              >
                Save Client
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
                data-ocid="clients.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trial Upgrade Dialog */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-sm" data-ocid="trial.dialog">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--theme-primary, #6B1A2B)" }}>
              Trial Limit Reached
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>
              <p className="text-sm text-gray-700 text-center">
                You&apos;ve reached the <strong>5 client limit</strong> for the
                Trial plan.
              </p>
              <p className="text-xs text-gray-500 text-center">
                Contact your Administrator to upgrade to the{" "}
                <strong>Full plan</strong> for unlimited clients.
              </p>
            </div>
            <Button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full text-white"
              style={{ background: "var(--theme-primary, #6B1A2B)" }}
              data-ocid="trial.close_button"
            >
              OK, Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

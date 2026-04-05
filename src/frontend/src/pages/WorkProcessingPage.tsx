import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Edit2, Lock, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import DatePickerInput from "../components/DatePickerInput";
import { getFilingStatus, onStorageChange, storage } from "../data/storage";
import type { Client, User, WorkProcessing } from "../types";
import { getTaxYears } from "../utils/taxYears";

const TAX_YEARS = ["All", ...getTaxYears()];
const ITR_FORMS = [
  "ITR-1",
  "ITR-2",
  "ITR-3",
  "ITR-4",
  "ITR-5",
  "ITR-6",
  "ITR-7",
];

interface WorkProcessingPageProps {
  user?: User;
}

/** Derive DD-MM-YYYY from last 6 digits of a 15-digit ack number (positions 10-15). */
function deriveFilingDateFromAck(digits: string): string | null {
  if (digits.length !== 15) return null;
  const last6 = digits.slice(9, 15);
  const dd = last6.slice(0, 2);
  const mm = last6.slice(2, 4);
  const yy = last6.slice(4, 6);
  const yyyy = `20${yy}`;
  const dayNum = Number(dd);
  const monthNum = Number(mm);
  const yearNum = Number(yyyy);
  if (
    dayNum < 1 ||
    dayNum > 31 ||
    monthNum < 1 ||
    monthNum > 12 ||
    yearNum < 2000 ||
    yearNum > 2099
  ) {
    return null;
  }
  const dt = new Date(yearNum, monthNum - 1, dayNum);
  if (
    dt.getFullYear() !== yearNum ||
    dt.getMonth() !== monthNum - 1 ||
    dt.getDate() !== dayNum
  ) {
    return null;
  }
  return `${dd}-${mm}-${yyyy}`;
}

// Inline editable acknowledgement number cell
function AckNumberCell({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    if (localVal && !/^\d{15}$/.test(localVal)) {
      toast.error("Ack number must be 15 digits");
      setLocalVal(value);
      setEditing(false);
      return;
    }
    onSave(localVal);
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={localVal}
        onChange={(e) =>
          setLocalVal(e.target.value.replace(/\D/g, "").slice(0, 15))
        }
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setLocalVal(value);
            setEditing(false);
          }
        }}
        inputMode="numeric"
        maxLength={15}
        className="w-36 font-mono text-xs h-7"
        style={{ border: "2px solid #6B1414" }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex items-center gap-1 text-xs font-mono group hover:text-blue-600"
      title="Click to edit"
    >
      <span>
        {value || <span className="text-gray-300 italic">Click to enter</span>}
      </span>
      <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
    </button>
  );
}

// Inline editable Due Date cell
function DueDateCell({
  value,
  taxYear,
  onSave,
}: {
  value: string;
  taxYear: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value);

  // Compute minDate: day after 31-March of end year
  const minDate = useMemo(() => {
    const parts = taxYear?.split("-");
    if (parts && parts.length === 2) {
      const endYear = Number(parts[1]);
      const d = new Date(endYear, 2, 31); // 31 March of end year
      d.setDate(d.getDate() + 1); // one day after
      return d;
    }
    return undefined;
  }, [taxYear]);

  const commit = () => {
    if (!localVal) {
      onSave("");
      setEditing(false);
      return;
    }
    // Validate format
    const parts = localVal.split("-");
    if (parts.length !== 3) {
      toast.error("Due Date must be in DD-MM-YYYY format");
      setLocalVal(value);
      setEditing(false);
      return;
    }
    // Validate after tax year end
    if (minDate) {
      const tyParts = taxYear.split("-");
      const endYear = Number(tyParts[1]);
      const dueDt = new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0]),
      );
      dueDt.setHours(0, 0, 0, 0);
      const taxYearEnd = new Date(endYear, 2, 31);
      taxYearEnd.setHours(0, 0, 0, 0);
      if (dueDt <= taxYearEnd) {
        toast.error(
          `Due Date must be after 31-03-${endYear} (end of Tax Year ${taxYear})`,
        );
        setLocalVal(value);
        setEditing(false);
        return;
      }
    }
    onSave(localVal);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="min-w-[160px]">
        <DatePickerInput
          value={localVal}
          onChange={(v) => setLocalVal(v)}
          placeholder="DD-MM-YYYY"
          minDate={minDate}
        />
        <div className="flex gap-1 mt-1">
          <button
            type="button"
            onClick={commit}
            className="text-xs px-2 py-0.5 rounded text-white"
            style={{ background: "var(--theme-primary, #6B1414)" }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setLocalVal(value);
              setEditing(false);
            }}
            className="text-xs px-2 py-0.5 rounded border text-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setLocalVal(value);
        setEditing(true);
      }}
      className="flex items-center gap-1 text-xs group hover:text-blue-600"
      title="Click to edit due date"
    >
      <span className={value ? "font-mono" : "text-gray-300 italic"}>
        {value || "Set date"}
      </span>
      <Edit2 className="w-3 h-3 text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
    </button>
  );
}

export default function WorkProcessingPage({ user }: WorkProcessingPageProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    const unsub = onStorageChange(refresh);
    return unsub;
  }, [refresh]);

  const rows = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    const clients = storage.getClients();
    const work = storage.getWork();
    return work
      .map((w) => {
        const client = clients.find((c) => c.id === w.clientId);
        const fs = getFilingStatus(w);
        // Normalize legacy "Filed" to "Completed" for display
        const displayStatus = w.status === "Filed" ? "Completed" : w.status;
        return {
          ...w,
          status: displayStatus as WorkProcessing["status"],
          filingStatusDerived: fs,
          clientName: client?.name || "-",
          pan: client?.pan || "-",
          dueDate: client?.dueDate || "",
          hasAck: !!(w.ackNumber && /^\d{15}$/.test(w.ackNumber)),
          clientRef: client,
        };
      })
      .filter((r) => {
        const matchSearch =
          !search ||
          r.clientName.toLowerCase().includes(search.toLowerCase()) ||
          r.pan.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "All" || r.status === filterStatus;
        const matchYear = filterYear === "All" || r.taxYear === filterYear;
        return matchSearch && matchStatus && matchYear;
      });
  }, [search, filterStatus, filterYear, refreshKey]);

  const updateWork = (
    workId: string,
    changes: Partial<WorkProcessing>,
    auditField: string,
    oldValue: string,
    newValue: string,
  ) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;

    const clients = storage.getClients();
    const client = clients.find((c) => c.id === work.clientId);
    const clientName = client?.name || "Unknown";

    storage.saveWork(
      allWork.map((w) =>
        w.id === workId
          ? { ...w, ...changes, updatedAt: new Date().toISOString() }
          : w,
      ),
    );

    if (user) {
      storage.addAuditLog({
        id: storage.uid(),
        userId: user.id,
        userName: user.name,
        action: `Updated ${auditField}`,
        clientId: work.clientId,
        clientName,
        fieldChanged: auditField,
        oldValue,
        newValue,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleStatusChange = (workId: string, newStatus: string) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    const oldStatus = work.status === "Filed" ? "Completed" : work.status;
    if (oldStatus === newStatus) return;
    updateWork(
      workId,
      { status: newStatus as WorkProcessing["status"] },
      "Work Status",
      oldStatus,
      newStatus,
    );
    toast.success(`Work status updated to: ${newStatus}`);
  };

  const handleFilingStatusChange = (
    workId: string,
    newStatus: WorkProcessing["filingStatus"],
    hasAck: boolean,
  ) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;

    // Guard: if ack number exists, only allow post-filing statuses
    if (hasAck && newStatus === "Pending") {
      toast.error(
        'Acknowledgement number is entered. Status must be "Pending for E-verification" or "E-Verified".',
      );
      return;
    }

    const oldStatus = getFilingStatus(work);
    if (oldStatus === newStatus) return;

    const eVerified = newStatus === "E-Verified";
    updateWork(
      workId,
      { filingStatus: newStatus, eVerified },
      "Filing Status",
      oldStatus,
      newStatus || "",
    );

    if (newStatus === "E-Verified") {
      toast.success("Marked as E-Verified", {
        description: "Client removed from deadline alerts.",
      });
    } else {
      toast.success(`Filing status updated to: ${newStatus}`);
    }
  };

  const handleItrFormChange = (workId: string, newForm: string) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    updateWork(
      workId,
      { itrForm: newForm },
      "ITR Form",
      work.itrForm || "-",
      newForm,
    );
    toast.success(`ITR Form updated to ${newForm}`);
  };

  const handleAckNumberSave = (workId: string, newAck: string) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;

    // Auto-derive filing date from last 6 digits if ack is complete
    const derivedDate = deriveFilingDateFromAck(newAck);
    const changes: Partial<WorkProcessing> = { ackNumber: newAck };
    const currentStatus = getFilingStatus(work);

    if (derivedDate) {
      // Validate: Filing Date must be after tax year end date (31 March of end year)
      const tyParts = work.taxYear?.split("-");
      if (tyParts && tyParts.length === 2) {
        const endYear = Number(tyParts[1]);
        const taxYearEndDate = new Date(endYear, 2, 31);
        taxYearEndDate.setHours(0, 0, 0, 0);
        const fdParts = derivedDate.split("-");
        if (fdParts.length === 3) {
          const filingDt = new Date(
            Number(fdParts[2]),
            Number(fdParts[1]) - 1,
            Number(fdParts[0]),
          );
          filingDt.setHours(0, 0, 0, 0);
          if (filingDt <= taxYearEndDate) {
            toast.error("Invalid Filing Date", {
              description: `Filing Date ${derivedDate} must be after 31-03-${endYear} (end of Tax Year ${work.taxYear}). Please check the Acknowledgement Number.`,
            });
            return;
          }
        }
      }
      changes.filingDate = derivedDate;
      // Auto-upgrade filing status to Pending for E-verification when ack is entered
      if (currentStatus !== "E-Verified") {
        changes.filingStatus = "Pending for E-verification";
        changes.eVerified = false;
      }
    } else if (!newAck) {
      // Ack cleared — reset filing status to Pending (unless E-Verified)
      if (currentStatus !== "E-Verified") {
        changes.filingStatus = "Pending";
        changes.filingDate = "";
        changes.eVerified = false;
      }
    }

    updateWork(
      workId,
      changes,
      "Acknowledgement Number",
      work.ackNumber || "-",
      newAck || "-",
    );
    if (newAck) {
      if (derivedDate) {
        toast.success("Acknowledgement number saved", {
          description: `Filing date auto-set to ${derivedDate}`,
        });
      } else {
        toast.success("Acknowledgement number saved");
      }
    }
  };

  const handleDueDateSave = (
    _workId: string,
    clientRef: Client | undefined,
    newDueDate: string,
  ) => {
    if (!clientRef) return;
    const oldDueDate = clientRef.dueDate || "-";
    if (oldDueDate === newDueDate) return;

    // Update on the client record
    const allClients = storage.getClients();
    storage.saveClients(
      allClients.map((c) =>
        c.id === clientRef.id ? { ...c, dueDate: newDueDate } : c,
      ),
    );

    if (user) {
      storage.addAuditLog({
        id: storage.uid(),
        userId: user.id,
        userName: user.name,
        action: "Updated Due Date",
        clientId: clientRef.id,
        clientName: clientRef.name,
        fieldChanged: "Due Date",
        oldValue: oldDueDate,
        newValue: newDueDate || "-",
        timestamp: new Date().toISOString(),
      });
    }

    toast.success(`Due date updated to ${newDueDate || "(cleared)"}`);
  };

  const filingStatusBadge = (status: string) => {
    if (status === "E-Verified")
      return "bg-green-100 text-green-700 border border-green-200";
    if (status === "Pending for E-verification")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-orange-100 text-orange-700 border border-orange-200";
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search client, PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-56"
            data-ocid="work.search_input"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36" data-ocid="work.filter.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-36">
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

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--theme-primary, #6B1A2B)" }}>
            <tr>
              {[
                "Client",
                "PAN",
                "Tax Year",
                "Due Date",
                "Work Status",
                "ITR Form",
                "Ack Number",
                "Filing Date",
                "Filing Status",
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400">
                  No work records found
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr
                key={row.id}
                data-ocid={`work.item.${i + 1}`}
                className={`border-b last:border-0 hover:bg-gray-50 transition-colors duration-150 ${
                  i % 2 === 0 ? "" : "bg-gray-50/30"
                } ${row.filingStatusDerived === "E-Verified" ? "bg-green-50/40" : ""}`}
              >
                <td className="py-2.5 px-3 font-medium text-xs">
                  {row.clientName}
                </td>
                <td className="py-2.5 px-3 font-mono text-xs">{row.pan}</td>
                <td className="py-2.5 px-3 text-xs">{row.taxYear}</td>

                {/* Due Date - inline editable, synced to Client Master */}
                <td className="py-2.5 px-3">
                  <DueDateCell
                    value={row.dueDate}
                    taxYear={row.taxYear}
                    onSave={(v) => handleDueDateSave(row.id, row.clientRef, v)}
                  />
                </td>

                <td className="py-2.5 px-3">
                  <Select
                    value={row.status}
                    onValueChange={(v) => handleStatusChange(row.id, v)}
                  >
                    <SelectTrigger
                      className={`h-7 text-xs w-32 ${
                        row.status === "Completed"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : row.status === "In Progress"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-orange-100 text-orange-700 border-orange-200"
                      }`}
                      data-ocid={`work.status.${i + 1}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending" className="text-xs">
                        Pending
                      </SelectItem>
                      <SelectItem value="In Progress" className="text-xs">
                        In Progress
                      </SelectItem>
                      <SelectItem value="Completed" className="text-xs">
                        Completed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>

                {/* ITR Form - inline editable dropdown */}
                <td className="py-2.5 px-3">
                  <Select
                    value={row.itrForm || ""}
                    onValueChange={(v) => handleItrFormChange(row.id, v)}
                  >
                    <SelectTrigger
                      className="h-7 text-xs w-24 border-dashed"
                      data-ocid={`work.toggle.${i + 1}`}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITR_FORMS.map((f) => (
                        <SelectItem key={f} value={f} className="text-xs">
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>

                {/* Ack Number - inline editable */}
                <td className="py-2.5 px-3">
                  <AckNumberCell
                    value={row.ackNumber || ""}
                    onSave={(v) => handleAckNumberSave(row.id, v)}
                  />
                </td>

                {/* Filing Date - always locked, auto-filled from Ack No */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1 text-xs font-mono text-gray-700">
                    <Lock className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>{row.filingDate || "\u2014"}</span>
                  </div>
                </td>

                {/* Filing Status - restricted to post-filing options when ack exists */}
                <td className="py-2.5 px-3">
                  <Select
                    value={row.filingStatusDerived}
                    onValueChange={(v) =>
                      handleFilingStatusChange(
                        row.id,
                        v as WorkProcessing["filingStatus"],
                        row.hasAck,
                      )
                    }
                  >
                    <SelectTrigger
                      className={`h-7 text-xs w-44 ${filingStatusBadge(row.filingStatusDerived)}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* "Pending" only shown when no ack number */}
                      {!row.hasAck && (
                        <SelectItem value="Pending" className="text-xs">
                          Pending
                        </SelectItem>
                      )}
                      <SelectItem
                        value="Pending for E-verification"
                        className="text-xs"
                      >
                        Pending for E-verification
                      </SelectItem>
                      <SelectItem value="E-Verified" className="text-xs">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          E-Verified
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

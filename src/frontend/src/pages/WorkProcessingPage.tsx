import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Edit2, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import DatePickerInput from "../components/DatePickerInput";
import { getFilingStatus, onStorageChange, storage } from "../data/storage";
import type { User, WorkProcessing } from "../types";
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
const FILING_STATUS_OPTIONS: Array<WorkProcessing["filingStatus"]> = [
  "Pending",
  "Pending for E-verification",
  "E-Verified",
];

interface WorkProcessingPageProps {
  user?: User;
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
        return {
          ...w,
          filingStatusDerived: fs,
          clientName: client?.name || "-",
          pan: client?.pan || "-",
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

  const handleFilingStatusChange = (
    workId: string,
    newStatus: WorkProcessing["filingStatus"],
  ) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;

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
    updateWork(
      workId,
      { ackNumber: newAck },
      "Acknowledgement Number",
      work.ackNumber || "-",
      newAck || "-",
    );
    if (newAck) toast.success("Acknowledgement number saved");
  };

  const handleFilingDateChange = (workId: string, newDate: string) => {
    const allWork = storage.getWork();
    const work = allWork.find((w) => w.id === workId);
    if (!work) return;
    updateWork(
      workId,
      { filingDate: newDate },
      "Filing Date",
      work.filingDate || "-",
      newDate || "-",
    );
  };

  const filingStatusBadge = (status: string) => {
    if (status === "E-Verified")
      return "bg-green-100 text-green-700 border border-green-200";
    if (status === "Pending for E-verification")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-orange-100 text-orange-700 border border-orange-200";
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
            <SelectItem value="Filed">Filed</SelectItem>
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
                <td colSpan={8} className="py-8 text-center text-gray-400">
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
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === "Filed"
                        ? "bg-green-100 text-green-700"
                        : row.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {row.status}
                  </span>
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

                {/* Filing Date - DatePickerInput inline */}
                <td className="py-2.5 px-3">
                  <DatePickerInput
                    value={row.filingDate || ""}
                    onChange={(v) => handleFilingDateChange(row.id, v)}
                    placeholder="DD-MM-YYYY"
                    maxDate={today}
                    className="w-44"
                  />
                </td>

                {/* Filing Status - dropdown */}
                <td className="py-2.5 px-3">
                  <Select
                    value={row.filingStatusDerived}
                    onValueChange={(v) =>
                      handleFilingStatusChange(
                        row.id,
                        v as WorkProcessing["filingStatus"],
                      )
                    }
                  >
                    <SelectTrigger
                      className={`h-7 text-xs w-44 ${filingStatusBadge(row.filingStatusDerived)}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FILING_STATUS_OPTIONS.map((s) => (
                        <SelectItem
                          key={s}
                          value={s || "Pending"}
                          className="text-xs"
                        >
                          {s === "E-Verified" ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              E-Verified
                            </span>
                          ) : (
                            s
                          )}
                        </SelectItem>
                      ))}
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

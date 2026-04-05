import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Lock, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import DatePickerInput from "../components/DatePickerInput";
import { parseDDMMYYYY, storage } from "../data/storage";
import type { Client, DocumentInward, WorkProcessing } from "../types";
import { getHeadOfIncome } from "../types";

interface Props {
  client: Client;
  onBack: () => void;
  onUpdateClient?: (updated: Client) => void;
}

export default function ClientDetailPage({
  client,
  onBack,
  onUpdateClient,
}: Props) {
  const [docForm, setDocForm] = useState({
    date: "",
    mode: "Email" as DocumentInward["mode"],
    status: "Complete" as DocumentInward["status"],
    remarks: "",
  });
  const [docError, setDocError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [workForm, setWorkForm] = useState<Partial<WorkProcessing>>({
    filingStatus: "Pending",
    returnType: "Original",
    remark: "",
  });
  const [filingDateLocked, setFilingDateLocked] = useState(false);
  const [workError, setWorkError] = useState("");
  const [workSaved, setWorkSaved] = useState(false);
  const [dueDate, setDueDate] = useState(client.dueDate || "");
  const workInitialized = useRef(false);

  const docs = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    return storage
      .getDocuments()
      .filter((d) => d.clientId === client.id)
      .sort((a, b) => {
        const da = parseDDMMYYYY(a.date)?.getTime() || 0;
        const db = parseDDMMYYYY(b.date)?.getTime() || 0;
        return db - da;
      });
  }, [client.id, refreshKey]);

  const work = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    refreshKey;
    return storage.getWork().find((w) => w.clientId === client.id) || null;
  }, [client.id, refreshKey]);

  // Initialize workForm from work -- only once per client load
  useEffect(() => {
    if (work && !workInitialized.current) {
      workInitialized.current = true;
      const fs =
        work.filingStatus ?? (work.eVerified ? "E-Verified" : "Pending");
      setWorkForm({
        status: work.status,
        itrForm: work.itrForm,
        returnType: work.returnType || "Original",
        remark: work.remark || "",
        ackNumber: work.ackNumber,
        filingDate: work.filingDate,
        filingStatus: fs as WorkProcessing["filingStatus"],
      });
      if (work.ackNumber && /^\d{15}$/.test(work.ackNumber)) {
        setFilingDateLocked(true);
      }
    }
  }, [work]);

  const validateDate = (d: string): boolean => {
    if (!d) return false;
    const parts = d.split("-");
    if (parts.length !== 3) return false;
    const [dd, mm, yyyy] = parts;
    const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return !Number.isNaN(dt.getTime()) && dt.getFullYear() === Number(yyyy);
  };

  const isDateInFuture = (d: string): boolean => {
    const dt = parseDDMMYYYY(d);
    if (!dt) return false;
    return dt > new Date();
  };

  const deriveFilingDateFromAck = (digits: string): string | null => {
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
  };

  const handleAckNumberChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 15);
    if (digits.length === 15) {
      const derived = deriveFilingDateFromAck(digits);
      if (derived) {
        // Auto-fill filing date and upgrade filing status unless already E-Verified
        setWorkForm((f) => ({
          ...f,
          ackNumber: digits,
          filingDate: derived,
          filingStatus:
            f.filingStatus === "E-Verified"
              ? "E-Verified"
              : "Pending for E-verification",
        }));
        setFilingDateLocked(true);
        return;
      }
    }
    // Ack cleared or incomplete — reset filing status to Pending (unless E-Verified)
    setWorkForm((f) => ({
      ...f,
      ackNumber: digits,
      filingStatus: f.filingStatus === "E-Verified" ? "E-Verified" : "Pending",
    }));
    setFilingDateLocked(false);
  };

  const handleAddDoc = () => {
    setDocError("");
    if (!docForm.date) return setDocError("Date is required.");
    if (!validateDate(docForm.date))
      return setDocError("Date must be DD-MM-YYYY format.");
    if (isDateInFuture(docForm.date))
      return setDocError("Date cannot be in the future.");

    const newDoc: DocumentInward = {
      id: storage.uid(),
      clientId: client.id,
      date: docForm.date,
      mode: docForm.mode,
      status: docForm.status,
      remarks: docForm.remarks,
      createdAt: new Date().toISOString(),
    };
    storage.saveDocuments([...storage.getDocuments(), newDoc]);
    setDocForm({ date: "", mode: "Email", status: "Complete", remarks: "" });
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteDoc = (id: string) => {
    storage.saveDocuments(storage.getDocuments().filter((d) => d.id !== id));
    setRefreshKey((k) => k + 1);
  };

  const handleSaveWork = () => {
    setWorkError("");
    if (workForm.ackNumber && !/^\d{15}$/.test(workForm.ackNumber))
      return setWorkError(
        "Acknowledgement Number must be exactly 15 numeric digits.",
      );
    // Validate Due Date
    if (dueDate) {
      if (!validateDate(dueDate))
        return setWorkError("Due Date must be in DD-MM-YYYY format.");
      if (client.taxYear) {
        const tyParts = client.taxYear.split("-");
        if (tyParts.length === 2) {
          const endYear = Number(tyParts[1]);
          const taxYearEnd = new Date(endYear, 2, 31);
          taxYearEnd.setHours(0, 0, 0, 0);
          const dueParts = dueDate.split("-");
          if (dueParts.length === 3) {
            const dueDt = new Date(
              Number(dueParts[2]),
              Number(dueParts[1]) - 1,
              Number(dueParts[0]),
            );
            dueDt.setHours(0, 0, 0, 0);
            if (dueDt <= taxYearEnd)
              return setWorkError(
                `Due Date must be after 31-03-${endYear} (end of Tax Year ${client.taxYear}).`,
              );
          }
        }
      }
    }
    // Filing date is auto-derived from ack number (locked field) — only validate format, not future date
    if (workForm.filingDate) {
      if (!validateDate(workForm.filingDate))
        return setWorkError("Filing Date must be DD-MM-YYYY format.");
      // Validate: Filing Date must be after the tax year end date (31st March of end year)
      const tyParts = client.taxYear?.split("-");
      if (tyParts && tyParts.length === 2) {
        const endYear = Number(tyParts[1]);
        const taxYearEndDate = new Date(endYear, 2, 31); // 31 March of end year
        taxYearEndDate.setHours(0, 0, 0, 0);
        const fdParts = workForm.filingDate.split("-");
        if (fdParts.length === 3) {
          const filingDt = new Date(
            Number(fdParts[2]),
            Number(fdParts[1]) - 1,
            Number(fdParts[0]),
          );
          filingDt.setHours(0, 0, 0, 0);
          if (filingDt <= taxYearEndDate) {
            return setWorkError(
              `Filing Date must be after 31-03-${endYear} (end of Tax Year ${client.taxYear}).`,
            );
          }
        }
      }
    }

    const allWork = storage.getWork();
    const filingStatus = workForm.filingStatus || "Pending";
    const eVerified = filingStatus === "E-Verified";

    if (work) {
      const updated: WorkProcessing = {
        ...work,
        status: (workForm.status || work.status) as WorkProcessing["status"],
        itrForm: workForm.itrForm || "",
        returnType: workForm.returnType || "Original",
        remark: workForm.remark || "",
        ackNumber: workForm.ackNumber || "",
        filingDate: workForm.filingDate || "",
        filingStatus,
        eVerified,
        updatedAt: new Date().toISOString(),
      };
      storage.saveWork(allWork.map((w) => (w.id === work.id ? updated : w)));
    } else {
      const wp: WorkProcessing = {
        id: storage.uid(),
        clientId: client.id,
        taxYear: client.taxYear,
        status: (workForm.status || "Pending") as WorkProcessing["status"],
        itrForm: workForm.itrForm || "",
        returnType: workForm.returnType || "Original",
        remark: workForm.remark || "",
        ackNumber: workForm.ackNumber || "",
        filingDate: workForm.filingDate || "",
        filingStatus,
        eVerified,
        updatedAt: new Date().toISOString(),
      };
      storage.saveWork([...allWork, wp]);
    }
    // Also update Due Date on the client record if it changed
    if (dueDate !== client.dueDate) {
      const allClients = storage.getClients();
      const updatedClient: Client = { ...client, dueDate };
      storage.saveClients(
        allClients.map((c) => (c.id === client.id ? updatedClient : c)),
      );
      if (onUpdateClient) onUpdateClient(updatedClient);
    }
    setWorkSaved(true);
    setTimeout(() => setWorkSaved(false), 2000);
    setRefreshKey((k) => k + 1);
  };

  const currentWork = work ? { ...work, ...workForm } : workForm;
  const headOfIncome = getHeadOfIncome(client);

  // Whether ack number is complete -- restricts filing status options
  const ackComplete =
    !!currentWork.ackNumber && /^\d{15}$/.test(currentWork.ackNumber);

  const filingStatusColor = (status: string) => {
    if (status === "E-Verified") return "text-green-700";
    if (status === "Pending for E-verification") return "text-blue-700";
    return "text-orange-700";
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm hover:underline"
          style={{ color: "var(--theme-primary, #6B1A2B)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="h-5 w-px bg-gray-300" />
        <h2 className="font-semibold text-gray-800">{client.name}</h2>
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
          {client.pan}
        </span>
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
          {client.taxYear}
        </span>
      </div>

      {/* Client Info - fixed grid to prevent overlap */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
          <div className="min-w-0">
            <span className="text-gray-500 text-xs">Mobile</span>
            <div className="font-medium truncate">{client.mobile}</div>
          </div>
          <div className="min-w-0">
            <span className="text-gray-500 text-xs">Email</span>
            <div className="font-medium text-xs break-all leading-tight mt-0.5">
              {client.email || "-"}
            </div>
          </div>
          <div className="min-w-0">
            <span className="text-gray-500 text-xs">Category</span>
            <div className="font-medium truncate">{client.clientCategory}</div>
          </div>
          <div className="min-w-0">
            <span className="text-gray-500 text-xs">Head of Income</span>
            <div className="font-medium truncate">{headOfIncome}</div>
          </div>
          {headOfIncome === "Business" && client.businessName && (
            <div className="min-w-0">
              <span className="text-gray-500 text-xs">Business Name</span>
              <div className="font-medium truncate">{client.businessName}</div>
            </div>
          )}
          <div className="min-w-0">
            <span className="text-gray-500 text-xs">Tax Year</span>
            <div className="font-medium">{client.taxYear}</div>
          </div>
          <div className="min-w-0">
            <span className="text-gray-500 text-xs">Due Date</span>
            <div className="font-medium">{dueDate || client.dueDate}</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="documents">
        <TabsList
          style={{
            background: "var(--theme-primary-light, rgba(107,26,43,0.1))",
          }}
        >
          <TabsTrigger value="documents" style={{ fontWeight: 600 }}>
            Document Inward
          </TabsTrigger>
          <TabsTrigger value="work" style={{ fontWeight: 600 }}>
            Work Processing
          </TabsTrigger>
        </TabsList>

        {/* Document Inward Tab */}
        <TabsContent value="documents" className="mt-4 space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <h3
              className="font-semibold mb-3"
              style={{ color: "var(--theme-primary, #6B1A2B)" }}
            >
              Add Document Entry
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Date (no future) *</Label>
                <DatePickerInput
                  value={docForm.date}
                  onChange={(v) => setDocForm((f) => ({ ...f, date: v }))}
                  placeholder="DD-MM-YYYY"
                  maxDate={today}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Mode</Label>
                <Select
                  value={docForm.mode}
                  onValueChange={(v) =>
                    setDocForm((f) => ({
                      ...f,
                      mode: v as DocumentInward["mode"],
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Hardcopy">Hardcopy</SelectItem>
                    <SelectItem value="Mix">Mix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select
                  value={docForm.status}
                  onValueChange={(v) =>
                    setDocForm((f) => ({
                      ...f,
                      status: v as DocumentInward["status"],
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Remarks</Label>
                <Input
                  value={docForm.remarks}
                  onChange={(e) =>
                    setDocForm((f) => ({ ...f, remarks: e.target.value }))
                  }
                  placeholder="Optional notes"
                  className="mt-1"
                />
              </div>
            </div>
            {docError && (
              <p className="text-red-600 text-xs mt-2">{docError}</p>
            )}
            <Button
              onClick={handleAddDoc}
              size="sm"
              className="mt-3 text-white"
              style={{ background: "var(--theme-primary, #6B1A2B)" }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
            </Button>
          </div>

          {/* Document list */}
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--theme-primary, #6B1A2B)" }}>
                <tr>
                  {["Date", "Mode", "Status", "Remarks", "Action"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2.5 px-4 text-white font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      No documents yet. Add the first entry above.
                    </td>
                  </tr>
                )}
                {docs.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-2.5 px-4 font-mono text-xs">{d.date}</td>
                    <td className="py-2.5 px-4">{d.mode}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          d.status === "Complete"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-500">
                      {d.remarks || "-"}
                    </td>
                    <td className="py-2.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(d.id)}
                        className="p-1 rounded hover:bg-red-100 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Work Processing Tab */}
        <TabsContent value="work" className="mt-4">
          <div className="bg-white rounded-lg border p-5 max-w-2xl space-y-4">
            <h3
              className="font-semibold"
              style={{ color: "var(--theme-primary, #6B1A2B)" }}
            >
              Work Processing
            </h3>

            {/* Work Status */}
            <div>
              <Label>Work Status</Label>
              <Select
                value={currentWork.status || "Pending"}
                onValueChange={(v) =>
                  setWorkForm((f) => ({
                    ...f,
                    status: v as WorkProcessing["status"],
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ITR Form + Return Type side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ITR Form</Label>
                <Select
                  value={currentWork.itrForm || ""}
                  onValueChange={(v) =>
                    setWorkForm((f) => ({ ...f, itrForm: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select ITR Form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ITR-1">ITR-1</SelectItem>
                    <SelectItem value="ITR-2">ITR-2</SelectItem>
                    <SelectItem value="ITR-3">ITR-3</SelectItem>
                    <SelectItem value="ITR-4">ITR-4</SelectItem>
                    <SelectItem value="ITR-5">ITR-5</SelectItem>
                    <SelectItem value="ITR-6">ITR-6</SelectItem>
                    <SelectItem value="ITR-7">ITR-7</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Return Type</Label>
                <Select
                  value={currentWork.returnType || "Original"}
                  onValueChange={(v) =>
                    setWorkForm((f) => ({
                      ...f,
                      returnType: v as WorkProcessing["returnType"],
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Original">Original</SelectItem>
                    <SelectItem value="Revised">Revised</SelectItem>
                    <SelectItem value="Belated">Belated</SelectItem>
                    <SelectItem value="Updated">Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Remark */}
            <div>
              <Label>
                Remark <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Input
                value={currentWork.remark || ""}
                onChange={(e) =>
                  setWorkForm((f) => ({ ...f, remark: e.target.value }))
                }
                placeholder="e.g. Revision reason, notes for future reference..."
                className="mt-1"
              />
            </div>

            {/* Acknowledgement Number */}
            <div>
              <Label>Acknowledgement Number (15 digits)</Label>
              <div
                className="mt-1"
                style={{
                  border: "2px solid var(--theme-primary, #6B1A2B)",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Input
                  value={currentWork.ackNumber || ""}
                  onChange={(e) => handleAckNumberChange(e.target.value)}
                  placeholder="15-digit acknowledgement number"
                  maxLength={15}
                  inputMode="numeric"
                  className="font-mono border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ border: "none", outline: "none", boxShadow: "none" }}
                />
              </div>
              {(currentWork.ackNumber?.length || 0) > 0 && (
                <p className="text-xs mt-1 text-gray-400">
                  {currentWork.ackNumber?.length || 0}/15 digits
                  {(currentWork.ackNumber?.length || 0) === 15 &&
                    filingDateLocked && (
                      <span className="ml-2 text-green-600">
                        ✓ Filing date auto-filled
                      </span>
                    )}
                </p>
              )}
            </div>

            {/* Filing Date - always locked, auto-filled from Ack No */}
            <div>
              <Label>Filing Date</Label>
              <div
                className="mt-1 flex items-center gap-2 px-3 bg-gray-50 text-sm text-gray-700"
                style={{
                  height: "36px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                }}
              >
                <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="font-mono">
                  {currentWork.filingDate || "—"}
                </span>
              </div>
            </div>

            {/* Due Date - editable, synced with Client Master */}
            <div>
              <Label>Due Date * (DD-MM-YYYY)</Label>
              <DatePickerInput
                value={dueDate}
                onChange={(v) => setDueDate(v)}
                placeholder="DD-MM-YYYY"
              />
              <p className="text-xs text-gray-400 mt-0.5">
                Editable here and in Client Master — both stay in sync.
              </p>
            </div>
            {/* Filing Status */}
            <div>
              <Label>Filing Status</Label>
              {ackComplete && (
                <p className="text-xs text-blue-600 mt-0.5 mb-1">
                  Acknowledgement number entered — only post-filing statuses
                  available.
                </p>
              )}
              <Select
                value={
                  currentWork.filingStatus ||
                  (ackComplete ? "Pending for E-verification" : "Pending")
                }
                onValueChange={(v) =>
                  setWorkForm((f) => ({
                    ...f,
                    filingStatus: v as WorkProcessing["filingStatus"],
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* Show "Pending" only if no ack number */}
                  {!ackComplete && (
                    <SelectItem value="Pending">Pending</SelectItem>
                  )}
                  <SelectItem value="Pending for E-verification">
                    Pending for E-verification
                  </SelectItem>
                  <SelectItem value="E-Verified">E-Verified</SelectItem>
                </SelectContent>
              </Select>
              {currentWork.filingStatus && (
                <p
                  className={`text-xs mt-1 ${filingStatusColor(currentWork.filingStatus)}`}
                >
                  {currentWork.filingStatus === "E-Verified" &&
                    "✅ Client excluded from deadline alerts"}
                  {currentWork.filingStatus === "Pending for E-verification" &&
                    "⚠️ E-verification must be done within 30 days of filing"}
                  {currentWork.filingStatus === "Pending" &&
                    "Work is in progress"}
                </p>
              )}
            </div>

            {workError && (
              <p className="text-red-600 text-sm bg-red-50 rounded p-2">
                {workError}
              </p>
            )}
            {workSaved && (
              <p className="text-green-600 text-sm bg-green-50 rounded p-2">
                ✅ Saved successfully!
              </p>
            )}
            <Button
              onClick={handleSaveWork}
              style={{ background: "var(--theme-primary, #6B1A2B)" }}
              className="text-white w-full"
            >
              <Save className="w-4 h-4 mr-2" /> Save Work Processing
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

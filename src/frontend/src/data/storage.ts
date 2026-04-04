import type {
  AuditLogEntry,
  Billing,
  Client,
  DocumentInward,
  FirmAccount,
  NotificationLog,
  User,
  WhatsAppSettings,
  WorkProcessing,
} from "../types";

const KEYS = {
  users: "taxcore_users",
  clients: "taxcore_clients",
  documents: "taxcore_documents",
  work: "taxcore_work",
  billing: "taxcore_billing",
  currentUser: "taxcore_current_user",
  firmAccounts: "taxcore_firm_accounts",
  superAdminCreated: "taxcore_super_admin_created",
  auditLogs: "taxcore_audit_logs",
  whatsappSettings: "taxcore_whatsapp_settings",
  notificationLogs: "taxcore_notification_logs",
};

function get<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
  // Dispatch a custom event so subscribed components can react
  window.dispatchEvent(
    new CustomEvent("taxcore-storage-change", { detail: { key } }),
  );
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const storage = {
  uid,

  // Users
  getUsers: (): User[] => get<User>(KEYS.users),
  saveUsers: (users: User[]) => set(KEYS.users, users),
  getCurrentUser: (): User | null => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.currentUser) || "null");
    } catch {
      return null;
    }
  },
  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
    else localStorage.removeItem(KEYS.currentUser);
  },

  // Super Admin flag
  isSuperAdminCreated: (): boolean => {
    return localStorage.getItem(KEYS.superAdminCreated) === "true";
  },
  markSuperAdminCreated: () => {
    localStorage.setItem(KEYS.superAdminCreated, "true");
  },

  // Firm Accounts (managed by Super Admin)
  getFirmAccounts: (): FirmAccount[] => get<FirmAccount>(KEYS.firmAccounts),
  saveFirmAccounts: (accounts: FirmAccount[]) =>
    set(KEYS.firmAccounts, accounts),

  // Clients
  getClients: (): Client[] => get<Client>(KEYS.clients),
  saveClients: (clients: Client[]) => set(KEYS.clients, clients),

  // Documents
  getDocuments: (): DocumentInward[] => get<DocumentInward>(KEYS.documents),
  saveDocuments: (docs: DocumentInward[]) => set(KEYS.documents, docs),

  // Work
  getWork: (): WorkProcessing[] => get<WorkProcessing>(KEYS.work),
  saveWork: (work: WorkProcessing[]) => set(KEYS.work, work),

  // Billing
  getBilling: (): Billing[] => get<Billing>(KEYS.billing),
  saveBilling: (billing: Billing[]) => set(KEYS.billing, billing),

  // Audit Logs
  getAuditLogs: (): AuditLogEntry[] => get<AuditLogEntry>(KEYS.auditLogs),
  addAuditLog: (entry: AuditLogEntry): void => {
    const logs = get<AuditLogEntry>(KEYS.auditLogs);
    logs.push(entry);
    localStorage.setItem(KEYS.auditLogs, JSON.stringify(logs));
    window.dispatchEvent(
      new CustomEvent("taxcore-storage-change", {
        detail: { key: KEYS.auditLogs },
      }),
    );
  },
  clearAuditLogs: (): void => {
    localStorage.setItem(KEYS.auditLogs, JSON.stringify([]));
    window.dispatchEvent(
      new CustomEvent("taxcore-storage-change", {
        detail: { key: KEYS.auditLogs },
      }),
    );
  },

  // WhatsApp Settings
  getWhatsAppSettings: (): WhatsAppSettings | null => {
    try {
      const raw = localStorage.getItem(KEYS.whatsappSettings);
      return raw ? (JSON.parse(raw) as WhatsAppSettings) : null;
    } catch {
      return null;
    }
  },
  saveWhatsAppSettings: (settings: WhatsAppSettings): void => {
    localStorage.setItem(KEYS.whatsappSettings, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent("taxcore-storage-change", {
        detail: { key: KEYS.whatsappSettings },
      }),
    );
  },

  // Notification Logs
  getNotificationLogs: (): NotificationLog[] =>
    get<NotificationLog>(KEYS.notificationLogs),
  addNotificationLog: (entry: NotificationLog): void => {
    const logs = get<NotificationLog>(KEYS.notificationLogs);
    logs.push(entry);
    localStorage.setItem(KEYS.notificationLogs, JSON.stringify(logs));
    window.dispatchEvent(
      new CustomEvent("taxcore-storage-change", {
        detail: { key: KEYS.notificationLogs },
      }),
    );
  },
  clearNotificationLogs: (): void => {
    localStorage.setItem(KEYS.notificationLogs, JSON.stringify([]));
    window.dispatchEvent(
      new CustomEvent("taxcore-storage-change", {
        detail: { key: KEYS.notificationLogs },
      }),
    );
  },
};

/** Subscribe to any storage write. Returns an unsubscribe function. */
export function onStorageChange(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener("taxcore-storage-change", handler);
  return () => window.removeEventListener("taxcore-storage-change", handler);
}

export function getPanCategory(pan: string): string {
  if (!pan || pan.length < 4) return "Other";
  const ch = pan[3].toUpperCase();
  const map: Record<string, string> = {
    P: "Individual",
    F: "Firm",
    C: "Company",
    A: "AOP",
    B: "BOI",
    G: "Government",
    H: "HUF",
    J: "AJP",
    L: "Local Authority",
    T: "Trust",
  };
  return map[ch] || "Other";
}

export function parseDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function getDaysUntilDue(dueDate: string): number | null {
  const due = parseDDMMYYYY(dueDate);
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getLatestDocStatus(clientId: string): string {
  const docs = storage.getDocuments().filter((d) => d.clientId === clientId);
  if (!docs.length) return "-";
  docs.sort((a, b) => {
    const da = parseDDMMYYYY(a.date)?.getTime() || 0;
    const db = parseDDMMYYYY(b.date)?.getTime() || 0;
    return db - da;
  });
  return docs[0].status;
}

export function getLatestDoc(clientId: string) {
  const docs = storage.getDocuments().filter((d) => d.clientId === clientId);
  if (!docs.length) return null;
  docs.sort((a, b) => {
    const da = parseDDMMYYYY(a.date)?.getTime() || 0;
    const db = parseDDMMYYYY(b.date)?.getTime() || 0;
    return db - da;
  });
  return docs[0];
}

export function getClientWork(clientId: string): WorkProcessing | null {
  return storage.getWork().find((w) => w.clientId === clientId) || null;
}

export function getClientBilling(clientId: string): Billing | null {
  return storage.getBilling().find((b) => b.clientId === clientId) || null;
}

/**
 * Checks if a client's work record is E-Verified (stop-gate).
 * Checks both `eVerified === true` AND `filingStatus === 'E-Verified'`.
 */
export function isClientEVerified(clientId: string): boolean {
  const work = getClientWork(clientId);
  if (!work) return false;
  const fs = work.filingStatus ?? (work.eVerified ? "E-Verified" : "Pending");
  return fs === "E-Verified" || work.eVerified === true;
}

/**
 * Get the effective filing status for a work record.
 */
export function getFilingStatus(
  work: WorkProcessing,
): "Pending" | "Pending for E-verification" | "E-Verified" {
  if (work.filingStatus) return work.filingStatus;
  if (work.eVerified === true) return "E-Verified";
  return "Pending";
}

/**
 * Returns clients with due date <= 10 days AND NOT e-verified.
 */
export function getDueAlertClients(): Array<{
  client: Client;
  daysLeft: number;
}> {
  const result: Array<{ client: Client; daysLeft: number }> = [];
  for (const c of storage.getClients()) {
    if (isClientEVerified(c.id)) continue;
    const daysLeft = getDaysUntilDue(c.dueDate);
    if (daysLeft !== null && daysLeft <= 10) {
      result.push({ client: c, daysLeft });
    }
  }
  return result.sort((a, b) => a.daysLeft - b.daysLeft);
}

/**
 * Enhanced deadline alert function with role-based scoping and urgency tiers.
 * - daysLeft < 0: YELLOW (overdue)
 * - daysLeft 0-5: RED (critical)
 * - daysLeft 6-10: AMBER (warning)
 */
export function getDeadlineAlertClients(
  userId: string,
  userRole: string,
): Array<{
  client: Client;
  daysLeft: number;
  urgency: "red" | "amber" | "yellow";
  workStatus: string;
}> {
  const allClients = storage.getClients();

  // Apply role-based scoping
  const scopedClients =
    userRole === "Staff"
      ? allClients.filter((c) => c.createdBy === userId)
      : allClients;

  const result: Array<{
    client: Client;
    daysLeft: number;
    urgency: "red" | "amber" | "yellow";
    workStatus: string;
  }> = [];

  for (const c of scopedClients) {
    // Stop-gate: exclude e-verified clients
    if (isClientEVerified(c.id)) continue;

    const daysLeft = getDaysUntilDue(c.dueDate);
    if (daysLeft === null || daysLeft > 10) continue;

    const work = getClientWork(c.id);
    // Yellow = overdue (negative), Red = 0-5, Amber = 6-10
    const urgency: "red" | "amber" | "yellow" =
      daysLeft < 0 ? "yellow" : daysLeft <= 5 ? "red" : "amber";

    result.push({
      client: c,
      daysLeft,
      urgency,
      workStatus: work?.status || "Pending",
    });
  }

  return result.sort((a, b) => a.daysLeft - b.daysLeft);
}

/**
 * Returns work records with filing status 'Pending for E-verification'.
 * E-verification deadline = filing date + 30 days.
 */
export function getEVerificationAlerts(): Array<{
  client: Client;
  work: WorkProcessing;
  daysToDeadline: number;
  urgency: "high" | "normal";
}> {
  const allWork = storage.getWork();
  const allClients = storage.getClients();
  const result: Array<{
    client: Client;
    work: WorkProcessing;
    daysToDeadline: number;
    urgency: "high" | "normal";
  }> = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const w of allWork) {
    const fs = getFilingStatus(w);
    if (fs !== "Pending for E-verification") continue;
    if (!w.filingDate) continue;

    const filingDt = parseDDMMYYYY(w.filingDate);
    if (!filingDt) continue;

    // E-verification deadline = filing date + 30 days
    const deadline = new Date(filingDt.getTime() + 30 * 24 * 60 * 60 * 1000);
    deadline.setHours(0, 0, 0, 0);
    const daysToDeadline = Math.floor(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Only include if within 30 days of deadline
    if (daysToDeadline > 30) continue;

    const client = allClients.find((c) => c.id === w.clientId);
    if (!client) continue;

    result.push({
      client,
      work: w,
      daysToDeadline,
      urgency: daysToDeadline < 10 ? "high" : "normal",
    });
  }

  return result.sort((a, b) => a.daysToDeadline - b.daysToDeadline);
}

/**
 * Queue due date notifications for all at-risk clients.
 */
export function queueDueDateNotifications(_currentUser: {
  id: string;
  name: string;
}): number {
  const alertClients = getDueAlertClients();
  const existingLogs = storage.getNotificationLogs();

  let queued = 0;
  for (const { client, daysLeft } of alertClients) {
    const alreadyPending = existingLogs.some(
      (l) =>
        l.clientId === client.id &&
        l.event === "Due Date Alert" &&
        l.status === "Pending",
    );
    if (alreadyPending) continue;

    const message =
      daysLeft <= 0
        ? `Dear ${client.name}, your ITR due date (${client.dueDate}) has passed. Please contact us immediately.`
        : `Dear ${client.name}, your ITR due date is ${client.dueDate} \u2014 only ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining. Please submit documents at the earliest.`;

    storage.addNotificationLog({
      id: storage.uid(),
      clientId: client.id,
      clientName: client.name,
      mobile: client.mobile,
      message,
      event: "Due Date Alert",
      status: "Pending",
      timestamp: new Date().toISOString(),
    });
    queued++;
  }
  return queued;
}

// Seed sample data only - no hardcoded users
export function seedData() {
  // Only seed sample clients/work/docs if an Owner user already exists
  // and no clients have been created yet
  const users = storage.getUsers();
  const ownerUser = users.find((u) => u.role === "Owner");
  if (!ownerUser) return;
  if (storage.getClients().length > 0) return;

  const c1: Client = {
    id: "c1",
    name: "Rajesh Kumar",
    pan: "ABCPK1234F",
    mobile: "9876543210",
    email: "rajesh@example.com",
    clientType: "Existing",
    headOfIncome: "Salaried",
    businessName: "",
    taxYear: "2024-2025",
    dueDate: "31-07-2025",
    clientCategory: "Individual",
    createdAt: new Date().toISOString(),
    createdBy: ownerUser.id,
  };
  const c2: Client = {
    id: "c2",
    name: "Sharma & Co.",
    pan: "BCQFS5678G",
    mobile: "8765432109",
    email: "sharma@example.com",
    clientType: "Existing",
    headOfIncome: "Business",
    businessName: "Sharma Traders",
    taxYear: "2024-2025",
    dueDate: "31-10-2025",
    clientCategory: "Firm",
    createdAt: new Date().toISOString(),
    createdBy: ownerUser.id,
  };
  localStorage.setItem(KEYS.clients, JSON.stringify([c1, c2]));

  const work: WorkProcessing[] = [
    {
      id: "w1",
      clientId: "c1",
      taxYear: "2024-2025",
      status: "In Progress",
      itrForm: "ITR-1",
      ackNumber: "",
      filingDate: "",
      filingStatus: "Pending",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "w2",
      clientId: "c2",
      taxYear: "2024-2025",
      status: "Pending",
      itrForm: "",
      ackNumber: "",
      filingDate: "",
      filingStatus: "Pending",
      updatedAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(KEYS.work, JSON.stringify(work));

  const docs: DocumentInward[] = [
    {
      id: "d1",
      clientId: "c1",
      date: "01-04-2025",
      mode: "Email",
      status: "Complete",
      remarks: "Form 16 received",
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(KEYS.documents, JSON.stringify(docs));

  const billing: Billing[] = [
    {
      id: "b1",
      clientId: "c1",
      taxYear: "2024-2025",
      billAmount: 5000,
      receipt: 2500,
      balance: 2500,
      outwardStatus: "Pending",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "b2",
      clientId: "c2",
      taxYear: "2024-2025",
      billAmount: 8000,
      receipt: 0,
      balance: 8000,
      outwardStatus: "Pending",
      updatedAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(KEYS.billing, JSON.stringify(billing));
}

/**
 * Get head of income for a client with backward compatibility.
 */
export function getHeadOfIncome(client: import("../types").Client): string {
  if (client.headOfIncome) return client.headOfIncome;
  const legacy = (client as any).sourceOfIncome;
  if (legacy === "Salary") return "Salaried";
  if (legacy === "Other") return "Salaried";
  return legacy || "Salaried";
}

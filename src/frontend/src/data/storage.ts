/**
 * storage.ts
 *
 * Hybrid storage layer for TaxCore.
 * - In-memory cache for instant synchronous reads
 * - localStorage for offline/fast fallback cache
 * - ICP canister for permanent cross-device persistence (global blobs)
 *
 * v2: All canister I/O now uses two global JSON blobs (not per-caller maps).
 * This means any browser/device can read the same data without ICP identity issues.
 */

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
import {
  type UserDatabase,
  loadAllFromCanister,
  saveAppData,
  saveUserDatabase,
} from "./canisterDb";

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

// ─── In-memory cache ───────────────────────────────────────────────────────

const cache: {
  users: User[];
  clients: Client[];
  documents: DocumentInward[];
  work: WorkProcessing[];
  billing: Billing[];
  firmAccounts: FirmAccount[];
  auditLogs: AuditLogEntry[];
  notificationLogs: NotificationLog[];
  superAdminCreated: boolean;
  whatsappSettings: WhatsAppSettings | null;
} = {
  users: [],
  clients: [],
  documents: [],
  work: [],
  billing: [],
  firmAccounts: [],
  auditLogs: [],
  notificationLogs: [],
  superAdminCreated: false,
  whatsappSettings: null,
};

// ─── Initialization state ────────────────────────────────────────────────────

let initPromise: Promise<void> | null = null;
let isInitialized = false;
export let lastSyncTime: Date | null = null;

// ─── localStorage helpers ───────────────────────────────────────────────────

function lsGet<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function lsSet<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── Load cache from localStorage ─────────────────────────────────────────────────

function loadCacheFromLocalStorage(): void {
  cache.users = lsGet<User>(KEYS.users);
  cache.clients = lsGet<Client>(KEYS.clients);
  cache.documents = lsGet<DocumentInward>(KEYS.documents);
  cache.work = lsGet<WorkProcessing>(KEYS.work);
  cache.billing = lsGet<Billing>(KEYS.billing);
  cache.firmAccounts = lsGet<FirmAccount>(KEYS.firmAccounts);
  cache.auditLogs = lsGet<AuditLogEntry>(KEYS.auditLogs);
  cache.notificationLogs = lsGet<NotificationLog>(KEYS.notificationLogs);
  cache.superAdminCreated =
    localStorage.getItem(KEYS.superAdminCreated) === "true";
  try {
    const raw = localStorage.getItem(KEYS.whatsappSettings);
    cache.whatsappSettings = raw ? (JSON.parse(raw) as WhatsAppSettings) : null;
  } catch {
    cache.whatsappSettings = null;
  }
}

// ─── Dispatch change event ───────────────────────────────────────────────────

function dispatchChange(key?: string): void {
  window.dispatchEvent(
    new CustomEvent("taxcore-storage-change", { detail: { key } }),
  );
}

// ─── Background sync helper ──────────────────────────────────────────────────
// Writes to cache + localStorage immediately, dispatches change event,
// then syncs to canister in background (fire-and-forget with retry)

function bgSync(
  syncFn: () => Promise<void>,
  description: string,
  retries = 2,
): void {
  const attempt = (remaining: number) => {
    syncFn().catch((err) => {
      console.warn(`[storage] canister sync failed (${description}):`, err);
      if (remaining > 0) {
        setTimeout(() => attempt(remaining - 1), 3000);
      }
    });
  };
  attempt(retries);
}

// ─── Helper: build current AppData snapshot for canister save ──────────────────

function buildAppDataSnapshot() {
  return {
    clients: cache.clients,
    documents: cache.documents,
    work: cache.work,
    billing: cache.billing,
    auditLogs: cache.auditLogs,
  };
}

function buildUserDbSnapshot(): UserDatabase {
  return {
    users: cache.users,
    firmAccounts: cache.firmAccounts,
    superAdminCreated: cache.superAdminCreated,
    whatsAppSettings: cache.whatsappSettings,
  };
}

/** Immediately (awaited) saves the user database to canister. Use for critical first-time saves. */
export async function saveUserDatabaseNow(): Promise<void> {
  await saveUserDatabase(buildUserDbSnapshot());
}

/**
 * Saves users immediately to canister (awaited, not fire-and-forget).
 * Use after any user creation/deletion to guarantee cross-device visibility
 * within the next 5-second poll cycle.
 */
export async function saveUsersNow(users: User[]): Promise<void> {
  cache.users = users;
  lsSet(KEYS.users, users);
  const hasSA = users.some((u) => u.role === "Super Admin");
  if (hasSA) {
    cache.superAdminCreated = true;
    localStorage.setItem(KEYS.superAdminCreated, "true");
  }
  dispatchChange(KEYS.users);
  await saveUserDatabase(buildUserDbSnapshot());
}

// ─── Main initialize function ──────────────────────────────────────────────────

/**
 * Loads all data from the ICP canister into memory.
 * Falls back gracefully to localStorage data if canister is unavailable.
 * Call once on app startup. Returns immediately if already called.
 */
export async function initialize(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // First load localStorage so we have something immediately
    loadCacheFromLocalStorage();

    try {
      // Load all data from both global canister blobs in parallel
      const canisterData = await loadAllFromCanister();

      // ─ User database ─
      if (canisterData.userDb) {
        const udb = canisterData.userDb;
        // Always trust canister for users — canister is the authoritative source.
        // Even if canister returns an empty array, that might mean no users yet (new deployment).
        // However, we preserve local users if canister is empty AND we have local users
        // (guards against bgSync race where canister write hasn't completed yet).
        if (udb.users !== undefined) {
          if (udb.users.length > 0) {
            // Canister has users — always use them
            cache.users = udb.users;
            lsSet(KEYS.users, cache.users);
          }
          // If canister returns empty but local has users, keep local (bgSync not completed yet)
        }
        if (udb.firmAccounts !== undefined) {
          if (udb.firmAccounts.length > 0) {
            cache.firmAccounts = udb.firmAccounts;
            lsSet(KEYS.firmAccounts, cache.firmAccounts);
          }
        }
        // superAdminCreated flag: ALWAYS sync from canister regardless of users array length.
        // This is the critical fix: the flag must propagate even when users array guard fires.
        if (udb.superAdminCreated === true) {
          cache.superAdminCreated = true;
          localStorage.setItem(KEYS.superAdminCreated, "true");
        }
        if (udb.whatsAppSettings) {
          cache.whatsappSettings = udb.whatsAppSettings ?? null;
          if (cache.whatsappSettings) {
            localStorage.setItem(
              KEYS.whatsappSettings,
              JSON.stringify(cache.whatsappSettings),
            );
          }
        }
      }

      // Derive superAdminCreated from users array as a safety net
      // (handles cases where flag wasn't set but admin user exists)
      const hasAdmin = cache.users.some((u) => u.role === "Super Admin");
      if (hasAdmin) {
        cache.superAdminCreated = true;
        localStorage.setItem(KEYS.superAdminCreated, "true");
      }

      // ─ App data ─
      if (canisterData.clients.length > 0) {
        cache.clients = canisterData.clients;
        lsSet(KEYS.clients, cache.clients);
      }
      if (canisterData.documents.length > 0) {
        cache.documents = canisterData.documents;
        lsSet(KEYS.documents, cache.documents);
      }
      if (canisterData.work.length > 0) {
        cache.work = canisterData.work;
        lsSet(KEYS.work, cache.work);
      }
      if (canisterData.billing.length > 0) {
        cache.billing = canisterData.billing;
        lsSet(KEYS.billing, cache.billing);
      }
      if (canisterData.auditLogs.length > 0) {
        const canisterIds = new Set(canisterData.auditLogs.map((l) => l.id));
        const localOnly = cache.auditLogs.filter((l) => !canisterIds.has(l.id));
        cache.auditLogs = [...canisterData.auditLogs, ...localOnly];
        lsSet(KEYS.auditLogs, cache.auditLogs);
      }

      lastSyncTime = new Date();
      console.log("[storage] Initialized from canister:", {
        users: cache.users.length,
        clients: cache.clients.length,
        superAdminCreated: cache.superAdminCreated,
      });
    } catch (err) {
      console.warn(
        "[storage] Canister load failed, using localStorage cache:",
        err,
      );
    }

    isInitialized = true;
    dispatchChange("init");
  })();

  return initPromise;
}

/**
 * Returns a promise that resolves when storage is fully initialized from canister.
 */
export async function whenInitialized(): Promise<void> {
  if (isInitialized) return;
  return initialize();
}

/**
 * Forces a fresh reload from the canister, replacing cached data.
 */
export async function refreshFromCanister(): Promise<void> {
  initPromise = null;
  isInitialized = false;
  return initialize();
}

/**
 * Silently polls the canister for fresh data without resetting initPromise.
 * Called every 30 seconds while the user is logged in.
 */
export async function silentRefreshFromCanister(): Promise<void> {
  try {
    const canisterData = await loadAllFromCanister();
    let changed = false;

    if (canisterData.userDb) {
      const udb = canisterData.userDb;
      // Always trust canister user data (handles deletions/additions on other devices).
      // CRITICAL: Update users if canister has users. If canister returns empty, preserve
      // local users (guards bgSync race: local write may not have reached canister yet).
      if (udb.users !== undefined) {
        const prev = JSON.stringify(cache.users);
        if (udb.users.length > 0) {
          // Canister has real data — always use it
          cache.users = udb.users;
          lsSet(KEYS.users, cache.users);
        }
        // If canister empty + local has users: keep local (bgSync not yet committed)
        if (JSON.stringify(cache.users) !== prev) changed = true;
      }
      if (udb.firmAccounts !== undefined) {
        const prev = JSON.stringify(cache.firmAccounts);
        if (udb.firmAccounts.length > 0) {
          cache.firmAccounts = udb.firmAccounts;
          lsSet(KEYS.firmAccounts, cache.firmAccounts);
        }
        if (JSON.stringify(cache.firmAccounts) !== prev) changed = true;
      }
      // CRITICAL FIX: Always sync superAdminCreated flag from canister,
      // even when users array is empty or guard didn't fire.
      // This ensures new browsers see login (not setup) as soon as canister has the flag.
      if (udb.superAdminCreated === true) {
        cache.superAdminCreated = true;
        localStorage.setItem(KEYS.superAdminCreated, "true");
      }
    }

    // Derive superAdminCreated from users array as backup safety net
    if (cache.users.some((u) => u.role === "Super Admin")) {
      cache.superAdminCreated = true;
      localStorage.setItem(KEYS.superAdminCreated, "true");
    }

    // Always trust canister app data - this handles deletions from other devices
    const prevClients = JSON.stringify(cache.clients);
    cache.clients = canisterData.clients;
    lsSet(KEYS.clients, cache.clients);
    if (JSON.stringify(canisterData.clients) !== prevClients) changed = true;

    const prevDocs = JSON.stringify(cache.documents);
    cache.documents = canisterData.documents;
    lsSet(KEYS.documents, cache.documents);
    if (JSON.stringify(canisterData.documents) !== prevDocs) changed = true;

    const prevWork = JSON.stringify(cache.work);
    cache.work = canisterData.work;
    lsSet(KEYS.work, cache.work);
    if (JSON.stringify(canisterData.work) !== prevWork) changed = true;

    const prevBilling = JSON.stringify(cache.billing);
    cache.billing = canisterData.billing;
    lsSet(KEYS.billing, cache.billing);
    if (JSON.stringify(canisterData.billing) !== prevBilling) changed = true;

    const prevLogs = JSON.stringify(cache.auditLogs);
    if (canisterData.auditLogs.length > 0) {
      // Merge: canister is authoritative, but preserve local-only entries not yet synced
      const canisterIds = new Set(canisterData.auditLogs.map((l) => l.id));
      const localOnly = cache.auditLogs.filter((l) => !canisterIds.has(l.id));
      cache.auditLogs = [...canisterData.auditLogs, ...localOnly];
    }
    // If canister returned empty, do NOT wipe local cache (bgSync may not have completed yet)
    lsSet(KEYS.auditLogs, cache.auditLogs);
    if (JSON.stringify(cache.auditLogs) !== prevLogs) changed = true;

    if (changed) {
      lastSyncTime = new Date();
      dispatchChange("refresh");
    } else {
      // Always update lastSyncTime even when unchanged
      lastSyncTime = new Date();
    }
  } catch (err) {
    console.warn("[storage] silentRefresh failed:", err);
  }
}

// ─── Storage API ───────────────────────────────────────────────────────────────

export const storage = {
  uid,

  // ─── Users ────────────────────────────────────────────────────────────

  getUsers: (): User[] => cache.users,

  saveUsers: (users: User[]): void => {
    cache.users = users;
    lsSet(KEYS.users, users);
    const hasSA = users.some((u) => u.role === "Super Admin");
    if (hasSA) {
      cache.superAdminCreated = true;
      localStorage.setItem(KEYS.superAdminCreated, "true");
    }
    dispatchChange(KEYS.users);
    bgSync(async () => {
      await saveUserDatabase(buildUserDbSnapshot());
    }, "saveUsers");
  },

  getCurrentUser: (): User | null => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.currentUser) || "null");
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: User | null): void => {
    if (user) localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
    else localStorage.removeItem(KEYS.currentUser);
  },

  // ─── Super Admin flag ─────────────────────────────────────────────────

  isSuperAdminCreated: (): boolean => {
    return (
      cache.superAdminCreated ||
      cache.users.some((u) => u.role === "Super Admin")
    );
  },

  markSuperAdminCreated: (): void => {
    cache.superAdminCreated = true;
    localStorage.setItem(KEYS.superAdminCreated, "true");
    bgSync(async () => {
      await saveUserDatabase(buildUserDbSnapshot());
    }, "markSuperAdminCreated");
  },

  // ─── Firm Accounts ────────────────────────────────────────────────────

  getFirmAccounts: (): FirmAccount[] => cache.firmAccounts,

  saveFirmAccounts: (accounts: FirmAccount[]): void => {
    cache.firmAccounts = accounts;
    lsSet(KEYS.firmAccounts, accounts);
    dispatchChange(KEYS.firmAccounts);
    bgSync(async () => {
      await saveUserDatabase(buildUserDbSnapshot());
    }, "saveFirmAccounts");
  },

  /**
   * Updates lastLogin timestamp for the FirmAccount belonging to the given owner ID.
   * For Staff users, pass their firmOwnerId. For Owner users, pass their own id.
   */
  updateFirmLastLogin: (firmOwnerId: string): void => {
    // Find the owner user to match their email → firm account
    const ownerUser = cache.users.find(
      (u) => u.id === firmOwnerId && u.role === "Owner",
    );
    if (!ownerUser) return;

    const updated = cache.firmAccounts.map((f) =>
      f.email.toLowerCase() === ownerUser.email.toLowerCase()
        ? { ...f, lastLogin: new Date().toISOString() }
        : f,
    );
    cache.firmAccounts = updated;
    lsSet(KEYS.firmAccounts, updated);
    dispatchChange(KEYS.firmAccounts);
    bgSync(async () => {
      await saveUserDatabase(buildUserDbSnapshot());
    }, "updateFirmLastLogin");
  },

  // ─── Clients ─────────────────────────────────────────────────────────────

  getClients: (): Client[] => cache.clients,

  saveClients: (clients: Client[]): void => {
    cache.clients = clients;
    lsSet(KEYS.clients, clients);
    dispatchChange(KEYS.clients);
    bgSync(async () => {
      await saveAppData(buildAppDataSnapshot());
    }, "saveClients");
  },

  // ─── Documents ───────────────────────────────────────────────────────────

  getDocuments: (): DocumentInward[] => cache.documents,

  saveDocuments: (docs: DocumentInward[]): void => {
    cache.documents = docs;
    lsSet(KEYS.documents, docs);
    dispatchChange(KEYS.documents);
    bgSync(async () => {
      await saveAppData(buildAppDataSnapshot());
    }, "saveDocuments");
  },

  // ─── Work Processing ─────────────────────────────────────────────────────

  getWork: (): WorkProcessing[] => cache.work,

  saveWork: (work: WorkProcessing[]): void => {
    cache.work = work;
    lsSet(KEYS.work, work);
    dispatchChange(KEYS.work);
    bgSync(async () => {
      await saveAppData(buildAppDataSnapshot());
    }, "saveWork");
  },

  // ─── Billing ─────────────────────────────────────────────────────────────

  getBilling: (): Billing[] => cache.billing,

  saveBilling: (billing: Billing[]): void => {
    cache.billing = billing;
    lsSet(KEYS.billing, billing);
    dispatchChange(KEYS.billing);
    bgSync(async () => {
      await saveAppData(buildAppDataSnapshot());
    }, "saveBilling");
  },

  // ─── Audit Logs ───────────────────────────────────────────────────────────

  getAuditLogs: (): AuditLogEntry[] => cache.auditLogs,

  addAuditLog: (entry: AuditLogEntry): void => {
    cache.auditLogs.push(entry);
    lsSet(KEYS.auditLogs, cache.auditLogs);
    dispatchChange(KEYS.auditLogs);
    bgSync(
      async () => {
        await saveAppData(buildAppDataSnapshot());
      },
      "addAuditLog",
      0,
    );
  },

  clearAuditLogs: (): void => {
    cache.auditLogs = [];
    lsSet(KEYS.auditLogs, []);
    dispatchChange(KEYS.auditLogs);
    bgSync(async () => {
      await saveAppData(buildAppDataSnapshot());
    }, "clearAuditLogs");
  },

  // ─── WhatsApp Settings ───────────────────────────────────────────────────

  getWhatsAppSettings: (): WhatsAppSettings | null => cache.whatsappSettings,

  saveWhatsAppSettings: (settings: WhatsAppSettings): void => {
    cache.whatsappSettings = settings;
    localStorage.setItem(KEYS.whatsappSettings, JSON.stringify(settings));
    dispatchChange(KEYS.whatsappSettings);
    bgSync(async () => {
      await saveUserDatabase(buildUserDbSnapshot());
    }, "saveWhatsAppSettings");
  },

  // ─── Notification Logs ───────────────────────────────────────────────────

  getNotificationLogs: (): NotificationLog[] => cache.notificationLogs,

  addNotificationLog: (entry: NotificationLog): void => {
    cache.notificationLogs.push(entry);
    lsSet(KEYS.notificationLogs, cache.notificationLogs);
    dispatchChange(KEYS.notificationLogs);
  },

  clearNotificationLogs: (): void => {
    cache.notificationLogs = [];
    lsSet(KEYS.notificationLogs, []);
    dispatchChange(KEYS.notificationLogs);
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
    if (isClientEVerified(c.id)) continue;
    const daysLeft = getDaysUntilDue(c.dueDate);
    if (daysLeft === null || daysLeft > 10) continue;
    const work = getClientWork(c.id);
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
    const deadline = new Date(filingDt.getTime() + 30 * 24 * 60 * 60 * 1000);
    deadline.setHours(0, 0, 0, 0);
    const daysToDeadline = Math.floor(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
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
  storage.saveClients([c1, c2]);

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
  storage.saveWork(work);

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
  storage.saveDocuments(docs);

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
  storage.saveBilling(billing);
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

// Load cache from localStorage on module import so reads are instant
loadCacheFromLocalStorage();

/**
 * canisterDb.ts
 *
 * Manages the ICP canister connection for TaxCore.
 *
 * Architecture (v2 - Global Blobs):
 * - ALL data is stored in two global canister text variables.
 * - No per-caller identity is used, so any browser/device reads the same data.
 * - globalUserDb  → users, firmAccounts, superAdminCreated, whatsAppSettings
 * - globalAppData → clients, documents, work, billing, auditLogs
 *
 * This permanently fixes the "System Setup" bug that appeared when opening
 * the app in a new browser, because there is no per-principal scoping.
 */

import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import type {
  AuditLogEntry,
  Billing,
  Client,
  DocumentInward,
  FirmAccount,
  User,
  WhatsAppSettings,
  WorkProcessing,
} from "../types";

// ─── Actor singleton ─────────────────────────────────────────────────────────

let actorInstance: backendInterface | null = null;
let initializationPromise: Promise<backendInterface> | null = null;
let initialized = false;

export async function getActor(): Promise<backendInterface> {
  if (actorInstance && initialized) return actorInstance;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    const actor = await createActorWithConfig();
    actorInstance = actor;
    initialized = true;
    return actor;
  })();

  return initializationPromise;
}

// ─── JSON helpers ─────────────────────────────────────────────────────────────

function encodeJson(data: unknown): string {
  return JSON.stringify(data);
}

function decodeJson<T>(str: string): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface UserDatabase {
  users: User[];
  firmAccounts: FirmAccount[];
  superAdminCreated: boolean;
  whatsAppSettings: WhatsAppSettings | null;
}

export interface AppData {
  clients: Client[];
  documents: DocumentInward[];
  work: WorkProcessing[];
  billing: Billing[];
  auditLogs: AuditLogEntry[];
}

export interface FullCanisterData {
  userDb: UserDatabase | null;
  clients: Client[];
  documents: DocumentInward[];
  work: WorkProcessing[];
  billing: Billing[];
  auditLogs: AuditLogEntry[];
}

// ─── User Database ────────────────────────────────────────────────────────────

export async function loadUserDatabase(): Promise<UserDatabase | null> {
  try {
    const actor = await getActor();
    const json = await (
      actor as unknown as { getGlobalUserDatabase(): Promise<string> }
    ).getGlobalUserDatabase();
    if (!json) return null;
    return decodeJson<UserDatabase>(json);
  } catch (err) {
    console.error("[canisterDb] loadUserDatabase failed:", err);
    return null;
  }
}

export async function saveUserDatabase(db: UserDatabase): Promise<void> {
  try {
    const actor = await getActor();
    const json = encodeJson(db);
    await (
      actor as unknown as {
        saveGlobalUserDatabase(json: string): Promise<void>;
      }
    ).saveGlobalUserDatabase(json);
  } catch (err) {
    console.error("[canisterDb] saveUserDatabase failed:", err);
    throw err;
  }
}

// ─── App Data ─────────────────────────────────────────────────────────────────

export async function loadAppData(): Promise<AppData | null> {
  try {
    const actor = await getActor();
    const json = await (
      actor as unknown as { getGlobalAppData(): Promise<string> }
    ).getGlobalAppData();
    if (!json) return null;
    return decodeJson<AppData>(json);
  } catch (err) {
    console.error("[canisterDb] loadAppData failed:", err);
    return null;
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  try {
    const actor = await getActor();
    const json = encodeJson(data);
    await (
      actor as unknown as { saveGlobalAppData(json: string): Promise<void> }
    ).saveGlobalAppData(json);
  } catch (err) {
    console.error("[canisterDb] saveAppData failed:", err);
    throw err;
  }
}

// ─── Full data load ───────────────────────────────────────────────────────────

export async function loadAllFromCanister(): Promise<FullCanisterData> {
  const [userDb, appData] = await Promise.all([
    loadUserDatabase().catch(() => null),
    loadAppData().catch(() => null),
  ]);

  return {
    userDb,
    clients: appData?.clients ?? [],
    documents: appData?.documents ?? [],
    work: appData?.work ?? [],
    billing: appData?.billing ?? [],
    auditLogs: appData?.auditLogs ?? [],
  };
}

// ─── Legacy no-ops (kept to avoid import errors in storage.ts) ────────────────
// These are called in storage.ts bgSync calls but are now handled by saveAppData.

export function buildClientIdMap() {
  return new Map<string, string>();
}

export async function canisterSaveClients(_clients: Client[]): Promise<void> {
  // Handled by saveAppData in storage.ts
}

export async function canisterSaveDocuments(
  _docs: DocumentInward[],
): Promise<void> {
  // Handled by saveAppData in storage.ts
}

export async function canisterSaveWork(_work: WorkProcessing[]): Promise<void> {
  // Handled by saveAppData in storage.ts
}

export async function canisterSaveBilling(_billing: Billing[]): Promise<void> {
  // Handled by saveAppData in storage.ts
}

export async function canisterAddLog(_log: AuditLogEntry): Promise<void> {
  // Handled by saveAppData in storage.ts
}

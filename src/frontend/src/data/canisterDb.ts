/**
 * canisterDb.ts
 *
 * Manages the ICP canister connection for TaxCore and provides
 * typed async CRUD operations with type mapping between frontend types
 * and canister types.
 *
 * Strategy:
 * - Use anonymous identity (no Internet Identity) since TaxCore uses email+password auth
 * - Store ALL user data (users array) as JSON in canister UserProfile.firmId field
 *   with prefix "USERDB:" for the anonymous caller
 * - Store clients/docs/work/billing in their respective canister collections
 *   with JSON-encoded extra fields in available text fields
 * - localStorage remains as fast cache; canister is the permanent store
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
  WorkProcessing,
} from "../types";
import { getSecretParameter } from "../utils/urlParams";

// ─── Canister types (from backend.ts) ───────────────────────────────────────
import type {
  Client as CanisterClient,
  DocumentInward as CanisterDoc,
  Invoice as CanisterInvoice,
  ActivityLog as CanisterLog,
  WorkProcessing as CanisterWork,
} from "../backend";

// ─── Actor singleton ─────────────────────────────────────────────────────────

let actorInstance: backendInterface | null = null;
let initializationPromise: Promise<backendInterface> | null = null;
let initialized = false;

export async function getActor(): Promise<backendInterface> {
  if (actorInstance && initialized) return actorInstance;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    const actor = await createActorWithConfig();
    const adminToken =
      getSecretParameter("caffeineAdminToken") ||
      sessionStorage.getItem("caffeineAdminToken") ||
      "";
    try {
      // @ts-ignore - _initializeAccessControlWithSecret may exist at runtime
      await actor._initializeAccessControlWithSecret(adminToken);
    } catch {
      // May already be initialized or token is empty - that's OK
    }
    actorInstance = actor;
    initialized = true;
    return actor;
  })();

  return initializationPromise;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const JSON_PREFIX = "JSON:";
const _USERDB_KEY = "__taxcore_userdb__";

function encodeJson(data: unknown): string {
  return JSON_PREFIX + JSON.stringify(data);
}

function decodeJson<T>(str: string): T | null {
  if (!str) return null;
  const s = str.startsWith(JSON_PREFIX) ? str.slice(JSON_PREFIX.length) : str;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

// Safely convert bigint to string for use as frontend ID
function bigintToId(n: bigint): string {
  return n.toString();
}

// Convert string ID to bigint for canister calls
function idToBigint(id: string): bigint {
  try {
    return BigInt(id);
  } catch {
    return BigInt(0);
  }
}

// ─── User Database in Canister ────────────────────────────────────────────────

export interface UserDatabase {
  users: User[];
  firmAccounts: FirmAccount[];
  superAdminCreated: boolean;
  whatsAppSettings: WhatsAppSettings | null;
}

interface WhatsAppSettings {
  provider: string;
  apiKey: string;
  senderPhone: string;
  dueDateAlertEnabled: boolean;
  filingStatusAlertEnabled: boolean;
  documentReadyAlertEnabled: boolean;
}

/**
 * Loads the global user database from canister.
 * Uses a shared canister variable (not per-caller), so all browsers/devices see the same data.
 * Returns null if not found or on error.
 */
export async function loadUserDatabase(): Promise<UserDatabase | null> {
  try {
    const actor = await getActor();
    // Use the global shared storage (not per-caller)
    const json = await actor.getGlobalUserDatabase();
    if (!json) return null;
    return decodeJson<UserDatabase>(json);
  } catch {
    return null;
  }
}

/**
 * Saves the entire user database to canister in a shared global slot.
 * Not tied to any specific browser identity -- all devices can read it.
 */
export async function saveUserDatabase(db: UserDatabase): Promise<void> {
  try {
    const actor = await getActor();
    const json = encodeJson(db);
    await actor.saveGlobalUserDatabase(json);
  } catch (err) {
    console.error("[canisterDb] saveUserDatabase (global) failed:", err);
    throw err;
  }
}

// ─── Client ID map (canister bigint id → frontend string id) ────────────────────
// The canister assigns bigint IDs; we store frontend string IDs in sourceOfIncome.
// clientIdMap: frontend string id → canister bigint id

export type ClientIdMap = Map<string, bigint>;

/**
 * Builds a map from frontend client ID to canister bigint client ID.
 * Used by documents/work/billing to link records.
 */
export async function buildClientIdMap(): Promise<ClientIdMap> {
  try {
    const actor = await getActor();
    const canisterClients = await actor.getAllClients();
    const map: ClientIdMap = new Map();
    for (const cc of canisterClients) {
      // Frontend ID is stored in sourceOfIncome field with prefix "FEID:"
      if (cc.sourceOfIncome.startsWith("FEID:")) {
        const frontendId = cc.sourceOfIncome.slice(5);
        map.set(frontendId, cc.id);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

// ─── Client CRUD ─────────────────────────────────────────────────────────────

/**
 * Maps a frontend Client to canister Client format.
 * We store extra fields as JSON in the `clientType` field with a prefix,
 * and the frontend ID in `sourceOfIncome` with prefix "FEID:".
 */
function clientToCanister(c: Client): CanisterClient {
  const extra = encodeJson({
    headOfIncome: c.headOfIncome,
    businessName: c.businessName,
    taxYear: c.taxYear,
    dueDate: c.dueDate,
    clientCategory: c.clientCategory,
    clientType: c.clientType,
    createdBy: c.createdBy,
    createdAt: c.createdAt,
  });
  return {
    id: idToBigint(c.id),
    name: c.name,
    pan: c.pan,
    mobile: c.mobile,
    email: c.email || "",
    // store frontend ID in sourceOfIncome with prefix
    sourceOfIncome: `FEID:${c.id}`,
    // store extra data in clientType
    clientType: extra,
    firmId: "",
    createdBy: c.createdBy || "",
    createdAt: BigInt(0),
  };
}

function canisterToClient(c: CanisterClient): Client {
  // sourceOfIncome stores the frontend ID: "FEID:<id>"
  const frontendId = c.sourceOfIncome.startsWith("FEID:")
    ? c.sourceOfIncome.slice(5)
    : bigintToId(c.id);

  // clientType stores extra JSON data
  const extra = decodeJson<{
    headOfIncome?: string;
    businessName?: string;
    taxYear?: string;
    dueDate?: string;
    clientCategory?: string;
    clientType?: string;
    createdBy?: string;
    createdAt?: string;
  }>(c.clientType || "");

  return {
    id: frontendId,
    name: c.name,
    pan: c.pan,
    mobile: c.mobile,
    email: c.email,
    taxYear: extra?.taxYear ?? "",
    dueDate: extra?.dueDate ?? "",
    clientCategory: extra?.clientCategory ?? "",
    clientType: (extra?.clientType as "Existing" | "New") ?? "Existing",
    headOfIncome: extra?.headOfIncome as
      | "Salaried"
      | "Business"
      | "Agricultural"
      | "Capital Gain"
      | undefined,
    businessName: extra?.businessName ?? "",
    createdBy: extra?.createdBy ?? c.createdBy ?? "",
    createdAt:
      extra?.createdAt ??
      new Date(Number(c.createdAt) / 1_000_000).toISOString(),
  };
}

export async function canisterGetAllClients(): Promise<Client[]> {
  const actor = await getActor();
  const results = await actor.getAllClients();
  return results
    .filter((c) => c.sourceOfIncome.startsWith("FEID:"))
    .map(canisterToClient);
}

/**
 * Saves all frontend clients to canister.
 * Creates new ones or updates existing based on frontend ID.
 */
export async function canisterSaveClients(clients: Client[]): Promise<void> {
  try {
    const actor = await getActor();
    // Get existing canister clients to find which to create vs update
    const existing = await actor.getAllClients();
    const existingByFrontendId = new Map<string, bigint>();
    for (const cc of existing) {
      if (cc.sourceOfIncome.startsWith("FEID:")) {
        existingByFrontendId.set(cc.sourceOfIncome.slice(5), cc.id);
      }
    }

    const CHUNK_SIZE = 3;
    for (let i = 0; i < clients.length; i += CHUNK_SIZE) {
      const chunk = clients.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (c) => {
          const canisterData = clientToCanister(c);
          const existingId = existingByFrontendId.get(c.id);
          if (existingId !== undefined) {
            await actor.updateClient({ ...canisterData, id: existingId });
          } else {
            await actor.createClient(canisterData);
          }
        }),
      );
    }
  } catch (err) {
    console.error("[canisterDb] canisterSaveClients failed:", err);
  }
}

// ─── Document Inward CRUD ─────────────────────────────────────────────────────

function documentToCanister(
  d: DocumentInward,
  clientCanisterId: bigint,
): CanisterDoc {
  return {
    id: idToBigint(d.id),
    clientId: clientCanisterId,
    dateOfReceipt: d.date,
    mode: d.mode,
    documentStatus: d.status,
    remarks: encodeJson({
      remarks: d.remarks,
      createdAt: d.createdAt,
      frontendId: d.id,
      frontendClientId: d.clientId,
    }),
    firmId: "",
  };
}

function canisterToDocument(
  d: CanisterDoc,
  frontendClientId: string,
): DocumentInward {
  const extra = decodeJson<{
    remarks?: string;
    createdAt?: string;
    frontendId?: string;
    frontendClientId?: string;
  }>(d.remarks || "");

  return {
    id: extra?.frontendId ?? bigintToId(d.id),
    clientId: extra?.frontendClientId ?? frontendClientId,
    date: d.dateOfReceipt,
    mode: d.mode as "Email" | "WhatsApp" | "Hardcopy" | "Mix",
    status: d.documentStatus as "Complete" | "Partial",
    remarks: extra?.remarks ?? "",
    createdAt: extra?.createdAt ?? new Date().toISOString(),
  };
}

export async function canisterGetAllDocuments(
  clients?: Client[],
): Promise<DocumentInward[]> {
  const actor = await getActor();
  // Get all canister clients to build clientId map
  const canisterClients = clients
    ? null
    : await actor.getAllClients().catch(() => []);
  const clientsToUse =
    canisterClients ??
    clients?.map(
      (c) =>
        ({
          id: idToBigint(c.id),
          sourceOfIncome: `FEID:${c.id}`,
        }) as { id: bigint; sourceOfIncome: string },
    ) ??
    [];

  // Build frontend ID map
  const canisterIdToFrontendId = new Map<bigint, string>();
  for (const cc of clientsToUse) {
    if (
      "sourceOfIncome" in cc &&
      (cc as { sourceOfIncome: string }).sourceOfIncome.startsWith("FEID:")
    ) {
      canisterIdToFrontendId.set(
        cc.id,
        (cc as { sourceOfIncome: string }).sourceOfIncome.slice(5),
      );
    }
  }

  // Fetch documents for each client in parallel (chunked)
  const clientIds = Array.from(canisterIdToFrontendId.keys());
  if (clientIds.length === 0) return [];

  const CHUNK_SIZE = 5;
  const allDocs: DocumentInward[] = [];
  for (let i = 0; i < clientIds.length; i += CHUNK_SIZE) {
    const chunk = clientIds.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(
      chunk.map((cid) => actor.getDocumentInwardByClient(cid).catch(() => [])),
    );
    for (let j = 0; j < chunk.length; j++) {
      const frontendClientId = canisterIdToFrontendId.get(chunk[j]) ?? "";
      for (const doc of results[j]) {
        allDocs.push(canisterToDocument(doc, frontendClientId));
      }
    }
  }
  return allDocs;
}

/**
 * Saves all frontend documents to canister.
 * clientIdMap: frontend string id → canister bigint id
 */
export async function canisterSaveDocuments(
  docs: DocumentInward[],
  clientIdMap: ClientIdMap,
): Promise<void> {
  try {
    const actor = await getActor();
    // Get existing docs to know which to create vs update
    // We use frontend ID stored in remarks to find existing
    const allExistingDocs = await Promise.all(
      Array.from(clientIdMap.values()).map((cid) =>
        actor.getDocumentInwardByClient(cid).catch(() => []),
      ),
    );
    const existingByFrontendId = new Map<string, bigint>();
    for (const clientDocs of allExistingDocs) {
      for (const d of clientDocs) {
        const extra = decodeJson<{ frontendId?: string }>(d.remarks || "");
        if (extra?.frontendId) {
          existingByFrontendId.set(extra.frontendId, d.id);
        }
      }
    }

    const CHUNK_SIZE = 3;
    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
      const chunk = docs.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (d) => {
          const clientCanisterId = clientIdMap.get(d.clientId);
          if (!clientCanisterId) return;
          const canisterData = documentToCanister(d, clientCanisterId);
          const existingId = existingByFrontendId.get(d.id);
          if (existingId !== undefined) {
            await actor.updateDocumentInward({
              ...canisterData,
              id: existingId,
            });
          } else {
            await actor.addDocumentInward(canisterData);
          }
        }),
      );
    }
  } catch (err) {
    console.error("[canisterDb] canisterSaveDocuments failed:", err);
  }
}

// ─── Work Processing CRUD ─────────────────────────────────────────────────────

function workToCanister(
  w: WorkProcessing,
  clientCanisterId: bigint,
): CanisterWork {
  return {
    id: idToBigint(w.id),
    clientId: clientCanisterId,
    itrFormType: encodeJson({
      frontendId: w.id,
      frontendClientId: w.clientId,
      status: w.status,
      itrForm: w.itrForm,
      returnType: w.returnType,
      remark: w.remark,
      eVerified: w.eVerified,
      filingStatus: w.filingStatus,
      updatedAt: w.updatedAt,
      taxYear: w.taxYear,
    }),
    filingStatus: w.filingStatus ?? "Pending",
    ackNumber: w.ackNumber,
    dueDateOfFiling: w.taxYear,
    dateOfFiling: w.filingDate,
    firmId: "",
  };
}

function canisterToWork(
  w: CanisterWork,
  frontendClientId: string,
): WorkProcessing {
  const extra = decodeJson<{
    frontendId?: string;
    frontendClientId?: string;
    status?: string;
    itrForm?: string;
    returnType?: string;
    remark?: string;
    eVerified?: boolean;
    filingStatus?: string;
    updatedAt?: string;
    taxYear?: string;
  }>(w.itrFormType || "");

  return {
    id: extra?.frontendId ?? bigintToId(w.id),
    clientId: extra?.frontendClientId ?? frontendClientId,
    taxYear: extra?.taxYear ?? w.dueDateOfFiling ?? "",
    status:
      (extra?.status as "Pending" | "In Progress" | "Completed" | "Filed") ??
      "Pending",
    itrForm: extra?.itrForm ?? "",
    returnType: extra?.returnType as
      | "Original"
      | "Revised"
      | "Belated"
      | "Updated"
      | undefined,
    remark: extra?.remark,
    eVerified: extra?.eVerified,
    filingStatus: (extra?.filingStatus ?? w.filingStatus) as
      | "Pending"
      | "Pending for E-verification"
      | "E-Verified"
      | undefined,
    ackNumber: w.ackNumber,
    filingDate: w.dateOfFiling,
    updatedAt: extra?.updatedAt ?? new Date().toISOString(),
  };
}

export async function canisterGetAllWork(): Promise<WorkProcessing[]> {
  const actor = await getActor();
  const [allWork, allClients] = await Promise.all([
    actor.getAllWorkProcessing(),
    actor.getAllClients().catch(() => []),
  ]);

  // Build canister id → frontend id map
  const canisterIdToFrontendId = new Map<bigint, string>();
  for (const cc of allClients) {
    if (cc.sourceOfIncome.startsWith("FEID:")) {
      canisterIdToFrontendId.set(cc.id, cc.sourceOfIncome.slice(5));
    }
  }

  return allWork.map((w) => {
    const frontendClientId =
      canisterIdToFrontendId.get(w.clientId) ?? bigintToId(w.clientId);
    return canisterToWork(w, frontendClientId);
  });
}

export async function canisterSaveWork(
  workList: WorkProcessing[],
  clientIdMap: ClientIdMap,
): Promise<void> {
  try {
    const actor = await getActor();
    const allExistingWork = await actor.getAllWorkProcessing().catch(() => []);
    const existingByFrontendId = new Map<string, bigint>();
    for (const w of allExistingWork) {
      const extra = decodeJson<{ frontendId?: string }>(w.itrFormType || "");
      if (extra?.frontendId) {
        existingByFrontendId.set(extra.frontendId, w.id);
      }
    }

    const CHUNK_SIZE = 3;
    for (let i = 0; i < workList.length; i += CHUNK_SIZE) {
      const chunk = workList.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (w) => {
          const clientCanisterId = clientIdMap.get(w.clientId);
          if (!clientCanisterId) return;
          const canisterData = workToCanister(w, clientCanisterId);
          const existingId = existingByFrontendId.get(w.id);
          if (existingId !== undefined) {
            await actor.updateWorkProcessing({
              ...canisterData,
              id: existingId,
            });
          } else {
            await actor.addWorkProcessing(canisterData);
          }
        }),
      );
    }
  } catch (err) {
    console.error("[canisterDb] canisterSaveWork failed:", err);
  }
}

// ─── Billing CRUD ─────────────────────────────────────────────────────────────

function billingToCanister(
  b: Billing,
  clientCanisterId: bigint,
): CanisterInvoice {
  return {
    id: idToBigint(b.id),
    clientId: clientCanisterId,
    amount: BigInt(Math.round(b.billAmount)),
    paid: b.receipt > 0,
    generatedAt: BigInt(0),
    generatedBy: "",
    invoiceNumber: encodeJson({
      frontendId: b.id,
      frontendClientId: b.clientId,
      billAmount: b.billAmount,
      receipt: b.receipt,
      balance: b.balance,
      outwardStatus: b.outwardStatus,
      taxYear: b.taxYear,
      updatedAt: b.updatedAt,
    }),
    firmId: "",
  };
}

function canisterToBilling(
  b: CanisterInvoice,
  frontendClientId: string,
): Billing {
  const extra = decodeJson<{
    frontendId?: string;
    frontendClientId?: string;
    billAmount?: number;
    receipt?: number;
    balance?: number;
    outwardStatus?: string;
    taxYear?: string;
    updatedAt?: string;
  }>(b.invoiceNumber || "");

  const billAmount = extra?.billAmount ?? Number(b.amount);
  const receipt = extra?.receipt ?? 0;
  return {
    id: extra?.frontendId ?? bigintToId(b.id),
    clientId: extra?.frontendClientId ?? frontendClientId,
    taxYear: extra?.taxYear ?? "",
    billAmount,
    receipt,
    balance: extra?.balance ?? billAmount - receipt,
    outwardStatus: (extra?.outwardStatus as "Ready" | "Pending") ?? "Pending",
    updatedAt:
      extra?.updatedAt ??
      new Date(Number(b.generatedAt) / 1_000_000).toISOString(),
  };
}

export async function canisterGetAllBilling(): Promise<Billing[]> {
  const actor = await getActor();
  const [allInvoices, allClients] = await Promise.all([
    actor.getAllInvoices(),
    actor.getAllClients().catch(() => []),
  ]);

  const canisterIdToFrontendId = new Map<bigint, string>();
  for (const cc of allClients) {
    if (cc.sourceOfIncome.startsWith("FEID:")) {
      canisterIdToFrontendId.set(cc.id, cc.sourceOfIncome.slice(5));
    }
  }

  return allInvoices.map((b) => {
    const frontendClientId =
      canisterIdToFrontendId.get(b.clientId) ?? bigintToId(b.clientId);
    return canisterToBilling(b, frontendClientId);
  });
}

export async function canisterSaveBilling(
  billingList: Billing[],
  clientIdMap: ClientIdMap,
): Promise<void> {
  try {
    const actor = await getActor();
    const allExisting = await actor.getAllInvoices().catch(() => []);
    const existingByFrontendId = new Map<string, bigint>();
    for (const b of allExisting) {
      const extra = decodeJson<{ frontendId?: string }>(b.invoiceNumber || "");
      if (extra?.frontendId) {
        existingByFrontendId.set(extra.frontendId, b.id);
      }
    }

    const CHUNK_SIZE = 3;
    for (let i = 0; i < billingList.length; i += CHUNK_SIZE) {
      const chunk = billingList.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (b) => {
          const clientCanisterId = clientIdMap.get(b.clientId);
          if (!clientCanisterId) return;
          const canisterData = billingToCanister(b, clientCanisterId);
          const existingId = existingByFrontendId.get(b.id);
          if (existingId !== undefined) {
            // No updateInvoice in backend, so mark paid/unpaid
            if (b.receipt > 0) {
              await actor.markInvoicePaid(existingId);
            }
          } else {
            await actor.generateInvoice(canisterData);
          }
        }),
      );
    }
  } catch (err) {
    console.error("[canisterDb] canisterSaveBilling failed:", err);
  }
}

// ─── Audit Log CRUD ─────────────────────────────────────────────────────────

function logToCanister(log: AuditLogEntry): CanisterLog {
  return {
    id: idToBigint(log.id),
    userId: log.userId,
    userName: log.userName,
    action: log.action,
    clientId: log.clientId ?? "",
    role: log.userRole ?? "Owner",
    firmId: "",
    timestamp: BigInt(new Date(log.timestamp).getTime()) * BigInt(1_000_000),
    details: encodeJson({
      clientName: log.clientName,
      fieldChanged: log.fieldChanged,
      oldValue: log.oldValue,
      newValue: log.newValue,
      frontendId: log.id,
    }),
  };
}

function canisterToLog(l: CanisterLog): AuditLogEntry {
  const extra = decodeJson<{
    clientName?: string;
    fieldChanged?: string;
    oldValue?: string;
    newValue?: string;
    frontendId?: string;
  }>(l.details || "");

  return {
    id: extra?.frontendId ?? bigintToId(l.id),
    userId: l.userId,
    userName: l.userName,
    action: l.action,
    clientId: l.clientId || "",
    clientName: extra?.clientName ?? "",
    fieldChanged: extra?.fieldChanged ?? "",
    oldValue: extra?.oldValue ?? "",
    newValue: extra?.newValue ?? "",
    userRole: l.role,
    timestamp: new Date(Number(l.timestamp) / 1_000_000).toISOString(),
  };
}

export async function canisterGetAllLogs(): Promise<AuditLogEntry[]> {
  const actor = await getActor();
  const results = await actor.getAllActivityLogs();
  return results.map(canisterToLog);
}

export async function canisterAddLog(log: AuditLogEntry): Promise<void> {
  try {
    const actor = await getActor();
    await actor.addActivityLog(logToCanister(log));
  } catch (err) {
    console.error("[canisterDb] canisterAddLog failed:", err);
  }
}

// ─── Full data load ───────────────────────────────────────────────────────────
// Loads ALL data from canister in parallel for fast initialization

export interface FullCanisterData {
  userDb: UserDatabase | null;
  clients: Client[];
  documents: DocumentInward[];
  work: WorkProcessing[];
  billing: Billing[];
  auditLogs: AuditLogEntry[];
}

export async function loadAllFromCanister(): Promise<FullCanisterData> {
  // Fetch everything in parallel including documents
  const [userDb, clients, work, billing, auditLogs, documents] =
    await Promise.all([
      loadUserDatabase().catch(() => null),
      canisterGetAllClients().catch(() => []),
      canisterGetAllWork().catch(() => []),
      canisterGetAllBilling().catch(() => []),
      canisterGetAllLogs().catch(() => []),
      canisterGetAllDocuments().catch(() => []),
    ]);

  return { userDb, clients, documents, work, billing, auditLogs };
}

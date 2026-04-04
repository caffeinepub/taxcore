const STORAGE_KEY = "taxcore_extended_data";

export interface ClientExtended {
  taxYear: string;
  dueDate: string;
  businessName: string;
  clientCategory: string;
}

export interface InvoiceExtended {
  receiptAmount: number;
  taxYear: string;
}

interface ExtendedStore {
  clients: Record<string, ClientExtended>;
  invoices: Record<string, InvoiceExtended>;
  isPaid: boolean;
}

function loadStore(): ExtendedStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ExtendedStore;
  } catch {
    // ignore
  }
  return { clients: {}, invoices: {}, isPaid: false };
}

function saveStore(store: ExtendedStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getClientExtended(clientId: string): ClientExtended {
  const store = loadStore();
  return (
    store.clients[clientId] ?? {
      taxYear: "",
      dueDate: "",
      businessName: "",
      clientCategory: "",
    }
  );
}

export function setClientExtended(
  clientId: string,
  data: ClientExtended,
): void {
  const store = loadStore();
  store.clients[clientId] = data;
  saveStore(store);
}

export function getAllClientExtended(): Record<string, ClientExtended> {
  return loadStore().clients;
}

export function getInvoiceExtended(invoiceId: string): InvoiceExtended {
  const store = loadStore();
  return store.invoices[invoiceId] ?? { receiptAmount: 0, taxYear: "" };
}

export function setInvoiceExtended(
  invoiceId: string,
  data: InvoiceExtended,
): void {
  const store = loadStore();
  store.invoices[invoiceId] = data;
  saveStore(store);
}

export function getIsPaid(): boolean {
  return loadStore().isPaid;
}

export function setIsPaid(val: boolean): void {
  const store = loadStore();
  store.isPaid = val;
  saveStore(store);
}

export function getPanCategory(pan: string): string {
  if (!pan || pan.length < 4) return "General";
  const ch = pan[3].toUpperCase();
  const map: Record<string, string> = {
    P: "Individual",
    F: "Firm",
    C: "Company",
    A: "AOP",
  };
  return map[ch] ?? "General";
}

export function parseFilingDateFromAck(ack: string): string {
  if (!ack || ack.length < 6) return "";
  const last6 = ack.slice(-6);
  const dd = last6.slice(0, 2);
  const mm = last6.slice(2, 4);
  const yy = last6.slice(4, 6);
  const day = Number.parseInt(dd, 10);
  const month = Number.parseInt(mm, 10);
  const year = 2000 + Number.parseInt(yy, 10);
  if (
    Number.isNaN(day) ||
    Number.isNaN(month) ||
    Number.isNaN(year) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return "";
  }
  return `${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

export function exportToCSV(
  rows: Record<string, string>[],
  filename: string,
): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const TAX_YEARS = [
  "2021-22",
  "2022-23",
  "2023-24",
  "2024-25",
  "2025-26",
];

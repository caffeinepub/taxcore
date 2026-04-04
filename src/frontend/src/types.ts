export type UserRole = "Super Admin" | "Owner" | "Staff";

// Helper to display role label in UI (Super Admin shown as Administrator)
export function getRoleDisplayLabel(role: UserRole): string {
  if (role === "Super Admin") return "Administrator";
  return role;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  mobile?: string;
  role: UserRole;
  isActive?: boolean; // for Owner accounts controlled by Super Admin
  accessType?: "Trial" | "Full"; // for Owner accounts
}

export interface FirmAccount {
  id: string;
  ownerName: string;
  firmName: string;
  email: string;
  mobile: string;
  accessType: "Trial" | "Full";
  isActive: boolean;
  createdAt: string;
  clientCount: number;
}

export interface Client {
  id: string;
  name: string;
  pan: string;
  mobile: string;
  email: string;
  clientType: "Existing" | "New";
  headOfIncome?: "Salaried" | "Business" | "Agricultural" | "Capital Gain";
  /** @deprecated use headOfIncome */
  sourceOfIncome?:
    | "Salary"
    | "Business"
    | "Other"
    | "Salaried"
    | "Agricultural"
    | "Capital Gain";
  businessName: string;
  taxYear: string;
  dueDate: string; // DD-MM-YYYY
  clientCategory: string; // auto from PAN
  createdAt: string;
  createdBy: string;
}

export interface DocumentInward {
  id: string;
  clientId: string;
  date: string; // DD-MM-YYYY
  mode: "Email" | "WhatsApp" | "Hardcopy" | "Mix";
  status: "Complete" | "Partial";
  remarks: string;
  createdAt: string;
}

export interface WorkProcessing {
  id: string;
  clientId: string;
  taxYear: string;
  status: "Pending" | "In Progress" | "Filed";
  itrForm: string;
  returnType?: "Original" | "Revised" | "Belated" | "Updated";
  remark?: string;
  ackNumber: string;
  filingDate: string; // DD-MM-YYYY
  updatedAt: string;
  eVerified?: boolean; // backward compat stop-gate
  filingStatus?: "Pending" | "Pending for E-verification" | "E-Verified";
}

export interface Billing {
  id: string;
  clientId: string;
  taxYear: string;
  billAmount: number;
  receipt: number;
  balance: number; // auto = billAmount - receipt
  outwardStatus: "Pending" | "Ready";
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole?: string; // optional for backward compat with existing entries
  action: string;
  clientId: string;
  clientName: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface WhatsAppSettings {
  provider: string; // e.g. "Twilio", "Wati", "Interakt", "Other"
  apiKey: string; // placeholder, user will fill in later
  senderPhone: string; // WhatsApp Business number
  dueDateAlertEnabled: boolean;
  filingStatusAlertEnabled: boolean;
  documentReadyAlertEnabled: boolean;
}

export interface NotificationLog {
  id: string;
  clientId: string;
  clientName: string;
  mobile: string;
  message: string;
  event: string; // "Due Date Alert" | "Filing Status" | "Document Ready"
  status: "Pending" | "Sent" | "Failed";
  timestamp: string;
}

export type Page =
  | "dashboard"
  | "clients"
  | "client-detail"
  | "work-processing"
  | "billing"
  | "user-management"
  | "export"
  | "super-admin"
  | "audit-log"
  | "settings";

// Utility to get headOfIncome with backward compat
export function getHeadOfIncome(client: Client): string {
  if (client.headOfIncome) return client.headOfIncome;
  const legacy = (client as any).sourceOfIncome;
  if (legacy === "Salary") return "Salaried";
  if (legacy === "Other") return "Salaried";
  return legacy || "Salaried";
}

// Theme system
export type ThemeKey = "burgundy" | "yellow" | "navy" | "forestgreen";

export interface ThemeConfig {
  key: ThemeKey;
  label: string;
  primary: string;
  primaryLight: string;
  gold: string;
  activeHighlight: string;
  subtitle: string;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  burgundy: {
    key: "burgundy",
    label: "Burgundy",
    primary: "#8B2635",
    primaryLight: "rgba(139,38,53,0.08)",
    gold: "#D4AF6C",
    activeHighlight: "rgba(255,255,255,0.18)",
    subtitle: "rgba(255,255,255,0.6)",
  },
  yellow: {
    key: "yellow",
    label: "Golden Yellow",
    primary: "#5C5210",
    primaryLight: "rgba(92,82,16,0.08)",
    gold: "#D4AF6C",
    activeHighlight: "rgba(212,175,108,0.25)",
    subtitle: "rgba(255,255,255,0.65)",
  },
  navy: {
    key: "navy",
    label: "Navy Blue",
    primary: "#1A3A5C",
    primaryLight: "rgba(26,58,92,0.08)",
    gold: "#5BA3E8",
    activeHighlight: "#5BA3E8",
    subtitle: "#A0C8F0",
  },
  forestgreen: {
    key: "forestgreen",
    label: "Forest Green",
    primary: "#234D2D",
    primaryLight: "rgba(35,77,45,0.08)",
    gold: "#5BBF8A",
    activeHighlight: "#5BBF8A",
    subtitle: "#8EE0B5",
  },
};

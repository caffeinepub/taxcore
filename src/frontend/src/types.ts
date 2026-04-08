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
  firmOwnerId?: string; // for Staff: the ID of the Owner who created them
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
  lastLogin?: string; // ISO date string, updated on each Owner/Staff login
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
  status: "Pending" | "In Progress" | "Completed" | "Filed"; // "Filed" kept for backward compat
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
  /** Sidebar background color */
  primary: string;
  primaryLight: string;
  /** Accent / link color */
  gold: string;
  /** Active nav item background */
  activeHighlight: string;
  /** Subtitle / inactive text under TaxCore brand */
  subtitle: string;
  /** Logo icon circle background */
  logoIconBg: string;
  /** Logo icon circle text / icon color */
  logoIconText: string;
  /** Active nav item text color */
  activeNavText: string;
  /** Active nav item left-border color */
  activeNavBorder: string;
  /** User avatar circle background */
  avatarBg: string;
  /** User avatar circle text color */
  avatarText: string;
  /** Page title color in top nav */
  pageTitleColor: string;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  burgundy: {
    key: "burgundy",
    label: "Burgundy",
    primary: "#6B1414",
    primaryLight: "rgba(107,20,20,0.08)",
    gold: "#C9A84C",
    activeHighlight: "rgba(201,168,76,0.18)",
    subtitle: "#C9A84C",
    logoIconBg: "#C9A84C",
    logoIconText: "#6B1414",
    activeNavText: "#C9A84C",
    activeNavBorder: "#C9A84C",
    avatarBg: "#C9A84C",
    avatarText: "#6B1414",
    pageTitleColor: "#6B1414",
  },
  yellow: {
    key: "yellow",
    label: "Olive Gold",
    primary: "#3D3D0A",
    primaryLight: "rgba(61,61,10,0.08)",
    gold: "#BFA84A",
    activeHighlight: "rgba(191,168,74,0.18)",
    subtitle: "#BFA84A",
    logoIconBg: "#BFA84A",
    logoIconText: "#3D3D0A",
    activeNavText: "#BFA84A",
    activeNavBorder: "#BFA84A",
    avatarBg: "#BFA84A",
    avatarText: "#3D3D0A",
    pageTitleColor: "#3D3D0A",
  },
  navy: {
    key: "navy",
    label: "Navy Blue",
    primary: "#0D2137",
    primaryLight: "rgba(13,33,55,0.08)",
    gold: "#5B9BD5",
    activeHighlight: "rgba(91,155,213,0.18)",
    subtitle: "#8BB8E0",
    logoIconBg: "#5B9BD5",
    logoIconText: "#FFFFFF",
    activeNavText: "#8BB8E0",
    activeNavBorder: "#5B9BD5",
    avatarBg: "#5B9BD5",
    avatarText: "#FFFFFF",
    pageTitleColor: "#0D2137",
  },
  forestgreen: {
    key: "forestgreen",
    label: "Forest Green",
    primary: "#1A3A22",
    primaryLight: "rgba(26,58,34,0.08)",
    gold: "#4CAF7D",
    activeHighlight: "rgba(76,175,125,0.18)",
    subtitle: "#7ED6A8",
    logoIconBg: "#4CAF7D",
    logoIconText: "#FFFFFF",
    activeNavText: "#7ED6A8",
    activeNavBorder: "#4CAF7D",
    avatarBg: "#4CAF7D",
    avatarText: "#FFFFFF",
    pageTitleColor: "#1A3A22",
  },
};

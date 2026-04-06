import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type DocumentInwardId = bigint;
export type WorkProcessingId = bigint;
export interface ExportData {
    documents: Array<DocumentInward>;
    billing: Array<Invoice>;
    workProcessing: Array<WorkProcessing>;
    clients: Array<Client>;
}
export interface ActivityLog {
    id: ActivityLogId;
    userName: string;
    clientId: string;
    action: string;
    userId: string;
    role: string;
    firmId: string;
    timestamp: bigint;
    details: string;
}
export interface WorkProcessing {
    id: WorkProcessingId;
    clientId: ClientId;
    itrFormType: string;
    filingStatus: string;
    ackNumber: string;
    dueDateOfFiling: string;
    firmId: string;
    dateOfFiling: string;
}
export interface Invoice {
    id: InvoiceId;
    clientId: ClientId;
    generatedAt: bigint;
    generatedBy: string;
    paid: boolean;
    invoiceNumber: string;
    firmId: string;
    amount: bigint;
}
export interface DashboardStats {
    documentsPending: bigint;
    filedITR: bigint;
    totalClients: bigint;
    inProgressITR: bigint;
    readyForDelivery: bigint;
    pendingITR: bigint;
}
export type OutwardDocumentId = bigint;
export interface DocumentInward {
    id: DocumentInwardId;
    clientId: ClientId;
    dateOfReceipt: string;
    mode: string;
    documentStatus: string;
    firmId: string;
    remarks: string;
}
export interface OutwardDocument {
    id: OutwardDocumentId;
    clientId: ClientId;
    readyDate: string;
    firmId: string;
    outwardStatus: string;
}
export type ActivityLogId = bigint;
export type InvoiceId = bigint;
export interface Client {
    id: ClientId;
    pan: string;
    clientType: string;
    name: string;
    createdAt: bigint;
    createdBy: string;
    email: string;
    firmId: string;
    sourceOfIncome: string;
    mobile: string;
}
export type ClientId = bigint;
export interface UserProfile {
    name: string;
    role: string;
    email: string;
    firmId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addActivityLog(log: ActivityLog): Promise<ActivityLogId>;
    addDocumentInward(doc: DocumentInward): Promise<DocumentInwardId>;
    addWorkProcessing(wp: WorkProcessing): Promise<WorkProcessingId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignStaffRole(staffPrincipal: Principal, firmId: string): Promise<void>;
    createClient(client: Client): Promise<ClientId>;
    deleteClient(id: ClientId): Promise<void>;
    deleteDocumentInward(id: DocumentInwardId): Promise<void>;
    disableTrialMode(): Promise<void>;
    generateInvoice(invoice: Invoice): Promise<InvoiceId>;
    getActivityLogsByClient(clientId: string): Promise<Array<ActivityLog>>;
    getAllActivityLogs(): Promise<Array<ActivityLog>>;
    getAllClients(): Promise<Array<Client>>;
    getAllDataForExport(): Promise<ExportData>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAllOutwardDocuments(): Promise<Array<OutwardDocument>>;
    getAllWorkProcessing(): Promise<Array<WorkProcessing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGlobalUserDatabase(): Promise<string>;
    saveGlobalUserDatabase(json: string): Promise<void>;
    getClient(id: ClientId): Promise<Client>;
    getDashboardStats(): Promise<DashboardStats>;
    getDocumentInwardByClient(clientId: ClientId): Promise<Array<DocumentInward>>;
    getInvoiceByClient(clientId: ClientId): Promise<Array<Invoice>>;
    getOutwardStatusByClient(clientId: ClientId): Promise<Array<OutwardDocument>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkProcessingByClient(clientId: ClientId): Promise<Array<WorkProcessing>>;
    isCallerAdmin(): Promise<boolean>;
    markInvoicePaid(id: InvoiceId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateClient(client: Client): Promise<void>;
    updateDocumentInward(doc: DocumentInward): Promise<void>;
    updateOutwardStatus(od: OutwardDocument): Promise<void>;
    updateWorkProcessing(wp: WorkProcessing): Promise<void>;
}

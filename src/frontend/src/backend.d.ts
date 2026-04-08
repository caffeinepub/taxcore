import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getGlobalAppData(): Promise<string>;
    getGlobalUserDatabase(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    saveGlobalAppData(json: string): Promise<void>;
    saveGlobalUserDatabase(json: string): Promise<void>;
}

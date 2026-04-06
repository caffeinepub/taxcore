export interface backendInterface {
    getGlobalUserDatabase(): Promise<string>;
    saveGlobalUserDatabase(json: string): Promise<void>;
    getGlobalAppData(): Promise<string>;
    saveGlobalAppData(json: string): Promise<void>;
}

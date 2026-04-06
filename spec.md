# TaxCore

## Current State

TaxCore stores all app data (clients, work, billing, audit logs) in an ICP canister's shared maps, accessible to all authenticated callers. However, the **user database** (TaxCore users list, `superAdminCreated` flag, firm accounts, WhatsApp settings) is stored using `saveCallerUserProfile` / `getCallerUserProfile`, which is **keyed by the caller's ICP anonymous principal**. Each browser generates a unique anonymous principal, so:

- Browser A creates Administrator → data saved under Principal A
- Browser B opens the app → gets a different Principal B → `loadUserDatabase()` returns null → `cache.users` is empty → `isSuperAdminCreated()` returns false → **System Setup screen appears again**

This is the core bug. Additionally, the Dashboard Refresh button exists but needs to be more accessible.

## Requested Changes (Diff)

### Add
- New backend Motoko function: `getGlobalUserDatabase()` — query, returns the stored global user DB (no caller restriction, anyone can read)
- New backend Motoko function: `saveGlobalUserDatabase(json: Text)` — update, stores user DB in a single shared stable variable (not per-caller)
- Manual Refresh button visible on the main app header/top bar (not just the dashboard)

### Modify
- `canisterDb.ts`: Replace `loadUserDatabase()` (which uses `getCallerUserProfile`) with a new `loadGlobalUserDatabase()` call that uses the new global backend endpoint
- `canisterDb.ts`: Replace `saveUserDatabase()` with `saveGlobalUserDatabase()` that writes to the shared slot
- `storage.ts`: Update initialization to call the new global load function; data is shared across all browser sessions/devices
- Refresh button in the app layout is always visible in the header, triggers `refreshFromCanister()` and shows loading state

### Remove
- Dependency on `saveCallerUserProfile` / `getCallerUserProfile` for user database persistence (those calls tied user data to a specific browser identity)

## Implementation Plan

1. Add `globalUserDb: Text` stable variable to main.mo with two public functions: `getGlobalUserDatabase()` (query, no auth required) and `saveGlobalUserDatabase(json: Text)` (update, no auth required for now since it's our own canister)
2. Update `canisterDb.ts`: add `loadGlobalUserDatabase()` and `saveGlobalUserDatabase(json)` calling the new actor methods; update `loadAllFromCanister()` to use the new function
3. Update `storage.ts`: wire up the new global DB functions in initialize() and bgSync calls
4. Add Refresh button to the Layout component header that calls `refreshFromCanister()` and re-renders

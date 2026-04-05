# TaxCore — Improvements: Dashboard Fix, Staff Management, Trial System, Performance, Security

## Current State

- **Frontend:** React + TypeScript, Vite, Tailwind/shadcn, ICP canister backend
- **Storage:** Hybrid — in-memory cache + localStorage (fast) + ICP canister (persistent). `storage.ts` / `canisterDb.ts` pattern.
- **Auth:** Email+password, roles: Super Admin, Owner, Staff. Stored in canister USERDB
- **Dashboard (`DashboardPage.tsx`):** Computes stats from in-memory `storage.getClients()` / `getWork()` / `getBilling()`. Listens to `onStorageChange` events. Stats compute correctly from cache but only when cache is loaded from canister. No loading state on dashboard itself.
- **Staff Management (`UserManagementPage.tsx`):** Owner can add/delete staff. Staff users are saved to user DB (canister). Works functionally but staff see Owner's full client list — no data scoping by `createdBy`.
- **Trial System:** `accessType: 'Trial' | 'Full'` field exists on `User`. No enforcement in `ClientMasterPage.tsx` — trial limit of 5 clients is not checked before adding.
- **Performance:** `initialize()` loads all data from canister sequentially: userDb → clients → work → billing → auditLogs → documents (after clients). No caching headers, no optimistic UI beyond localStorage fallback.
- **Security/Data Isolation:** All clients loaded via `actor.getAllClients()` with anonymous identity — canister returns ALL clients for the anonymous principal. Isolation is done at frontend by filtering via `createdBy` only for Staff role. Owners see all clients in the canister (no firm-level isolation at canister layer). This is the existing design — cannot change backend.

## Requested Changes (Diff)

### Add
- **Trial enforcement:** When Owner has `accessType: 'Trial'`, cap client additions at 5. Show a clear upgrade banner/modal when the limit is reached.
- **Dashboard refresh from canister:** On mount, dashboard should trigger a fresh canister data pull (not just rely on localStorage) and re-render stats after load. Add a visible "Refresh" button on dashboard.
- **Staff data scoping:** Staff users should only see clients they created (`createdBy === user.id`). Apply this filter in `ClientMasterPage` and `DashboardPage` when `user.role === 'Staff'`.
- **Per-firm data isolation:** Owner data is namespaced by `ownerId` (the Owner user's `id`) stored as prefix in clients' `createdBy`. On load, filter all canister data to only show records where the top-level owner matches the currently logged-in user's firm. For Owner, firm = own `id`. For Staff, firm = the owner who created them (stored in `user.id`'s parent firm). Use the existing `createdBy` field scoping.
- **Performance: parallel canister load:** `loadAllFromCanister()` in `canisterDb.ts` already fetches in parallel for most data. Ensure documents are also fetched in parallel (not sequentially after clients).
- **Loading skeleton on dashboard cards:** Show skeleton placeholders in stat cards while canister data loads.

### Modify
- **`ClientMasterPage.tsx`:** Before saving a new client, check if `currentUser.accessType === 'Trial'` and current client count >= 5. If so, block the save and show upgrade message instead of the form.
- **`DashboardPage.tsx`:** Add a "Refresh" button that calls `initialize()` and re-renders. Show skeleton state for stat cards while loading. Ensure stats are scoped: Staff see only their clients' stats.
- **`storage.ts` `initialize()`:** Add a `forceRefresh` parameter or export a separate `refreshFromCanister()` function to allow re-fetching without needing a full page reload.
- **`UserManagementPage.tsx`:** When creating staff, store the Owner's ID in the staff user's profile (e.g., in a `firmOwnerId` field) so staff data can be scoped back to the owner's firm. Also display staff's `isActive` status.
- **`App.tsx`:** Pass `user.accessType` through to `ClientMasterPage` so it can enforce the trial limit.
- **`canisterDb.ts` `loadAllFromCanister()`:** Fetch documents in parallel with other data (remove sequential dependency on clients).

### Remove
- Nothing removed.

## Implementation Plan

1. **`canisterDb.ts`:** Update `loadAllFromCanister()` to fetch documents in parallel (not after clients). Move `canisterGetAllDocuments()` to call `actor.getAllWorkProcessing()` approach — fetch all docs via `actor.getAllClients()` once, then fan out in parallel; ensure this is batched in a single `Promise.all`.

2. **`storage.ts`:** Add `refreshFromCanister(): Promise<void>` export — resets `initPromise`/`isInitialized` flags and re-runs full canister load, merging fresh data into cache and dispatching `taxcore-storage-change`.

3. **`types.ts`:** Add optional `firmOwnerId?: string` to `User` interface to track which Owner a Staff member belongs to.

4. **`DashboardPage.tsx`:**
   - Add skeleton loading state for the 4 stat cards (use Tailwind `animate-pulse` skeleton divs).
   - Add a "Refresh" button (small, icon + text) that calls `refreshFromCanister()` from storage, shows a spinner while loading, then re-renders stats.
   - Scope `computeStats()`: for Staff role, filter clients to only those with `createdBy === user.id`. For Owner, show all clients.
   - After `initialize()` completes in `App.tsx`, dispatch a storage change so dashboard re-renders with fresh data.

5. **`ClientMasterPage.tsx`:**
   - Accept `userAccessType` prop (or read from `storage.getCurrentUser()` directly).
   - In `openAdd()` (add client handler): check if `currentUser.accessType === 'Trial'` and `storage.getClients().filter(c => c.createdBy === currentUser.id || userRole === 'Owner').length >= 5`. If true, show upgrade dialog/banner instead of the add form.
   - Upgrade message dialog: "You've reached the 5 client limit for the Trial plan. Contact your Administrator to upgrade to the Full plan for unlimited clients."

6. **`UserManagementPage.tsx`:**
   - When creating a new Staff user, set `firmOwnerId: currentUser.id` on the new User object.
   - Show `isActive` badge next to each staff member.

7. **`App.tsx`:**
   - Pass `currentUserId` and `accessType` to `ClientMasterPage` and `DashboardPage`.
   - After `initialize()` completes, dispatch a storage change event (already done via `setStorageReady(true)` + `onStorageChange`) — verify this triggers dashboard re-render correctly.

# TaxCore

## Current State

- `ClientDetailPage.tsx` has a Work Processing tab with fields: Work Status (Pending/In Progress/Filed), ITR Form, Acknowledgement Number, Filing Date (manual/picker), Filing Status (Pending/Pending for E-verification/E-Verified).
- `ClientDetailPage.tsx` has a Document Inward tab that allows adding multiple entries with Date, Mode (Email/WhatsApp/Hardcopy/Mix), Status (Complete/Partial), Remarks.
- `ClientMasterPage.tsx` auto-creates a Work Processing record with Status=Pending on new client save.
- `types.ts` has `WorkProcessing` with `status: 'Pending' | 'In Progress' | 'Filed'`.
- `DocumentInward.mode` currently includes 'Email' but the user wants 'Gmail' instead of 'Email'.
- Acknowledgement Number field is a plain Input with no special border styling.
- Filing Date is currently a DatePickerInput (free entry).

## Requested Changes (Diff)

### Add
- **Filing Date auto-derive from Acknowledgement Number**: When a 15-digit ack number is entered, auto-extract the last 6 digits to derive the filing date. Format: last 6 digits = DDMMYY → convert to DD-MM-20YY. Auto-fill the Filing Date field and lock it (read-only) when derived from ack number. If ack number is cleared/changed, recalculate or unlock.
- **Acknowledgement Number styled border**: Add a clear, prominent bordered input box for the Ack Number field — use a thick rounded border (e.g. 2px solid #6B1A2B or gold) so it visually stands out as an important field.
- **Work Processing status options update**: Change Work Status dropdown options to: Pending, In Progress, Filed (already correct — confirm no change needed from user's latest message).
- **Document Inward mode**: Change 'Email' to 'Gmail' in mode options (Email → Gmail). Update type in `types.ts` and all references.
- **Document Inward master tab**: Ensure the Document Inward tab is visible and functional in ClientDetailPage (already exists — verify it renders correctly; the user says it is missing, so double-check the tab renders and is accessible).
- **Auto Work Processing on client create**: Already implemented in ClientMasterPage — verify and ensure it still works correctly and status starts as 'Pending'.

### Modify
- **`types.ts`**: Change `DocumentInward.mode` union from `'Email' | 'WhatsApp' | 'Hardcopy' | 'Mix'` to `'Gmail' | 'WhatsApp' | 'Hardcopy' | 'Mix'`.
- **`ClientDetailPage.tsx` — Acknowledgement Number field**: Add prominent styled border (2px solid #6B1A2B, rounded-lg, padding), add `onChange` handler that reads last 6 digits and auto-fills Filing Date.
- **`ClientDetailPage.tsx` — Filing Date field**: Make it read-only / locked when auto-derived from ack number. Show a lock icon or note "Auto-filled from Ack No." When ack number is blank or < 15 digits, allow manual entry.
- **`ClientDetailPage.tsx` — Document Inward mode select**: Change `SelectItem value="Email"` to `value="Gmail"` and label to "Gmail".
- **`ClientMasterPage.tsx`**: Update `DOC_STATUS_OPTIONS` and mode references if Email→Gmail affects inline editing.

### Remove
- Nothing removed.

## Implementation Plan

1. **`types.ts`**: Update `DocumentInward.mode` type to `'Gmail' | 'WhatsApp' | 'Hardcopy' | 'Mix'`.
2. **`ClientDetailPage.tsx`**:
   a. In `docForm` state, change default mode from `'Email'` to `'Gmail'`.
   b. In Document Inward tab mode `<Select>`, change SelectItem value/label from `Email` → `Gmail`.
   c. In Work Processing tab, style the Acknowledgement Number input with a thick Burgundy/gold border (add className with border-2 and a ring style or use inline style with border: '2px solid #6B1A2B').
   d. Add derived filing date logic: in the `onChange` for ackNumber, after setting the value, if the new value has exactly 15 digits, extract `ackNumber.slice(9, 15)` (last 6 digits = positions 9-14 in 0-indexed), parse as DDMMYY → `DD-MM-20YY`, and call `setWorkForm(f => ({ ...f, filingDate: derivedDate, filingDateLocked: true }))`.
   e. Add `filingDateLocked` boolean to workForm state. When true, render Filing Date as a read-only styled div (or disabled input) showing the auto-derived date with a lock icon. When false (ack number < 15 digits or cleared), show the normal DatePickerInput.
3. **`ClientMasterPage.tsx`**: No mode changes needed to inline doc status editing (it only shows Complete/Partial, not mode). Ensure auto-WorkProcessing creation remains intact.
4. **Verify** Document Inward tab renders: The tab exists in ClientDetailPage. If user sees it missing, confirm the `Tabs defaultValue="documents"` is set so it opens by default.

# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Core commands

This is a Next.js App Router project using TypeScript, TailwindCSS, and Supabase.

**Local development**
- Start dev server (default: http://localhost:3000):
  - `npm run dev`

**Build & run production**
- Build: `npm run build`
- Start after build: `npm start`

**Linting**
- Run Next.js ESLint: `npm run lint`

**CSV/Excel import test scripts**
- Some import-related behavior is exercised via ad‑hoc Node scripts under `app/deport/csv-upload/test-data`.
- Example (from inside `app/deport/csv-upload/test-data`):
  - `node test-excel-parsing.js`

> If you prefer `yarn` or `pnpm`, use the equivalent commands (e.g. `yarn dev`, `pnpm dev`). No project-level test runner is currently configured in `package.json`.

## High-level architecture

### Framework & entrypoints
- Next.js App Router app in `app/`.
- Global layout: `app/layout.tsx` imports Tailwind CSS, sets up the Inter font, and wraps the app with `AuthProvider`, the global `Header`, and the toast `Toaster`.
- Route groups:
  - `app/(default)/page.tsx`: marketing/landing page composed from hero and content components.
  - `app/(auth)/...`: auth-related routes with a dedicated layout and background illustration.
- Additional top-level routes:
  - `app/deport`: main data application for deported persons.
  - `app/account`: user account page.
  - `app/participate`: “Mitmachen” page.
  - `app/api/hello/route.ts`: example API route.

### Auth & Supabase integration
- Client-side auth context: `components/providers/AuthProvider.tsx`.
  - Uses `createBrowserClient` from `@supabase/ssr` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Tracks the current session via `supabase.auth.onAuthStateChange` and exposes `{ user, signOut }`.
- Server-side auth:
  - `app/layout.tsx` calls `createClient` from `@/utils/supabase/server` (not in this summary) to get the current `user` on the server and passes it into `Header` as `initialUser`.
- Auth routes:
  - `app/(auth)/layout.tsx`: shared shell for auth pages, with logo and right-side illustration.
  - `app/(auth)/signin/page.tsx`: email/password sign-in using `supabase.auth.signInWithPassword`, then redirect to `/`.
  - Additional auth pages under `app/(auth)/` (e.g. signup, password reset, change-password) follow the same layout.
- Header behavior: `components/ui/header.tsx`.
  - Reads `user` from `AuthProvider` and falls back to `initialUser` from the server.
  - Shows login/register vs account/logout links based on authentication state.
  - Hides the header on `/signin` and `/signup` by checking `usePathname()`.

### Deportation data application (`app/deport`)

This feature area models deported persons (and also reuses invoice/customer data structures from the original template).

- **Page shell**: `app/deport/page.tsx`.
  - Fetches pagination and statistics via `fetchDeportedPages` and `fetchDeportationStatistics` from `app/deport/data.ts`.
  - Renders a description of the deportation transport, statistics, a search bar, the `Table` component, and `Pagination`.
- **Table & client data loading**:
  - `app/deport/table.tsx` is a client component that uses `useEffect` to call `fetchDeported(query, currentPage)` from `data.ts` and passes the result to `TableClient`.
  - `TableClient` (in `app/deport/TableClient.tsx`) renders the actual table UI and row actions.
- **Data access & business logic**: `app/deport/data.ts`.
  - Uses a browser Supabase client from `app/deport/supabase.js` for all data access.
  - Deported persons table (`deport`):
    - `fetchDeported`, `fetchDeportedPages`, `fetchDeportationStatistics` implement paginated list views, search, and statistics (gender distribution, average age, total pages/persons) and always filter to logically “current” rows via `valid_to IS NULL`.
    - `createDeportedPerson`, `updateDeportedPerson`, `deleteDeportedPerson` implement a historized data model:
      - Inserts/updates set `valid_from`, `valid_to`, and `updated_by` (user email) instead of hard deletes.
      - `updateDeportedPerson` closes the current version (sets `valid_to`) and inserts a new version for edits.
    - `getDeportedPersonByLaufendenr` and `hasHistoricalVersions` work with the business key `Laufendenr` to retrieve current or historical versions.
    - `fetchFieldSuggestions` provides autocomplete suggestions for selected text fields (names, roles, locations).
  - The same module also contains a number of Supabase RPC-based helpers for invoices/customers/sparten and dashboard-like metrics that originate from the original template (e.g. `fetchRevenue`, `fetchLatestInvoices`, `fetchCardData`, `fetchInvoices*`, `fetchSparten`, `fetchCustomers*`). These are used in other parts of the app when invoice/customer functionality is enabled.
- **Supabase client in deport module**: `app/deport/supabase.js`.
  - Creates a browser Supabase client using `createBrowserClient` with the public URL and anon key; this is used inside `data.ts`.

### CSV/Excel import pipeline (`app/deport/csv-upload`)

The CSV/Excel import system for deported persons is structured as a mini-module with clear separation between UI, types, utils, and test data.

- **Entry page & wizard**:
  - `app/deport/csv-upload/page.tsx` (not detailed here) hosts the import experience and renders `CsvUploadWizard`.
  - `CsvUploadWizard` in `app/deport/csv-upload/components/CsvUploadWizard.tsx`:
    - Is a client component using `useAuth` for `user` and `useToast` for feedback.
    - Maintains a `CsvUploadState` state machine with steps: `upload → preview → validate → import → complete`.
    - Orchestrates file selection, parsing (`parseFile`), validation (`validateCsvData`, `identifyDuplicateConflicts`), and import (`processCsvImport`), and tracks duplicate conflicts and progress.
- **Types & validation rules**: `app/deport/csv-upload/types/csvTypes.ts`.
  - Defines core types: `ParsedCsvData`, `CsvRow`, `ValidationError`, `ValidationResult`, `ImportResult`, `DuplicateConflict`, `CsvUploadState`, and `DeportedPersonCsvRow`.
  - `EXPECTED_CSV_HEADERS` describes the required CSV header order and labels (German field names matching DB columns).
  - `FIELD_VALIDATION_RULES` encodes per-field rules (required, type, min/max, allowed values, etc.), including controlled vocabularies for `Familienrolle` and `Geschlecht`.
- **Parsing utilities**: `app/deport/csv-upload/utils/csvParser.ts`.
  - Supports both CSV and Excel (`.xlsx`, `.xls`) files.
  - CSV parsing:
    - Detects separators (`;`, `,`, `|`, tab) by matching against `EXPECTED_CSV_HEADERS` and computes a confidence score; rejects ambiguous separators.
    - Handles quoted values and escaped quotes, normalizes headers, and validates them against `EXPECTED_CSV_HEADERS`.
  - Excel parsing:
    - Uses `xlsx` to read the first worksheet, validates that sheets and data exist, converts to CSV (semicolon separator), then reuses the CSV parser.
  - Exposes helpers like `parseFile`, `validateFile`, `downloadCsvTemplate`, and `detectSeparatorFromContent`.
- **Validation & conflict detection**: `app/deport/csv-upload/utils/dataValidator.ts`.
  - `validateCsvData` iterates rows, applies `FIELD_VALIDATION_RULES`, tracks row-level errors/warnings, and detects duplicates of `Laufendenr` inside the file.
  - `checkDatabaseConflicts` and `identifyDuplicateConflicts` call `getDeportedPersonByLaufendenr` from `app/deport/data.ts` to detect conflicts against existing DB records and produce `DuplicateConflict` entries for the wizard.
- **Import processing**: `app/deport/csv-upload/utils/importProcessor.ts`.
  - `processCsvImport` walks all parsed rows, applies duplicate resolutions per `DuplicateConflict` (`skip`, `update`, `create_new_version`), and delegates to `createDeportedPerson` / `updateDeportedPerson` in `app/deport/data.ts`.
  - Progress is reported via an optional callback for progress UI.
  - Utility helpers prepare import summaries and estimates for the UI.
- **Test data & scripts**: `app/deport/csv-upload/test-data/`.
  - Contains sample CSV/Excel files (valid, invalid, multi-sheet, empty) and Node scripts such as `test-excel-parsing.js` for manual verification of import behavior.

### Shared UI components
- `components/` holds reusable UI pieces:
  - Marketing/landing components: hero, CTA, testimonials, categories, etc.
  - `components/ui/` contains primitives like `header`, `footer`, `logo`, dialog components, and toast components under `ui/Toasts/`.
- Toast system: `components/ui/Toasts/*` provides `Toaster` and `use-toast` used globally via `RootLayout`.

## Notes for future agents
- The project started as a generic “Simple Light” Tailwind/Next.js template; a significant amount of business logic now lives under `app/deport` and its CSV/Excel import pipeline.
- When adding new data operations for deported persons, prefer extending `app/deport/data.ts` and reusing its historization pattern (`valid_from` / `valid_to` / `updated_by`) and Supabase RPC helpers rather than introducing ad‑hoc queries elsewhere.
- For auth-sensitive features, wire into the existing Supabase auth flow via `AuthProvider` and/or server-side `createClient` so that both server and client components stay in sync regarding the current user.
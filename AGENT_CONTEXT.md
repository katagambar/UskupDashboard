# 🛑 STOP AND READ: CRITICAL PROJECT CONTEXT

> **TO THE AGENT WORKING ON THIS PROJECT:**
>
> You are likely encountering issues with **missing sidebars**, **auth errors**, or **database confusion**.
> This document resolves those specific hallucinations and errors. **Read this before writing any code.**

## 1. 🔑 The Authentication System is NOT NextAuth

- **Reality**: This project uses a **custom JWT implementation** using the `jose` library.
- **Code Location**: `src/lib/custom-auth.ts` and `src/hooks/useAuth.ts`.
- **Action**: **DO NOT** try to use `getServerSession`, `NextAuth`, or `[...nextauth]`. They do not exist. Use `getCurrentUserFromRequest` instead.
- **Docs Error**: `docs/API_DOCUMENTATION.md` incorrectly mentions NextAuth. **Ignore that part.**

## 2. 🗄️ Database is PostgreSQL ONLY

- **Reality**: `prisma/schema.prisma` is hardcoded to `provider = "postgresql"`.
- **Action**: Do not attempt to run with SQLite without changing the schema. Ensure your `.env` has a valid postgres `DATABASE_URL`.

## 3. 📉 Why the Sidebar/Layout is Missing

- **The Issue**: The `ReferenceError` on the page crashes the component tree.
- **The Cause**: `DashboardLayout` is imported **inside the page** component (`src/app/surat/page.tsx`).
- **The Effect**: When the page crashes, the Layout (and Sidebar) unmounts.
- **The Fix**:
  1.  **Immediate**: Fix the runtime error (e.g., define `onUploadFile`, fix imports). The sidebar will reappear once the page renders successfully.
  2.  **Long-term**: Create a `src/app/(dashboard)/layout.tsx` and move pages there so navigation persists during errors.

## 4. 📝 Immediate Tasks for You

1.  **Fix `src/app/surat/page.tsx`**: Define the missing `handleFileUpload` or `onUploadFile` function.
2.  **Verify Imports**: Ensure `src/hooks/useAuth` is imported correctly.
3.  **Ignore "NextAuth" Instructions**: If the user asks for NextAuth, explain the custom auth system.

---

_Context provided by Antigravity Agent Analysis - Jan 2026_

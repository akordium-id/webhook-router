# Dynamic Forwarding & Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement dynamic prefix-based webhook forwarding via environment variables and optional JSON configuration without needing code redeployment for new SaaS products.

**Architecture:** Extend `resolveTargetUrl` to extract the prefix from `orderOrExternalId` (split by `-` or `_`), look up dynamic env var `${PREFIX}_WEBHOOK_URL`, fallback to `ROUTES_CONFIG` (JSON map) if present, then fallback to default static routes (`visteo`, `crm`) and simulation test IDs. Update bindings types to allow arbitrary env keys and update documentation.

**Tech Stack:** TypeScript, Hono, Cloudflare Workers, Vitest / Bun test.

**Spec:** Direct user request to support dynamic prefix routing:
1. Dynamic Env lookup: `env[`${prefix.toUpperCase()}_WEBHOOK_URL`]`
2. JSON routing table fallback: `ROUTES_CONFIG`
3. Fallback to existing defaults (`VISTEO_WEBHOOK_URL`, `CRM_WEBHOOK_URL`)
4. Preserve simulation test handling (`invoice_123*`, `test`)

## Global Constraints

- Preserve public signature `resolveTargetUrl(orderOrExternalId: string | undefined | null, env: Bindings): RouteMatch | null`
- Support case-insensitivity on prefix extraction
- Keep zero extra runtime dependencies
- Ensure all tests pass with `bun test`

## Review Focus

- Malformed `ROUTES_CONFIG` JSON string should not crash the worker; it should log a warning or gracefully ignore and fall back.
- Prefixes containing multiple hyphens or underscores (e.g. `dompiku-app-order-123`) should extract the first segment (`dompiku`).
- Whitespace and mixed case in `orderOrExternalId` (e.g. ` DOMPIKU-123 `) should correctly map to `DOMPIKU_WEBHOOK_URL`.
- Prefix without hyphen/underscore: if exact match exists in config/env, or return null if unmatched.
- Empty or invalid URL values in env should not be treated as valid matches.

---

### Task 1: Update TypeScript Types for Dynamic Bindings

**Files:**
- Modify: `src/types.ts`

**Interfaces:**
- Produces: `Bindings` interface with index signature `[key: string]: unknown` and typed `ROUTES_CONFIG?: string`.

- [ ] **Step 1: Update `src/types.ts`**
Add index signature and `ROUTES_CONFIG` to `Bindings`.

- [ ] **Step 2: Verify type checks compile**
Run: `bun run build` or `bun test`
Expected: PASS

---

### Task 2: Implement Dynamic Prefix & Config Resolution in `src/router.ts`

**Files:**
- Modify: `src/router.ts`
- Modify: `test/router.spec.ts`

**Interfaces:**
- Consumes: `Bindings`, `RouteMatch`
- Produces: `resolveTargetUrl(orderOrExternalId: string | undefined | null, env: Bindings): RouteMatch | null`

- [ ] **Step 1: Write failing unit tests for dynamic env and ROUTES_CONFIG**
Add test cases in `test/router.spec.ts`:
- Resolves dynamic `${PREFIX}_WEBHOOK_URL` (e.g. `DOMPIKU_WEBHOOK_URL`)
- Resolves via `ROUTES_CONFIG` JSON map
- Gracefully handles invalid JSON in `ROUTES_CONFIG`
- Preserves fallback to `VISTEO_WEBHOOK_URL` and `CRM_WEBHOOK_URL`

- [ ] **Step 2: Run tests to verify failures**
Run: `bun test`
Expected: FAIL on new tests

- [ ] **Step 3: Implement dynamic resolution logic in `src/router.ts`**
1. Check test simulation prefix.
2. Extract prefix using delimiter split `[-_]`.
3. Check `env[`${prefix.toUpperCase()}_WEBHOOK_URL`]`.
4. Parse and check `env.ROUTES_CONFIG` if present.
5. Fallback to default routes table (`visteo`, `crm`).

- [ ] **Step 4: Run tests to verify they pass**
Run: `bun test`
Expected: PASS all tests

---

### Task 3: Update Documentation and Config Examples

**Files:**
- Modify: `README.md`
- Modify: `.dev.vars.example`

- [ ] **Step 1: Update `.dev.vars.example`**
Add examples of dynamic product env vars (`DOMPIKU_WEBHOOK_URL`) and `ROUTES_CONFIG`.

- [ ] **Step 2: Update `README.md`**
Document how to add new SaaS products dynamically using env variables or `ROUTES_CONFIG` without modifying code.

- [ ] **Step 3: Run full test suite & verify git status**
Run: `bun test && rtk git status`
Expected: All tests pass, modified files tracked.

---

### Task 4: Commit Changes

- [ ] **Step 1: Stage and commit changes**
Run git commit with conventional commit message:
`feat: implement dynamic routing via env vars and routes config`

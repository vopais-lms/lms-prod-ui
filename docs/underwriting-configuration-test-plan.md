# Underwriting Configuration — Manual QA Test Plan

## Prerequisites

- Admin, employee, or support user logged in (customer users must receive 403).
- At least one loan type exists with ID known.
- Loan application form fields configured for that loan type (for field picker in rules editor).
- Backend API running and reachable from the UI.

## Section navigation

- [ ] Open **Loan Types** hub and select a loan type.
- [ ] Confirm **Configuration** sidebar shows **Underwriting configuration** section.
- [ ] Click **Underwriting configuration** — section loads without errors.
- [ ] Switch to another section (e.g. Loan approvals) and back — state reloads correctly.

## Parameter group CRUD

- [ ] **Create verification group** — type `verification`, weight 100, empty rules — appears in grid.
- [ ] **Create scoring group** — type `scoring`, weight 100 — appears in grid.
- [ ] **Edit group** — change weight — saved value persists after reload.
- [ ] **Delete leaf group** — removed from list.
- [ ] **Delete parent with children** — verify backend error or blocked behavior is surfaced.

## TreeGrid expand / collapse

- [ ] Create parent and child groups (via drag or create + link).
- [ ] Expand parent — child row visible with indent.
- [ ] Collapse parent — child hidden.
- [ ] List loads with `page=1`, `per_page=50` — pagination footer shows total if >50 groups.

## Drag-and-drop

- [ ] Drag child onto another group — link modal/API succeeds, tree updates.
- [ ] Drag child to **root drop zone** — parent unlinked (`remove_parent_group`), group becomes root.
- [ ] **Self-parent** drop blocked client-side.
- [ ] **Cycle** drop (parent onto descendant) blocked client-side.
- [ ] **Type mismatch** (verification under scoring or vice versa per backend rules) shows error.

## Rules page navigation

- [ ] Row click navigates to `/app/loan-types/:loanTypeId/parameter-groupings/:groupId/rules`.
- [ ] Ctrl/Cmd + click opens rules page in new browser tab.
- [ ] Back link returns to loan type detail underwriting section.

## Rule builder — scoring group

- [ ] Add conditional with AND/OR conditions using form field keys.
- [ ] Nest conditionals up to depth 10 — allowed.
- [ ] Attempt depth 11 — validation error before save.
- [ ] Add **scoring leaf** with numeric score — saves and reloads.
- [ ] Add **formula leaf** with postfix tokens — saves and reloads.
- [ ] Scoring/formula only on leaf nodes (not on nodes with children).

## Rule builder — verification group

- [ ] Conditional branches only — no scoring or formula leaf types offered.
- [ ] Save empty conditional tree where allowed — persists.

## Persistence and errors

- [ ] Save rules, reload page — JSON matches backend detail response.
- [ ] Invalid group ID in URL — 404 or friendly error.
- [ ] Customer login — underwriting APIs return 403.
- [ ] Cross-tenant: groups from another tenant not visible.

## Regression smoke

- [ ] Existing **Forms** and **Loan approvals** sections still work on same loan type page.
- [ ] **Global Parameter Configurations** page (`/app/loan-types/underwriting`) unaffected.

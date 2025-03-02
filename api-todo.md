# Proposed Changes

## Renaming

1. **Renamed `Api` to `FrontQL`** in `src/services/backend/api.ts`

   - This change reflects the purpose of the API interface more accurately.

2. **Renamed `apiWrapper` to `api`** in `src/services/backend/reactQueryWrapper.ts`
   - This change simplifies the naming and makes it more intuitive for usage.

## Updated Functionality

- The `api` wrapper now abstracts React Query terms, providing a clean interface for CRUD operations without exposing React Query-specific methods.
- The `FrontQL` API retains its original functionality but is now more appropriately named.

## Checklist of Steps

- [x] Implemented changes in `reactQueryWrapper.ts` to rename `apiWrapper` to `api`.
- [] Implemented changes in `api.ts` to rename `Api` to `FrontQLAPI`.
- [] Updated `api-todo.md` with a checklist of changes.

# Security Specification: Firebase Cloud Hub

## 1. Data Invariants

- **Authentication Integrity**: Only signed-in users can write or access user-restricted documents.
- **Identity Integrity**: Users can only create documents where `ownerId` or `userId` strictly matches `request.auth.uid`. Users cannot modify other users' profiles or items without ownership/permission.
- **Profile Protection**: Users can only read and write their own `/users/{userId}` profile document.
- **Volumetric Boundaries**: String inputs (titles, descriptions, tags) must conform to length limits. Titles `<= 120` chars, descriptions `<= 2000` chars, IDs `<= 128` chars.
- **Action-Based Mutation**: Updates to items can only modify designated fields (e.g. status transition, editing title/description/tags/priority) and must preserve `ownerId` and `createdAt`.

## 2. The "Dirty Dozen" Payloads (Must be Rejected)

1. **Unauthenticated Read of User Profiles**: An unauthenticated user attempts `get /users/victim123`.
2. **Identity Spoofing on Item Creation**: Authenticated user `attacker` creates item with `ownerId: 'victim'`.
3. **Ghost / Shadow Fields Injection**: Authenticated user creates an item containing arbitrary admin or injected keys (`isAdmin: true`, `elevated: true`).
4. **Oversized Field Payload (Denial of Wallet)**: Item creation payload with title > 500KB string to exhaust quota.
5. **ID Poisoning Attack**: Document ID with newline or 2KB malicious characters targeting `/items/{junkId}`.
6. **Cross-User Profile Hijack**: Authenticated user `attacker` attempts `update /users/victim123` with new email.
7. **Tampering with Immutable Creation Timestamps**: Updating an existing item and altering its original `createdAt`.
8. **Owner Reassignment Attack**: Updating an item and modifying `ownerId` from `alice` to `bob`.
9. **Invalid Status Enum**: Item status updated to `'deleted_forever_backdoor'` instead of allowed enums (`todo`, `in_progress`, `completed`).
10. **Activity Log Impersonation**: Creating an activity log with `userId: 'admin'` while authenticated as regular user.
11. **Direct Write to Non-Existent Path**: Writing to root catch-all or secret documents like `/system_keys/passwords`.
12. **PII Information Leak**: Querying or listing `/users` collection without user constraint.

## 3. Test Runner Invariant Checks

All dirty payloads must trigger `PERMISSION_DENIED` under Firestore rules.

# Firebase Firestore Security Specification

This document details the data security invariants, defensive validation matrices, test payloads, and implementation schema for the HillTrip database synchronization layer.

## 1. Data Invariants & Zero-Trust Assertions

1. **Master Collection Permissions**: Core master dataset nodes (`hubs`, `routes`, `destinations`, `attractions`, `homestays`) are public read-accessible to support instant clientside offline-first loading, but absolute write-prevented from client SDKs.
2. **Anonymous / Customer Submissions**: Non-authenticated or basic authenticated users can safely submit `contributions` (crowdsourced updates), `tripLeads` (trip requests), and `carLeads` (taxi booking referrals), but cannot modify existing ones or escalate status fields.
3. **Admin Exclusivity**: Document mutation (update/delete) on validated master routes, destinations, or approval overrides on pending contributions is restricted strictly to verified operations. Correct action auth uses `adminAuth` checking.
4. **ID Validity and Length Constraints**: Document IDs and path variables must adhere to `isValidId()` boundaries (max 128 characters, alphanumeric/safe symbols) to prevent payload injection attempts.

---

## 2. The "Dirty Dozen" Poison Payloads

The rules are built to structurally reject the following 12 adversarial vectors:

1. **Identity Spoofing - Contributor Hijack**: Write a contribution document where the `contributorName` is forced to a spoofed identity.
   - *Result*: Denied by validation.
2. **Privilege Escalation - Self Approve**: Submit an approved contribution directly into `contributions`.
   - *Result*: Denied. Rules force `status == 'Pending'` on creation.
3. **Identity Spoofing - Lead Sabotage**: Modifying someone else’s `tripLeads` request details from standard guest connection.
   - *Result*: Denied; update/delete is locked.
4. **Denial of Wallet - Mass ID Flooding**: Create a hub document with a 1MB string as the document ID.
   - *Result*: Denied by `isValidId()` characters/length constraint.
5. **Resource Exhaustion - Field Bloat**: Send a trip lead document with a 2MB nested array of custom services.
   - *Result*: Denied by size bounds (`services.size() <= 10`).
6. **State Shortcutting - Terminal State Override**: Move a taxi booking `carLeads` status of `Completed` retrospectively to `Pending` by client injection.
   - *Result*: Denied; terminal values block update.
7. **Bypassing Whitelisting - Phantom Fields**: Update a homestay to insert `isVerifiedPartner: true` as a ghost field.
   - *Result*: Denied via `affectedKeys().hasOnly(...)`.
8. **PII Blanket Scraping**: Direct collection queries targeting user mobile numbers or bookings without admin gating.
   - *Result*: Denied; list queries enforce strict rules.
9. **Relational Spoofing - Orphaned Attractions**: Create a tourist attraction document referencing a non-existent `destinationId`.
   - *Result*: Denied via relational parent check.
10. **Temporal Invalidation - Client Clock Fraud**: Submit a booking lead with `createdAt = "1999-01-01T00:00:00Z"`.
    - *Result*: Denied; forces `request.time` matches.
11. **Type Poisoning**: Attempt to update numeric `fareMin` to a string or a boolean flag.
    - *Result*: Denied by helper schemas.
12. **Malicious Empty Write**: Send empty JSON write payload targeting hubs.
    - *Result*: Denied by `keys().size() > 0`.

---

## 3. Fortress Rule Architecture

Compiled rules are deployed to Firestore. The production file `firestore.rules` enforces full catch-all protection and validation helper functions.

# Security Specification & The Dirty Dozen Audit

## 1. Data Invariants
1. **Business Settings & Services**: Publicly readable for service catalog queries and prices; write/update access is restricted strictly to authenticated admins (`admins/{uid}`).
2. **Leads**: Customers can create leads via website forms with explicit consent (`consentGiven: true`). Reading lead documents and modifying lead status/notes is restricted to authenticated shop admins to protect customer phone numbers and PII.
3. **Bookings**: Bookings created directly or via server must satisfy valid fields (`customerName`, `customerPhone`, `serviceId`, `appointmentDate`, `appointmentSlot`, `status`). Only admins can modify existing booking statuses or cancel arbitrary bookings.
4. **Conversations & Messages**: Customers can write messages in their active conversation session; public list scans across all customer messages are blocked.
5. **Admins Collection**: Only existing admins can read/write administrator accounts. Bootstrapped admin email `tusharkh157@gmail.com` is granted administrative verification.
6. **Immutable & System Fields**: Critical identifier fields and timestamps cannot be spoofed or overwritten with invalid types.

## 2. The Dirty Dozen Payloads (Designed to Break Identity, Integrity, and State)
1. **Unauthenticated Service Price Modification**: Anonymous user trying to change ceramic coating price to 1 rupee.
2. **Ghost Field Injection in Lead**: Malicious user trying to inject `isAdmin: true` into a new lead payload.
3. **Lead PII Scrape**: Unauthenticated visitor attempting `get` or `list` on `/leads` collection to extract customer phone numbers.
4. **Admins Collection Self-Elevation**: Normal user attempting to write their own UID into `/admins/{uid}` with role `superadmin`.
5. **Admin List Snooping**: Non-admin attempting to list all admins.
6. **Lead Update Hijack**: Attacker attempting to change a lead's phone number or assigned staff without admin auth.
7. **Negative or Non-numeric Pricing**: Admin payload updating service price with negative or string value `{"startingPrice": -500}`.
8. **Oversized String Buffer Overflow Attempt**: Malicious payload attempting to push a 500KB text string into `customerName` or `notes`.
9. **Status Transition Bypass**: User trying to mark an unconfirmed booking as `Completed` without admin rights.
10. **Path Variable ID Poisoning**: Payload attempting to read or write to `/bookings/../../admin_secret`.
11. **Spoofed Admin Email without Verification**: User claiming `tusharkh157@gmail.com` with `email_verified: false` attempting admin write.
12. **Blanket Query Scraping**: Malicious client running an unconstrained query on `/messages` without conversation context.

## 3. Security Assertions
All 12 attacks must strictly return `PERMISSION_DENIED` under Firestore Security Rules.
Administrative actions must verify `request.auth != null`, `request.auth.token.email_verified == true`, and role existence in `/admins/$(request.auth.uid)` or authenticated bootstrap email.

# Security Specification: UnityGrid AI

## Data Invariants
1. A **Need** must have a valid `category`, `urgency` (High, Medium, Low), and `location`.
2. A **Volunteer** must have a `name` and a list of `skills`.
3. PII (requesterName, requesterPhone) should only be readable by authorized responders or the creator.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Need with invalid urgency**: `{ urgency: "Critically Urgent" }` -> DENIED
2. **Need with massive lat/lng**: `{ location: { lat: 9999999, lng: 0 } }` -> DENIED (though Firestore might not check range, I will)
3. **Ghost field injection**: `{ id: "123", category: "Medical", isVerified: true }` -> DENIED (strict keys)
4. **Volunteer with 1MB string name**: `{ name: "A..." }` -> DENIED (size check)
5. **Unauthorized PII read**: Guest user reading `needs/n1` requester details -> DENIED
6. **Identity spoofing**: User A creating a need with `ownerId: "UserB"` -> DENIED
7. **Negative location values where not expected**: (Lat/lng are signed, but I'll check validity)
8. **Volunteer with empty skills list**: `{ name: "John", skills: [] }` -> DENIED (min size 1)
9. **Status bypass**: Updating a "Resolved" need back to "Open" -> DENIED (Terminal State Locking)
10. **System field overwrite**: Overwriting a system-generated `createdAt` timestamp.
11. **Orphaned data**: Creating a need without a valid category.
12. **DDoS via metadata**: Injecting 100 extra keys into a volunteer object.

## Test Runner (Planned)
The `firestore.rules` will be validated against these scenarios.

# Firestore Security Specification - Strategic Systems Portfolio

## 1. Data Invariants
- **Public Content**: `userProfile`, `experience`, `skills`, `projects`, and chat settings are publicly readable.
- **Admin Control**: Only the authenticated admin (`jvpaisan@gmail.com`) can modify public content and manage conversations.
- **Visitor Interactions**:
    - Visitors must be authenticated (anonymously or via Google) to record visits or start chats.
    - Visit IDs are derived from Email or IP to prevent duplicate tracking, but writes require an active auth session.
    - Conversations are strictly between a visitor and the admin.
    - Visitors can only access conversations identifying them (ID prefix `vst_`).
    - Messages are immutable after 10 minutes and can only be edited by the sender.
    - Blocked conversations prevent subsequent message writes.

## 2. The "Dirty Dozen" Payloads

### Identity & Spoofing
1. **Shadow Admin**: Attempt to write to `projects/` as an anonymous user.
2. **Conversation Hijack**: Authorized user `UserA` attempting to read `conversations/vst_UserB`.
3. **Visit Cloaking**: Attempt to create a visit record with a mismatching `visitorId` field.
4. **Message Forgery**: Anonymous user `UserA` attempting to set `senderId: "admin"` on a new message.

### Integrity & Validation
5. **Junk ID Poisoning**: Create `conversations/` with a 2MB string as the ID.
6. **Shadow Update**: Add `isVerified: true` to a message payload (field not in schema).
7. **Temporal Fraud**: Set `createdAt` to a future date instead of `serverTimestamp()`.
8. **Resource Exhaustion**: Send a 1MB string in the `visitorName` field.

### State & Lifecycle
9. **Terminal Breach**: Modify a message after the 10-minute lock window.
10. **Blocked Bypass**: Send a message to a conversation where `isBlocked: true`.
11. **Immutability Breach**: Change the `senderId` of an existing message via update.
12. **Relationship Orphan**: Create a message in a non-existent conversation folder.

## 3. Test Runner Definition (Verification Plan)
The following behaviors must be verified:
- `get` on `userProfile/main` returns 200 for everyone.
- `create` on `visits/vst_test` returns 200 for `isSignedIn()`.
- `create` on `conversations/vst_test` returns 200 for `isSignedIn()`.
- `update` on `conversations/vst_test` where `isBlocked: true` returns 403.
- `update` on `messages/msg_test` after 11 minutes returns 403.
- `create` on any collection with extra fields (Shadow Update) returns 403.

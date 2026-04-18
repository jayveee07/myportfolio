# Security Specification: Pro Portfolio Hub

## Data Invariants
1. **Portfolio Content Integrity**: Experience, Skills, and Projects can only be created or modified by the Admin identified by email `jvpaisan@gmail.com`.
2. **Conversation Isolation**: Visitors can only see and send messages to their own unique conversation document.
3. **Admin Omniscience**: The Admin has full read/write access to all conversations and messages to facilitate customer support.
4. **ID Hardening**: All document IDs must be valid alphanumeric strings to prevent injection attacks.
5. **No Self-Privileging**: Field `senderId` in messages must match the authenticated `request.auth.uid`.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempting to create a message with `senderId` of the admin as a visitor.
2. **State Shortcutting**: Attempting to update a conversation's `unreadCount` to 0 as a visitor.
3. **Portfolio Vandalism**: Attempting to delete a work experience item without being logged in as admin.
4. **Ghost Field Injection**: Adding `isPromoted: true` to a project document update.
5. **Resource Poisoning**: Using a 1MB string as a Skill category name to cause denial of wallet.
6. **Cross-User Snooping**: Attempting to `get` a message subcollection of another visitor's UID.
7. **Identity Poisoning**: Using a document ID with special characters like `../root` to attempt path traversal.
8. **Orphaned Message**: Trying to send a message to a conversation ID that doesn't exist in the parent collection.
9. **Role Escalation**: Trying to create an `admins` document for themselves.
10. **Terminal State Break**: Attempting to edit a message text after it has been sent.
11. **Spoofed Metadata**: Sending a `createdAt` timestamp from the client that is 10 years in the future.
12. **Public PII Leak**: Attempting to `list` all user profiles to harvest emails without being the admin.

## Performance & Cost Guard
- No `get()` lookups inside `allow list` blocks.
- Mandatory `limit` and `where` clause enforcement on all private data queries.

# Firestore Security Specification

This document defines the security parameters, data invariants, and edge case attack vectors (the "Dirty Dozen") for the Firestore database of the WAEC exam app.

## 1. Data Invariants
- **User Integrity**: A user profile path must be `/users/{userId}` where `{userId}` is identical to their dynamic verification ID or authentication dynamic value (e.g. email or generated ID).
- **No Self-Promotions**: Only designated emails (e.g., `temiokusami@gmail.com`, `timothyihum@gmail.com`) can have `isAdmin == true`. Users must not be able to elevate their own privilege to Admin.
- **Strict Size/Type Limits**: Text messages and payloads must be under restricted sizes (e.g., username <= 30 characters, content <= 500 characters) to prevent database resource exhaustion.

## 2. The "Dirty Dozen" Payloads

Here are 12 specific payloads attempting to break database security:

### Payload 1: self_admin_elevation
```json
{
  "username": "attacker",
  "email": "attacker@gmail.com",
  "isAdmin": true
}
```
- **Target**: `/users/attackerId`
- **Goal**: Elevate privilege.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 2: spoof_real_email
```json
{
  "username": "attacker",
  "email": "temiokusami@gmail.com",
  "isAdmin": false
}
```
- **Target**: `/users/attackerId` (where user UID does not match the Admin UID).
- **Goal**: Registering an account with an email they do not own.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 3: oversized_username
```json
{
  "username": "a非常长的名字aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "email": "user@gmail.com"
}
```
- **Target**: `/users/userId`
- **Goal**: Resource poisoning with oversized strings.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 4: state_shortcut_xp_injection
```json
{
  "username": "user1",
  "email": "user1@gmail.com",
  "xp": 9999999
}
```
- **Target**: `/users/userId`
- **Goal**: Bypassing steady XP accumulation to skip level progression.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 5: malicious_ghost_fields
```json
{
  "username": "regularUser",
  "email": "user@gmail.com",
  "extraVulnerabilityField": "exploit"
}
```
- **Target**: `/users/userId`
- **Goal**: Inserting undeclared schema fields.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 6: cross_user_profile_edit
```json
{
  "username": "impersonator",
  "email": "exploit@gmail.com"
}
```
- **Target**: `/users/victimUserId` (Request owner is NOT victimUserId)
- **Goal**: Attacker trying to modify someone else's profile.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 7: message_denial_of_service
```json
{
  "id": "post123",
  "author": "spammer",
  "content": "A".repeat(50000),
  "subject": "Mathematics",
  "likes": 0
}
```
- **Target**: `/discussions/post123`
- **Goal**: Exploding the database storage footprint.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 8: fake_creation_timestamp
```json
{
  "id": "post456",
  "author": "cheater",
  "content": "Cheating times",
  "subject": "Mathematics",
  "timestamp": "2020-01-01"
}
```
- **Target**: `/discussions/post456`
- **Goal**: Bypassing server timestamp rules.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 9: update_discussion_author
```json
{
  "id": "post789",
  "author": "differentAuthor",
  "content": "Modified content",
  "subject": "Mathematics",
  "likes": 1
}
```
- **Target**: `/discussions/post789`
- **Goal**: Attempt to change the immutable author parameter of a posted resource.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 10: anonymous_discussion_creation
```json
{
  "id": "postAnn",
  "author": "anon",
  "content": "No auth info and bypass email verification",
  "subject": "Mathematics"
}
```
- **Target**: `/discussions/postAnn` (Executed without user being authenticated/signed in)
- **Goal**: Spamming discussion boards while unauthenticated.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 11: negative_likes_injection
```json
{
  "id": "post_like",
  "author": "user1",
  "content": "Cool app!",
  "subject": "English Language",
  "likes": -50
}
```
- **Target**: `/discussions/post_like`
- **Goal**: Corrupting metrics with negative numbers.
- **Expected Result**: `PERMISSION_DENIED`

### Payload 12: database_scraping_attempt
- **Query**: Attempting to grab list of all users' complete profiles without specific account constraints.
- **Goal**: Scraping emails and confidential learner metadata.
- **Expected Result**: `PERMISSION_DENIED`

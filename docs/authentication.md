# Authentication Contract

## Overview

The Orange-Allied backend uses FastAPI-managed JWT authentication.

The frontend uses the authentication endpoints exposed by the FastAPI backend
and sends the returned access token when calling protected routes.

All request and response bodies use **camelCase** field names, matching the
frontend's TypeScript types.

## Session object

`POST /auth/register`, `POST /auth/login` and `POST /auth/refresh` all return the
same session object:

```json
{
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "avatarUrl": null,
    "role": "owner",
    "organisation": "",
    "jobTitle": null,
    "createdAt": "2026-09-11T07:14:39.493140Z",
    "lastActiveAt": "2026-09-11T07:15:09.537669Z"
  },
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "expiresAt": "2026-09-11T07:45:09.537669Z"
}
```

## Registration

`POST /auth/register` → `201 Created`

Request: `fullName`, `email`, `password`.

The backend checks whether the email is already registered, hashes the password,
creates the user and returns a session (the user is logged in immediately).

Validation rules, mirroring the registration form in the frontend:

- password: at least 8 characters, at most 72 bytes, at least one digit and one
  uppercase letter
- email: must be a valid address
- fullName: 1–120 characters

Errors: `400` if the email is already registered, `422` if validation fails.

## Login

`POST /auth/login` → `200 OK`

Request: `email`, `password`, optional `rememberMe` (stored client-side only).

Returns a session. `401` when the credentials do not match.

After 10 consecutive failed attempts the account is locked for 15 minutes and
further attempts return `429` with a `Retry-After` header — including attempts
with the correct password. A successful login resets the counter.

## Email normalization

Addresses are trimmed and lowercased before being stored or compared, so
`Vasilii@Pupkin.com` and `vasilii@pupkin.com` are the same account.

## Tokens

Two tokens are issued, and they are **not** interchangeable:

- `accessToken` — short lived (`ACCESS_TOKEN_EXPIRE_MINUTES`, 30 by default).
  This is the only token accepted on protected routes.
- `refreshToken` — long lived (7 days). Accepted only by `POST /auth/refresh`.

Both carry a `type` claim that is verified on decoding, so a refresh token
cannot be used to call protected routes.

JWT payload: `sub` (user id), `exp` (expiry), `iat` (issued at, with sub-second
precision), `type` (`access` / `refresh`).

## Refresh

`POST /auth/refresh` → `200 OK`

Request: `refreshToken`. Returns a new session. `401` if the token is invalid,
expired, of the wrong type, or the user no longer exists or is inactive.

> Not yet called by the frontend — added so the issued refresh token is usable.

## Protected requests

Protected routes require the access token in the HTTP header:

`Authorization: Bearer <accessToken>`

Missing, malformed, expired or wrong-type tokens return `401`. A token belonging
to a deactivated user returns `403`.

## Current user

- `GET /auth/me` → the current user
- `PUT /auth/me` → updates `fullName`, `avatarUrl`, `organisation`, `jobTitle`

Fields that are omitted, or sent as `null`, are left unchanged. `email`, `role`
and `id` cannot be changed through this endpoint.

## User by id

`GET /users/{userId}` → the user with that id, but only if it is the caller's own
id; otherwise `403`.

## Logout

`POST /auth/logout` → `204 No Content`

Requires a valid access token. Stateless tokens cannot be deleted, so the
account records the moment of the logout and every token issued before it stops
being accepted — the access token *and* the refresh token, on every device.
Logging in again immediately afterwards works normally.

## Forgot password

`POST /auth/forgot-password` → `{ "sent": true }`

> **Not implemented.** No email is sent. The endpoint always reports success,
> whether or not the address is registered, so it cannot be used to discover
> which emails exist.

## Known gaps

- logging out revokes *all* of the account's tokens; signing out a single
  device is not supported
- failed attempts are counted per account, so login attempts against addresses
  that are not registered are not rate limited
- every account is created with `role: "owner"` and an empty `organisation`;
  roles and organisations are not managed yet
- two-factor authentication is not implemented
- CORS is not configured yet, so a browser cannot call this API from the
  frontend's origin

## Configuration

`JWT_SECRET_KEY`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` — see
`.env.example`.

---

Backend implemented by Bîrcă Damian.

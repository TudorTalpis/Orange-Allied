# Authentication Contract

## Overview

The Orange-Allied backend uses FastAPI-managed JWT authentication.

The frontend must use the authentication endpoints exposed by the FastAPI backend and use the returned JWT access token when calling protected routes.

## Registration

Endpoint:

`POST /auth/register`

The frontend sends the user registration data to the backend.

The backend:

- checks whether the email is already registered
- hashes the password
- creates the user
- returns the created user

## Login

Endpoint:

`POST /auth/login`

The frontend sends the user's login credentials to the backend.

The backend:

- finds the user by email
- verifies the password
- generates a JWT access token
- returns the access token to the frontend

Example response:

```json
{
  "access_token": "<jwt-token>"
}

from datetime import timedelta

import pytest

VALID_PASSWORD = "Parola123"


def auth_header(session: dict) -> dict:
    return {"Authorization": f"Bearer {session['accessToken']}"}


def register(client, **overrides) -> dict:
    payload = {
        "fullName": "Grace Hopper",
        "email": "grace@example.com",
        "password": VALID_PASSWORD,
    }
    payload.update(overrides)
    return client.post("/auth/register", json=payload)


# --------------------------------------------------------------------------
# Registration
# --------------------------------------------------------------------------


def test_register_returns_session_in_camel_case(client):
    response = register(client)

    assert response.status_code == 201
    body = response.json()
    assert set(body) == {"user", "accessToken", "refreshToken", "expiresAt"}
    assert body["user"]["fullName"] == "Grace Hopper"
    assert body["user"]["email"] == "grace@example.com"
    assert body["user"]["role"] == "owner"
    assert "password" not in body["user"]
    assert "hashedPassword" not in body["user"]


def test_register_rejects_duplicate_email(client):
    register(client)
    assert register(client).status_code == 400


def test_register_rejects_duplicate_email_in_a_different_case(client):
    register(client, email="grace@example.com")
    assert register(client, email="GRACE@Example.COM").status_code == 400


def test_register_stores_the_email_lowercased(client):
    response = register(client, email="Grace@Example.COM")
    assert response.json()["user"]["email"] == "grace@example.com"


@pytest.mark.parametrize(
    "password",
    [
        "Scurt1",  # shorter than 8
        "parola123",  # no uppercase
        "ParolaFara",  # no digit
        "A1" + "x" * 200,  # longer than bcrypt's 72 bytes
    ],
)
def test_register_rejects_weak_passwords(client, password):
    assert register(client, password=password).status_code == 422


def test_register_accepts_a_password_of_exactly_72_bytes(client):
    password = "A1" + "x" * 70
    assert len(password.encode()) == 72
    assert register(client, password=password).status_code == 201


@pytest.mark.parametrize("email", ["not-an-email", "@example.com", ""])
def test_register_rejects_invalid_emails(client, email):
    assert register(client, email=email).status_code == 422


@pytest.mark.parametrize("full_name", ["", "N" * 200])
def test_register_rejects_invalid_names(client, full_name):
    assert register(client, fullName=full_name).status_code == 422


# --------------------------------------------------------------------------
# Login
# --------------------------------------------------------------------------


def test_login_succeeds_with_correct_credentials(client, registered_user):
    response = client.post(
        "/auth/login",
        json={"email": "ada@example.com", "password": VALID_PASSWORD},
    )
    assert response.status_code == 200
    assert response.json()["user"]["email"] == "ada@example.com"


def test_login_is_case_insensitive_for_the_email(client, registered_user):
    """Registering as Ada@Example.com must not lock the account out."""
    response = client.post(
        "/auth/login",
        json={"email": "ADA@EXAMPLE.COM", "password": VALID_PASSWORD},
    )
    assert response.status_code == 200


def test_login_rejects_a_wrong_password(client, registered_user):
    response = client.post(
        "/auth/login", json={"email": "ada@example.com", "password": "Gresita123"}
    )
    assert response.status_code == 401


def test_login_rejects_an_unknown_email(client):
    response = client.post(
        "/auth/login", json={"email": "nobody@example.com", "password": VALID_PASSWORD}
    )
    assert response.status_code == 401


def test_login_sets_last_active_at(client, registered_user):
    session = client.post(
        "/auth/login", json={"email": "ada@example.com", "password": VALID_PASSWORD}
    ).json()
    assert session["user"]["lastActiveAt"] is not None


def test_login_locks_the_account_after_repeated_failures(client, registered_user):
    from app.api.auth import MAX_FAILED_LOGIN_ATTEMPTS

    for _ in range(MAX_FAILED_LOGIN_ATTEMPTS):
        failed = client.post(
            "/auth/login", json={"email": "ada@example.com", "password": "Gresita123"}
        )
        assert failed.status_code == 401

    locked = client.post(
        "/auth/login", json={"email": "ada@example.com", "password": "Gresita123"}
    )
    assert locked.status_code == 429
    assert "Retry-After" in locked.headers

    # Even the correct password must wait out the lockout.
    still_locked = client.post(
        "/auth/login", json={"email": "ada@example.com", "password": VALID_PASSWORD}
    )
    assert still_locked.status_code == 429


# --------------------------------------------------------------------------
# Tokens
# --------------------------------------------------------------------------


def test_protected_route_requires_a_token(client):
    assert client.get("/auth/me").status_code == 401


def test_protected_route_rejects_a_malformed_token(client):
    response = client.get("/auth/me", headers={"Authorization": "Bearer nonsense"})
    assert response.status_code == 401


def test_protected_route_rejects_a_refresh_token(client, registered_user):
    """A refresh token lives far longer; accepting it here would extend access."""
    refresh_token = registered_user["session"]["refreshToken"]
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {refresh_token}"})
    assert response.status_code == 401


def test_protected_route_rejects_a_token_with_a_non_uuid_subject(client):
    from app.core.security import _create_token

    token, _ = _create_token("not-a-uuid", timedelta(minutes=5), "access")
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_protected_route_rejects_an_expired_token(client, registered_user):
    from app.core.security import _create_token

    user_id = registered_user["session"]["user"]["id"]
    token, _ = _create_token(user_id, timedelta(minutes=-5), "access")
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_refresh_returns_a_new_session(client, registered_user):
    refresh_token = registered_user["session"]["refreshToken"]
    response = client.post("/auth/refresh", json={"refreshToken": refresh_token})

    assert response.status_code == 200
    assert response.json()["user"]["email"] == "ada@example.com"


def test_refresh_rejects_an_access_token(client, registered_user):
    access_token = registered_user["session"]["accessToken"]
    response = client.post("/auth/refresh", json={"refreshToken": access_token})
    assert response.status_code == 401


# --------------------------------------------------------------------------
# Current user
# --------------------------------------------------------------------------


def test_me_returns_the_current_user(client, registered_user):
    response = client.get("/auth/me", headers=auth_header(registered_user["session"]))

    assert response.status_code == 200
    assert response.json()["email"] == "ada@example.com"


def test_me_updates_the_profile(client, registered_user):
    response = client.put(
        "/auth/me",
        headers=auth_header(registered_user["session"]),
        json={"fullName": "Ada King", "jobTitle": "Analyst"},
    )

    assert response.status_code == 200
    assert response.json()["fullName"] == "Ada King"
    assert response.json()["jobTitle"] == "Analyst"


def test_me_treats_an_explicit_null_as_no_change(client, registered_user):
    """fullName is NOT NULL in the database; null must not reach it."""
    response = client.put(
        "/auth/me",
        headers=auth_header(registered_user["session"]),
        json={"fullName": None, "jobTitle": "Analyst"},
    )

    assert response.status_code == 200
    assert response.json()["fullName"] == "Ada Lovelace"


def test_me_rejects_an_over_long_name(client, registered_user):
    response = client.put(
        "/auth/me",
        headers=auth_header(registered_user["session"]),
        json={"fullName": "N" * 200},
    )
    assert response.status_code == 422


# --------------------------------------------------------------------------
# Logout
# --------------------------------------------------------------------------


def test_logout_invalidates_both_tokens(client, registered_user):
    session = registered_user["session"]

    assert client.post("/auth/logout", headers=auth_header(session)).status_code == 204

    assert client.get("/auth/me", headers=auth_header(session)).status_code == 401
    refreshed = client.post("/auth/refresh", json={"refreshToken": session["refreshToken"]})
    assert refreshed.status_code == 401


def test_logging_in_again_after_logout_works(client, registered_user):
    client.post("/auth/logout", headers=auth_header(registered_user["session"]))

    session = client.post(
        "/auth/login", json={"email": "ada@example.com", "password": VALID_PASSWORD}
    ).json()
    assert client.get("/auth/me", headers=auth_header(session)).status_code == 200


# --------------------------------------------------------------------------
# User by id
# --------------------------------------------------------------------------


def test_user_by_id_returns_own_account(client, registered_user):
    session = registered_user["session"]
    response = client.get(f"/users/{session['user']['id']}", headers=auth_header(session))

    assert response.status_code == 200
    assert response.json()["id"] == session["user"]["id"]


def test_user_by_id_refuses_another_account(client, registered_user):
    response = client.get(
        "/users/11111111-1111-1111-1111-111111111111",
        headers=auth_header(registered_user["session"]),
    )
    assert response.status_code == 403


# --------------------------------------------------------------------------
# Misc
# --------------------------------------------------------------------------


def test_forgot_password_does_not_reveal_whether_the_email_exists(client, registered_user):
    known = client.post("/auth/forgot-password", json={"email": "ada@example.com"})
    unknown = client.post("/auth/forgot-password", json={"email": "nobody@example.com"})

    assert known.status_code == unknown.status_code == 200
    assert known.json() == unknown.json() == {"sent": True}


def test_health_reports_the_database(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}

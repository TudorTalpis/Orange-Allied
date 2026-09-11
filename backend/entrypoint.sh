#!/bin/sh
# Bring the database schema up to date before serving, so a fresh
# `docker compose up` yields a working app instead of empty tables.
set -e

alembic upgrade head

exec "$@"

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack web application template with a Python Flask API backend and a SolidJS TypeScript frontend, deployed via Docker Compose or Kubernetes.

## Development Setup

Start the required dev services (MariaDB, Redis, MailDev) from the root:
```bash
make docker_up
```

### API (backend)
```bash
cd api
make deps          # Install all dependencies
make server        # Start Flask dev server on port 5000
make worker        # Start Celery background worker (separate terminal)
make db_upgrade    # Apply pending migrations
```

### UI (frontend)
```bash
cd ui
make deps          # Install pnpm dependencies
make server        # Start Vite dev server on port 5173
```

## Commands

### API
| Command | Description |
|---|---|
| `make lint` | Run ruff format check + lint |
| `make formatlint` | Format then lint |
| `make test` | Run pytest |
| `make test_cov` | Run pytest with coverage |
| `make db_migrate` | Generate Alembic migration |
| `make db_upgrade` | Apply migrations |
| `make db_downgrade` | Revert last migration |
| `make create_admin EMAIL=x PASSWORD=y` | Create admin user |

Run a single test:
```bash
cd api
pytest tests/resources/test_authentication.py::test_login_success -v
# or using the Makefile filter:
make test TEST_FILTER=test_login_success
```

### UI
| Command | Description |
|---|---|
| `make lint` | ESLint + Prettier + TypeScript check |
| `make formatlint` | Format then lint |
| `make cypress` | Open Cypress interactive test runner |
| `make check_translations` | Validate i18n completeness |

Run a single Cypress spec:
```bash
cd ui
pnpm cypress run --spec "cypress/e2e/authentication.cy.js"
```

## Architecture

### Services
- **UI** (SolidJS/TypeScript, port 5173): SPA with `@solidjs/router`, `@modular-forms/solid`, TailwindCSS + DaisyUI, i18n via `@solid-primitives/i18n` (English, Dutch)
- **API** (Flask/Python 3.13, port 5000): REST API with Flask-RestX, SQLAlchemy 2.0, Flask-Login sessions, Flask-CORS
- **Tasks** (Celery): Background jobs (email sending) using Redis as broker
- **DB**: MariaDB, managed with Alembic migrations (`api/migrations/`)
- **Redis**: Celery broker and result backend

### API Structure (`api/app/`)
- `resources/` — Flask-RestX namespaces: `authentication`, `user`, `two_factor`
- `db/` — SQLAlchemy models
- `tasks/` — Celery task definitions (mail, etc.)
- `app.py` — App factory (registers extensions, blueprints, error handlers)
- `config.py` — `DevConfig`, `ProdConfig`, `TestConfig`; all env vars prefixed `MY_SOLID_APP_`
- `extensions.py` — Flask extension instances (db, login_manager, mail, celery, etc.)
- `fernet.py` — Encryption utilities for sensitive data

### UI Structure (`ui/src/`)
- `pages/` — Route-level page components
- `components/` — Reusable UI components
- `locales/` — i18n translation files (add keys to `en.ts` first, run `make check_translations`)
- `validators.ts` — Shared form validation logic
- `form_helpers.ts` — Helpers for `@modular-forms/solid`

### Configuration
All API config comes from environment variables prefixed `MY_SOLID_APP_`. In development these default to the values in `docker-compose.dev.yml` (DB: `my_solid_app_db`, Redis: `localhost:6379`, MailDev SMTP: `localhost:1025`).

### Deployment
- **Dev**: `docker-compose.dev.yml` (infrastructure only; run API and UI locally)
- **Staging/Prod**: Kubernetes with Kustomize overlays at `config/k8s/overlays/{staging,prod}/`; Nginx ingress with Cert-Manager for TLS
- CI/CD via GitHub Actions (`.github/workflows/`): lint → test → build Docker images → deploy

## Pre-push / Pre-PR Checks

**Before every `git push` or pull request creation, you MUST run the following checks and fix any issues. Do not push or create a PR until all checks pass.**

### 1. UI: format + lint
```bash
cd ui && make formatlint
```
If this changes any files, stage and commit them before pushing.

### 2. UI: translation checks
```bash
cd ui && make check_translations
```
If translations are missing or unused, fix them before pushing.

### 3. API: format + lint
```bash
cd api && make formatlint
```
If this changes any files, stage and commit them before pushing.

### 4. API: migration check
If any files in `api/app/db/` (model files) were modified, verify that a corresponding migration exists in `api/migrations/versions/`. If a schema change was made without a migration, run:
```bash
cd api && make db_migrate
```
and commit the generated migration file.

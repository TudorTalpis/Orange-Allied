# Git Workflow

## Branch Strategy

The Orange-Allied project uses a shared development workflow based on
three branch levels.

### Main Branch

`main` contains the stable version of the project.

Direct development on `main` should be avoided.

Changes should reach `main` only after they have been integrated and
reviewed in the `develop` branch.

### Develop Branch

`develop` is the main integration branch.

Completed work from individual developers is merged into `develop`
through Pull Requests.

The purpose of this branch is to combine and test the work of all team
members before it is merged into `main`.

### Personal Development Branches

Each member of the five-person team works on an individual development
branch.

Branch naming convention:

- `dev-daniel`
- `dev-<developer-name>`

Each personal branch is created from `develop`.

Developers should commit their work to their own branch and should not
work directly on `main`.

## Workflow

The standard development workflow is:

Personal developer branch
→ Pull Request
→ develop
→ review and integration testing
→ Pull Request
→ main

## Rules

1. Each developer works on their personal branch.
2. Personal branches are based on `develop`.
3. Direct commits to `main` should be avoided.
4. Changes are merged into `develop` through Pull Requests.
5. Code should be reviewed before important changes are merged.
6. The `main` branch should contain only stable and tested code.
7. Developers should synchronize their branches with `develop`
   when necessary to reduce merge conflicts.

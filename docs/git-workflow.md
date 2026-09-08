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

## Pull Request Process

All changes intended for integration should be submitted through Pull Requests.

### Personal Branch to Develop

When a developer completes a task, they create a Pull Request from their personal branch into `develop`.

Example:

`dev-daniel` → `develop`

The Pull Request should include:

- a clear title
- a short description of the changes
- the related Jira issue key
- testing information, when applicable

Example title:

`KAN-276 Configure pull request workflow`

### Develop to Main

Changes from `develop` should be merged into `main` only when they are stable and ready for release.

Example:

`develop` → `main`

Before merging into `main`, the team should verify that:

- required checks pass
- important functionality has been tested
- no known blocking issues remain
- the Pull Request has been reviewed

### Pull Request Rules

1. Avoid direct commits to `main`.
2. Use Pull Requests for integration into `develop`.
3. Use Pull Requests for merging `develop` into `main`.
4. Each Pull Request should be linked to a Jira issue where possible.
5. Pull Requests should have a clear and descriptive title.
6. Changes should be reviewed before important merges.
7. Failed CI checks should be resolved before merging.
8. Merge conflicts should be resolved before approval.

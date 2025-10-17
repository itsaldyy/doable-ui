---
title: Git Best Practices
inclusion: always
---

# Git Best Practices

## Commit Messages

- Use conventional commit format: `type(scope): subject`
- Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
- Scope is optional but recommended: hooks, spec, steering, docs, api, ui, etc.
- Subject must be lowercase, no period at end, max 72 characters
- Use imperative mood ("add feature" not "added feature")
- Include body for complex changes (explain why, not how)
- Reference issues in footer: `Fixes #123`, `Closes #456`
- Commit messages are automatically validated by commit-msg hook
- See docs/COMMIT_MESSAGE_CONVENTION.md for detailed guidelines

## Branching

- Use feature branches for new development
- Keep main/master branch stable and deployable
- Use descriptive branch names (feature/user-auth, fix/login-bug)
- Delete merged branches to keep repository clean

## Workflow

- Pull latest changes before starting work
- Commit frequently with logical chunks
- Use interactive rebase to clean up history before merging
- Review code before merging (pull requests)

## Repository Management

- Use .gitignore to exclude build artifacts and secrets
- Keep repository size manageable (use Git LFS for large files)
- Tag releases with semantic versioning
- Document branching strategy in README

## Security

- Never commit secrets, API keys, or passwords
- Use environment variables for configuration
- Review commits for sensitive information
- Use signed commits when possible

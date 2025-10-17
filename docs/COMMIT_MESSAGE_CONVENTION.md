# Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification to ensure consistent, readable commit history.

## Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Type (Required)

The type must be one of the following:

- **feat** - A new feature
- **fix** - A bug fix
- **docs** - Documentation only changes
- **style** - Changes that don't affect code meaning (formatting, whitespace, etc.)
- **refactor** - Code change that neither fixes a bug nor adds a feature
- **test** - Adding missing tests or correcting existing tests
- **chore** - Changes to build process, auxiliary tools, or maintenance
- **perf** - Performance improvements
- **ci** - Changes to CI/CD configuration
- **build** - Changes to build system or dependencies
- **revert** - Reverts a previous commit

### Scope (Optional)

The scope provides additional context about what part of the codebase is affected:

- **hooks** - Git hooks related changes
- **spec** - Specification/planning documents
- **steering** - Steering rules and guidelines
- **docs** - Documentation
- **api** - API related changes
- **ui** - User interface changes
- **tests** - Test related changes
- **config** - Configuration changes

You can use any scope that makes sense for your change.

### Subject (Required)

The subject is a brief description of the change:

- Use imperative mood: "Add" not "Added" or "Adds"
- Start with uppercase letter (Sentence case)
- No period at the end
- Maximum 72 characters
- Be concise but descriptive

### Body (Optional)

The body provides additional context:

- Separate from subject with a blank line
- Explain what and why, not how
- Wrap at 72 characters
- Can have multiple paragraphs

### Footer (Optional)

The footer contains metadata:

- Breaking changes: `BREAKING CHANGE: description`
- Issue references: `Fixes #123`, `Closes #456`
- Co-authors: `Co-authored-by: Name <email>`

## Examples

### Simple commit

```
feat: Add user authentication
```

### With scope

```
feat(hooks): Add commit message validation
```

### With body

```
fix(spec): Resolve Node version switching issue

The direnv configuration was not being loaded in new terminal
sessions. Added DIRENV_LOG_FORMAT to shell config and updated
documentation to emphasize the need to reload the shell.
```

### With breaking change

```
feat(api): Change authentication endpoint

BREAKING CHANGE: The /auth endpoint now requires a token parameter.
Update all API calls to include the token.

Fixes #123
```

### Multiple scopes

```
refactor(hooks,docs): Improve pre-commit workflow

- Reorganize hook scripts for better maintainability
- Update documentation with new workflow
- Add troubleshooting guide
```

## Real Examples from This Project

### Feature additions

```
feat(hooks): Add commit message validation
feat: Add automatic Node.js version switching
feat(vite): Enable automatic browser opening on server start
```

### Bug fixes

```
fix: Resolve VS Code PROMPT_COMMAND error with direnv
fix(hooks): Add robust path resolution to pre-commit orchestrator
fix: Ensure DIRENV_LOG_FORMAT is added to shell config
```

### Documentation

```
docs: Complete TDD enforcement restructuring knowledge transfer document
docs(steering): Add Git commands best practices for agent
docs(hooks): Add comprehensive Git hooks documentation
```

### Refactoring

```
refactor(spec): Restructure tasks to follow Test-Driven Development
refactor(steering): Rename git-commands.md to agentic-git-best-practices.md
```

### Chores

```
chore(hooks): Clean up whitespace and normalize file permissions
```

## Validation

Commit messages are automatically validated by a pre-commit hook. Invalid messages will be rejected with helpful guidance.

### What Gets Validated

✅ Type is one of the allowed types
✅ Format matches `type(scope): subject` pattern
✅ Subject is present and not empty
✅ Subject is lowercase
✅ Subject doesn't end with a period
⚠️ Subject length (warning if > 72 chars)

### Bypassing Validation (Not Recommended)

If you absolutely must bypass validation:

```bash
git commit --no-verify -m "your message"
```

**Note:** This is strongly discouraged as it breaks consistency.

## Tips

### Writing Good Commit Messages

1. **Be specific**: "fix: resolve login timeout" not "fix: bug fix"
2. **Use imperative mood**: "add feature" not "added feature"
3. **Explain why, not how**: The diff shows how, explain why you made the change
4. **Reference issues**: Include issue numbers when applicable
5. **Keep it atomic**: One logical change per commit

### Common Mistakes

❌ `Fixed bug` - Missing type and colon
❌ `feat: added new feature` - Subject should start with uppercase and use imperative mood
❌ `fix: Resolve issue.` - Subject shouldn't end with period
❌ `update code` - Missing type
❌ `feat(HOOKS): Add validation` - Scope should be lowercase

✅ `fix: Resolve login timeout`
✅ `feat(hooks): Add commit message validation`
✅ `docs: Update API documentation`
✅ `refactor: Simplify authentication logic`

## Benefits

Following this convention provides:

- **Consistent history**: Easy to read and understand
- **Automated changelog**: Generate changelogs from commits
- **Semantic versioning**: Determine version bumps automatically
- **Better collaboration**: Clear communication about changes
- **Easier debugging**: Find specific changes quickly
- **Professional codebase**: Shows attention to detail

## Tools

### Commitizen (Optional)

For interactive commit message creation:

```bash
npm install -g commitizen
npm install -g cz-conventional-changelog

# Then use
git cz
```

### Commitlint (Alternative)

For more advanced validation:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

## References

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)

## Questions?

If you're unsure about how to format a commit message:

1. Look at recent commits: `git log --oneline -20`
2. Check this documentation
3. The validation hook will guide you if the format is wrong
4. Ask the team for clarification

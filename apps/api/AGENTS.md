# Commit Message Guidelines

This project enforces **conventional commits** to ensure clear, consistent, and useful commit history.

Each commit message must follow the format:

```
<type>(<scope>): <subject>
```

### Rules

- **Length**: Commit message must be **at least 10 characters** and **no longer than 100 characters**.
- **Case**: Use lowercase for `<type>` and `<scope>`.
- **Subject**: Brief summary in **present tense**, not capitalized, and **no period at the end**.

---

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, whitespace, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **test**: Adding or modifying tests
- **chore**: Changes to build process or auxiliary tools/libraries
- **perf**: Code change that improves performance
- **ci**: Changes to CI configuration or scripts
- **build**: Changes that affect the build system or external dependencies
- **temp**: Temporary commit that won’t be included in the changelog

---

## Scope (Optional)

The **scope** specifies the part of the codebase affected.  
Examples:

- `scope`: `auth`, `dashboard`, `api`, `docs`
- App dev: `page`, `module`, `component`

---

## Subject

- Must be a **brief summary** of the change.
- Use **present tense** (e.g., `add`, `fix`, `update`, not `added` or `fixed`).
- Do **not capitalize** the first word.
- Do **not end** with a period.

---

## Examples

✅ Valid:

```
feat(auth): add login endpoint
fix(dashboard): resolve chart rendering issue
docs: update README with developer tips
style(api): format response handler
```

❌ Invalid:

```
fi
Fix: Added new button.
chore: update
```

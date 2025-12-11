---
description: Run all checks before commit/merge
---

# Preflight Workflow

Run all quality checks before committing or merging code.

## Checks

1. **Syntax Check**
```bash
# Python
find . -name "*.py" -exec python -m py_compile {} \;

# JavaScript
find . -name "*.js" -exec node --check {} \;

# Rust
cargo check
```

2. **Run Tests**
```bash
# Python
pytest

# JavaScript
npm test

# Rust
cargo test
```

3. **Linting**
```bash
# Python
flake8 . || pylint . || ruff check .

# JavaScript
eslint . || npm run lint

# Rust
cargo clippy
```

4. **Git Status**
```bash
git status
git diff --stat
```

## Checklist

- [ ] All syntax checks pass
- [ ] All tests pass
- [ ] No linting errors
- [ ] Git status is clean (or intentional changes only)
- [ ] Commit message is descriptive

## Purpose

Catch issues BEFORE they hit the repository.

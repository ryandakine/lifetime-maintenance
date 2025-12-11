---
description: Run strict quality gates and syntax checks
---

# Quality Gates Workflow

Run this before ANY commit or after significant code changes.

## 1. Syntax Gate (The "Compile" Check)
// turbo-all
Run checks for modified files:

### Python
```bash
find . -name "*.py" -not -path "*/.*" -exec python3 -m py_compile {} +
```

### JavaScript/TypeScript
```bash
find . -name "*.js" -o -name "*.ts" -not -path "*/node_modules/*" -exec node --check {} +
```

### Rust
```bash
cargo check
```

## 2. Linter Gate
Run if syntax passes.

```bash
# Example generic linter
npm run lint --if-present
# OR
flake8 .
```

## 3. Test Gate
Run ONLY tests relevant to the changes.

```bash
# Run specific test file
pytest tests/test_relevant.py
```

## 4. Git Gate
Check for accidental inclusions.

```bash
git status
# Verify no secrets or unrelated files
```

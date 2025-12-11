---
description: Rust/Cargo quick reference
---

# Rust Quick Reference

Common Rust patterns and Cargo commands.

## Cargo Commands

```bash
cargo new project_name        # Create new project
cargo build                   # Build debug
cargo build --release         # Build optimized
cargo run                     # Build and run
cargo test                    # Run tests
cargo check                   # Fast syntax check (no binary)
cargo clippy                  # Linting
cargo fmt                     # Format code
cargo doc --open              # Generate and open docs
```

## Error Handling

```rust
use anyhow::{Context, Result};

fn load_config() -> Result<Config> {
    let contents = std::fs::read_to_string("config.toml")
        .context("Failed to read config")?;
    toml::from_str(&contents)
        .context("Failed to parse config")
}
```

## Common Patterns

### Option Handling
```rust
let value = some_option.unwrap_or_default();
let value = some_option.unwrap_or(42);
let value = some_option.expect("Should have value");
```

### Result Handling
```rust
match result {
    Ok(val) => println!("Success: {}", val),
    Err(e) => eprintln!("Error: {}", e),
}

// Or with ?
let value = risky_operation()?;
```

### Async/Await
```rust
#[tokio::main]
async fn main() {
    let result = fetch_data().await;
}

async fn fetch_data() -> Result<Data> {
    // async code
}
```

## Common Crates

- `anyhow` - Application error handling
- `thiserror` - Library error types
- `tokio` - Async runtime
- `serde` - Serialization
- `clap` - CLI parsing
- `sqlx` - Async SQL with compile-time checks
- `axum` - Web framework
- `reqwest` - HTTP client

## Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculation() {
        assert_eq!(calculate(5, 3), 8);
    }
    
    #[tokio::test]
    async fn test_async() {
        let result = fetch().await.unwrap();
        assert!(!result.is_empty());
    }
}
```

## Ownership Cheat Sheet

- `fn process(data: Data)` - Takes ownership
- `fn process(data: &Data)` - Borrows (read-only)
- `fn process(data: &mut Data)` - Borrows (mutable)
- `fn process(data: Data) -> ProcessedData` - Consumes and returns

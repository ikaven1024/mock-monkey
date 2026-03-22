# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-21

### Added

- **Custom Mock Methods (Alpha)** - Define JavaScript functions for dynamic mock responses
  - New Methods tab in UI for managing custom functions
  - Console API: `mockMonkey.addMethod()`, `mockMonkey.removeMethod()`
  - Request context access: `url`, `method`, `body`, `params`
  - Mock.js integration via `ctx.Mock` for generating random data
  - Use `@{...functionName}` syntax to spread function results into responses

- **Route Parameter Matching** - Extract URL parameters automatically
  - Use `:paramName` syntax in URL patterns (e.g., `/api/users/:id`)
  - Access parameters with `@params.xxx` placeholder in responses
  - Supports multiple parameters (e.g., `/api/users/:userId/posts/:postId`)

- **Search Functionality** - Filter rules and network requests
  - Search input in Rules and Network tabs
  - Case-insensitive partial matching
  - Real-time filtering as you type

- **Rule Reordering** - Adjust priority order of Mock rules
  - Drag & drop support with visual handles (`⋮⋮`)
  - Up/Down arrow buttons for precise control
  - Order persistence to localStorage
  - Rule matching respects order (first match wins)

- **Method Reordering** - Reorder custom methods with drag & drop
  - Same drag & drop UI as rules
  - Order persisted to localStorage

### Changed

- Enhanced import/export UI with better feedback
- Reorganized panel tabs order: Rules → Methods → Add → Network
- Optimized network panel layout for better readability

### Testing

- Added `test/MethodManager.test.ts` - 36 tests for custom methods
- Added `test/PanelSearch.test.ts` - 20 tests for search functionality
- Enhanced `test/MockManager.test.ts` with route parameter matching tests
- Total test coverage: **153 tests passing**

### Known Issues

- Custom Methods API is in Alpha, APIs may change in future releases
- Rule reordering affects match priority (first match wins) - be aware of rule order

## [1.0.0] - 2025-12-XX

### Added

- Initial release of MockMonkey
- Request interception for XHR and Fetch
- Visual management panel with Shadow DOM isolation
- Mock rule management (add, edit, delete, enable/disable)
- Mock.js integration with placeholder syntax
- Network request monitoring (up to 500 requests)
- Rule persistence to localStorage
- Import/export functionality for rules
- I18n support (English and Chinese)
- Draggable floating button and panel
- Position memory for UI elements

[1.1.0]: https://github.com/ikaven1024/mock-monkey/releases/tag/v1.1.0
[1.0.0]: https://github.com/ikaven1024/mock-monkey/releases/tag/v1.0.0

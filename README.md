<div align="center">

<img src="logo/logo.svg" alt="MockMonkey Logo" width="120">

<h1>MockMonkey</h1>

<p>A browser-native API mocking Tampermonkey script that requires no backend Mock services. Built with TypeScript, featuring a visual interface for managing Mock rules.</p>

<p>
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF" alt="Vite" />
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-green" alt="License" /></a>
  <a href="https://github.com/ikaven1024/mock-monkey/actions/workflows/ci.yml">
    <img src="https://github.com/ikaven1024/mock-monkey/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
</p>

<a href="https://github.com/ikaven1024/mock-monkey/releases/latest/download/mock-monkey.user.js">
  <img src="https://img.shields.io/badge/%F0%9F%90%B5-Install%20Script-B31D1D?logo=Tampermonkey&logoColor=white" alt="Install" />
</a>

English · [中文文档](./README.zh-CN.md)

</div>

## Features

- 🎯 **Request Interception** - Intercept XMLHttpRequest and Fetch requests in browser
- 🔧 **Visual Interface** - Intuitive management panel, no console commands needed
- 🔁 **Rule Persistence** - Rules auto-save to localStorage, persist across refreshes
- 🎭 **Mock.js Integration** - Built-in placeholders like `@name`, `@email` for random data
- 🔌 **Network Monitoring** - Real-time request logging, quickly create rules from requests
- 📥📤 **Import/Export** - Backup and restore rules in bulk

## Demo

📺 **Watch MockMonkey in action** - This demo uses the Swagger Petstore API to show how to intercept and mock API responses with just a few clicks:

<p align="center">
  <video src="https://github.com/user-attachments/assets/05e7731b-b686-4bdc-9c71-835076ae51c4" width="600" controls></video>
</p>

## Acknowledgments

This project was inspired by [pocket-mocker](https://github.com/tianchangNorth/pocket-mocker).

## Usage

### 1. Install Script

**Option 1: Quick Install (Recommended)**
- Click the **🐵 Install Script** badge at the top to install directly from the latest Release

**Option 2: Manual Install**
1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Download [mock-monkey.user.js](https://github.com/ikaven1024/mock-monkey/releases/latest/download/mock-monkey.user.js) from the latest Release
3. Open Tampermonkey management panel
4. Click "Add New Script"
5. Copy and paste the content of the downloaded file

**Option 3: Build Locally**
```bash
git clone https://github.com/ikaven1024/mock-monkey.git
cd mock-monkey
npm install
npm run build
# Then copy mock-monkey.user.js to Tampermonkey
```

### 2. Using Visual Interface

After installing the script, visit any webpage:

1. Click the **<img src="logo/logo.svg" alt="🐵" style="vertical-align: middle; height: 1.2em;"> button in the bottom-right corner** to open the management panel
2. Drag the button and panel to adjust position (position auto-saves)
3. Use three tabs to manage Mock:

**📋 Rules Tab**
- View all Mock rules
- Enable/disable rules (click 🟢/⚫ icons)
- Edit rules (click ✏️ icon)
- Delete rules (click 🗑️ icon)
- Export/import rules (click bottom buttons)
- Rule details are collapsible, click to expand and view response data

**➕ Add Tab**
- Configure URL pattern (supports string and regex)
- Set response data (supports Mock.js placeholders)
- Configure delay, status code, response headers
- Edit existing rules

**🌐 Network Tab**
- Real-time display of all network requests (up to 500)
- View request method, URL, status code, duration
- Click request to quickly create Mock rule
- Clear request records

### 3. Console API (Optional)

You can also use the API in the browser console (F12):

```javascript
// Add Mock rule
mockMonkey.add('/api/user', {
    code: 200,
    data: { name: 'John Doe' }
});

// Use regex matching
mockMonkey.add(/\/api\/posts\/\d+/, {
    id: 123,
    title: 'Test Post'
});

// With delay and status code
mockMonkey.add('/api/slow', { data: 'test' }, {
    delay: 1000,    // 1 second delay
    status: 201,    // Return 201 status code
    headers: {      // Custom response headers
        'X-Custom-Header': 'value'
    }
});

// List all rules
mockMonkey.list();

// List all network requests
mockMonkey.listRequests();

// Remove rule
mockMonkey.remove('/api/user');

// Clear all rules
mockMonkey.clear();

// Clear request records
mockMonkey.clearRequests();

// Access underlying instances
mockMonkey.manager    // MockManager instance
mockMonkey.recorder   // RequestRecorder instance
```

## Rule Configuration

| Field | Description | Example |
|------|-------------|---------|
| URL Pattern | URL to match, supports string or regex | `/api/user` or `/\/api\/user\/\d+/` |
| Response Data | JSON response data, supports Mock.js placeholders | `{"name": "@name", "email": "@email"}` |
| Delay | Response delay (milliseconds) | `500` |
| Status Code | HTTP status code | `200`, `404`, `500` |
| Response Headers | Custom response headers | `{"Content-Type": "application/json"}` |

## Mock.js Placeholders

MockMonkey includes the Mock.js library, supporting placeholder syntax to generate random data:

| Placeholder | Description | Example Output |
|-------------|-------------|----------------|
| `@name` | Random name | "John Doe" |
| `@email` | Random email | "test@example.com" |
| `@phone` | Random phone number | "13800138000" |
| `@date` | Random date | "2024-03-10" |
| `@boolean` | Random boolean | true/false |
| `@natural(min, max)` | Random natural number | 42 |
| `@string(length)` | Random string | "xYz" |
| `@image(size)` | Random image URL | "http://dummyimage.com/100x100" |

For more placeholders, see [Mock.js Documentation](http://mockjs.com/examples.html).

## Examples

### Mock User Login API

```javascript
// Configure in visual interface:
// URL Pattern: /api/login
// Response Data:
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "mock-token-@string(10)",
    "userInfo": {
      "id": "@natural(1, 1000)",
      "name": "@name",
      "email": "@email"
    }
  }
}
```

### Mock Delayed API

```javascript
// Configure in visual interface:
// URL Pattern: /api/user/info
// Response Data:
{
  "code": 200,
  "data": {
    "id": 1,
    "name": "Test User",
    "avatar": "@image(100x100)"
  }
}
// Delay: 500 (milliseconds)
// Status Code: 200
```

### Mock Error Response

```javascript
// Configure in visual interface:
// URL Pattern: /api/error
// Response Data:
{
  "code": 500,
  "message": "Internal Server Error"
}
// Status Code: 500
```

### Mock List Data

```javascript
// Configure in visual interface:
// URL Pattern: /api/users
// Response Data:
{
  "code": 200,
  "data|10": [{    // Generate 10 items
    "id|+1": 1,    // Auto-increment ID
    "name": "@name",
    "email": "@email",
    "status": "@boolean"
  }]
}
```

## Project Structure

```
MockMonkey/
├── src/
│   ├── core/
│   │   ├── MockManager.ts       # Mock rule manager
│   │   ├── Interceptor.ts       # Request interceptor
│   │   └── RequestRecorder.ts   # Network request recorder
│   ├── ui/
│   │   └── Panel.ts             # Visual management panel
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── index.ts                 # Entry point
├── test/
│   ├── MockManager.test.ts      # Rule manager tests
│   ├── Interceptor.test.ts      # Interceptor tests
│   ├── RequestRecorder.test.ts  # Request recorder tests
│   └── setup.ts                 # Test environment setup
├── vendor/
│   └── mock.js                  # Mock.js library
├── .github/
│   └── workflows/
│       └── ci.yml               # CI/CD workflow (builds and creates releases)
├── vite.config.ts               # Vite configuration
├── vitest.config.ts             # Vitest configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project configuration
```

> **Note**: `mock-monkey.user.js` is built from source and automatically uploaded to [GitHub Releases](https://github.com/ikaven1024/mock-monkey/releases). Install it from the badge above or run `npm run build` to generate locally.

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

### Watch Mode (auto-build during development)

```bash
npm run dev
```

### Testing

```bash
# Run unit tests
npm run test

# Run test UI
npm run test:ui

# Generate test coverage report
npm run test:coverage
```

## License

MIT

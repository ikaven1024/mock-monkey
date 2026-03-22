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
- 🔍 **Search Function** - Quickly filter rules and network requests by URL
- 🌐 **I18n Support** - Interface available in English and Chinese
- ⚡ **Route Parameters** - Extract URL parameters with `@params.xxx` placeholder
- 🛠️ **Custom Methods** - Define JavaScript functions for dynamic mock responses (Alpha)

## Demo

📺 **Watch MockMonkey in action** - This demo uses the Swagger Petstore API to show how to intercept and mock API responses with just a few clicks:

<p align="center">
  <video src="https://github.com/user-attachments/assets/05e7731b-b686-4bdc-9c71-835076ae51c4" width="600" controls></video>
</p>

## Acknowledgments

This project was inspired by [pocket-mocker](https://github.com/tianchangNorth/pocket-mocker).

## Usage

📖 **Detailed documentation is available on [Wiki](https://github.com/ikaven1024/mock-monkey/wiki)**

- [Installation Guide](https://github.com/ikaven1024/mock-monkey/wiki/安装指南) - Installation steps
- [Quick Start](https://github.com/ikaven1024/mock-monkey/wiki/快速开始) - 5-minute tutorial
- [Basic Usage](https://github.com/ikaven1024/mock-monkey/wiki/基础用法) - Rule management
- [Rule Syntax](https://github.com/ikaven1024/mock-monkey/wiki/规则语法) - URL matching, Mock.js placeholders
- [Advanced Usage](https://github.com/ikaven1024/mock-monkey/wiki/高级用法) - Custom methods, route parameters
- [Import/Export](https://github.com/ikaven1024/mock-monkey/wiki/导入导出) - Rule backup
- [FAQ](https://github.com/ikaven1024/mock-monkey/wiki/常见问题) - Common issues

### Quick Example

```javascript
// Add a Mock rule via console API (F12)
mockMonkey.add('/api/user', {
  code: 200,
  data: { name: '@name', email: '@email' }
});

// Or use the visual interface by clicking the monkey button in bottom-right corner
```

See [Wiki](https://github.com/ikaven1024/mock-monkey/wiki) for more examples and advanced usage.


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

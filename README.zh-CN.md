<div align="center">

<img src="logo/logo.svg" alt="MockMonkey Logo" width="120">

<h1>MockMonkey</h1>

<p>浏览器本地接口 Mock 的 Tampermonkey 脚本，无需依赖任何 Mock 服务。使用 TypeScript 构建，提供可视化界面管理 Mock 规则。</p>

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

[English](./README.md) · 中文

</div>

## 功能特性

- 🎯 **拦截请求** - 在浏览器中拦截 XHR/Fetch 请求
- 🔧 **可视化界面** - 直观的管理面板，无需控制台命令
- 🔁 **规则持久化** - 规则自动保存，刷新不丢失
- 🎭 **Mock.js 集成** - 内置 `@name`、`@email` 等占位符生成随机数据
- 🔌 **网络监控** - 实时请求日志，一键从请求创建 Mock 规则
- 📥📤 **导入导出** - 批量备份和恢复规则
- 🔍 **搜索功能** - 快速筛选规则和网络请求
- 🌐 **多语言** - 界面支持中英文切换
- ⚡ **路由参数** - 使用 `@params.xxx` 提取 URL 参数
- 🛠️ **自定义方法** - JavaScript 函数生成动态响应（Alpha）

## 演示视频

📺 **观看 MockMonkey 实际演示** - 本演示使用 Swagger Petstore API 展示如何通过简单几步拦截和 Mock API 接口：

<p align="center">
  <video src="https://github.com/user-attachments/assets/05e7731b-b686-4bdc-9c71-835076ae51c4" width="600" controls></video>
</p>

## 致谢

本项目受 [pocket-mocker](https://github.com/tianchangNorth/pocket-mocker) 项目启发。

## 使用方法

📖 **详细文档请参考 [Wiki](https://github.com/ikaven1024/mock-monkey/wiki)**

- [安装指南](https://github.com/ikaven1024/mock-monkey/wiki/安装指南) - 安装步骤
- [快速开始](https://github.com/ikaven1024/mock-monkey/wiki/快速开始) - 5 分钟上手教程
- [基础用法](https://github.com/ikaven1024/mock-monkey/wiki/基础用法) - 规则管理
- [规则语法](https://github.com/ikaven1024/mock-monkey/wiki/规则语法) - URL 匹配、Mock.js 占位符
- [高级用法](https://github.com/ikaven1024/mock-monkey/wiki/高级用法) - 自定义方法、路由参数
- [导入导出](https://github.com/ikaven1024/mock-monkey/wiki/导入导出) - 规则备份
- [常见问题](https://github.com/ikaven1024/mock-monkey/wiki/常见问题) - 常见问题解答

### 快速示例

```javascript
// 通过控制台 API（F12）添加 Mock 规则
mockMonkey.add('/api/user', {
  code: 200,
  data: { name: '@name', email: '@email' }
});

// 或点击页面右下角的猴子按钮，使用可视化界面
```

更多示例和高级用法请查看 [Wiki](https://github.com/ikaven1024/mock-monkey/wiki)。


## 开发

### 安装依赖

```bash
npm install
```

### 构建

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

### 监听模式（开发时自动构建）

```bash
npm run dev
```

### 测试

```bash
# 运行单元测试
npm run test

# 运行测试 UI 界面
npm run test:ui

# 生成测试覆盖率报告
npm run test:coverage
```

## License

MIT

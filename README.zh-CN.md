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

### 1. 安装脚本

**方式一：快速安装（推荐）**
- 点击页面顶部的 **🐵 Install Script** 徽章，直接从最新 Release 安装

**方式二：手动安装**
1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 从最新 [Release](https://github.com/ikaven1024/mock-monkey/releases/latest/download/mock-monkey.user.js) 下载 `mock-monkey.user.js`
3. 打开 Tampermonkey 管理面板
4. 点击「添加新脚本」
5. 复制下载文件的内容并保存

**方式三：本地构建**
```bash
git clone https://github.com/ikaven1024/mock-monkey.git
cd mock-monkey
npm install
npm run build
# 然后将 mock-monkey.user.js 复制到 Tampermonkey
```

### 2. 使用可视化界面

脚本安装后，访问任意网页：

1. 点击页面**右下角的 <img src="logo/logo.svg" alt="🐵" style="vertical-align: middle; height: 1.2em;"> 按钮**打开管理面板
2. 拖动按钮和面板可调整位置（位置自动保存）
3. 使用三个标签页管理 Mock：

**📋 规则标签页**
- 查看所有 Mock 规则列表
- 启用/禁用规则（点击 🟢/⚫ 图标）
- 编辑规则（点击 ✏️ 图标）
- 删除规则（点击 🗑️ 图标）
- 导出/导入规则（点击底部按钮）
- 规则详情支持折叠，点击可展开查看响应数据

**➕ 添加标签页**
- 配置 URL 模式（支持字符串和正则表达式）
- 设置响应数据（支持 Mock.js 占位符）
- 配置延迟、状态码、响应头
- 编辑现有规则

**🌐 网络标签页**
- 实时显示所有网络请求（最多 500 条）
- 查看请求方法、URL、状态码、耗时
- 点击请求可快速创建 Mock 规则
- 清空请求记录
- 搜索过滤 URL

**🛠️ 方法标签页（Alpha）**
- 创建自定义 JavaScript 函数生成动态响应
- 访问请求上下文（URL、方法、请求体、参数）
- 启用/禁用自定义方法
- **注意**：Alpha 功能，API 可能会变更

**语言切换**
- 点击顶部语言按钮（EN/中）切换界面语言
- 语言偏好自动保存到 localStorage

### 3. 路由参数匹配

MockMonkey 支持从 URL 中提取路由参数并在响应数据中使用：

```javascript
// 规则模式: /api/users/@params.id
// 请求 URL: /api/users/123
// 响应数据中的 @params.id 会被替换为 "123"

mockMonkey.add('/api/users/@params.id', {
  userId: '@params.id',
  message: 'User @{params.id} loaded successfully'
});

// 示例：GET /api/users/456 返回：
// { "userId": "456", "message": "User 456 loaded successfully" }
```

支持两种语法格式：
- `@params.xxx` - 简单占位符
- `@{params.xxx}` - 支持后缀文本，如 `@{params.id}_suffix`

### 4. 自定义 Mock 方法（Alpha）

你可以定义自定义 JavaScript 函数来实现更复杂的 Mock 逻辑：

**简单引用**

```javascript
// 通过控制台 API 添加
mockMonkey.addMethod('getCurrentUser', 'return { id: 1, name: "Admin" };');

// 在响应数据中使用
mockMonkey.add('/api/user', {
  user: '@getCurrentUser'
});
```

**对象嵌入** - 将方法返回的对象嵌入到响应值中：

```javascript
mockMonkey.addMethod('getUserProfile', 'return { id: 1, name: "Alice", email: "alice@example.com" };');

mockMonkey.add('/api/profile', {
  user: '@{...getUserProfile}',
  timestamp: 123456
});

// 返回: { "user": { "id": 1, "name": "Alice", "email": "alice@example.com" }, "timestamp": 123456 }
```

**对象展开** - 将方法返回的对象展开到当前对象中：

```javascript
mockMonkey.addMethod('getBaseResponse', 'return { status: "success", version: "1.0" };');

mockMonkey.add('/api/data', {
  '@{...getBaseResponse}': true,  // `true` 只是占位符，可以是任意值
  data: { items: [1, 2, 3] }
});

// 返回: { "status": "success", "version": "1.0", "data": { "items": [1, 2, 3] } }
```

> **注意**：`@{...functionName}` 语法中的 `true` 只是一个占位符。JSON 要求键必须有值，所以可以使用任意值（`true`、`false`、`1`、`null` 等）——代码只检查键是否匹配模式。

**访问请求上下文**

```javascript
mockMonkey.addMethod('userById', `
  const id = context.params.id;
  return { id: parseInt(id), name: 'User ' + id };
`);

mockMonkey.add('/api/users/@params.id', {
  data: '@{...userById}'
});
```

**可用的上下文变量：**
- `context.url` - 请求 URL
- `context.method` - 请求方法（GET、POST 等）
- `context.body` - 请求体
- `context.params` - 提取的路由参数
- `context.Mock` - Mock.js 实例，用于生成随机数据

**最佳实践：在方法内部使用 Mock.js**

方法返回的对象**不会**再次被处理，因此不能在返回值中使用 Mock.js 占位符或其他方法引用。如需动态数据，请使用 `context.Mock`：

```javascript
// ✅ 正确：使用 context.Mock
mockMonkey.addMethod('getRandomUser', `
  return context.Mock.mock({
    id: '@natural(1, 1000)',
    name: '@name',
    email: '@email'
  });
`);

// ❌ 错误：返回值中的占位符不会被处理
mockMonkey.addMethod('getWrongUser', `
  return { id: '@natural(1, 1000)', name: '@name' };
`);
```

### 5. 控制台 API（可选）

也可以在浏览器控制台（F12）中使用 API：

```javascript
// 添加 Mock 规则
mockMonkey.add('/api/user', {
    code: 200,
    data: { name: '张三' }
});

// 添加自定义方法（Alpha）
mockMonkey.addMethod('methodName', 'return { data: "custom" };');

// 删除自定义方法
mockMonkey.removeMethod('methodName');

// 使用正则匹配
mockMonkey.add(/\/api\/posts\/\d+/, {
    id: 123,
    title: '测试文章'
});

// 带延迟和状态码
mockMonkey.add('/api/slow', { data: 'test' }, {
    delay: 1000,    // 延迟 1 秒
    status: 201,    // 返回 201 状态码
    headers: {      // 自定义响应头
        'X-Custom-Header': 'value'
    }
});

// 列出所有规则
mockMonkey.list();

// 列出所有网络请求
mockMonkey.listRequests();

// 删除规则
mockMonkey.remove('/api/user');

// 清空所有规则
mockMonkey.clear();

// 清空请求记录
mockMonkey.clearRequests();

// 访问底层实例
mockMonkey.manager    // MockManager 实例
mockMonkey.recorder   // RequestRecorder 实例
```

## 规则配置

| 字段 | 说明 | 示例 |
|------|------|------|
| URL 模式 | 匹配的 URL，支持字符串或正则 | `/api/user` 或 `/\/api\/user\/\d+/` |
| 响应数据 | 返回的 JSON 数据，支持 Mock.js 占位符 | `{"name": "@name", "email": "@email"}` |
| 延迟 | 响应延迟（毫秒） | `500` |
| 状态码 | HTTP 状态码 | `200`、`404`、`500` |
| 响应头 | 自定义响应头 | `{"Content-Type": "application/json"}` |

## Mock.js 占位符

MockMonkey 内置了 Mock.js 库，支持占位符语法生成随机数据：

| 占位符 | 说明 | 示例输出 |
|--------|------|----------|
| `@name` | 随机姓名 | "张三" |
| `@email` | 随机邮箱 | "test@example.com" |
| `@phone` | 随机手机号 | "13800138000" |
| `@date` | 随机日期 | "2024-03-10" |
| `@boolean` | 随机布尔值 | true/false |
| `@natural(min, max)` | 随机自然数 | 42 |
| `@string(length)` | 随机字符串 | "xYz" |
| `@image(size)` | 随机图片 URL | "http://dummyimage.com/100x100" |

更多占位符请参考 [Mock.js 文档](http://mockjs.com/examples.html)。

## 示例

### Mock 用户登录接口

```javascript
// 在可视化界面中配置：
// URL 模式: /api/login
// 响应数据:
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

### Mock 带延迟的接口

```javascript
// 在可视化界面中配置：
// URL 模式: /api/user/info
// 响应数据:
{
  "code": 200,
  "data": {
    "id": 1,
    "name": "测试用户",
    "avatar": "@image(100x100)"
  }
}
// 延迟: 500 (毫秒)
// 状态码: 200
```

### Mock 错误响应

```javascript
// 在可视化界面中配置：
// URL 模式: /api/error
// 响应数据:
{
  "code": 500,
  "message": "服务器错误"
}
// 状态码: 500
```

### Mock 列表数据

```javascript
// 在可视化界面中配置：
// URL 模式: /api/users
// 响应数据:
{
  "code": 200,
  "data|10": [{    // 生成 10 条数据
    "id|+1": 1,    // 自增 ID
    "name": "@name",
    "email": "@email",
    "status": "@boolean"
  }]
}
```

## 项目结构

```
MockMonkey/
├── src/
│   ├── core/
│   │   ├── MockManager.ts       # Mock 规则管理器
│   │   ├── Interceptor.ts       # 请求拦截器
│   │   ├── RequestRecorder.ts   # 网络请求记录器
│   │   └── MethodManager.ts     # 自定义方法管理器
│   ├── ui/
│   │   └── Panel.ts             # 可视化管理面板
│   ├── i18n/
│   │   └── index.ts             # 国际化
│   ├── types/
│   │   └── index.ts             # TypeScript 类型定义
│   └── index.ts                 # 入口文件
├── test/
│   ├── MockManager.test.ts      # 规则管理器测试
│   ├── Interceptor.test.ts      # 拦截器测试
│   ├── RequestRecorder.test.ts  # 请求记录器测试
│   └── setup.ts                 # 测试环境设置
├── vendor/
│   └── mock.js                  # Mock.js 库
├── .github/
│   └── workflows/
│       └── ci.yml               # CI/CD 工作流（构建并创建 Release）
├── vite.config.ts               # Vite 配置
├── vitest.config.ts             # Vitest 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 项目配置
```

> **注意**：`mock-monkey.user.js` 由源码构建生成，并自动上传到 [GitHub Releases](https://github.com/ikaven1024/mock-monkey/releases)。可从上方徽章安装，或运行 `npm run build` 本地生成。

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

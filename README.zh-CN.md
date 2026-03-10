<p align="center">
  <img src="logo/logo.svg" alt="MockMonkey Logo" width="120" height="120">
</p>

# MockMonkey

浏览器本地接口 Mock 的 Tampermonkey 脚本，无需依赖任何 Mock 服务。使用 TypeScript 构建，提供可视化界面管理 Mock 规则。

## 功能特性

- 🎯 **拦截请求** - 拦截 XMLHttpRequest 和 Fetch 请求
- 🔧 **可视化界面** - 直观的管理面板，无需手动输入命令
- 🔁 **规则持久化** - 规则自动保存到 localStorage，刷新页面不丢失
- 🎨 **支持正则** - 支持字符串和正则表达式匹配 URL
- ⏱️ **延迟模拟** - 可配置响应延迟
- 📊 **状态码控制** - 支持自定义 HTTP 状态码
- 🔌 **网络监控** - 实时显示所有网络请求记录（最多 500 条）
- 📥📤 **导入导出** - 支持规则批量导入导出
- 🎭 **Mock.js 集成** - 支持 `@name`、`@email` 等占位符语法
- 📍 **位置记忆** - 面板和按钮位置自动保存，支持拖动调整
- 📂 **规则折叠** - 规则列表支持折叠详情，节省空间
- 🧪 **单元测试** - 基于 Vitest + Happy DOM 的测试覆盖

## 项目结构

```
MockMonkey/
├── src/
│   ├── core/
│   │   ├── MockManager.ts       # Mock 规则管理器
│   │   ├── Interceptor.ts       # 请求拦截器
│   │   └── RequestRecorder.ts   # 网络请求记录器
│   ├── ui/
│   │   └── Panel.ts             # 可视化管理面板
│   ├── types/
│   │   └── index.ts             # TypeScript 类型定义
│   └── index.ts                 # 入口文件
├── test/
│   ├── MockManager.test.ts      # 规则管理器测试
│   ├── Interceptor.test.ts      # 拦截器测试
│   ├── RequestRecorder.test.ts  # 请求记录器测试
│   └── setup.ts                 # 测试环境设置
├── vendor/
│   └── mock.min.js              # Mock.js 库
├── dist/                        # 构建输出目录
├── mock-monkey.user.js          # 生成的 Tampermonkey 脚本
├── vite.config.ts               # Vite 配置
├── vitest.config.ts             # Vitest 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 项目配置
```

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

## 使用方法

### 1. 安装脚本

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 打开 Tampermonkey 管理面板
3. 点击「添加新脚本」
4. 复制 `mock-monkey.user.js` 的内容并保存

### 2. 使用可视化界面

脚本安装后，访问任意网页：

1. 点击页面**右下角的 🐵 按钮**打开管理面板
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

### 3. 控制台 API（可选）

也可以在浏览器控制台（F12）中使用 API：

```javascript
// 添加 Mock 规则
mockMonkey.add('/api/user', {
    code: 200,
    data: { name: '张三' }
});

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

## License

MIT

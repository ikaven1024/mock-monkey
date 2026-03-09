# MockMonkey

浏览器本地接口 Mock 的 Tampermonkey 脚本，无需依赖任何 Mock 服务。使用 TypeScript 构建，提供可视化界面管理 Mock 规则。

## 功能特性

- 🎯 **拦截请求** - 拦截 XMLHttpRequest 和 Fetch 请求
- 🔧 **可视化界面** - 直观的管理面板，无需手动输入命令
- 🔁 **规则持久化** - 规则自动保存到 localStorage，刷新页面不丢失
- 🎨 **支持正则** - 支持字符串和正则表达式匹配 URL
- ⏱️ **延迟模拟** - 可配置响应延迟
- 📊 **状态码控制** - 支持自定义 HTTP 状态码

## 项目结构

```
MockMonkey/
├── src/
│   ├── core/
│   │   ├── MockManager.ts    # Mock 规则管理器
│   │   └── Interceptor.ts    # 请求拦截器
│   ├── ui/
│   │   └── Panel.ts          # 可视化管理面板
│   ├── types/
│   │   └── index.ts          # TypeScript 类型定义
│   └── index.ts              # 入口文件
├── mock-monkey.user.js       # 生成的 Tampermonkey 脚本
└── README.md
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

## 使用方法

### 1. 安装脚本

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 打开 Tampermonkey 管理面板
3. 点击「添加新脚本」
4. 复制 `mock-monkey.user.js` 的内容并保存

### 2. 使用可视化界面

脚本安装后，访问任意网页：

1. 点击页面**右下角的 🐵 按钮**打开管理面板
2. 在「添加规则」标签页配置 Mock 规则
3. 点击「添加规则」保存

**面板功能：**
- 查看所有 Mock 规则列表
- 启用/禁用规则（点击 🟢/⚫ 图标）
- 删除规则（点击 🗑️ 图标）
- 查看规则的 URL 模式、响应数据、延迟和状态码

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
    status: 201     // 返回 201 状态码
});

// 列出所有规则
mockMonkey.list();

// 删除规则
mockMonkey.remove('/api/user');

// 清空所有规则
mockMonkey.clear();
```

## 规则配置

| 字段 | 说明 | 示例 |
|------|------|------|
| URL 模式 | 匹配的 URL，支持字符串或正则 | `/api/user` 或 `/\/api\/user\/\d+/` |
| 响应数据 | 返回的 JSON 数据 | `{"code": 200, "data": {}}` |
| 延迟 | 响应延迟（毫秒） | `500` |
| 状态码 | HTTP 状态码 | `200`、`404`、`500` |

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
    "token": "mock-token-123456",
    "userInfo": {
      "id": 1,
      "name": "测试用户"
    }
  }
}
```

### Mock 带延迟的接口

```javascript
// 在可视化界面中配置：
// URL 模式: /api/user/info
// 响应数据: {...}
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

## License

MIT

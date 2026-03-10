import { defineConfig } from 'vite';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// 读取 Mock.js 库代码
const mockJsCode = readFileSync('./vendor/mock.min.js', 'utf-8');

const userscriptHeader = `// ==UserScript==
// @name         ${pkg.name}
// @namespace    https://github.com/ikaven1024/
// @version      ${pkg.version}
// @description  ${pkg.description}
// @author       ${pkg.author}
// @match        *://*/*
// @grant        none
// @run-at       document-end
// @icon         data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwMCIgaGVpZ2h0PSIxMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxwYXRoIGQ9Im03MzQsNjNjLTUuMTU2LDguOTE5MiAtMTMuMjUsMTYuNDY5NCAtMjEsMjMuMTMwNGMtMjIuMTMzLDE5LjAyMTYgLTQ4LjYwNSwzMC45NTE2IC03NywzNy4wNzk2Yy00MC45NTksOC44MzkgLTgyLjUzNSw2LjA0IC0xMjQsOC44NzljLTMyLjk5NSwyLjI2IC02Ny4wMjEsOS45NzcgLTk4LDIxLjQ0MWMtODMuNTA0LDMwLjkgLTE1Mi4zNzEsOTYuMjg5IC0xOTAuMjE5LDE3Ni40N2MtOS4yMzEsMTkuNTU1IC0xNi4zMDQsNDAuOTQyIC0yMS4xMyw2MmMtMS41ODksNi45MzMgLTMuMDM5LDEzLjk4NSAtNC4yMTYsMjFjLTAuNTEyLDMuMDUgLTAuMzc1LDcuMDEyIC0yLjM3Myw5LjU2NmMtMy4zODMsNC4zMjIgLTEyLjI3LDIuMTQgLTE3LjA2MiwyLjYwNGMtMTMuNzQ1LDEuMzMgLTI4LjExLDUuNzQyIC00MSwxMC41MTFjLTM0LjIxNywxMi42NjIgLTY0LjQ5NTQsMzcuODI1IC04NS41NzI1LDY3LjMxOWMtNDAuOTQxNCw1Ny4yOSAtNDcuNTc4MzgsMTM3LjE1MyAtMTguMTE4MSwyMDFjMTQuMTkzMSwzMC43NiAzNy4xNjg3LDU3LjkwNCA2NC42OTA2LDc3LjU3M2MyMi4wNCwxNS43NSA0OC4zMDQsMjguOTcxIDc1LDM0LjQyM2MyMS44OTEsNC40NzEgNDMuNzg1LDQuMDA0IDY2LDQuMDA0Yy0yLjEzOSwtMTEuNTIgMCwtMjQuMjM2IDAsLTM2YzAsLTIzLjM2MSAtMC41ODcsLTQ2LjYyMyAtMC4wMTUsLTcwYzAuNjIsLTI1LjMgMC4wMTUsLTUwLjY5MiAwLjAxNSwtNzZjMCwtMTUuNjk4IC0wLjYzMywtMzEuNDk5IDIuMjYxLC00N2M2LjExLC0zMi43MzUgMjIuNzQ3LC02Mi4wMjEgNDYuNzM5LC04NC45NjFjNTAuMjQ1LC00OC4wNDEgMTMxLjQ3MywtNTYuNDUxIDE4OSwtMTYuMDAzYzIyLjUyMiwxNS44MzYgNDAuMzUzLDM4LjAwNyA1MS43NjksNjIuOTY0YzYuODg0LDE1LjA0OSAxMy41MTMsMzMuMzE5IDE0LjIzMSw1MGMyLjU1NywtNC44MDggMi40ODUsLTEwLjcyOSAzLjY2NSwtMTZjMS43MywtNy43MjUgNC4zMiwtMTUuNTY0IDcuMDMsLTIzYzguMTc1LC0yMi40MjYgMjIuODgsLTQzLjY3OSA0MC4zMDUsLTU5LjkxMWM0My4zMTgsLTQwLjM1MSAxMDkuOSwtNTEuNDA0IDE2NCwtMjYuOTk0YzIxLjgzNCw5Ljg1MSA0MC44NDYsMjUuMjQ5IDU1LjgsNDMuOTA1YzcuNDY2LDkuMzE0IDE0LjczLDE5LjE2NiAxOS44OCwzMWM4LjUxNSwxNy45MTQgMTQuMjYsMzcuMjIyIDE2LjE1LDU3YzEuOTA5LDE5Ljk3NCAwLjE3LDQwLjkzIDAuMTcsNjFsMCwxNTJjMTcuNDM0LDAgMzUuNzU0LDAuMzY3IDUzLC0yLjI5NmM0MS4yNTcsLTYuMzcyIDgyLjQyMSwtMjcuMzA0IDExMS45MSwtNTYuNzkzYzYwLjg4LC02MC44OCA3OS4xNCwtMTYxLjYyOCAzNS43NSwtMjM3LjkxMWMtMTguMTYsLTMxLjkzMyAtNDQuNzMsLTU4LjkxMiAtNzYuNjYsLTc3LjEyN2MtMjQuODI3LC0xNC4xNjUgLTUyLjU4NiwtMjEuODM4IC04MSwtMjMuNzg0Yy05LjQyMywtMC42NDUgLTE4LjY0NCwwLjcxOCAtMjgsMC45MTFjLTAuODg1LC0yMC4zMTYgLTcuNTg3LC00MS45MzcgLTE0LjMwOSwtNjFjLTE2LjkwMiwtNDcuOTMzIC00My42ODMsLTkwLjk5NCAtNzkuNjkxLC0xMjdjLTEwLjY1MiwtMTAuNjUxIC0yMS45NzMsLTIwLjQxNSAtMzQsLTI5LjQ3NWMtNy4wMTIsLTUuMjgxIC0xMy44NzksLTExLjAyMSAtMjIsLTE0LjUyNWMzLjkzMSwtMTIuMjkyIDUuNjc3LC0yNS4yOTIgNy43NTQsLTM4YzMuMzc1LC0yMC42NSA2LjI2LC00MS4yNCA4Ljk2NCwtNjJjMS4yNTUsLTkuNjI3MS0xLjAyMiwtMTkuNTMzNiAzLjI4MiwtMjlsLTIsMG0tMzUwLDUxMWMxLjY0NCw4Ljg1NSAxLDE4LjAyMyAxLDI3bDAsNDRsMCwxMzljMzEuNjgzLDAgNjQuNDc3LC0zLjk4NCA5NiwwbDAsLTIxMGwtOTcsMG0yMjUsMjEwbDcxLDBsMTcsMGMyLjIzNiwtMC4wMDUgNS41MDgsMC40NjggNy4zOTcsLTEuMDI4YzMuNDcsLTIuNzQ4IDAuOTQxLC0xMC4zNDEgMC42OTIsLTEzLjk3MmMtMC44MzcsLTEyLjIyNCAtMC4wODksLTI0Ljc0NiAtMC4wODksLTM3bDAsLTE1OGwtNzAsMGwtMTgsMGMtMi4yMTgsMC4wMDUgLTUuNTI4LC0wLjQ3OCAtNy4zOTMsMS4wMjhjLTIuODM4LDIuMjkxIC0wLjYyMyw5Ljc0OCAtMC42MDgsMTIuOTcyYzAuMDYxLDEyLjY2NiAwLjAwMSwyNS4zMzQgMC4wMDEsMzhsMCwxNTh6IiBmaWxsPSIjNmIwMjAyIiBpZD0ic3ZnXzIiLz4KIDwvZz4KCjwvc3ZnPg==
// ==/UserScript==

`;

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MockMonkey',
      fileName: 'mock-monkey',
      formats: ['iife']
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      output: {
        banner: '// Built with MockMonkey'
      },
      treeshake: false,
      // 禁用 PURE 注释
      moduleContext: {}
    }
  },
  plugins: [
    {
      name: 'add-userscript-header',
      closeBundle() {
        const inputFile = resolve(__dirname, 'dist/mock-monkey.iife.js');
        const outputFile = resolve(__dirname, 'mock-monkey.user.js');

        // 读取构建后的文件，移除 banner 注释和 PURE 注释
        let content = readFileSync(inputFile, 'utf-8');
        content = content.replace(/^\/\/ Built with MockMonkey\n/, '');
        // 移除可能导致问题的 PURE 注释
        content = content.replace(/\/\* @__PURE__ \*\//g, '');

        // 直接在 window 上下文中执行 Mock.js，不修改其内部代码
        // 使用一个包装函数确保 this 指向 window
        const mockWrapper = `
          (function() {
            var _this = this;
            ${mockJsCode}
          }).call(window);
        `;

        // 组合最终内容
        const finalContent = userscriptHeader + mockWrapper + '\n' + content;

        writeFileSync(outputFile, finalContent);
        console.log(`✓ UserScript created: ${outputFile}`);
      }
    }
  ]
});

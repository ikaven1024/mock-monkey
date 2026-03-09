import { defineConfig } from 'vite';
import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const userscriptHeader = `// ==UserScript==
// @name         ${pkg.name}
// @namespace    http://tampermonkey.net/
// @version      ${pkg.version}
// @description  ${pkg.description}
// @author       You
// @match        *://*/*
// @grant        none
// @run-at       document-idle
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
      treeshake: false
    }
  },
  plugins: [
    {
      name: 'add-userscript-header',
      closeBundle() {
        const inputFile = resolve(__dirname, 'dist/mock-monkey.iife.js');
        const outputFile = resolve(__dirname, 'mock-monkey.user.js');

        // 读取构建后的文件，移除 banner 注释
        let content = readFileSync(inputFile, 'utf-8');
        content = content.replace(/^\/\/ Built with MockMonkey\n/, '');

        // 添加 UserScript 头部
        const finalContent = userscriptHeader + content;

        writeFileSync(outputFile, finalContent);
        console.log(`✓ UserScript created: ${outputFile}`);
      }
    }
  ]
});

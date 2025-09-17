# CanvasMark

CanvasMark 是一款面向内容创作者的 Markdown + Drawnix 白板一体化写作与导出工具。你可以在同一界面中完成内容创作、主题切换以及标准 HTML / 公众号 HTML 的导出。

- 产品规格文档：[`docs/product-spec.md`](docs/product-spec.md)
- 当前版本：前端单页应用骨架 + Markdown 基础编辑能力 + HTML 导出预览

## 快速开始

```bash
npm install
npm run dev
```

访问 `http://localhost:5173` 即可打开示例应用。

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发（Vite） |
| `npm run build` | 构建产物（含 TypeScript 检查） |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | 执行 ESLint |
| `npm run typecheck` | TypeScript 严格类型检查 |
| `npm run test` | 运行 Vitest 单元测试（当前为占位） |
| `npm run format` | 使用 Prettier 自动格式化 |

## 项目结构（摘录）

```
├── src
│   ├── components          # UI 组件（工具栏、侧边栏、状态栏等）
│   ├── hooks               # 自定义 Hook（如主题切换）
│   ├── modules
│   │   ├── documents       # 文档数据模型、存储与导入导出
│   │   ├── editor          # Milkdown 编辑器封装与命令
│   │   ├── exports         # HTML 导出服务
│   │   └── themes          # 编辑/导出主题元数据与样式
│   ├── styles              # 全局样式
│   └── utils               # 下载等工具方法
├── docs/product-spec.md    # 完整产品需求与实现路线
└── index.html              # 应用入口
```

## 现状与路线

- ✅ 阶段 0：工程骨架、Lint/TypeScript/Vitest、Vite 开发环境
- ✅ 阶段 1：Milkdown 基础编辑、主题切换、项目包导入导出骨架、标准/公众号 HTML 导出（初版）
- ⏳ 阶段 2：Drawnix 白板块的 schema、视图与预览生成（当前提供占位信息）
- ⏳ 阶段 3 及后续：导出能力深化、长图/PDF、主题生态等

## 已知限制

- Drawnix 白板块暂仅支持从项目包中读取并统计数量，编辑器内插入/编辑功能将在后续迭代中补齐。
- HTML 导出初版主要用于流程验证，后续将补充资源策略、可访问性与更多主题。
- 测试覆盖率处于起步阶段，当前仅搭建基础测试环境。

欢迎基于产品规格继续扩展功能，或在 `docs/product-spec.md` 的路线图基础上提交改进建议。

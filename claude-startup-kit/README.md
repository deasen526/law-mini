# Claude 项目启动包

## 这是什么

一套即插即用的项目治理体系。丢进任何新项目的根目录，Claude 自动按标准干活。

## 包含什么

```
项目根目录/
├── CLAUDE.md                  ← 🧠 共享大脑（必填占位符）
├── .claude/
│   ├── settings.json          ← ⚙️  Hooks + 权限（开箱即用）
│   ├── rules/
│   │   ├── project-rule.md    ← 📋 协作规范（开箱即用）
│   │   ├── quality-gate.md    ← 🛡️ 7条质量门禁（开箱即用）
│   │   └── task-templates.md  ← 📝 6个任务模板（开箱即用）
│   └── skills/
│       └── product-spec.md    ← 🔧 需求翻译器（开箱即用）
└── .gitignore                 ← 🚫 通用忽略规则
```

## 怎么用

### 新项目（3步）

1. 把本目录所有文件复制到新项目根目录
2. 打开 `CLAUDE.md`，替换所有 `[ ]` 占位符为实际内容
3. `git init && git add -A && git commit -m "init: 项目启动"`

### 旧项目接入

只需复制 `.claude/` 目录 + `CLAUDE.md` + `.gitignore` 到已有项目根目录，然后填写 CLAUDE.md。

## 每层做什么

| 层 | 文件 | 解决什么问题 |
|------|------|------|
| 共享大脑 | CLAUDE.md | Claude 不懂项目架构 → 自动读取 |
| 质量门禁 | quality-gate.md | 代码风格不一致/缺边界处理/不安全 → 7条自查 |
| 协作规范 | project-rule.md | 多 Claude 协作冲突 → 统一规则 |
| 任务模板 | task-templates.md | 非技术用户不会写 prompt → 6个复制即用模板 |
| 需求翻译 | product-spec.md | 需求模糊 → 10个问题理清 |
| Hooks | settings.json | 偷偷 npm install/忘 commit → 自动拦截提醒 |

## 适用场景

- ✅ 小程序 / Web 应用 / API 后端
- ✅ 非技术用户 + 多 Claude 协作
- ✅ 需要质量一致性的持续开发项目
- ⚠️ 移动端原生 App（需调整部分规范）
- ⚠️ 超大型项目（需增加模块化规则）

## 维护

当项目演进出现新的架构决策、新的工具函数、新的代码规范时，更新 CLAUDE.md 相应段落即可，所有 Claude 自动同步。

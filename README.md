# AI设计作品集展示平台

一个基于 Vue 3 + TypeScript + TailwindCSS 的AI设计作品集展示平台，支持多项目管理、图片浏览、视频播放、Prompt查看等功能。

## 🌐 在线演示

**GitHub Pages 地址：** [https://outofearth.github.io/project_show/](https://outofearth.github.io/project_show/)

> ⚠️ **注意**：GitHub Pages 版本为静态演示版本，仅包含示例数据。如需完整功能（挂载文件夹、动态扫描、图片上传等），请使用本地开发模式。

## 🎯 功能特性

### 核心功能
- **项目管理**：支持多个Project切换，动态扫描目录结构
- **分类浏览**：支持嵌套文件夹显示，点击查看对应图片
- **图片展示**：大图展示区，支持左右切换、循环浏览
- **视频播放**：支持 MP4、WebM、OGG 等视频格式播放
- **Prompt查看**：双击图片查看对应的Prompt内容，首次需输入密码解锁
- **一键复制**：快速复制Prompt内容到剪贴板

### 交互体验
- **图片缩放**：支持鼠标滚轮缩放（100%-300%），放大后可拖动查看
- **触摸支持**：移动端支持双指捏合缩放、左右滑动切换
- **全屏浏览**：移动端支持全屏查看图片
- **响应式设计**：适配电脑端、平板和移动端
- **折叠屏适配**：针对折叠屏设备优化布局

### 动态扫描
- 自动扫描 `public/` 目录下的 `Project*` 文件夹
- 自动识别图片文件（jpg, jpeg, png, gif, webp, svg）
- 自动识别视频文件（mp4, webm, ogg, mkv, mov）
- 自动查找说明文件（.txt 或 .md）

### 移动端上传
- 支持在移动端直接上传图片到特定文件夹
- 支持多级文件夹选择
- 支持 JPEG、PNG 等图片格式

## 🛠️ 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite 6
- **样式框架**：TailwindCSS 3
- **图标库**：Lucide Vue Next

## 📁 项目结构

```
project_show/
├── public/                  # 静态资源目录
│   ├── Project1-image-show/ # 项目1：AI设计作品集
│   ├── Project2-xxx/        # 项目2
│   └── static-data.json     # 静态数据文件（自动生成）
├── src/
│   ├── components/          # Vue组件
│   │   ├── ImageGallery.vue # 图片展示组件
│   │   ├── FolderIndex.vue  # 文件夹索引组件
│   │   ├── ProjectTabs.vue  # 项目标签组件
│   │   ├── UnlockModal.vue  # 解锁弹窗组件
│   │   ├── ImageUploader.vue # 移动端上传组件
│   │   └── MountDialog.vue  # 挂载对话框组件
│   ├── utils/
│   │   ├── scanner.ts       # 文件扫描工具
│   │   └── static-data.ts   # 静态数据加载工具
│   ├── data/
│   │   └── projects.ts      # 默认项目数据
│   ├── App.vue              # 主应用组件
│   ├── main.ts              # 入口文件
│   └── style.css            # 全局样式
├── scripts/
│   └── generate-static-data.ts  # 静态数据生成脚本
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions 部署配置
├── vite.config.ts           # Vite配置
├── tailwind.config.js       # Tailwind配置
└── package.json             # 项目依赖
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问地址：http://localhost:5175/

### 生产构建

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### GitHub Pages 部署

本项目已配置 **GitHub Actions** 自动部署到 GitHub Pages。

**自动部署流程：**
1. 推送代码到 `main` 分支
2. GitHub Actions 自动触发构建和部署
3. 几分钟后即可访问在线版本

**手动构建（用于本地测试 GitHub Pages 版本）：**

```bash
# 生成静态数据并构建
npm run build:github

# 预览构建结果
npm run preview
```

**部署配置说明：**
- 静态数据文件：`public/static-data.json`（由 `scripts/generate-static-data.ts` 自动生成）
- 构建输出目录：`dist/`
- 基础路径：`/project_show/`（自动设置）

## 🔐 授权说明

### 默认授权码

默认授权码：`design2026`

### 通过 GitHub Secrets 自定义授权码

您可以通过 GitHub Secrets 来控制授权码，无需修改代码：

**设置步骤：**
1. 打开 GitHub 仓库
2. 进入 **Settings** -> **Secrets and variables** -> **Actions**
3. 点击 **New repository secret**
4. **Name**: `AUTHORIZATION_CODE`
5. **Value**: 您的自定义密码
6. 点击 **Add secret**

下次推送代码时，GitHub Actions 会使用您设置的自定义密码覆盖默认密码。

> 💡 **提示**：如果未设置 `AUTHORIZATION_CODE` Secrets，将使用默认授权码 `design2026`

### 本地开发模式

在本地开发模式下，授权码从 `src/data/projects.ts` 文件中读取。

## 📱 移动端支持

### 移动端功能
- 响应式布局，适配各种屏幕尺寸
- 触摸手势支持（滑动切换、双指缩放）
- 移动端上传功能
- 全屏浏览模式

## 📝 使用说明

### 添加新项目

1. 在 `public/` 目录下创建 `ProjectN-name/` 格式的文件夹
2. 在项目文件夹内创建子文件夹（分类）
3. 添加图片文件和说明文件（.txt 或 .md）
4. 点击页面顶部的刷新按钮

### 添加新分类

1. 在对应项目文件夹内创建新文件夹
2. 添加图片文件和说明文件
3. 点击刷新按钮，新分类会自动显示

## 📄 许可证

MIT License

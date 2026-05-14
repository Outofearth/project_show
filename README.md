# AI设计作品集展示平台

一个基于 Vue 3 + TypeScript + TailwindCSS 的AI设计作品集展示平台，支持多项目管理、图片浏览、Prompt查看等功能。

## 🎯 功能特性

### 核心功能
- **项目管理**：支持多个Project切换，动态扫描目录结构
- **分类浏览**：支持嵌套文件夹显示，点击查看对应图片
- **图片展示**：大图展示区，支持左右切换、循环浏览
- **Prompt查看**：双击图片查看对应的Prompt内容，首次需输入密码解锁
- **一键复制**：快速复制Prompt内容到剪贴板

### 交互体验
- **图片缩放**：支持鼠标滚轮缩放（100%-300%），放大后可拖动查看
- **触摸支持**：移动端支持双指捏合缩放、左右滑动切换
- **响应式设计**：适配电脑端和移动端

### 动态扫描
- 自动扫描 `public/` 目录下的 `Project*` 文件夹
- 自动识别图片文件（jpg, jpeg, png, gif, webp, svg）
- 自动查找说明文件（.txt 或 .md）

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
│   └── Project2-xxx/        # 项目2
├── src/
│   ├── components/          # Vue组件
│   │   ├── ImageGallery.vue # 图片展示组件
│   │   ├── FolderIndex.vue  # 文件夹索引组件
│   │   ├── ProjectTabs.vue  # 项目标签组件
│   │   └── UnlockModal.vue  # 解锁弹窗组件
│   ├── utils/
│   │   └── scanner.ts       # 文件扫描工具
│   ├── App.vue              # 主应用组件
│   ├── main.ts              # 入口文件
│   └── style.css            # 全局样式
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

## 🔐 授权说明

- 默认授权码：`design2024`
- 首次查看Prompt需要输入授权码
- 输入正确后，后续双击图片可直接查看

## 📱 移动端支持

移动端访问地址（手机连接同一WiFi）：
- http://192.168.1.5:5175/

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

## � 项目迁移

### 迁移准备

**需要复制的文件：**

```
project_show/
├── src/                    # ✅ 必须复制
├── public/                 # ✅ 必须复制（图片资源）
├── package.json            # ✅ 必须复制
├── vite.config.ts          # ✅ 必须复制
├── tailwind.config.js      # ✅ 必须复制
├── tsconfig.json           # ✅ 必须复制
└── index.html              # ✅ 必须复制
```

**不需要复制的文件夹：**
- `node_modules/` （会在新电脑重新安装）
- `dist/` （会在新电脑重新构建）

### 迁移步骤

**步骤1：打包项目**

```bash
# Windows PowerShell
Compress-Archive -Path * -DestinationPath project_show.zip -Force
```

**步骤2：传输到新电脑**

通过 U盘、网盘、Git仓库等方式传输。

**步骤3：在新电脑上部署**

```bash
# 1. 解压项目
cd D:\Projects\project_show

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问地址：http://localhost:5175/
```

### 生产部署迁移

如果只需要运行查看，不需要开发：

```bash
# 在原电脑构建
npm run build

# 将 dist/ 文件夹复制到新电脑
# 使用静态服务器运行
npx serve dist
```

### 注意事项

- 需要在新电脑安装 Node.js >= 18
- 修改授权码：编辑 `src/data/projects.ts` 文件
- 迁移后图片路径保持不变，无需额外配置

## �📄 许可证

MIT License

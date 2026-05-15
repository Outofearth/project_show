# 项目问题总结 - AI设计作品集展示平台

## 概述

本文档总结了开发过程中遇到的主要问题及其解决方案，形成可复用的技术经验。

---

## 问题分类

### 一、路径相关问题

#### 问题1：图片路径缺少项目ID前缀

**现象**：
- 图片无法显示，控制台显示404错误
- 路径格式：`/包装设计/xxx.jpg`（错误）

**原因分析**：
- Vite开发服务器从 `public/` 目录提供静态资源
- 项目结构为 `public/Project1-image-show/包装设计/xxx.jpg`
- 缺少项目ID前缀导致路径错误

**解决方案**：
```typescript
// 修复后路径格式
const imagePath = `/${projectId}/${folderName}/${imageName}`
```

**预防措施**：
- 在数据模型中保存完整路径
- 使用模板字符串拼接路径时确认层级正确

---

#### 问题2：中文路径编码问题

**现象**：
- Prompt文件加载失败，持续加载中
- 后端无法正确解析中文路径

**原因分析**：
- URL中不能直接包含中文字符
- 前端未对中文路径进行URL编码

**解决方案**：
```typescript
// 前端编码
const encodedPath = encodeURIComponent(folderPath)
const response = await fetch(`/api/text/${encodedPath}`)

// 后端解码
const decodedPath = decodeURIComponent(req.params.path)
```

**预防措施**：
- 所有包含中文的路径参数都需要进行URL编码
- 后端接收参数时进行相应解码

---

### 二、布局与显示问题

#### 问题3：图片超出显示区域

**现象**：
- 宽图左右被裁剪，无法完整查看
- 用户反馈"图片好像超出了图片显示区"

**原因分析**：
- 容器设置了 `overflow: hidden`
- 图片宽度超过容器宽度时被裁剪

**解决方案**：
```css
.image-container {
  overflow: auto;  /* 改为auto，支持滚动 */
}

img {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}
```

**预防措施**：
- 对于不确定尺寸的图片，使用 `max-width` 和 `max-height` 约束
- 容器使用 `overflow: auto` 支持滚动查看

---

#### 问题4：图片容器高度不足

**现象**：
- 图片显示区域太小
- 底部预览图被遮挡

**原因分析**：
- 容器高度未设置或设置过小
- 使用 `min-height` 导致高度不固定

**解决方案**：
```css
.image-container {
  height: calc(100vh - 200px);  /* 固定高度，扣除头部和边距 */
  overflow: hidden;
}
```

**预防措施**：
- 使用 `calc()` 动态计算容器高度
- 考虑响应式设计，不同屏幕尺寸使用不同高度

---

### 三、交互逻辑问题

#### 问题5：双击检测逻辑失效

**现象**：
- 双击图片无法触发查看Prompt功能
- 移动端触摸事件与双击事件冲突

**原因分析**：
- 移动端触摸事件处理复杂
- 单次点击和双击需要区分

**解决方案**：
```typescript
const tapCount = ref(0)
let tapTimer: ReturnType<typeof setTimeout> | null = null

const handleSingleTap = () => {
  tapCount.value++
  if (tapTimer) clearTimeout(tapTimer)
  
  if (tapCount.value === 2) {
    handleDoubleClick()
    tapCount.value = 0
  } else {
    tapTimer = setTimeout(() => {
      tapCount.value = 0
    }, 300)  // 300ms内两次点击判定为双击
  }
}
```

**预防措施**：
- 使用计数器+定时器模式实现双击检测
- 设置合理的时间阈值（200-300ms）

---

#### 问题6：图片拖动功能不生效

**现象**：
- 图片放大后无法拖动
- 鼠标拖动无反应

**原因分析**：
- 拖动事件处理逻辑有误
- 未正确记录拖动起始位置

**解决方案**：
```typescript
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const position = ref({ x: 0, y: 0 })

const handleMouseDown = (e: MouseEvent) => {
  if (canDrag.value && e.button === 0) {
    isDragging.value = true
    dragStart.value = { 
      x: e.clientX - position.value.x, 
      y: e.clientY - position.value.y 
    }
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    position.value = {
      x: e.clientX - dragStart.value.x,
      y: e.clientY - dragStart.value.y
    }
  }
}
```

**预防措施**：
- 确保拖动状态管理正确
- 记录相对位置而非绝对位置

---

### 四、数据加载问题

#### 问题7：动态扫描不生效

**现象**：
- 新增文件后点击刷新无变化
- 页面显示旧数据

**原因分析**：
- 前端直接读取静态数据文件
- 未调用后端API获取最新文件结构

**解决方案**：
```typescript
// Vite配置中添加API端点
server.middlewares.use('/api/scan', async (req, res) => {
  const projects = await scanProjects()
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(projects))
})

// 前端调用
const loadProjects = async () => {
  const response = await fetch('/api/scan')
  const data = await response.json()
  return data
}
```

**预防措施**：
- 使用API动态获取文件结构
- 刷新时重新调用API

---

#### 问题8：Prompt文件读取逻辑错误

**现象**：
- 显示的Prompt内容不对
- 部分文件夹显示错误内容

**原因分析**：
- 文件名拼写错误（`Promopt.txt` vs `Prompt.txt`）
- 固定文件名导致无法识别其他名称的文件

**解决方案**：
```typescript
// 支持任意txt/md文件
const findTextFile = (folderPath: string): string => {
  const files = fs.readdirSync(folderPath)
  
  // 优先查找Prompt.txt
  if (files.includes('Prompt.txt')) {
    return path.join(folderPath, 'Prompt.txt')
  }
  
  // 查找任意txt文件
  const txtFile = files.find(f => f.endsWith('.txt'))
  if (txtFile) {
    return path.join(folderPath, txtFile)
  }
  
  // 查找任意md文件
  const mdFile = files.find(f => f.endsWith('.md'))
  if (mdFile) {
    return path.join(folderPath, mdFile)
  }
  
  return null
}
```

**预防措施**：
- 不要依赖固定文件名
- 支持多种文件格式

---

### 五、移动端适配问题

#### 问题9：移动端布局错乱

**现象**：
- 侧边栏遮挡内容
- 按钮尺寸过小

**原因分析**：
- 未针对移动端进行响应式设计
- 缺少断点适配

**解决方案**：
```html
<!-- 使用Tailwind响应式断点 -->
<div class="lg:block hidden">
  <!-- 桌面端侧边栏 -->
</div>

<button class="lg:hidden">
  <!-- 移动端菜单按钮 -->
</button>

<div class="fixed inset-0 bg-black/50 lg:hidden">
  <!-- 移动端抽屉菜单遮罩 -->
</div>
```

**预防措施**：
- 使用Tailwind响应式类进行断点适配
- 移动端使用抽屉式菜单

---

#### 问题10：移动端触摸缩放不生效

**现象**：
- 双指捏合无法缩放图片
- 移动端无法放大查看细节

**原因分析**：
- 未实现触摸缩放逻辑
- 缺少对双指触摸的处理

**解决方案**：
```typescript
const getDistance = (touches: TouchList): number => {
  if (touches.length < 2) return 0
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    const currentDistance = getDistance(e.touches)
    if (touchStart.value.distance > 0) {
      const scaleChange = currentDistance / touchStart.value.distance
      const newScale = Math.max(1, Math.min(3, scale.value * scaleChange))
      scale.value = newScale
    }
    touchStart.value.distance = currentDistance
  }
}
```

**预防措施**：
- 实现触摸事件处理
- 支持双指缩放和单指拖动

---

### 六、上传功能问题

#### 问题11：上传时提示"项目目录不存在"

**现象**：
- 移动端上传图片时，无论是否选择文件夹，都提示"项目目录不存在"
- 测试脚本显示项目目录确实存在

**原因分析**：
- API 路径不匹配：前端发送请求到 `/project_show/api/upload`，但后端只监听 `/api/upload`
- 中文项目ID编码问题：前端发送的中文项目ID未正确编码，后端收到乱码

**解决方案**：
```typescript
// vite.config.ts - 添加路径支持
if (req.url === '/api/upload' || req.url === '/project_show/api/upload') {
  // 处理上传逻辑
}

// 后端解码中文参数
projectId = decodeURIComponent(contentBuffer.toString('utf-8').trim())
```

**预防措施**：
- API 端点需要同时支持带前缀和不带前缀的路径
- 中文参数需要进行 URL 编码/解码

---

#### 问题12：上传的图片无法查看

**现象**：
- 图片上传成功但无法显示
- 图片文件损坏，无法打开

**原因分析**：
- 为解决中文项目ID问题，将 `bodyBuffer.toString('binary')` 改为 `bodyBuffer.toString('utf-8')`
- `utf-8` 编码会损坏二进制图片数据

**解决方案**：
```typescript
// 重写 multipart 解析逻辑，直接操作 Buffer
const bodyBuffer = await new Promise<Buffer>((resolve) => {
  const chunks: Buffer[] = []
  req.on('data', (chunk: Buffer) => {
    chunks.push(chunk)
  })
  req.on('end', () => {
    resolve(Buffer.concat(chunks))
  })
})

// 文本字段使用 utf-8 解码
projectId = decodeURIComponent(contentBuffer.toString('utf-8').trim())

// 二进制文件直接保留 Buffer
files.push({
  filename,
  content: contentBuffer  // 不进行字符串转换
})
```

**预防措施**：
- 文本字段和二进制文件需要分开处理
- 二进制数据不应转换为字符串

---

### 七、全屏浏览功能

#### 问题13：移动端全屏浏览功能

**现象**：
- 用户需要在移动端全屏查看图片
- 原有功能不支持全屏模式

**解决方案**：
```typescript
const toggleMediaFullscreen = () => {
  const galleryContainer = document.querySelector('.gallery-fullscreen-container')
  if (!galleryContainer) return
  
  // 尝试原生全屏 API
  if (container.requestFullscreen) {
    container.requestFullscreen({ navigationUI: 'hide' })
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen({ navigationUI: 'hide' })
  } else {
    // CSS 全屏回退
    enableCssFullscreen()
  }
}
```

**预防措施**：
- 实现多浏览器兼容性方案
- 提供 CSS 回退方案

---

#### 问题14：Safari 全屏兼容性问题

**现象**：
- Chrome 浏览器全屏正常工作
- Safari 浏览器无法进入全屏模式

**原因分析**：
- Safari 使用 WebKit 前缀的全屏 API
- iOS Safari 对全屏 API 有严格限制（必须来自用户交互）

**解决方案**：
```typescript
// 支持多种浏览器前缀
if (container.webkitRequestFullscreen) {
  container.webkitRequestFullscreen(options)
} else if (container.webkitRequestFullScreen) {
  container.webkitRequestFullScreen(options)
}

// CSS 回退方案
const enableCssFullscreen = () => {
  document.documentElement.classList.add('gallery-fullscreen-active')
}
```

**当前状态**：部分解决，原生全屏在某些 Safari 版本仍有问题，CSS 回退方案可工作

---

### 八、部署与环境问题

#### 问题15：GitHub Pages 路径配置错误

**现象**：
- 本地运行正常，但部署到 GitHub Pages 后图片无法显示
- 控制台显示 404 错误，路径缺少项目名前缀

**原因分析**：
- 本地开发服务器运行在 `http://localhost:5175/`
- GitHub Pages 部署在 `https://username.github.io/project_show/`
- Vite 的 `base` 配置未正确设置，导致资源路径缺少 `/project_show/` 前缀

**解决方案**：
```typescript
// vite.config.ts
export default defineConfig({
  base: '/project_show/',  // 设置正确的 base 路径
})
```

**预防措施**：
- 在 `vite.config.ts` 中设置正确的 `base` 路径
- 使用环境变量适配不同环境：
  ```typescript
  const base = process.env.NODE_ENV === 'production' ? '/project_show/' : '/'
  ```

---

#### 问题16：静态环境下 API 不可用

**现象**：
- 本地可以正常加载 Prompt 文本
- GitHub Pages 上 Prompt 无法加载，显示空白

**原因分析**：
- 本地开发时使用 Vite 插件提供 `/api/text/` 等 API 端点
- GitHub Pages 是纯静态文件托管，无法执行 Node.js 代码
- 静态页面无法调用后端 API

**解决方案**：
```typescript
// scripts/generate-static-data.ts
// 预先生成静态数据，包含文本内容
const getTextContent = (folderPath: string): string => {
  const files = fs.readdirSync(folderPath)
  const textFiles = files.filter(file => 
    file.toLowerCase().endsWith('.txt') || file.toLowerCase().endsWith('.md')
  )
  if (textFiles.length > 0) {
    return fs.readFileSync(path.join(folderPath, textFiles[0]), 'utf-8')
  }
  return ''
}
```

```typescript
// 前端优先使用静态数据中的文本内容
const loadPromptContent = async () => {
  if (props.folder.textContent) {
    promptContent.value = props.folder.textContent
    return
  }
  // 降级到 API（仅本地开发时可用）
  try {
    promptContent.value = await loadTextFile(props.folder.path)
  } catch {
    promptContent.value = ''
  }
}
```

**预防措施**：
- 将动态数据预先生成为静态 JSON 文件
- 前端代码优先使用静态数据，再降级到 API
- 部署前运行数据生成脚本

---

#### 问题17：环境变量未正确传递

**现象**：
- 本地构建正常，但 GitHub Actions 构建失败
- 环境变量 `GITHUB_PAGES` 未被正确设置

**原因分析**：
- GitHub Actions 工作流中未定义所需的环境变量
- Vite 配置依赖环境变量但未提供默认值

**解决方案**：
```yaml
# .github/workflows/deploy.yml
env:
  GITHUB_PAGES: true
```

或直接在配置中使用固定值：
```typescript
base: '/project_show/'  // 直接设置，不依赖环境变量
```

**预防措施**：
- 在 GitHub Actions 工作流中明确设置环境变量
- 为环境变量提供合理的默认值
- 避免过度依赖环境变量进行配置

---

#### 问题18：静态资源路径编码问题

**现象**：
- 包含中文的路径在 GitHub Pages 上无法访问
- 图片路径中的中文导致 404 错误

**原因分析**：
- URL 中不能直接包含中文字符
- 前端生成图片路径时未进行 URL 编码

**解决方案**：
```typescript
const getMediaUrl = (mediaPath: string): string => {
  const encodedPath = encodeURIComponent(mediaPath).replace(/%2F/g, '/')
  return `/project_show/${encodedPath}`
}
```

**预防措施**：
- 所有包含中文的资源路径都需要进行 URL 编码
- 使用 `encodeURIComponent()` 处理路径
- 保持 `/` 不被编码以维持路径结构

---

## 问题解决流程图

```
用户反馈问题
    │
    ▼
确认问题现象
    │
    ▼
定位问题位置（组件/工具函数/配置）
    │
    ▼
分析根本原因
    │
    ▼
制定解决方案
    │
    ▼
实施修复
    │
    ▼
验证修复效果
    │
    ▼
记录问题与解决方案
```

---

## 最佳实践总结

### 1. 路径处理
- 始终使用完整路径
- 中文路径需要URL编码
- 避免硬编码路径

### 2. 布局设计
- 使用 `max-width`/`max-height` 约束图片
- 容器高度使用 `calc()` 动态计算
- 考虑响应式断点

### 3. 交互逻辑
- 使用计数器+定时器实现双击检测
- 拖动时记录相对位置
- 触摸事件需要区分单指和双指

### 4. 数据加载
- 使用API动态获取数据
- 支持多种文件格式
- 不要依赖固定文件名

### 5. 移动端适配
- 使用响应式设计
- 实现触摸手势支持
- 移动端使用抽屉式菜单

### 6. 部署与环境
- 配置正确的 Vite `base` 路径
- 将动态数据静态化（预生成 JSON）
- 使用环境变量适配不同环境
- 中文路径需要 URL 编码
- 部署前验证构建是否成功

---

## 后续改进计划

| 改进项 | 描述 | 优先级 |
|--------|------|--------|
| 图片懒加载 | 提升页面加载性能 | 中 |
| 图片压缩 | 减小文件大小 | 中 |
| 密码管理 | 支持自定义密码 | 低 |
| 主题切换 | 支持深色/浅色模式 | 低 |

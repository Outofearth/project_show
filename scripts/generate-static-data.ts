/**
 * 生成用于 GitHub Pages 的静态项目数据
 * 该脚本会扫描 public 目录并生成 JSON 数据文件
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mkv', '.mov']

const isImageFile = (filename: string): boolean => {
  return IMAGE_EXTENSIONS.some(ext => filename.toLowerCase().endsWith(ext))
}

const isVideoFile = (filename: string): boolean => {
  return VIDEO_EXTENSIONS.some(ext => filename.toLowerCase().endsWith(ext))
}

interface MediaItem {
  name: string
  path: string
  type: 'image' | 'video'
}

interface FolderData {
  name: string
  path: string
  images: { name: string; path: string; type: 'image' }[]
  videos: { name: string; path: string; type: 'video' }[]
  media: MediaItem[]
}

interface ProjectData {
  id: string
  name: string
  folders: FolderData[]
}

const scanFolder = (basePath: string, projectId: string, relativePath: string = ''): FolderData[] => {
  const folders: FolderData[] = []
  const currentPath = path.join(basePath, relativePath)

  if (!fs.existsSync(currentPath)) {
    return folders
  }

  try {
    const files = fs.readdirSync(currentPath)
    const folderNames = files.filter(file => {
      const fullPath = path.join(currentPath, file)
      return fs.statSync(fullPath).isDirectory() && !file.startsWith('.')
    })

    for (const folderName of folderNames) {
      const folderRelativePath = relativePath ? `${relativePath}/${folderName}` : folderName
      const folderFullPath = path.join(basePath, folderRelativePath)

      try {
        const folderFiles = fs.readdirSync(folderFullPath)

        const images = folderFiles
          .filter(file => isImageFile(file))
          .map(file => ({
            name: file,
            path: `${projectId}/${folderRelativePath}/${file}`,
            type: 'image' as const
          }))
          .sort((a, b) => a.name.localeCompare(b.name))

        const videos = folderFiles
          .filter(file => isVideoFile(file))
          .map(file => ({
            name: file,
            path: `${projectId}/${folderRelativePath}/${file}`,
            type: 'video' as const
          }))
          .sort((a, b) => a.name.localeCompare(b.name))

        const media: MediaItem[] = [...images, ...videos]

        if (images.length > 0 || videos.length > 0) {
          folders.push({
            name: folderName,
            path: `${projectId}/${folderRelativePath}`,
            images,
            videos,
            media
          })
        }
      } catch (err) {
        console.error(`Error scanning folder ${folderName}:`, err)
      }
    }

    folders.sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    console.error(`Error reading directory ${currentPath}:`, err)
  }

  return folders
}

const generateStaticData = () => {
  console.log('开始生成静态数据...')

  const projects: ProjectData[] = []
  const publicDir = path.join(__dirname, '..', 'public')

  if (!fs.existsSync(publicDir)) {
    console.error('public 目录不存在')
    process.exit(1)
  }

  const files = fs.readdirSync(publicDir)
  const projectDirs = files.filter(file => {
    const fullPath = path.join(publicDir, file)
    return fs.statSync(fullPath).isDirectory() && file.startsWith('Project')
  })

  for (const projectId of projectDirs) {
    const projectPath = path.join(publicDir, projectId)
    const folders = scanFolder(projectPath, projectId)

    if (folders.length > 0) {
      const displayName = projectId.replace(/^Project\d+-/, '').replace(/-/g, ' ') || projectId
      projects.push({
        id: projectId,
        name: displayName,
        folders
      })
      console.log(`✓ 处理项目: ${displayName} (${folders.length} 个文件夹)`)
    }
  }

  const outputData = {
    generatedAt: new Date().toISOString(),
    projects
  }

  const outputPath = path.join(__dirname, '..', 'public', 'static-data.json')
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8')

  console.log(`\n✅ 静态数据已生成:`)
  console.log(`   文件位置: ${outputPath}`)
  console.log(`   项目数量: ${projects.length}`)
  console.log(`   总文件夹数: ${projects.reduce((sum, p) => sum + p.folders.length, 0)}`)
}

generateStaticData()

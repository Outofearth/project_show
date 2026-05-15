import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'
import path from 'path'

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mkv', '.mov', '.avi', '.flv']

const isImageFile = (filename: string): boolean => {
  const lowerName = filename.toLowerCase()
  return IMAGE_EXTENSIONS.some(ext => lowerName.endsWith(ext))
}

const isVideoFile = (filename: string): boolean => {
  const lowerName = filename.toLowerCase()
  return VIDEO_EXTENSIONS.some(ext => lowerName.endsWith(ext))
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
  subfolders?: FolderData[]
  isMounted?: boolean
}

interface ProjectData {
  id: string
  name: string
  folders: FolderData[]
  isMounted?: boolean
}

const scanFolder = (basePath: string, projectId: string, relativePath: string = '', isMounted: boolean = false): FolderData[] => {
  const folders: FolderData[] = []
  const currentPath = path.join(basePath, relativePath)

  if (!fs.existsSync(currentPath)) {
    return folders
  }

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
        .sort((a: any, b: any) => a.name.localeCompare(b.name))

      const videos = folderFiles
        .filter(file => isVideoFile(file))
        .map(file => ({
          name: file,
          path: `${projectId}/${folderRelativePath}/${file}`,
          type: 'video' as const
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))

      const media: MediaItem[] = [...images, ...videos]

      const subfolders = scanFolder(basePath, projectId, folderRelativePath, isMounted)

      if (images.length > 0 || videos.length > 0 || subfolders.length > 0) {
        folders.push({
          name: folderName,
          path: `${projectId}/${folderRelativePath}`,
          images,
          videos,
          media,
          subfolders: subfolders.length > 0 ? subfolders : undefined,
          isMounted
        })
      }
    } catch {
      continue
    }
  }

  folders.sort((a: any, b: any) => a.name.localeCompare(b.name))
  return folders
}

const scanFolderWithRootImages = (basePath: string, projectId: string, isMounted: boolean = false): FolderData[] => {
  const folders: FolderData[] = []

  if (!fs.existsSync(basePath)) {
    return folders
  }

  const files = fs.readdirSync(basePath)
  const folderNames = files.filter(file => {
    const fullPath = path.join(basePath, file)
    return fs.statSync(fullPath).isDirectory() && !file.startsWith('.')
  })

  const rootImages = files
    .filter(file => isImageFile(file))
    .map(file => ({
      name: file,
      path: `${projectId}/${file}`,
      type: 'image' as const
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  const rootVideos = files
    .filter(file => isVideoFile(file))
    .map(file => ({
      name: file,
      path: `${projectId}/${file}`,
      type: 'video' as const
    }))
    .sort((a: any, b: any) => a.name.localeCompare(b.name))

  const rootMedia: MediaItem[] = [...rootImages, ...rootVideos]

  if (rootImages.length > 0 || rootVideos.length > 0) {
    folders.push({
      name: path.basename(basePath),
      path: `${projectId}/`,
      images: rootImages,
      videos: rootVideos,
      media: rootMedia,
      isMounted
    })
  }

  for (const folderName of folderNames) {
    const folderFullPath = path.join(basePath, folderName)

    try {
      const folderFiles = fs.readdirSync(folderFullPath)

      const images = folderFiles
        .filter(file => isImageFile(file))
        .map(file => ({
          name: file,
          path: `${projectId}/${folderName}/${file}`,
          type: 'image' as const
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))

      const videos = folderFiles
        .filter(file => isVideoFile(file))
        .map(file => ({
          name: file,
          path: `${projectId}/${folderName}/${file}`,
          type: 'video' as const
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))

      const media: MediaItem[] = [...images, ...videos]

      const subfolders = scanFolder(basePath, projectId, folderName, isMounted)

      if (images.length > 0 || videos.length > 0 || subfolders.length > 0) {
        folders.push({
          name: folderName,
          path: `${projectId}/${folderName}`,
          images,
          videos,
          media,
          subfolders: subfolders.length > 0 ? subfolders : undefined,
          isMounted
        })
      }
    } catch {
      continue
    }
  }

  folders.sort((a: any, b: any) => a.name.localeCompare(b.name))
  return folders
}

const mountedFolders: string[] = []

const scanProjects = (): ProjectData[] => {
  const projects: ProjectData[] = []
  const publicDir = path.join(__dirname, 'public')

  if (fs.existsSync(publicDir)) {
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
      }
    }
  }

  for (const mountedPath of mountedFolders) {
    try {
      if (fs.existsSync(mountedPath) && fs.statSync(mountedPath).isDirectory()) {
        const projectId = `mounted_${path.basename(mountedPath)}`
        const folders = scanFolderWithRootImages(mountedPath, projectId, true)

        if (folders.length > 0) {
          projects.push({
            id: projectId,
            name: `📁 ${path.basename(mountedPath)}`,
            folders,
            isMounted: true
          })
        }
      }
    } catch (err) {
      console.error('Error scanning mounted folder:', err)
      continue
    }
  }

  projects.sort((a: any, b: any) => a.name.localeCompare(b.name))
  return projects
}

const apiPlugin = () => {
  return {
    name: 'api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/scan') {
          const projects = scanProjects()
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(projects))
          return
        }

        if (req.url?.startsWith('/api/text/')) {
          const encodedFolderPath = req.url.replace('/api/text/', '')
          let folderPath: string
          try {
            folderPath = decodeURIComponent(encodedFolderPath)
          } catch {
            folderPath = encodedFolderPath
          }

          let fullPath = path.join(__dirname, 'public', folderPath)

          if (!fs.existsSync(fullPath)) {
            for (const mountedPath of mountedFolders) {
              const relativePath = folderPath.replace(/^mounted_[\w-]+\/?/, '')
              const testPath = path.join(mountedPath, relativePath)
              if (fs.existsSync(testPath)) {
                fullPath = testPath
                break
              }
            }
          }

          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            const files = fs.readdirSync(fullPath)
            const textFiles = files.filter(file => {
              const lowerName = file.toLowerCase()
              return lowerName.endsWith('.txt') || lowerName.endsWith('.md')
            })

            if (textFiles.length > 0) {
              const textFilePath = path.join(fullPath, textFiles[0])
              const content = fs.readFileSync(textFilePath, 'utf-8')
              res.writeHead(200, { 'Content-Type': 'text/plain' })
              res.end(content)
              return
            }
          }

          res.writeHead(200, { 'Content-Type': 'text/plain' })
          res.end('')
          return
        }

        if (req.url === '/api/mount') {
          const body = await new Promise<string>((resolve) => {
            let data = ''
            req.on('data', (chunk: Buffer) => {
              data += chunk.toString()
            })
            req.on('end', () => {
              resolve(data)
            })
          })

          try {
            const jsonData = JSON.parse(body)
            const folderPath = jsonData.path

            if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
              if (!mountedFolders.includes(folderPath)) {
                mountedFolders.push(folderPath)
              }
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: true, message: '挂载成功' }))
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, message: '文件夹不存在或无法访问' }))
            }
          } catch {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, message: '请求格式错误' }))
          }
          return
        }

        if (req.url === '/api/unmount') {
          const body = await new Promise<string>((resolve) => {
            let data = ''
            req.on('data', (chunk: Buffer) => {
              data += chunk.toString()
            })
            req.on('end', () => {
              resolve(data)
            })
          })

          try {
            const jsonData = JSON.parse(body)
            const folderPath = jsonData.path
            const index = mountedFolders.indexOf(folderPath)
            if (index !== -1) {
              mountedFolders.splice(index, 1)
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, message: '卸载成功' }))
          } catch {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, message: '请求格式错误' }))
          }
          return
        }

        if (req.url === '/api/mounted') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(mountedFolders))
          return
        }

        if (req.url?.startsWith('/mounted/')) {
          let encodedRelativePath = req.url.replace('/mounted/', '')
          
          const queryIndex = encodedRelativePath.indexOf('?')
          if (queryIndex !== -1) {
            encodedRelativePath = encodedRelativePath.substring(0, queryIndex)
          }
          
          let relativePath: string
          try {
            relativePath = decodeURIComponent(encodedRelativePath)
          } catch {
            relativePath = encodedRelativePath
          }
          
          let foundPath = ''

          for (const mountedPath of mountedFolders) {
            const testPath = path.join(mountedPath, relativePath)
            if (fs.existsSync(testPath)) {
              foundPath = testPath
              break
            }
          }

          if (foundPath) {
            const stats = fs.statSync(foundPath)
            if (stats.isFile()) {
              const ext = path.extname(foundPath).toLowerCase()
              let contentType = 'application/octet-stream'

              if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
              else if (ext === '.png') contentType = 'image/png'
              else if (ext === '.gif') contentType = 'image/gif'
              else if (ext === '.webp') contentType = 'image/webp'
              else if (ext === '.svg') contentType = 'image/svg+xml'
              else if (ext === '.mp4') contentType = 'video/mp4'
              else if (ext === '.webm') contentType = 'video/webm'
              else if (ext === '.ogg') contentType = 'video/ogg'
              else if (ext === '.mkv') contentType = 'video/x-matroska'
              else if (ext === '.mov') contentType = 'video/quicktime'
              else if (ext === '.avi') contentType = 'video/x-msvideo'
              else if (ext === '.flv') contentType = 'video/x-flv'

              const range = req.headers.range
              const fileSize = stats.size

              if (range && (ext.startsWith('.mp4') || ext.startsWith('.webm') || ext.startsWith('.ogg') || ext.startsWith('.mkv') || ext.startsWith('.mov'))) {
                const parts = range.replace(/bytes=/, '').split('-')
                const start = parseInt(parts[0], 10)
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
                const chunksize = (end - start) + 1
                const file = fs.createReadStream(foundPath, { start, end })
                const head = {
                  'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                  'Accept-Ranges': 'bytes',
                  'Content-Length': chunksize,
                  'Content-Type': contentType,
                }
                res.writeHead(206, head)
                file.pipe(res)
              } else {
                const content = fs.readFileSync(foundPath)
                res.writeHead(200, {
                  'Content-Type': contentType,
                  'Content-Length': stats.size
                })
                res.end(content)
              }
              return
            }
          }

          res.writeHead(404)
          res.end()
          return
        }

        next()
      })
    }
  }
}

export default defineConfig({
  base: '/project_show/',
  plugins: [vue(), apiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5175,
    host: true
  },
  build: {
    outDir: 'dist'
  }
})
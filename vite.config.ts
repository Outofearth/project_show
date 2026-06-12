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

        if (req.url === '/api/test-projects' || req.url === '/project_show/api/test-projects') {
          const publicDir = path.join(__dirname, 'public')
          const projects = fs.existsSync(publicDir) 
            ? fs.readdirSync(publicDir).filter(f => fs.statSync(path.join(publicDir, f)).isDirectory())
            : []
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ 
            success: true, 
            publicDir: publicDir,
            exists: fs.existsSync(publicDir),
            projects: projects 
          }))
          return
        }

        if (req.url === '/api/upload' || req.url === '/project_show/api/upload') {
          if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, message: '不支持的请求方法' }))
            return
          }

          const boundary = req.headers['content-type']?.split('boundary=')[1]
          if (!boundary) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, message: '缺少边界标识' }))
            return
          }

          const bodyBuffer = await new Promise<Buffer>((resolve) => {
            const chunks: Buffer[] = []
            req.on('data', (chunk: Buffer) => {
              chunks.push(chunk)
            })
            req.on('end', () => {
              resolve(Buffer.concat(chunks))
            })
          })

          try {
            let projectId = ''
            let folderPath = ''
            const files: { filename: string; content: Buffer }[] = []

            const boundaryBuffer = Buffer.from(`--${boundary}`)
            const crlfCrlf = Buffer.from('\r\n\r\n')

            let start = 0
            while (start < bodyBuffer.length) {
              const boundaryIndex = bodyBuffer.indexOf(boundaryBuffer, start)
              if (boundaryIndex === -1) break

              start = boundaryIndex + boundaryBuffer.length

              const headerEndIndex = bodyBuffer.indexOf(crlfCrlf, start)
              if (headerEndIndex === -1) break

              const headerBuffer = bodyBuffer.slice(start, headerEndIndex)
              const header = headerBuffer.toString('utf-8')

              start = headerEndIndex + crlfCrlf.length

              const nextBoundaryIndex = bodyBuffer.indexOf(boundaryBuffer, start)
              if (nextBoundaryIndex === -1) break

              let contentEndIndex = nextBoundaryIndex - 2
              if (bodyBuffer[contentEndIndex] === 0x0a && bodyBuffer[contentEndIndex - 1] === 0x0d) {
                contentEndIndex -= 2
              }

              const contentBuffer = bodyBuffer.slice(start, contentEndIndex)

              const filenameMatch = header.match(/filename="([^"]+)"/)
              const nameMatch = header.match(/name="([^"]+)"/)

              if (nameMatch && nameMatch[1] === 'projectId') {
                projectId = decodeURIComponent(contentBuffer.toString('utf-8').trim())
              } else if (nameMatch && nameMatch[1] === 'folderPath') {
                folderPath = decodeURIComponent(contentBuffer.toString('utf-8').trim())
              } else if (filenameMatch) {
                const filename = filenameMatch[1]
                files.push({
                  filename,
                  content: contentBuffer
                })
              }

              start = nextBoundaryIndex
            }

            console.log('Received projectId:', projectId)
            console.log('Received folderPath:', folderPath)
            console.log('Number of files:', files.length)

            if (!projectId) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, message: '缺少项目ID' }))
              return
            }

            if (files.length === 0) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, message: '没有上传文件' }))
              return
            }

            const publicDir = path.join(__dirname, 'public')
            const projectPath = path.join(publicDir, projectId)
            
            console.log('Checking project path:', projectPath)
            console.log('Path exists:', fs.existsSync(projectPath))
            
            if (!fs.existsSync(projectPath)) {
              const availableProjects = fs.existsSync(publicDir) 
                ? fs.readdirSync(publicDir).filter(f => fs.statSync(path.join(publicDir, f)).isDirectory())
                : []
              
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ 
                success: false, 
                message: '项目目录不存在',
                projectId: projectId,
                projectPath: projectPath,
                availableProjects: availableProjects
              }))
              return
            }

            let targetPath = projectPath

            if (folderPath && folderPath.trim && folderPath.trim().length > 0) {
              const cleanFolderPath = folderPath.trim()
              const folderName = cleanFolderPath.split('/').pop() || cleanFolderPath
              const possiblePaths = [
                path.join(projectPath, cleanFolderPath),
                path.join(projectPath, folderName)
              ]
              
              let foundPath = ''
              for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                  foundPath = p
                  break
                }
              }
              
              if (!foundPath) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, message: '指定的文件夹不存在' }))
                return
              }
              
              targetPath = foundPath
            } else {
              const date = new Date()
              const dateFolderName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
              targetPath = path.join(projectPath, dateFolderName)
              if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath, { recursive: true })
              }
            }

            let uploadedCount = 0
            for (const file of files) {
              const filePath = path.join(targetPath, file.filename)
              fs.writeFileSync(filePath, file.content)
              uploadedCount++
            }

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, message: `成功上传 ${uploadedCount} 个文件`, count: uploadedCount }))
            return
          } catch (error: unknown) {
            console.error('上传文件失败:', error)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            const errorMsg = error instanceof Error ? error.message : String(error)
            res.end(JSON.stringify({ success: false, message: '上传失败: ' + errorMsg }))
            return
          }
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
  base: './',
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
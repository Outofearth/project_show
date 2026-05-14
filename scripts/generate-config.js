const fs = require('fs')
const path = require('path')

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

const isImageFile = (filename) => {
  const lowerName = filename.toLowerCase()
  return IMAGE_EXTENSIONS.some(ext => lowerName.endsWith(ext))
}

const scanProjects = () => {
  const projects = []
  const publicDir = path.join(__dirname, '..', 'public')
  
  if (!fs.existsSync(publicDir)) {
    console.log('public directory not found')
    return projects
  }
  
  const files = fs.readdirSync(publicDir)
  const projectDirs = files.filter(file => {
    const fullPath = path.join(publicDir, file)
    return fs.statSync(fullPath).isDirectory() && file.startsWith('Project')
  })
  
  for (const projectId of projectDirs) {
    const projectPath = path.join(publicDir, projectId)
    const projectFiles = fs.readdirSync(projectPath)
    const folderNames = projectFiles.filter(file => {
      const fullPath = path.join(projectPath, file)
      return fs.statSync(fullPath).isDirectory() && !file.startsWith('.')
    })
    
    const folders = []
    for (const folderName of folderNames) {
      const folderPath = path.join(projectPath, folderName)
      const folderFiles = fs.readdirSync(folderPath)
      
      const images = folderFiles
        .filter(file => isImageFile(file))
        .map(file => ({
          name: file,
          path: `${projectId}/${folderName}/${file}`
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
      
      if (images.length > 0) {
        folders.push({
          name: folderName,
          images
        })
      }
    }
    
    folders.sort((a, b) => a.name.localeCompare(b.name))
    
    if (folders.length > 0) {
      const displayName = projectId.replace(/^Project\d+-/, '').replace(/-/g, ' ') || projectId
      projects.push({
        id: projectId,
        name: displayName,
        folders
      })
    }
  }
  
  projects.sort((a, b) => a.name.localeCompare(b.name))
  return projects
}

const generateConfig = () => {
  const projects = scanProjects()
  
  const configContent = `export interface ImageItem {
  name: string
  path: string
}

export interface FolderItem {
  name: string
  images: ImageItem[]
}

export interface ProjectItem {
  id: string
  name: string
  folders: FolderItem[]
}

export const projects: ProjectItem[] = ${JSON.stringify(projects, null, 2)}

export const AUTHORIZATION_CODE = 'design2024'
`
  
  const configPath = path.join(__dirname, '..', 'src', 'data', 'projects.ts')
  fs.writeFileSync(configPath, configContent)
  
  console.log(`Generated config with ${projects.length} projects`)
}

generateConfig()

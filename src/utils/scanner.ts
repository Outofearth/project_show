export interface MediaItem {
  name: string
  path: string
  type: 'image' | 'video'
}

export interface ImageItem extends MediaItem {
  type: 'image'
}

export interface VideoItem extends MediaItem {
  type: 'video'
}

export interface FolderItem {
  name: string
  path: string
  images: ImageItem[]
  videos: VideoItem[]
  media: MediaItem[]
  subfolders?: FolderItem[]
  isMounted?: boolean
  textContent?: string
}

export interface ProjectItem {
  id: string
  name: string
  folders: FolderItem[]
  isMounted?: boolean
}

export const scanProjects = async (): Promise<ProjectItem[]> => {
  try {
    const response = await fetch('/api/scan')
    if (response.ok) {
      const data = await response.json()
      return data as ProjectItem[]
    }
  } catch (error) {
    console.error('扫描项目失败:', error)
  }
  return []
}

export const loadTextFile = async (folderPath: string): Promise<string> => {
  try {
    const encodedPath = encodeURIComponent(folderPath)
    const response = await fetch(`/api/text/${encodedPath}`)
    if (response.ok) {
      return await response.text()
    }
  } catch (error) {
    console.error('加载文本文件失败:', error)
  }
  return ''
}

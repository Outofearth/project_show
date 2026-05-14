/**
 * 静态数据加载工具
 * 用于 GitHub Pages 等纯静态环境下的数据加载
 */

export interface StaticMediaItem {
  name: string
  path: string
  type: 'image' | 'video'
}

export interface StaticFolderData {
  name: string
  path: string
  images: { name: string; path: string; type: 'image' }[]
  videos: { name: string; path: string; type: 'video' }[]
  media: StaticMediaItem[]
}

export interface StaticProjectData {
  id: string
  name: string
  folders: StaticFolderData[]
}

export interface StaticDataResponse {
  generatedAt: string
  projects: StaticProjectData[]
}

/**
 * 检测是否在 GitHub Pages 静态环境运行
 */
const isStaticEnvironment = (): boolean => {
  return window.location.hostname === 'localhost' === false &&
         !window.location.hostname.includes('127.0.0.1') &&
         (window.location.protocol === 'https:' || 
          (window.location.hostname !== 'localhost' && window.location.port === '')) ||
         import.meta.env.MODE === 'production'
}

/**
 * 从静态 JSON 文件加载数据
 */
export const loadStaticData = async (): Promise<StaticProjectData[]> => {
  try {
    const response = await fetch('/project_show/static-data.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: StaticDataResponse = await response.json()
    console.log('✅ 已加载静态数据，生成时间:', data.generatedAt)
    return data.projects
  } catch (error) {
    console.error('加载静态数据失败:', error)
    return []
  }
}

/**
 * 判断当前环境是否应该使用静态数据
 */
export const shouldUseStaticData = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const isProduction = import.meta.env.PROD
  
  return isProduction || isStaticEnvironment()
}

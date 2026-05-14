<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Image as ImageIcon, RefreshCw, Menu, X, FolderPlus } from 'lucide-vue-next'
import ProjectTabs from './components/ProjectTabs.vue'
import FolderIndex from './components/FolderIndex.vue'
import ImageGallery from './components/ImageGallery.vue'
import UnlockModal from './components/UnlockModal.vue'
import MountDialog from './components/MountDialog.vue'
import { projects as defaultProjects, type ProjectItem } from './data/projects'
import { scanProjects, type FolderItem } from './utils/scanner'
import { loadStaticData, shouldUseStaticData } from './utils/static-data'

const projects = ref<ProjectItem[]>([])
const isLoading = ref(false)
const activeProjectId = ref('')
const activeFolderPath = ref<string | null>(null)
const isUnlocked = ref(false)
const showUnlockModal = ref(false)
const showMobileMenu = ref(false)
const showMountDialog = ref(false)
const isStaticMode = ref(false)

const currentProject = computed(() => {
  return projects.value.find(p => p.id === activeProjectId.value) || null
})

const findFolderByPath = (folders: FolderItem[], path: string): FolderItem | null => {
  for (const folder of folders) {
    if (folder.path === path) {
      return folder
    }
    if (folder.subfolders) {
      const found = findFolderByPath(folder.subfolders, path)
      if (found) return found
    }
  }
  return null
}

const currentFolder = computed(() => {
  if (!currentProject.value || !activeFolderPath.value) return null
  return findFolderByPath(currentProject.value.folders, activeFolderPath.value) || null
})

const handleSelectProject = (projectId: string) => {
  activeProjectId.value = projectId
  activeFolderPath.value = null
}

const handleSelectFolder = (folderPath: string) => {
  activeFolderPath.value = folderPath
  showMobileMenu.value = false
}

const handleRequestUnlock = () => {
  showUnlockModal.value = true
}

const handleUnlock = () => {
  isUnlocked.value = true
  showUnlockModal.value = false
}

const loadProjects = async () => {
  isLoading.value = true
  try {
    if (shouldUseStaticData()) {
      console.log('📦 使用静态数据模式（GitHub Pages）')
      const staticProjects = await loadStaticData()
      isStaticMode.value = true
      
      if (staticProjects.length > 0) {
        projects.value = staticProjects as any
      } else {
        projects.value = defaultProjects
        console.warn('⚠️ 静态数据为空，使用默认项目')
      }
    } else {
      console.log('🔧 使用动态扫描模式（本地开发）')
      const scannedProjects = await scanProjects()
      
      if (scannedProjects.length > 0) {
        projects.value = scannedProjects
      } else {
        projects.value = defaultProjects
      }
    }

    if (projects.value.length > 0 && !activeProjectId.value) {
      activeProjectId.value = projects.value[0].id
    }
    
    console.log(`✅ 已加载 ${projects.value.length} 个项目`)
  } catch (error) {
    console.error('加载项目失败:', error)
    projects.value = defaultProjects
    
    if (projects.value.length > 0 && !activeProjectId.value) {
      activeProjectId.value = projects.value[0].id
    }
  } finally {
    isLoading.value = false
  }
}

const handleMount = () => {
  showMountDialog.value = false
  loadProjects()
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

onMounted(() => {
  loadProjects()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
    <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-screen-2xl mx-auto px-4 py-3 sm:py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              @click="toggleMobileMenu"
              class="lg:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg mr-2"
            >
              <Menu v-if="!showMobileMenu" class="w-6 h-6" />
              <X v-else class="w-6 h-6" />
            </button>
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <ImageIcon class="w-6 h-6 text-white" />
            </div>
            <div class="hidden sm:block">
              <h1 class="text-lg sm:text-xl font-bold text-gray-800">AI设计作品集</h1>
              <p class="text-xs sm:text-sm text-gray-500">展示AI生成的创意设计作品</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              v-if="!isStaticMode"
              @click="showMountDialog = true"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="挂载外部文件夹"
            >
              <FolderPlus class="w-4 h-4" />
              <span class="hidden sm:inline">挂载</span>
            </button>
            <button
              @click="loadProjects"
              :disabled="isLoading"
              class="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw :class="['w-4 h-4', isLoading ? 'animate-spin' : '']" />
              <span class="hidden sm:inline">{{ isLoading ? '加载中...' : '刷新' }}</span>
            </button>
          </div>
        </div>
        
        <div class="mt-3 sm:mt-4">
          <ProjectTabs 
            :projects="projects" 
            :active-project-id="activeProjectId"
            @select="handleSelectProject"
          />
        </div>
      </div>
    </header>

    <div class="lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity" :class="showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'" @click="showMobileMenu = false"></div>
    
    <div class="flex-1 flex flex-col lg:flex-row min-h-0 max-w-[100vw] overflow-hidden">
      <aside 
        class="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform lg:transform-none lg:w-64 lg:flex-shrink-0"
        :class="showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      >
        <div class="p-4 h-full overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <span class="font-semibold text-gray-700">分类目录</span>
            <button @click="showMobileMenu = false" class="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <X class="w-5 h-5" />
            </button>
          </div>
          <FolderIndex 
            :folders="currentProject?.folders || []"
            :active-folder-path="activeFolderPath"
            @select="handleSelectFolder"
          />
        </div>
      </aside>

      <main class="flex-1 p-4 sm:p-6 lg:p-6 overflow-hidden">
        <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
          <div class="text-center">
            <RefreshCw class="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
            <p class="text-gray-500">正在扫描项目...</p>
          </div>
        </div>
        
        <div v-else class="w-full max-w-full">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full overflow-hidden" style="height: calc(100vh - 200px);">
            <ImageGallery 
              :folder="currentFolder"
              :is-unlocked="isUnlocked"
              @request-unlock="handleRequestUnlock"
            />
          </div>
        </div>
      </main>
    </div>

    <UnlockModal 
      :visible="showUnlockModal"
      @close="showUnlockModal = false"
      @unlock="handleUnlock"
    />
    
    <MountDialog 
      v-if="showMountDialog"
      @mount="handleMount"
      @close="showMountDialog = false"
    />
  </div>
</template>

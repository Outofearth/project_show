<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Upload, X, Image as ImageIcon, ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { ProjectItem } from '../data/projects'
import type { FolderItem } from '../utils/scanner'

const props = defineProps<{
  projects: ProjectItem[]
}>()

const emit = defineEmits<{
  (e: 'upload', projectId: string, folderPath: string, files: File[]): void
  (e: 'close'): void
}>()

const showUploader = ref(false)
const selectedProjectId = ref('')
const selectedFolderPath = ref('')
const selectedFiles = ref<File[]>([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const expandedFolders = ref<Set<string>>(new Set())
const fileInput = ref<HTMLInputElement | null>(null)

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

const filteredProjects = computed(() => {
  return props.projects.filter(p => !p.isMounted)
})

const currentProject = computed(() => {
  return props.projects.find(p => p.id === selectedProjectId.value)
})

const isValidImage = (file: File): boolean => {
  const lowerName = file.name.toLowerCase()
  return imageExtensions.some(ext => lowerName.endsWith(ext))
}

const getObjectUrl = (file: File): string => {
  return URL.createObjectURL(file)
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  
  const files = Array.from(input.files)
  const validFiles = files.filter(isValidImage)
  
  selectedFiles.value = [...selectedFiles.value, ...validFiles]
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const toggleFolder = (folderPath: string) => {
  if (expandedFolders.value.has(folderPath)) {
    expandedFolders.value.delete(folderPath)
  } else {
    expandedFolders.value.add(folderPath)
  }
}

const selectFolder = (folderPath: string) => {
  selectedFolderPath.value = folderPath
}

const handleUpload = async () => {
  if (!selectedProjectId.value || selectedFiles.value.length === 0) return
  
  isUploading.value = true
  uploadProgress.value = 0
  
  try {
    const formData = new FormData()
    formData.append('projectId', selectedProjectId.value)
    formData.append('folderPath', selectedFolderPath.value)
    
    selectedFiles.value.forEach(file => {
      formData.append('files', file)
    })
    
    const apiUrl = import.meta.env.BASE_URL ? `${import.meta.env.BASE_URL}api/upload` : '/api/upload'
    console.log('API URL:', apiUrl)
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    if (result.success) {
      uploadProgress.value = 100
      await new Promise(resolve => setTimeout(resolve, 500))
      emit('upload', selectedProjectId.value, selectedFolderPath.value, selectedFiles.value)
    } else {
      alert(result.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    selectedFiles.value = []
    selectedProjectId.value = ''
    selectedFolderPath.value = ''
    showUploader.value = false
  }
}

const openUploader = () => {
  if (filteredProjects.value.length > 0) {
    selectedProjectId.value = filteredProjects.value[0].id
  }
  expandedFolders.value.clear()
  showUploader.value = true
}

watch(selectedProjectId, () => {
  selectedFolderPath.value = ''
})

const renderFolders = (folders: FolderItem[], depth: number = 0): string => {
  let html = ''
  for (const folder of folders) {
    const isExpanded = expandedFolders.value.has(folder.path)
    const isSelected = selectedFolderPath.value === folder.path
    const padding = depth * 16
    
    html += `
      <div style="padding-left: ${padding}px;" class="folder-item">
        <div 
          class="flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors w-full ${isSelected ? 'bg-purple-50' : ''}"
          @click="selectFolder('${folder.path}')"
        >
          <button 
            class="w-6 h-6 flex items-center justify-center"
            @click.stop="toggleFolder('${folder.path}')"
          >
            ${folder.subfolders && folder.subfolders.length > 0 ? (
              isExpanded ? 
                '<ChevronDown class="w-4 h-4 text-gray-400" />' : 
                '<ChevronRight class="w-4 h-4 text-gray-400" />'
            ) : '<span class="w-4 h-4"></span>'}
          </button>
          <span class="text-sm text-gray-700 flex-1 truncate">${folder.name}</span>
          <span class="text-xs text-gray-400">${folder.media?.length || folder.images?.length || 0}</span>
        </div>
      </div>
    `
    
    if (isExpanded && folder.subfolders && folder.subfolders.length > 0) {
      html += renderFolders(folder.subfolders, depth + 1)
    }
  }
  return html
}
</script>

<template>
  <div>
    <button
      @click="openUploader"
      class="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-transform"
      title="上传图片"
    >
      <Upload class="w-6 h-6" />
    </button>

    <Transition name="fade">
      <div
        v-if="showUploader"
        class="fixed inset-0 z-50 bg-black/50 flex items-end"
        @click.self="showUploader = false"
      >
        <div class="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold text-gray-800">上传图片</h3>
            <button
              @click="showUploader = false"
              class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择项目</label>
            <select
              v-model="selectedProjectId"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="" disabled>请选择项目</option>
              <option
                v-for="project in filteredProjects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              选择文件夹
              <span class="text-gray-400 font-normal">(可选，默认创建日期文件夹)</span>
            </label>
            <div
              v-if="currentProject && currentProject.folders && currentProject.folders.length > 0"
              class="border border-gray-200 rounded-lg max-h-48 overflow-y-auto"
            >
              <div
                class="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                :class="{ 'bg-purple-50': selectedFolderPath === '' }"
                @click="selectedFolderPath = ''"
              >
                <span class="text-sm text-gray-600">📁 自动创建日期文件夹</span>
              </div>
              <div 
                v-for="folder in (currentProject?.folders || [])" 
                :key="folder.path"
                class="folder-tree"
              >
                <div 
                  class="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors w-full"
                  :class="{ 'bg-purple-50': selectedFolderPath === folder.path }"
                  @click="selectFolder(folder.path)"
                >
                  <button 
                    class="w-6 h-6 flex items-center justify-center"
                    @click.stop="toggleFolder(folder.path)"
                  >
                    <ChevronDown v-if="folder.subfolders?.length && expandedFolders.has(folder.path)" class="w-4 h-4 text-gray-400" />
                    <ChevronRight v-else-if="folder.subfolders?.length" class="w-4 h-4 text-gray-400" />
                    <span v-else class="w-4"></span>
                  </button>
                  <span class="text-sm text-gray-700 flex-1 truncate">{{ folder.name }}</span>
                  <span class="text-xs text-gray-400">{{ folder.media?.length || folder.images?.length || 0 }}</span>
                </div>
                <Transition name="expand">
                  <div v-if="expandedFolders.has(folder.path) && folder.subfolders?.length" class="pl-6">
                    <div 
                      v-for="subfolder in folder.subfolders" 
                      :key="subfolder.path"
                      class="flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors w-full"
                      :class="{ 'bg-purple-50': selectedFolderPath === subfolder.path }"
                      @click="selectFolder(subfolder.path)"
                    >
                      <button 
                        class="w-6 h-6 flex items-center justify-center"
                        @click.stop="toggleFolder(subfolder.path)"
                      >
                        <ChevronDown v-if="subfolder.subfolders?.length && expandedFolders.has(subfolder.path)" class="w-4 h-4 text-gray-400" />
                        <ChevronRight v-else-if="subfolder.subfolders?.length" class="w-4 h-4 text-gray-400" />
                        <span v-else class="w-4"></span>
                      </button>
                      <span class="text-sm text-gray-600 flex-1 truncate">{{ subfolder.name }}</span>
                      <span class="text-xs text-gray-400">{{ subfolder.media?.length || subfolder.images?.length || 0 }}</span>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400 px-3 py-2">
              该项目暂无文件夹
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择图片</label>
            <div
              class="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-purple-300 transition-colors cursor-pointer"
              @click="fileInput?.click()"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
                id="image-upload-input"
              />
              <ImageIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-600">点击或拖拽图片到此处</p>
              <p class="text-gray-400 text-sm mt-1">支持 JPG、PNG、GIF、WebP 格式</p>
            </div>
          </div>

          <div v-if="selectedFiles.length > 0" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">已选择 {{ selectedFiles.length }} 张图片</label>
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  :src="getObjectUrl(file)"
                  :alt="file.name"
                  class="w-full h-full object-cover"
                />
                <button
                  @click="removeFile(index)"
                  class="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center"
                >
                  <X class="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="isUploading" class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600">上传中...</span>
              <span class="text-sm text-purple-600">{{ Math.round(uploadProgress) }}%</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
          </div>

          <button
            @click="handleUpload"
            :disabled="!selectedProjectId || selectedFiles.length === 0 || isUploading"
            class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload class="w-5 h-5" />
            <span>上传图片</span>
          </button>

          <button
            @click="showUploader = false"
            class="w-full py-3 mt-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
}
</style>

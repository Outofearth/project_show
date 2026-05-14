<script setup lang="ts">
import { ref } from 'vue'
import { X, FolderPlus, AlertCircle, CheckCircle } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'mount', path: string): void
  (e: 'close'): void
}>()

const folderPath = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const mountedFolders = ref<string[]>([])

const loadMountedFolders = async () => {
  try {
    const response = await fetch('/api/mounted')
    const data = await response.json()
    mountedFolders.value = data || []
  } catch {
    mountedFolders.value = []
  }
}

const handleMount = async () => {
  if (!folderPath.value || !folderPath.value.trim()) {
    errorMessage.value = '请输入文件夹路径'
    successMessage.value = ''
    return
  }

  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch('/api/mount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: folderPath.value.trim() })
    })

    const data = await response.json()

    if (data.success) {
      successMessage.value = '挂载成功！项目列表已自动刷新'
      emit('mount', folderPath.value.trim())
      folderPath.value = ''
      loadMountedFolders()
    } else {
      errorMessage.value = data.message || '挂载失败'
    }
  } catch (error) {
    errorMessage.value = '网络错误，请检查后端服务'
  } finally {
    isLoading.value = false
  }
}

const handleUnmount = async (path: string) => {
  try {
    const response = await fetch('/api/unmount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path })
    })

    const data = await response.json()
    if (data.success) {
      loadMountedFolders()
      emit('mount', '')
    }
  } catch {
    console.error('Unmount failed')
  }
}

loadMountedFolders()
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <FolderPlus class="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">临时挂载文件夹</h2>
            <p class="text-sm text-gray-500">挂载外部文件夹，重启后失效</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <X class="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div class="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-160px)]">
        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">文件夹路径</label>
          <input
            v-model="folderPath"
            type="text"
            placeholder="请输入文件夹路径，如：C:\Users\用户名\Pictures\相册"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <div class="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <strong>💡 操作说明：</strong>
            <br />直接输入文件夹完整路径（如：<code class="px-1 py-0.5 bg-white rounded">C:\Users\用户名\Pictures\相册</code>）。
            <br />
            <br /><strong>注意：</strong>
            <br />• 现代浏览器出于安全考虑，不允许获取本地文件的完整路径。
            <br />• 系统仅读取路径信息，不会上传或复制任何文件！
          </div>

          <div v-if="successMessage" class="flex items-center gap-2 text-green-500 text-sm">
            <CheckCircle class="w-4 h-4" />
            <span>{{ successMessage }}</span>
          </div>

          <div v-if="errorMessage" class="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle class="w-4 h-4" />
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <div v-if="mountedFolders.length > 0" class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">已挂载的文件夹</label>
          <div class="space-y-2">
            <div
              v-for="path in mountedFolders"
              :key="path"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <span class="text-sm text-gray-700 truncate flex-1">{{ path }}</span>
              <button
                @click="handleUnmount(path)"
                class="px-3 py-1 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-3"
              >
                卸载
              </button>
            </div>
          </div>
        </div>

        <div class="p-3 bg-orange-50 rounded-xl">
          <p class="text-xs text-orange-700">
            <strong>⚠️ 注意：</strong>挂载的文件夹仅在当前会话有效，关闭页面或重启服务器后将自动卸载。
          </p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
        <button
          @click="emit('close')"
          class="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          取消
        </button>
        <button
          @click="handleMount"
          :disabled="isLoading"
          class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isLoading ? '挂载中...' : '挂载' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

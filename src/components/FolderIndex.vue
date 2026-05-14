<script setup lang="ts">
import { Folder, ChevronRight, ChevronDown } from 'lucide-vue-next'
import type { FolderItem } from '../utils/scanner'
import { ref } from 'vue'

defineProps<{
  folders: FolderItem[]
  activeFolderPath: string | null
}>()

const emit = defineEmits<{
  (e: 'select', folderPath: string): void
}>()

const expandedFolders = ref<Set<string>>(new Set())

const toggleExpand = (folderPath: string) => {
  if (expandedFolders.value.has(folderPath)) {
    expandedFolders.value.delete(folderPath)
  } else {
    expandedFolders.value.add(folderPath)
  }
}

const isExpanded = (folderPath: string) => {
  return expandedFolders.value.has(folderPath)
}
</script>

<template>
  <div class="space-y-1">
    <div class="flex items-center gap-2 text-gray-500 text-sm font-medium mb-4">
      <Folder class="w-4 h-4" />
      <span>分类目录</span>
    </div>
    
    <template v-for="folder in folders" :key="folder.path">
      <button
        @click="emit('select', folder.path)"
        :class="[
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
          activeFolderPath === folder.path
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        ]"
      >
        <div class="flex items-center gap-1">
          <button
            v-if="folder.subfolders && folder.subfolders.length > 0"
            @click.stop="toggleExpand(folder.path)"
            class="p-0.5 hover:bg-white/10 rounded"
          >
            <component 
              :is="isExpanded(folder.path) ? ChevronDown : ChevronRight" 
              class="w-4 h-4"
            />
          </button>
          <ChevronRight 
            v-else
            class="w-4 h-4"
          />
        </div>
        <span class="truncate">{{ folder.name }}</span>
        <span 
          :class="[
            'ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0',
            activeFolderPath === folder.path
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 text-gray-500'
          ]"
        >
          {{ folder.media.length }}
        </span>
      </button>
      
      <div 
        v-if="folder.subfolders && folder.subfolders.length > 0 && isExpanded(folder.path)"
        class="ml-4 mt-1 space-y-1"
      >
        <template v-for="subfolder in folder.subfolders" :key="subfolder.path">
          <button
            @click="emit('select', subfolder.path)"
            :class="[
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
              activeFolderPath === subfolder.path
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            ]"
          >
            <div class="flex items-center gap-1">
              <button
                v-if="subfolder.subfolders && subfolder.subfolders.length > 0"
                @click.stop="toggleExpand(subfolder.path)"
                class="p-0.5 hover:bg-white/10 rounded"
              >
                <component 
                  :is="isExpanded(subfolder.path) ? ChevronDown : ChevronRight" 
                  class="w-4 h-4"
                />
              </button>
              <ChevronRight 
                v-else
                class="w-4 h-4"
              />
            </div>
            <span class="truncate">{{ subfolder.name }}</span>
            <span 
              :class="[
                'ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                activeFolderPath === subfolder.path
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-500'
              ]"
            >
              {{ subfolder.media.length }}
            </span>
          </button>
          
          <div 
            v-if="subfolder.subfolders && subfolder.subfolders.length > 0 && isExpanded(subfolder.path)"
            class="ml-4 mt-1 space-y-1"
          >
            <button
              v-for="nestedFolder in subfolder.subfolders"
              :key="nestedFolder.path"
              @click="emit('select', nestedFolder.path)"
              :class="[
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                activeFolderPath === nestedFolder.path
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              ]"
            >
              <ChevronRight class="w-4 h-4" />
              <span class="truncate">{{ nestedFolder.name }}</span>
              <span 
                :class="[
                  'ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                  activeFolderPath === nestedFolder.path
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-500'
                ]"
              >
                {{ nestedFolder.media.length }}
              </span>
            </button>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

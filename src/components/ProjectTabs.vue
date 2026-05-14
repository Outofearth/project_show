<script setup lang="ts">
import { LayoutGrid, HardDrive } from 'lucide-vue-next'
import type { ProjectItem } from '../data/projects'

defineProps<{
  projects: ProjectItem[]
  activeProjectId: string
}>()

const emit = defineEmits<{
  (e: 'select', projectId: string): void
}>()
</script>

<template>
  <div class="flex items-center gap-2 overflow-x-auto pb-2">
    <div class="flex items-center gap-2 text-gray-400 mr-4">
      <LayoutGrid class="w-4 h-4" />
      <span class="text-sm font-medium">Projects</span>
    </div>
    <div class="flex gap-2">
      <button
        v-for="project in projects"
        :key="project.id"
        @click="emit('select', project.id)"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2',
          activeProjectId === project.id
            ? project.isMounted 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        <HardDrive v-if="project.isMounted" class="w-3.5 h-3.5" />
        {{ project.name }}
      </button>
    </div>
  </div>
</template>

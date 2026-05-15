<script setup lang="ts">
import { ref, computed } from 'vue'
import { Lock, X, Key } from 'lucide-vue-next'

const props = defineProps<{
  visible: boolean
  authCode?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'unlock'): void
}>()

const inputCode = ref('')
const errorMessage = ref('')

const authorizationCode = computed(() => props.authCode || 'design2026')

const handleSubmit = () => {
  if (inputCode.value === authorizationCode.value) {
    emit('unlock')
    inputCode.value = ''
    errorMessage.value = ''
  } else {
    errorMessage.value = '授权码不正确，请重试'
    inputCode.value = ''
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSubmit()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="visible" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="emit('close')"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Lock class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-800">解锁内容</h3>
                <p class="text-sm text-gray-500">输入授权码查看图片背后的内容</p>
              </div>
            </div>
            <button 
              @click="emit('close')"
              class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X class="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Key class="w-4 h-4" />
                授权码
              </label>
              <input
                v-model="inputCode"
                @keydown="handleKeydown"
                type="password"
                placeholder="请输入授权码"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none',
                  errorMessage 
                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                    : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
                ]"
              />
              <p v-if="errorMessage" class="mt-2 text-sm text-red-500 flex items-center gap-1">
                <span>✗</span> {{ errorMessage }}
              </p>
            </div>

            <button
              @click="handleSubmit"
              class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200"
            >
              解锁
            </button>

            <p class="text-center text-xs text-gray-400">
              提示：授权码为 <span class="font-mono bg-gray-100 px-2 py-0.5 rounded">design2026</span>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
</style>

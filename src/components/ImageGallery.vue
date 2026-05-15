<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight, Copy, Check, Lock, Unlock, ZoomIn, ZoomOut, RotateCcw, Volume2, VolumeX, Play, Pause, Maximize, RefreshCw } from 'lucide-vue-next'
import type { FolderItem } from '../utils/scanner'
import { loadTextFile } from '../utils/scanner'

const props = defineProps<{
  folder: FolderItem | null
  isUnlocked: boolean
}>()

const emit = defineEmits<{
  (e: 'requestUnlock'): void
}>()

const currentIndex = ref(0)
const copied = ref(false)
const promptContent = ref('')
const showBack = ref(false)
const scale = ref(1)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const touchStart = ref({ x: 0, y: 0, time: 0, distance: 0 })
const touchEnd = ref({ x: 0, y: 0 })
const tapCount = ref(0)
const videoRef = ref<HTMLVideoElement | null>(null)
const progressRef = ref<HTMLInputElement | null>(null)
const isVideoPlaying = ref(false)
const videoVolume = ref(0.1)
const isVideoMuted = ref(false)
const showVideoControls = ref(false)
const videoLoaded = ref(false)
const playbackSpeed = ref(1)
const showSpeedMenu = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isSeeking = ref(false)
const seekProgress = ref(0)
const hasSeeked = ref(false)
let tapTimer: ReturnType<typeof setTimeout> | null = null
let videoControlsTimer: ReturnType<typeof setTimeout> | null = null

const mediaList = computed(() => {
  if (!props.folder) return []
  return [...props.folder.media]
})

const currentMedia = computed(() => {
  if (mediaList.value.length === 0) return null
  return mediaList.value[currentIndex.value]
})

const mediaCount = computed(() => {
  return mediaList.value.length
})

const hasPrompt = computed(() => {
  return props.folder !== null
})

const isVideo = computed(() => {
  return currentMedia.value?.type === 'video'
})

const isGif = computed(() => {
  return currentMedia.value?.type === 'image' && currentMedia.value?.name.toLowerCase().endsWith('.gif')
})

const canDrag = computed(() => {
  return scale.value > 1 && !showBack.value && !isVideo.value
})

const getMediaUrl = (mediaPath: string): string => {
  if (mediaPath.startsWith('mounted_')) {
    const parts = mediaPath.split('/')
    if (parts.length > 1) {
      const relativePath = parts.slice(1).join('/')
      const encodedPath = encodeURIComponent(relativePath).replace(/%2F/g, '/')
      return `/mounted/${encodedPath}`
    }
    return `/mounted/${mediaPath}`
  }
  const base = import.meta.env.GITHUB_PAGES ? '/project_show/' : '/'
  return `${base}${mediaPath}`
}

watch(() => props.folder, () => {
  currentIndex.value = 0
  showBack.value = false
  scale.value = 1
  position.value = { x: 0, y: 0 }
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
    isVideoPlaying.value = false
  }
})

watch(scale, (newScale) => {
  if (newScale <= 1) {
    position.value = { x: 0, y: 0 }
  }
})

watch(currentIndex, () => {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
    isVideoPlaying.value = false
    applyVideoSettings()
  }
})

const loadPromptContent = async () => {
  if (!props.folder) return
  
  if (props.folder.textContent) {
    promptContent.value = props.folder.textContent
    return
  }
  
  try {
    promptContent.value = await loadTextFile(props.folder.path)
  } catch (error) {
    console.error('加载Prompt失败:', error)
    promptContent.value = ''
  }
}

const prevMedia = () => {
  if (mediaCount.value === 0) return
  showBack.value = false
  scale.value = 1
  position.value = { x: 0, y: 0 }
  currentIndex.value = currentIndex.value === 0 ? mediaCount.value - 1 : currentIndex.value - 1
}

const nextMedia = () => {
  if (mediaCount.value === 0) return
  showBack.value = false
  scale.value = 1
  position.value = { x: 0, y: 0 }
  currentIndex.value = currentIndex.value === mediaCount.value - 1 ? 0 : currentIndex.value + 1
}

const toggleVideoPlay = () => {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
    isVideoPlaying.value = true
  } else {
    videoRef.value.pause()
    isVideoPlaying.value = false
  }
}

const handleVideoSeek = (percent: number) => {
  if (!videoRef.value || !videoRef.value.duration) return
  videoRef.value.currentTime = percent * videoRef.value.duration
  currentTime.value = videoRef.value.currentTime
}

const toggleVideoMute = () => {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isVideoMuted.value = videoRef.value.muted
}

const setVideoVolume = (volume: number) => {
  if (!videoRef.value) return
  videoRef.value.volume = Math.max(0, Math.min(1, volume))
  videoVolume.value = videoRef.value.volume
  isVideoMuted.value = videoRef.value.volume === 0
}

const setPlaybackSpeed = (speed: number) => {
  if (!videoRef.value) return
  videoRef.value.playbackRate = speed
  playbackSpeed.value = speed
  showSpeedMenu.value = false
}

const applyVideoSettings = () => {
  if (!videoRef.value) return
  videoRef.value.volume = videoVolume.value
  videoRef.value.playbackRate = playbackSpeed.value
}

const updateVideoTime = () => {
  if (!videoRef.value || isSeeking.value) return
  currentTime.value = videoRef.value.currentTime
  duration.value = videoRef.value.duration || 0
}

const handleDoubleClick = () => {
  if (showBack.value) {
    showBack.value = false
  } else if (isVideo.value) {
    toggleVideoPlay()
  } else if (hasPrompt.value) {
    if (!props.isUnlocked) {
      emit('requestUnlock')
    } else {
      loadPromptContent()
      showBack.value = true
    }
  }
}

const handleSingleTap = () => {
  tapCount.value++
  if (tapTimer) {
    clearTimeout(tapTimer)
  }
  
  if (tapCount.value === 2) {
    handleDoubleClick()
    tapCount.value = 0
  } else {
    tapTimer = setTimeout(() => {
      tapCount.value = 0
    }, 300)
  }
}

const getDistance = (touches: TouchList): number => {
  if (touches.length < 2) return 0
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const handleTouchStart = (e: TouchEvent) => {
  touchStart.value = { 
    x: e.touches[0].clientX, 
    y: e.touches[0].clientY, 
    time: Date.now(),
    distance: getDistance(e.touches)
  }
  
  if (canDrag.value && e.touches.length === 1) {
    isDragging.value = true
    dragStart.value = { x: e.touches[0].clientX - position.value.x, y: e.touches[0].clientY - position.value.y }
  }
}

const handleTouchMove = (e: TouchEvent) => {
  touchEnd.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  
  if (e.touches.length === 2 && !showBack.value && !isVideo.value) {
    const currentDistance = getDistance(e.touches)
    if (touchStart.value.distance > 0) {
      const scaleChange = currentDistance / touchStart.value.distance
      const newScale = Math.max(1, Math.min(3, scale.value * scaleChange))
      scale.value = newScale
    }
    touchStart.value.distance = currentDistance
    return
  }
  
  if (isDragging.value) {
    position.value = {
      x: e.touches[0].clientX - dragStart.value.x,
      y: e.touches[0].clientY - dragStart.value.y
    }
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
  
  const deltaX = touchEnd.value.x - touchStart.value.x
  const deltaY = touchEnd.value.y - touchStart.value.y
  const deltaTime = Date.now() - touchStart.value.time
  
  if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
    handleSingleTap()
  } else if (Math.abs(deltaX) > 50 && deltaTime < 500) {
    if (deltaX > 0) {
      prevMedia()
    } else {
      nextMedia()
    }
  }
}

const handleMouseDown = (e: MouseEvent) => {
  if (canDrag.value && e.button === 0) {
    isDragging.value = true
    dragStart.value = { x: e.clientX - position.value.x, y: e.clientY - position.value.y }
    e.preventDefault()
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    position.value = {
      x: e.clientX - dragStart.value.x,
      y: e.clientY - dragStart.value.y
    }
    e.preventDefault()
  }
  if (isVideo.value && videoRef.value) {
    showVideoControls.value = true
    if (videoControlsTimer) {
      clearTimeout(videoControlsTimer)
    }
    videoControlsTimer = setTimeout(() => {
      if (!videoRef.value?.paused) {
        showVideoControls.value = false
      }
    }, 3000)
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleMouseLeave = () => {
  isDragging.value = false
}

const handleVideoClick = () => {
  toggleVideoPlay()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(promptContent.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    console.error('复制失败')
  }
}

const goToMedia = (index: number) => {
  showBack.value = false
  scale.value = 1
  position.value = { x: 0, y: 0 }
  currentIndex.value = index
}

const handleWheel = (e: WheelEvent) => {
  if (showBack.value || isVideo.value) return
  
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(1, Math.min(3, scale.value + delta))
  scale.value = newScale
  e.preventDefault()
}

const resetZoom = () => {
  scale.value = 1
  position.value = { x: 0, y: 0 }
}

const zoomIn = () => {
  scale.value = Math.min(3, scale.value + 0.2)
}

const zoomOut = () => {
  scale.value = Math.max(1, scale.value - 0.2)
  if (scale.value <= 1) {
    position.value = { x: 0, y: 0 }
  }
}

const toggleFullscreen = () => {
  if (!videoRef.value) return
  
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    videoRef.value.requestFullscreen()
  }
}

let wheelHandler: ((e: WheelEvent) => void) | null = null
let mouseMoveHandler: ((e: MouseEvent) => void) | null = null
let mouseUpHandler: ((e: MouseEvent) => void) | null = null

onMounted(() => {
  wheelHandler = handleWheel
  mouseMoveHandler = handleMouseMove
  mouseUpHandler = handleMouseUp
  document.addEventListener('wheel', wheelHandler, { passive: false })
  document.addEventListener('mousemove', mouseMoveHandler)
  document.addEventListener('mouseup', mouseUpHandler)
})

onUnmounted(() => {
  if (wheelHandler) {
    document.removeEventListener('wheel', wheelHandler)
  }
  if (mouseMoveHandler) {
    document.removeEventListener('mousemove', mouseMoveHandler)
  }
  if (mouseUpHandler) {
    document.removeEventListener('mouseup', mouseUpHandler)
  }
  if (tapTimer) {
    clearTimeout(tapTimer)
  }
  if (videoControlsTimer) {
    clearTimeout(videoControlsTimer)
  }
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<template>
  <div class="h-full flex flex-col">
    <div v-if="!folder" class="flex-1 flex items-center justify-center text-gray-400 p-4">
      <div class="text-center">
        <div class="text-5xl sm:text-6xl mb-4">🖼️</div>
        <p class="text-sm sm:text-base">请选择一个分类查看图片或视频</p>
      </div>
    </div>

    <div v-else class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm sm:text-lg font-semibold text-gray-800 truncate">{{ folder.name }}</h3>
        <div class="flex items-center gap-2">
          <span class="text-xs sm:text-sm text-gray-500">{{ currentIndex + 1 }} / {{ mediaCount }}</span>
          <div 
            :class="[
              'flex items-center gap-1 px-2 py-1 rounded text-xs',
              isUnlocked ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
            ]"
          >
            <Lock v-if="!isUnlocked" class="w-3 h-3" />
            <Unlock v-else class="w-3 h-3" />
            <span class="hidden sm:inline">{{ isUnlocked ? '已解锁' : '已锁定' }}</span>
          </div>
        </div>
      </div>

      <div 
        class="flex-1 relative bg-gray-900 rounded-xl overflow-auto"
      >
        <button
          @click="prevMedia"
          :disabled="mediaCount <= 1"
          class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
        >
          <ChevronLeft class="w-5 h-5 text-white" />
        </button>

        <div 
          v-if="mediaCount > 1 && !isVideo"
          class="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 z-10"
        >
          <button
            @click="zoomOut"
            class="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <ZoomOut class="w-3 h-3" />
          </button>
          <span class="text-white text-xs min-w-[50px] text-center">{{ Math.round(scale * 100) }}%</span>
          <button
            @click="zoomIn"
            class="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <ZoomIn class="w-3 h-3" />
          </button>
          <button
            @click="resetZoom"
            class="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <RotateCcw class="w-3 h-3" />
          </button>
        </div>

        <div 
          v-if="currentMedia"
          @dblclick="handleDoubleClick"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseLeave"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @click="showSpeedMenu = false"
          :class="[
            'min-h-[300px] flex items-center justify-center media-container',
            canDrag && 'cursor-grab active:cursor-grabbing'
          ]"
        >
          <Transition name="fade" mode="out-in">
            <div v-if="!showBack" key="front" class="flex items-center justify-center p-4 relative w-full">
              <template v-if="isVideo">
                <div class="flex flex-col items-center gap-3 w-full">
                  <div class="relative max-w-full max-h-[500px]">
                    <video
                      ref="videoRef"
                      :src="getMediaUrl(currentMedia.path)"
                      class="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
                      preload="metadata"
                      @click="handleVideoClick"
                      @play="isVideoPlaying = true"
                      @pause="isVideoPlaying = false"
                      @volumechange="videoVolume = videoRef?.volume || 0.1"
                      @timeupdate="updateVideoTime"
                      @loadedmetadata="videoLoaded = true; applyVideoSettings(); updateVideoTime()"
                      @loadeddata="videoLoaded = true; applyVideoSettings()"
                    />
                    
                    <div 
                      v-if="!isVideoPlaying && videoLoaded"
                      class="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <button
                        @click.stop="toggleVideoPlay"
                        class="w-20 h-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all duration-200 pointer-events-auto"
                      >
                        <Play class="w-10 h-10 text-white ml-1" />
                      </button>
                    </div>

                    <div v-if="!videoLoaded" class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                      <div class="text-white">
                        <RefreshCw class="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                        <span class="text-sm">加载中...</span>
                      </div>
                    </div>
                  </div>

                  <Transition name="fade">
                    <div 
                      v-if="showVideoControls || !isVideoPlaying"
                      class="w-full max-w-2xl bg-black/80 backdrop-blur-sm rounded-xl p-3"
                    >
                      <div class="flex items-center gap-3">
                        <button
                          @click.stop="toggleVideoPlay"
                          class="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                        >
                          <Pause v-if="isVideoPlaying" class="w-4 h-4" />
                          <Play v-else class="w-4 h-4 ml-0.5" />
                        </button>
                        
                        <span class="text-white text-xs min-w-[60px] text-right">
                          {{ Math.floor(currentTime / 60) }}:{{ String(Math.floor(currentTime % 60)).padStart(2, '0') }}
                          /
                          {{ Math.floor(duration / 60) }}:{{ String(Math.floor(duration % 60)).padStart(2, '0') }}
                        </span>
                        
                        <div class="w-36 h-2">
                          <input
                            ref="progressRef"
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            :value="isSeeking ? seekProgress : (duration > 0 ? (currentTime / duration * 100) : 0)"
                            @mousedown="isSeeking = true; hasSeeked = false"
                            @mouseup="isSeeking = false; if (hasSeeked) { handleVideoSeek(seekProgress / 100); hasSeeked = false }"
                            @mouseleave="isSeeking = false; if (hasSeeked) { handleVideoSeek(seekProgress / 100); hasSeeked = false }"
                            @input="(e) => {
                              seekProgress = Number((e.target as HTMLInputElement).value)
                              hasSeeked = true
                            }"
                            class="w-full h-2 bg-white/30 rounded-full appearance-none cursor-pointer
                                   [&::-webkit-slider-thumb]:appearance-none
                                   [&::-webkit-slider-thumb]:w-4
                                   [&::-webkit-slider-thumb]:h-4
                                   [&::-webkit-slider-thumb]:bg-white
                                   [&::-webkit-slider-thumb]:rounded-full
                                   [&::-webkit-slider-thumb]:shadow-lg
                                   [&::-webkit-slider-runnable-track]:h-2
                                   [&::-webkit-slider-runnable-track]:bg-purple-500
                                   [&::-webkit-slider-runnable-track]:rounded-full
                                   [&::-moz-range-thumb]:w-4
                                   [&::-moz-range-thumb]:h-4
                                   [&::-moz-range-thumb]:bg-white
                                   [&::-moz-range-thumb]:rounded-full
                                   [&::-moz-range-thumb]:border-0
                                   [&::-moz-range-track]:h-2
                                   [&::-moz-range-track]:bg-white/30
                                   [&::-moz-range-track]:rounded-full"
                          />
                        </div>
                        
                        <div class="flex items-center gap-2">
                          <button
                            @click.stop="toggleVideoMute"
                            class="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                          >
                            <VolumeX v-if="isVideoMuted || videoVolume === 0" class="w-3 h-3" />
                            <Volume2 v-else class="w-3 h-3" />
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            :value="videoVolume"
                            @input="(e) => setVideoVolume(Number((e.target as HTMLInputElement).value))"
                            class="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                          />
                          <span class="text-white text-xs w-8">{{ Math.round(videoVolume * 100) }}%</span>
                        </div>
                        
                        <div class="relative">
                          <button
                            @click.stop="showSpeedMenu = !showSpeedMenu"
                            class="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors text-xs font-medium"
                          >
                            {{ playbackSpeed }}x
                          </button>
                          <Transition name="fade">
                            <div 
                              v-if="showSpeedMenu"
                              class="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden"
                              @click.stop
                            >
                              <button
                                v-for="speed in [0.5, 0.75, 1, 1.25, 1.5, 2]"
                                :key="speed"
                                @click="setPlaybackSpeed(speed)"
                                :class="[
                                  'w-full px-3 py-2 text-sm text-left transition-colors',
                                  playbackSpeed === speed ? 'bg-purple-600 text-white' : 'text-white/80 hover:bg-white/10'
                                ]"
                              >
                                {{ speed }}x
                              </button>
                            </div>
                          </Transition>
                        </div>
                        
                        <button
                          @click.stop="toggleFullscreen"
                          class="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                        >
                          <Maximize class="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>
              </template>

              <template v-else>
                <img 
                  :src="getMediaUrl(currentMedia.path)" 
                  :alt="currentMedia.name"
                  :class="[
                    'rounded-lg shadow-lg',
                    isGif ? 'max-h-[500px]' : 'max-h-[500px]'
                  ]"
                  :style="{ 
                    maxWidth: '100%',
                    transform: scale > 1 ? `scale(${scale}) translate(${position.x}px, ${position.y}px)` : 'none',
                    transition: scale > 1 ? 'none' : 'transform 0.1s ease',
                    cursor: canDrag ? 'grab' : 'default'
                  }"
                  draggable="false"
                />
                <div class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs z-10">
                  <span v-if="!hasPrompt">查看图片</span>
                  <span v-else-if="!isUnlocked">双击解锁查看详情</span>
                  <span v-else>双击查看详情</span>
                </div>
              </template>
            </div>

            <div v-else key="back" class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 flex flex-col">
              <div class="flex items-center justify-between mb-3">
                <span class="text-purple-400 text-xs font-medium">Prompt 内容</span>
                <button
                  @click.stop="copyToClipboard"
                  :class="[
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-200',
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  ]"
                >
                  <Check v-if="copied" class="w-3 h-3" />
                  <Copy v-else class="w-3 h-3" />
                  <span>{{ copied ? '已复制' : '复制' }}</span>
                </button>
              </div>
              <div class="flex-1 overflow-auto bg-black/30 rounded-lg p-3">
                <pre class="text-gray-200 text-xs whitespace-pre-wrap font-mono leading-relaxed">{{ promptContent || '加载中...' }}</pre>
              </div>
              <button
                @click.stop="showBack = false"
                class="mt-3 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
              >
                返回
              </button>
            </div>
          </Transition>
        </div>

        <button
          @click="nextMedia"
          :disabled="mediaCount <= 1"
          class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
        >
          <ChevronRight class="w-5 h-5 text-white" />
        </button>
      </div>

      <div v-if="mediaCount > 1" class="mt-3 flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="(media, index) in mediaList"
          :key="media.name"
          @click="goToMedia(index)"
          :class="[
            'flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 relative',
            currentIndex === index 
              ? 'border-purple-500 shadow-lg shadow-purple-500/30' 
              : 'border-transparent hover:border-gray-300'
          ]"
        >
          <img 
            v-if="media.type === 'image'"
            :src="getMediaUrl(media.path)" 
            :alt="media.name"
            class="w-full h-full object-cover"
          />
          <video 
            v-else
            :src="getMediaUrl(media.path)"
            class="w-full h-full object-cover"
            preload="metadata"
            muted
            loop
            playsinline
          />
          <div 
            v-if="media.type === 'video'"
            class="absolute inset-0 flex items-center justify-center bg-black/40"
          >
            <Play class="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </div>
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

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: none;
}
</style>
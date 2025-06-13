<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// Imports das mídias
import DuasMetadesMsc from '@/assets/music/DuasMetadesMsc.mp3'
import DuasMetadesFoto from '@/assets/images/Duas_Metades.jpg'

// Tipos TypeScript
interface HeartElement {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  emoji: string
}

interface FloatingElement {
  id: number
  emoji: string
  x: number
  y: number
  delay: number
}

interface Photo {
  id: number
  url: string
  caption: string
  date: string
  location: string
  effect: string
  story: string
  polaroidStyle: string
}

interface LoveMessage {
  text: string
  category: string
}

interface Section {
  title: string
  subtitle: string
  content: string
  bg: string
  icon: string
  type: string
}

// Estados principais
const gameStarted = ref<boolean>(false)
const currentSection = ref<number>(0)
const hearts = ref<HeartElement[]>([])
const showMessage = ref<boolean>(false)
const currentMessage = ref<string>('')
const userName = ref<string>('Minha Princesa')
const currentPhotoIndex = ref<number>(0)
const showPhotoModal = ref<boolean>(false)
const photoZoom = ref<number>(1)
const photoRotation = ref<number>(0)

// Estados de música
const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref<boolean>(false)
const currentTime = ref<number>(0)
const duration = ref<number>(0)
const isLoading = ref<boolean>(true)
const volume = ref<number>(0.7)
const isLooping = ref<boolean>(true)
const showPlayer = ref<boolean>(false)

// Estados de interação
const touchStartX = ref<number>(0)
const touchStartY = ref<number>(0)
const isDragging = ref<boolean>(false)
const shakingPhotos = ref<Set<number>>(new Set())
const polaroidRotations = ref<Record<number, number>>({})
const floatingElements = ref<FloatingElement[]>([])
const isTransitioning = ref<boolean>(false)

// Seções do app
const sections: Section[] = [
  {
    title: 'Nossos Momentos Mágicos',
    subtitle: 'Polaroids do Coração',
    content: 'Cada foto é uma janela para nossas memórias mais preciosas...',
    bg: 'from-purple-400 via-pink-500 to-red-500',
    icon: '📸',
    type: 'photos'
  },
  {
    title: 'Galeria do Nosso Amor',
    subtitle: 'Coleção de Sorrisos',
    content: 'Uma timeline visual da nossa jornada juntos...',
    bg: 'from-indigo-400 via-purple-500 to-pink-500',
    icon: '🖼️',
    type: 'gallery'
  },
  {
    title: `Para ${userName.value} ❤️`,
    subtitle: 'Meu Amor Infinito',
    content: 'Você é a luz que ilumina meus dias e a melodia que embala meus sonhos...',
    bg: 'from-pink-400 via-red-400 to-pink-600',
    icon: '💕',
    type: 'text'
  },
  {
    title: 'Feliz Dia dos Namorados!',
    subtitle: 'Celebrando Nosso Amor',
    content: 'Hoje e sempre, você será a razão do meu sorriso! 💕',
    bg: 'from-rose-400 via-pink-500 to-red-600',
    icon: '🎉',
    type: 'celebration'
  }
]

// Fotos com molduras polaroid
const photos: Photo[] = [
  {
    id: 1,
    url: DuasMetadesFoto,
    caption: 'Primeiro olhar que mudou tudo ❤️',
    date: 'Janeiro 2024',
    location: 'Café da Esquina',
    effect: 'hearts',
    story: 'Lembro como se fosse ontem... seus olhos brilharam e meu mundo mudou para sempre.',
    polaroidStyle: 'rotate-3 shadow-pink-300/50'
  },
  {
    id: 2,
    url: DuasMetadesFoto,
    caption: 'Caminhada dos sonhos 🌸',
    date: 'Fevereiro 2024',
    location: 'Parque das Flores',
    effect: 'sparkles',
    story: 'Nossas mãos se encontraram pela primeira vez... e nunca mais se soltaram.',
    polaroidStyle: '-rotate-2 shadow-purple-300/50'
  },
  {
    id: 3,
    url: DuasMetadesFoto,
    caption: 'Jantar à luz de velas 🍷',
    date: 'Março 2024',
    location: 'Restaurante do Amor',
    effect: 'glow',
    story: 'A noite em que soube que era amor verdadeiro...',
    polaroidStyle: 'rotate-1 shadow-red-300/50'
  },
  {
    id: 4,
    url: DuasMetadesFoto,
    caption: 'Nossa primeira viagem ✈️',
    date: 'Abril 2024',
    location: 'Praia do Paraíso',
    effect: 'zoom',
    story: 'Descobrimos que somos parceiros perfeitos em qualquer lugar.',
    polaroidStyle: '-rotate-1 shadow-blue-300/50'
  },
  {
    id: 5,
    url: DuasMetadesFoto,
    caption: 'Momento de pura felicidade 💫',
    date: 'Maio 2024',
    location: 'Nossa Casa',
    effect: 'rotate',
    story: 'Quando percebemos que lar é estar com quem amamos.',
    polaroidStyle: 'rotate-2 shadow-yellow-300/50'
  },
  {
    id: 6,
    url: DuasMetadesFoto,
    caption: 'Crescendo juntos 🌹',
    date: 'Junho 2024',
    location: 'Jardim Secreto',
    effect: 'pulse',
    story: 'Como flores que crescem lado a lado, nosso amor só fica mais forte.',
    polaroidStyle: '-rotate-3 shadow-green-300/50'
  }
]

// Mensagens românticas
const loveMessages: LoveMessage[] = [
  { text: 'Você é minha estrela-guia! ✨', category: 'inspiration' },
  { text: 'Meu coração dança quando te vê 💃', category: 'joy' },
  { text: 'Você é minha dose diária de felicidade! 🌈', category: 'happiness' },
  { text: 'Te amo além das palavras 💕', category: 'deep' },
  { text: 'Você é meu sonho realizado! 🌙', category: 'dream' },
  { text: 'Sua risada é minha música favorita 🎵', category: 'joy' },
  { text: 'Com você, todo dia é especial! 🌺', category: 'daily' }
]

// Promessas
const promises = [
  { text: 'Prometo te fazer sorrir todos os dias', icon: '😊' },
  { text: 'Prometo ser seu porto seguro sempre', icon: '⚓' },
  { text: 'Prometo dividir todos os sonhos contigo', icon: '🌠' },
  { text: 'Prometo te amar em todas as estações', icon: '🍀' },
  { text: 'Prometo construir nosso futuro juntos', icon: '🏠' }
]

// Computed
const currentBg = computed(() => sections[currentSection.value]?.bg || 'from-pink-400 to-red-600')

// Métodos de música
const initAudio = (): void => {
  try {
    if (!DuasMetadesMsc) {
      console.warn('Arquivo de música não encontrado')
      isLoading.value = false
      return
    }

    audio.value = new Audio(DuasMetadesMsc)
    if (audio.value) {
      audio.value.loop = isLooping.value
      audio.value.volume = volume.value
      
      // CORREÇÃO: Definir loading como false imediatamente
      isLoading.value = false
      
      audio.value.addEventListener('loadedmetadata', () => {
        try {
          if (audio.value) {
            duration.value = audio.value.duration || 0
          }
        } catch (err: any) {
          console.warn('Erro ao carregar metadados:', err)
        }
      })
      
      audio.value.addEventListener('timeupdate', () => {
        try {
          if (audio.value) {
            currentTime.value = audio.value.currentTime || 0
          }
        } catch (err: any) {
          // Silenciar erro de timeupdate
        }
      })
      
      audio.value.addEventListener('ended', () => {
        try {
          if (!isLooping.value) {
            isPlaying.value = false
            currentTime.value = 0
          }
        } catch (err: any) {
          console.warn('Erro no final da música:', err)
        }
      })
      
      audio.value.addEventListener('error', (e: any) => {
        console.warn('Erro ao carregar música:', e)
        isLoading.value = false
        isPlaying.value = false
      })
      
      audio.value.addEventListener('canplay', () => {
        isLoading.value = false
      })
    }
  } catch (error: any) {
    console.warn('Erro ao inicializar áudio:', error)
    isLoading.value = false
  }
}

const toggleMusic = (): void => {
  try {
    if (!audio.value) {
      initAudio()
      // Aguardar um pouco para o áudio carregar
      setTimeout(() => {
        if (audio.value) {
          const playPromise = audio.value.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                isPlaying.value = true
                isLoading.value = false
              })
              .catch((error: any) => {
                console.warn('Erro ao reproduzir:', error)
                isPlaying.value = false
                isLoading.value = false
              })
          }
        }
      }, 100)
      return
    }
    
    if (isPlaying.value) {
      audio.value.pause()
      isPlaying.value = false
    } else {
      const playPromise = audio.value.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isPlaying.value = true
            isLoading.value = false
          })
          .catch((error: any) => {
            console.warn('Erro ao reproduzir:', error)
            isPlaying.value = false
            isLoading.value = false
          })
      }
    }
    
    if (navigator?.vibrate) {
      navigator.vibrate(100)
    }
  } catch (error: any) {
    console.warn('Erro no toggleMusic:', error)
    isPlaying.value = false
    isLoading.value = false
  }
}

const seekTo = (percentage: number): void => {
  try {
    if (audio.value && duration.value && percentage >= 0 && percentage <= 100) {
      audio.value.currentTime = (percentage / 100) * duration.value
    }
  } catch (error: any) {
    console.warn('Erro no seekTo:', error)
  }
}

const setVolume = (newVolume: number | string): void => {
  try {
    const vol = Math.max(0, Math.min(1, parseFloat(String(newVolume)) || 0))
    volume.value = vol
    if (audio.value) {
      audio.value.volume = vol
    }
  } catch (error: any) {
    console.warn('Erro no setVolume:', error)
  }
}

const toggleLoop = (): void => {
  try {
    isLooping.value = !isLooping.value
    if (audio.value) {
      audio.value.loop = isLooping.value
    }
  } catch (error: any) {
    console.warn('Erro no toggleLoop:', error)
  }
}

const formatTime = (timeInSeconds: number): string => {
  try {
    const time = parseFloat(String(timeInSeconds)) || 0
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  } catch (error: any) {
    return '0:00'
  }
}

const togglePlayer = (): void => {
  try {
    showPlayer.value = !showPlayer.value
  } catch (error: any) {
    console.warn('Erro no togglePlayer:', error)
  }
}

// Métodos principais
const startExperience = async () => {
  gameStarted.value = true
  // @ts-ignore 
  generateHearts()
  // @ts-ignore 
  generateFloatingElements()
  
  // Inicializar música automaticamente
  setTimeout(() => {
    initAudio()
  }, 1000)
}

const nextSection = () => {
  if (currentSection.value < sections.length - 1) {
    isTransitioning.value = true
    setTimeout(() => {
      currentSection.value++
      isTransitioning.value = false
    }, 300)
  }
}

const prevSection = () => {
  if (currentSection.value > 0) {
    isTransitioning.value = true
    setTimeout(() => {
      currentSection.value--
      isTransitioning.value = false
    }, 300)
  }
}

const showRandomMessage = (): void => {
  try {
    const randomIndex = Math.floor(Math.random() * loveMessages.length)
    currentMessage.value = loveMessages[randomIndex]?.text || 'Te amo! ❤️'
    showMessage.value = true
    
    if (navigator?.vibrate) {
      navigator.vibrate(100)
    }
    
    setTimeout(() => {
      showMessage.value = false
    }, 4000)
  } catch (error: any) {
    console.warn('Erro no showRandomMessage:', error)
  }
}

// Métodos de fotos
const openPhotoModal = (index: number): void => {
  try {
    const validIndex = parseInt(String(index)) || 0
    if (validIndex >= 0 && validIndex < photos.length) {
      currentPhotoIndex.value = validIndex
      showPhotoModal.value = true
      photoZoom.value = 1
      photoRotation.value = 0
    }
  } catch (error: any) {
    console.warn('Erro no openPhotoModal:', error)
  }
}

const closePhotoModal = (): void => {
  try {
    showPhotoModal.value = false
  } catch (error: any) {
    console.warn('Erro no closePhotoModal:', error)
  }
}

const nextPhoto = (): void => {
  try {
    const totalPhotos = photos.length || 1
    currentPhotoIndex.value = (currentPhotoIndex.value + 1) % totalPhotos
    resetPhotoEffects()
  } catch (error: any) {
    console.warn('Erro no nextPhoto:', error)
  }
}

const prevPhoto = (): void => {
  try {
    const totalPhotos = photos.length || 1
    currentPhotoIndex.value = (currentPhotoIndex.value - 1 + totalPhotos) % totalPhotos
    resetPhotoEffects()
  } catch (error: any) {
    console.warn('Erro no prevPhoto:', error)
  }
}

const resetPhotoEffects = (): void => {
  try {
    photoZoom.value = 1
    photoRotation.value = 0
  } catch (error: any) {
    console.warn('Erro no resetPhotoEffects:', error)
  }
}

const zoomPhoto = (): void => {
  try {
    photoZoom.value = photoZoom.value === 1 ? 1.8 : 1
    if (navigator?.vibrate) {
      navigator.vibrate(50)
    }
  } catch (error: any) {
    console.warn('Erro no zoomPhoto:', error)
  }
}

const rotatePhoto = (): void => {
  try {
    photoRotation.value += 90
    if (navigator?.vibrate) {
      navigator.vibrate([50, 50, 50])
    }
  } catch (error: any) {
    console.warn('Erro no rotatePhoto:', error)
  }
}

// Gestos touch
const handleTouchStart = (e: TouchEvent, photoId: number): void => {
  try {
    if (e?.touches?.[0]) {
      touchStartX.value = e.touches[0].clientX || 0
      touchStartY.value = e.touches[0].clientY || 0
      isDragging.value = false
    }
  } catch (error: any) {
    console.warn('Erro no handleTouchStart:', error)
  }
}

const handleTouchMove = (e: TouchEvent): void => {
  try {
    if (!isDragging.value && e?.touches?.[0]) {
      const deltaX = Math.abs((e.touches[0].clientX || 0) - touchStartX.value)
      const deltaY = Math.abs((e.touches[0].clientY || 0) - touchStartY.value)
      if (deltaX > 15 || deltaY > 15) {
        isDragging.value = true
      }
    }
  } catch (error: any) {
    console.warn('Erro no handleTouchMove:', error)
  }
}

const handleTouchEnd = (e: TouchEvent, photoId: number, index: number): void => {
  try {
    if (!isDragging.value) {
      openPhotoModal(index)
    } else {
      if (photoId && shakingPhotos.value) {
        shakingPhotos.value.add(photoId)
        if (navigator?.vibrate) {
          navigator.vibrate([100, 50, 100])
        }
        setTimeout(() => {
          shakingPhotos.value?.delete(photoId)
        }, 800)
      }
    }
  } catch (error: any) {
    console.warn('Erro no handleTouchEnd:', error)
  }
}

const onModalTouchStart = (e: TouchEvent): void => {
  try {
    if (e?.touches?.[0]) {
      touchStartX.value = e.touches[0].clientX || 0
      touchStartY.value = e.touches[0].clientY || 0
    }
  } catch (error: any) {
    console.warn('Erro no onModalTouchStart:', error)
  }
}

const onModalTouchEnd = (e: TouchEvent): void => {
  try {
    if (e?.changedTouches?.[0]) {
      const deltaX = (e.changedTouches[0].clientX || 0) - touchStartX.value
      const deltaY = (e.changedTouches[0].clientY || 0) - touchStartY.value
      
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
        if (deltaX > 0) {
          prevPhoto()
        } else {
          nextPhoto()
        }
      } else if (deltaY > 120) {
        closePhotoModal()
      }
    }
  } catch (error: any) {
    console.warn('Erro no onModalTouchEnd:', error)
  }
}

// Lifecycle
onMounted((): void => {
  try {
    // @ts-ignore
    generateHearts()
    // @ts-ignore
    generateFloatingElements()
  } catch (error: any) {
    console.warn('Erro no onMounted:', error)
  }
})

// Tratamento global de erros
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e: ErrorEvent) => {
    console.warn('Erro capturado:', e.error)
    return true
  })
  
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    console.warn('Promise rejeitada:', e.reason)
    e.preventDefault()
  })
}
</script>


<template>
  <div class="min-h-screen relative overflow-hidden select-none bg-black">
    <!-- Tela Inicial -->
    <div v-if="!gameStarted" class="fixed inset-0 z-50 bg-gradient-to-br from-pink-600 via-purple-600 to-red-600 flex items-center justify-center">
      <!-- Corações de boas-vindas -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          v-for="i in 30"
          :key="'welcome-heart-' + i"
          class="absolute text-pink-200 opacity-40 animate-bounce"
          :style="{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            fontSize: (12 + Math.random() * 20) + 'px',
            animationDelay: Math.random() * 5 + 's',
            animationDuration: (2 + Math.random() * 3) + 's'
          }"
        >
          {{ ['❤️', '💕', '💖', '💗', '💝', '🌹'][Math.floor(Math.random() * 6)] }}
        </div>
      </div>

      <!-- Conteúdo da tela inicial -->
      <div class="text-center px-8 max-w-sm mx-auto relative z-10">
        <!-- Título principal -->
        <div class="mb-8">
          <div class="text-8xl mb-6 animate-pulse">💕</div>
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
            Para {{ userName }}
          </h1>
          <p class="text-xl text-pink-100 font-light opacity-90">
            Uma surpresa especial te aguarda...
          </p>
        </div>

        <!-- Botão de iniciar -->
        <button
          @click="startExperience"
          class="group bg-white/20 backdrop-blur-xl rounded-2xl px-8 py-6 text-white font-bold text-xl hover:bg-white/30 transition-all duration-700 transform hover:scale-110 active:scale-95 border-2 border-white/30 shadow-2xl relative overflow-hidden"
        >
          <!-- Efeito de brilho -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div class="relative flex items-center justify-center space-x-3">
            <span class="text-2xl">🎁</span>
            <span>Abrir Presente</span>
            <span class="text-2xl animate-bounce">💖</span>
          </div>
        </button>

        <!-- Dica sutil -->
        <p class="text-pink-200 text-sm mt-6 opacity-70 animate-pulse">
          ✨ Prepare-se para uma experiência mágica ✨
        </p>
      </div>
    </div>

    <!-- App Principal -->
    <div v-if="gameStarted" class="min-h-screen">
      <!-- Corações flutuantes -->
      <div class="fixed inset-0 pointer-events-none z-10">
        <div
          v-for="heart in hearts"
          :key="heart.id"
          class="absolute text-pink-300 opacity-70 animate-bounce"
          :style="{
            left: heart.left + '%',
            fontSize: heart.size + 'px',
            top: '100vh',
            animationDuration: heart.duration + 's',
            animationDelay: heart.delay + 's',
            transform: 'translateY(-120vh) rotate(360deg)'
          }"
        >
          {{ heart.emoji }}
        </div>
      </div>

      <!-- Elementos flutuantes -->
      <div class="fixed inset-0 pointer-events-none z-5">
        <div
          v-for="element in floatingElements"
          :key="'float-' + element.id"
          class="absolute animate-ping opacity-60"
          :style="{
            left: element.x + '%',
            top: element.y + '%',
            animationDelay: element.delay + 's',
            animationDuration: '3s',
            fontSize: '16px'
          }"
        >
          {{ element.emoji }}
        </div>
      </div>

      <!-- Background -->
      <div 
        class="fixed inset-0 bg-gradient-to-br transition-all duration-2000 ease-in-out"
        :class="[currentBg, { 'scale-110 blur-sm': isTransitioning }]"
      >
        <div class="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <!-- Header com player mini romântico -->
      <header class="relative z-20 p-6 flex justify-between items-center">
        <!-- Player mini romântico -->
        <div class="flex items-center space-x-3">
          <button 
            @click="togglePlayer"
            class="bg-gradient-to-r from-pink-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-4 text-white hover:from-pink-500/30 hover:to-red-500/30 transition-all duration-500 border border-pink-300/30 shadow-2xl min-w-[240px] group"
          >
            <div class="flex items-center space-x-4">
              <!-- Capa do álbum com borda romântica -->
              <div class="relative flex-shrink-0">
                <div class="w-12 h-12 rounded-2xl overflow-hidden shadow-lg ring-2 ring-pink-300/50 group-hover:ring-pink-300/80 transition-all duration-300">
                  <img 
                    :src="DuasMetadesFoto" 
                    alt="Duas Metades" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <!-- Coração flutuante -->
                <div class="absolute -top-1 -right-1 text-pink-300 animate-pulse group-hover:animate-bounce">
                  <span class="text-sm">💕</span>
                </div>
              </div>
              
              <!-- Info da música -->
              <div class="flex-1 text-left min-w-0">
                <p class="text-white text-sm font-bold truncate group-hover:text-pink-100 transition-colors">
                  Duas Metades
                </p>
                <p class="text-pink-200 text-xs truncate opacity-90">
                  Jorge e Matheus
                </p>
              </div>
              
              <!-- Controles românticos -->
              <div class="flex items-center space-x-3 flex-shrink-0">
                <button 
                  @click.stop="toggleMusic"
                  class="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-400 hover:to-red-400 rounded-full p-2 text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg"
                >
                
                  <div v-if="isPlaying" class="flex space-x-0.5">
                    <div class="w-1 h-4 bg-white rounded-full"></div>
                    <div class="w-1 h-4 bg-white rounded-full"></div>
                  </div>
                  <svg v-else class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                
                <button class="text-pink-300 hover:text-pink-100 transition-colors p-1 transform hover:scale-125 duration-300">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Barra de progresso mini -->
            <div v-if="duration > 0" class="mt-3 px-1">
              <div class="h-1 bg-pink-300/30 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-pink-400 to-red-400 rounded-full transition-all duration-300"
                  :style="{ width: (currentTime / duration) * 100 + '%' }"
                ></div>
              </div>
            </div>
          </button>
        </div>
        
        <!-- Indicador de progresso -->
        <div class="text-center">
          <div class="text-white text-sm bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
            {{ currentSection + 1 }} / {{ sections.length }}
          </div>
        </div>

        <!-- Botão de mensagem -->
        <button 
          @click="showRandomMessage"
          class="group bg-gradient-to-r from-pink-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-4 text-white hover:from-pink-500/30 hover:to-red-500/30 transition-all duration-500 transform hover:scale-110 active:scale-95 border border-pink-300/30 relative shadow-xl"
        >
          <span class="text-xl">💌</span>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-ping"></div>
        </button>
      </header>

      <!-- Conteúdo principal -->
      <main class="relative z-20 flex-1 flex flex-col justify-center items-center px-6 text-center pb-32">
        <!-- Seção de Fotos Polaroid -->
        <div v-if="sections[currentSection].type === 'photos'" class="max-w-4xl mx-auto w-full">
          <div class="text-center mb-10">
            <div class="text-7xl mb-6 animate-bounce">{{ sections[currentSection].icon }}</div>
            <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {{ sections[currentSection].title }}
            </h1>
            <h2 class="text-xl md:text-2xl text-pink-100 mb-6 font-light">
              {{ sections[currentSection].subtitle }}
            </h2>
            <p class="text-white opacity-90 text-lg">{{ sections[currentSection].content }}</p>
          </div>

          <!-- Grid de polaroids 2x2 -->
          <div class="grid grid-cols-2 gap-8 mb-10">
            <div
              v-for="(photo, index) in photos.slice(0, 4)"
              :key="photo.id"
              class="polaroid-frame transform transition-all duration-700 hover:scale-110 hover:-translate-y-4 cursor-pointer"
              :class="[
                photo.polaroidStyle,
                {
                  'animate-bounce': shakingPhotos.has(photo.id),
                  'hover:rotate-0': true,
                  'z-50': shakingPhotos.has(photo.id)
                }
              ]"
             
              @touchstart="(e: any) => handleTouchStart(e, photo.id)"
             
              @touchmove="(e: any) => handleTouchMove(e)"
             
              @touchend="(e: any) => handleTouchEnd(e, photo.id, index)"
              @click="openPhotoModal(index)"
            >
              <!-- Moldura Polaroid -->
              <div class="bg-white p-4 pb-16 rounded-lg shadow-2xl hover:shadow-pink-300/60 transition-all duration-500 border border-gray-200 relative">
                <!-- Foto -->
                <div class="relative overflow-hidden rounded group">
                  <img
                    :src="photo.url"
                    :alt="photo.caption"
                    class="w-full h-36 md:h-44 object-cover transition-all duration-1000 group-hover:brightness-110"
                  />
                  
                  <!-- Efeitos de hover -->
                  <div class="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                    <div 
                      v-if="photo.effect === 'hearts'"
                      class="absolute inset-0 overflow-hidden pointer-events-none"
                    >
                      <div
                        v-for="i in 3"
                        :key="'heart-effect-' + i"
                        class="absolute text-red-400 animate-bounce opacity-90"
                        :style="{
                          left: (20 + i * 25) + '%',
                          top: (20 + i * 20) + '%',
                          animationDelay: i * 0.3 + 's',
                          fontSize: (18 + i * 2) + 'px'
                        }"
                      >
                        💕
                      </div>
                    </div>
                    
                    <div 
                      v-if="photo.effect === 'sparkles'"
                      class="absolute inset-0 overflow-hidden pointer-events-none"
                    >
                      <div
                        v-for="i in 4"
                        :key="'sparkle-effect-' + i"
                        class="absolute text-yellow-300 animate-ping opacity-80"
                        :style="{
                          left: (15 + i * 20) + '%',
                          top: (15 + i * 15) + '%',
                          animationDelay: i * 0.2 + 's',
                          fontSize: (14 + i * 2) + 'px'
                        }"
                      >
                        ✨
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Texto da polaroid -->
                <div class="mt-4 space-y-1">
                  <p class="text-gray-800 text-base font-bold text-center">{{ photo.caption }}</p>
                  <p class="text-gray-600 text-sm text-center">{{ photo.date }}</p>
                </div>
                
                <!-- Fitas adesivas -->
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-yellow-200 opacity-70 rounded rotate-12 shadow-lg"></div>
                <div class="absolute -top-2 right-4 w-8 h-4 bg-yellow-100 opacity-60 rounded rotate-45"></div>
              </div>
            </div>
          </div>

          <!-- Botão para galeria -->
          <button
            @click="currentSection = 1"
            class="bg-white/15 backdrop-blur-xl rounded-2xl px-8 py-4 text-white font-bold hover:bg-white/25 transition-all duration-500 transform hover:scale-105 active:scale-95 border border-white/30"
          >
            Ver Todas as Fotos 📸✨
          </button>
        </div>

        <!-- Galeria Completa -->
        <div v-else-if="sections[currentSection].type === 'gallery'" class="max-w-5xl mx-auto w-full">
          <div class="text-center mb-8">
            <div class="text-6xl mb-4">{{ sections[currentSection].icon }}</div>
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-3">
              {{ sections[currentSection].title }}
            </h1>
            <h2 class="text-lg md:text-xl text-pink-100 mb-4 font-light">
              {{ sections[currentSection].subtitle }}
            </h2>
            <p class="text-white opacity-90">{{ sections[currentSection].content }}</p>
          </div>

          <!-- Grid masonry 3 colunas -->
          <div class="columns-3 gap-4 mb-8">
            <div
              v-for="(photo, index) in photos"
              :key="photo.id"
              class="break-inside-avoid mb-4 transform transition-all duration-700 hover:scale-105 cursor-pointer"
              :class="[
                `rotate-${index % 2 === 0 ? '1' : '-1'}`,
                photo.polaroidStyle
              ]"
              @click="openPhotoModal(index)"
            >
              <!-- Mini polaroid -->
              <div class="bg-white p-3 pb-10 rounded-lg shadow-xl border border-gray-200">
                <div class="relative overflow-hidden rounded">
                  <img
                    :src="photo.url"
                    :alt="photo.caption"
                    class="w-full h-24 md:h-28 object-cover"
                  />
                  
                  <!-- Número -->
                  <div class="absolute top-1 right-1 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                    {{ index + 1 }}
                  </div>
                </div>
                
                <div class="mt-2">
                  <p class="text-gray-700 text-xs font-semibold text-center truncate">{{ photo.caption }}</p>
                  <p class="text-gray-500 text-xs text-center">{{ photo.date }}</p>
                </div>
                
                <!-- Mini fita -->
                <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-yellow-200 opacity-60 rounded rotate-45"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Outras seções (texto, promessas, celebração) -->
        <div v-else-if="sections[currentSection].type === 'text'" class="max-w-lg mx-auto">
          <div class="text-7xl mb-8 animate-pulse">{{ sections[currentSection].icon }}</div>
          <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            {{ sections[currentSection].title }}
          </h1>
          <h2 class="text-2xl md:text-3xl text-pink-100 mb-8 font-light">
            {{ sections[currentSection].subtitle }}
          </h2>
          <p class="text-xl md:text-2xl text-white leading-relaxed mb-10 drop-shadow-md">
            {{ sections[currentSection].content }}
          </p>
          <div class="text-8xl cursor-pointer transform hover:scale-125 transition-all duration-500">
            <span class="animate-pulse">💖</span>
          </div>
        </div>

        <div v-else-if="sections[currentSection].type === 'celebration'" class="max-w-lg mx-auto">
          <div class="text-8xl mb-8 animate-bounce">{{ sections[currentSection].icon }}</div>
          <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            {{ sections[currentSection].title }}
          </h1>
          <h2 class="text-2xl md:text-3xl text-pink-100 mb-8 font-light">
            {{ sections[currentSection].subtitle }}
          </h2>
          <p class="text-xl md:text-2xl text-white leading-relaxed mb-10">
            {{ sections[currentSection].content }}
          </p>
          
          <div class="relative">
            <div class="text-9xl animate-pulse cursor-pointer transform hover:scale-125 transition-all duration-500">
              💝
            </div>
            <div class="absolute -top-4 -right-4 text-3xl animate-ping">🎊</div>
            <div class="absolute -bottom-4 -left-4 text-3xl animate-ping" style="animation-delay: 0.5s">🎉</div>
          </div>
        </div>
      </main>

      <!-- Navegação -->
      <footer class="relative z-20 p-8">
        <div class="flex justify-between items-center max-w-lg mx-auto">
          <button 
            @click="prevSection"
            class="bg-white/15 backdrop-blur-xl rounded-2xl px-6 py-4 text-white font-bold hover:bg-white/25 transition-all duration-500 transform hover:scale-105 active:scale-90 disabled:opacity-30 border border-white/30"
            :disabled="currentSection === 0"
          >
            ← Anterior
          </button>

          <div class="flex space-x-3">
            <div
              v-for="(section, index) in sections"
              :key="index"
              class="transition-all duration-500 rounded-full"
              :class="index === currentSection 
                ? 'w-12 h-4 bg-white' 
                : 'w-4 h-4 bg-white/40'"
            ></div>
          </div>

          <button 
            @click="nextSection"
            class="bg-white/15 backdrop-blur-xl rounded-2xl px-6 py-4 text-white font-bold hover:bg-white/25 transition-all duration-500 transform hover:scale-105 active:scale-90 disabled:opacity-30 border border-white/30"
            :disabled="currentSection === sections.length - 1"
          >
            Próximo →
          </button>
        </div>
      </footer>
    </div>

    <!-- Player expandido romântico -->
    <Transition
      enter-active-class="transition-all duration-700 ease-out"
      enter-from-class="opacity-0 translate-y-full scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-500 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-full scale-95"
    >
      <div v-if="showPlayer" class="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-pink-900/95 via-red-900/90 to-pink-800/85 backdrop-blur-2xl border-t border-pink-300/30">
        <div class="p-8">
          <!-- Header romântico -->
          <div class="flex justify-between items-start mb-8">
            <div class="flex items-center space-x-6">
              <!-- Capa grande com efeitos -->
              <div class="relative">
                <div class="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-pink-300/50 group">
                  <img 
                    :src="DuasMetadesFoto" 
                    alt="Duas Metades" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <!-- Corações flutuantes -->
                <div class="absolute -top-2 -right-2 text-pink-300 animate-bounce">
                  <span class="text-lg">💕</span>
                </div>
                <div class="absolute -bottom-1 -left-1 text-red-300 animate-pulse">
                  <span class="text-sm">💖</span>
                </div>
              </div>
              
              <!-- Info da música -->
              <div>
                <h3 class="text-white font-bold text-2xl mb-1 drop-shadow-lg">
                  Duas Metades
                </h3>
                <p class="text-pink-200 text-lg font-medium opacity-90">
                  Jorge e Matheus
                </p>
                <p class="text-pink-300 text-sm mt-1 opacity-70">
                  ✨ Trilha Sonora do Nosso Amor ✨
                </p>
              </div>
            </div>
            
            <!-- Botão de fechar romântico -->
            <button 
              @click="togglePlayer" 
              class="bg-pink-500/20 hover:bg-pink-500/30 rounded-full p-3 text-pink-200 hover:text-white transition-all duration-300 backdrop-blur-sm border border-pink-300/30"
            >
              <span class="text-2xl">⌄</span>
            </button>
          </div>

          <!-- Barra de progresso romântica -->
          <div class="mb-8">
            <div 
              class="h-2 bg-pink-300/20 rounded-full overflow-hidden cursor-pointer mb-4 shadow-inner" 
              
            @click="(e: any) => seekTo((e.offsetX / e.target.offsetWidth) * 100)"
            >
              <div 
                class="h-full bg-gradient-to-r from-pink-400 via-red-400 to-pink-500 rounded-full transition-all duration-300 shadow-lg relative"
                :style="{ width: duration ? (currentTime / duration) * 100 + '%' : '0%' }"
              >
                <!-- Ponto deslizante -->
                <div class="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-pink-400"></div>
              </div>
            </div>
            <div class="flex justify-between text-sm text-pink-200 font-medium">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration || 0) }}</span>
            </div>
          </div>

          <!-- Controles principais românticos -->
          <div class="flex items-center justify-center space-x-10 mb-8">
            <button 
              @click="toggleLoop" 
              class="p-3 rounded-full transition-all duration-300 transform hover:scale-125 active:scale-95 hover:bg-pink-500/20" 
              :class="isLooping ? 'text-white bg-pink-500/30' : 'text-pink-300 hover:text-white'"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
            
            <button class="text-pink-300 hover:text-white transition-all duration-300 transform hover:scale-125 active:scale-95 p-3 rounded-full hover:bg-pink-500/20">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            
            <button 
              @click="toggleMusic"
              class="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-400 hover:to-red-400 rounded-full p-6 text-white transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-2xl ring-4 ring-pink-300/30"
            >
              
              <div v-if="isPlaying" class="flex space-x-1">
                <div class="w-2 h-8 bg-white rounded-full"></div>
                <div class="w-2 h-8 bg-white rounded-full"></div>
              </div>
              <svg v-else class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            
            <button class="text-pink-300 hover:text-white transition-all duration-300 transform hover:scale-125 active:scale-95 p-3 rounded-full hover:bg-pink-500/20">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
            
            <button class="text-pink-300 hover:text-white transition-all duration-300 transform hover:scale-125 active:scale-95 p-3 rounded-full hover:bg-pink-500/20">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v12a2 2 0 002 2h6a2 2 0 002-2V7m-8 0V5a1 1 0 011-1h6a1 1 0 011 1v2m-8 0h8M9 11v6m6-6v6"/>
              </svg>
            </button>
          </div>

          <!-- Controles inferiores românticos -->
          <div class="flex items-center justify-between">
            <!-- Volume com design romântico -->
            <div class="flex items-center space-x-4">
              <svg class="w-5 h-5 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <div class="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  :value="volume"
                
              @input="(e: any) => setVolume(e.target?.value || 0)"
                  class="w-28 h-2 bg-pink-300/20 rounded-full appearance-none cursor-pointer slider-romantic"
                />
              </div>
              <span class="text-pink-200 text-sm font-medium">{{ Math.round(volume * 100) }}%</span>
            </div>
            
            <!-- Botões extras românticos -->
            <div class="flex items-center space-x-6">
              <button class="text-pink-300 hover:text-red-400 transition-all duration-300 transform hover:scale-125 active:scale-95 p-2 rounded-full hover:bg-pink-500/20">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
              <button class="text-pink-300 hover:text-white transition-all duration-300 transform hover:scale-125 active:scale-95 p-2 rounded-full hover:bg-pink-500/20">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </button>
              <button class="text-pink-300 hover:text-white transition-all duration-300 transform hover:scale-125 active:scale-95 p-2 rounded-full hover:bg-pink-500/20">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Efeitos decorativos -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <!-- Corações flutuantes no player -->
          <div
            v-for="i in 8"
            :key="'player-heart-' + i"
            class="absolute text-pink-300/30 animate-pulse"
            :style="{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: (2 + Math.random() * 3) + 's',
              fontSize: (12 + Math.random() * 8) + 'px'
            }"
          >
            {{ ['💕', '💖', '💗', '💝'][Math.floor(Math.random() * 4)] }}
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de Foto -->
    <Transition
      enter-active-class="transition-all duration-700 ease-out"
      enter-from-class="opacity-0 scale-50 rotate-12"
      enter-to-class="opacity-100 scale-100 rotate-0"
      leave-active-class="transition-all duration-500 ease-in"
      leave-from-class="opacity-100 scale-100 rotate-0"
      leave-to-class="opacity-0 scale-50 rotate-12"
    >
      <div 
        v-if="showPhotoModal"
        class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        @click="closePhotoModal"
        
        @touchstart="(e: any) => onModalTouchStart(e)"
        
        @touchend="(e: any) => onModalTouchEnd(e)"
      >
        <div class="relative max-w-sm mx-auto" @click.stop>
          <!-- Controles -->
          <div class="absolute -top-20 left-0 right-0 flex justify-between items-center text-white z-10">
            <div class="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span class="text-sm font-bold">{{ currentPhotoIndex + 1 }} / {{ photos.length }}</span>
            </div>
            <div class="flex space-x-3">
              <button @click="rotatePhoto" class="bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all duration-300">🔄</button>
              <button @click="zoomPhoto" class="bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all duration-300">🔍</button>
              <button @click="closePhotoModal" class="bg-red-500/80 hover:bg-red-500 rounded-full p-3 transition-all duration-300">✕</button>
            </div>
          </div>

          <!-- Polaroid modal -->
          <div class="bg-white p-6 pb-20 rounded-2xl shadow-2xl">
            <div class="relative overflow-hidden rounded-xl">
              <img
                :src="photos[currentPhotoIndex].url"
                :alt="photos[currentPhotoIndex].caption"
                class="w-full h-80 object-cover transition-all duration-700 cursor-pointer"
                :style="{
                  transform: `scale(${photoZoom}) rotate(${photoRotation}deg)`
                }"
                @click="zoomPhoto"
              />
              
              <!-- Efeitos no modal -->
              <div 
                v-if="photos[currentPhotoIndex].effect === 'hearts'"
                class="absolute inset-0 pointer-events-none overflow-hidden"
              >
                <div
                  v-for="i in 6"
                  :key="'modal-heart-' + i"
                  class="absolute text-red-400 opacity-80 animate-bounce"
                  :style="{
                    left: Math.random() * 80 + 10 + '%',
                    top: Math.random() * 80 + 10 + '%',
                    animationDelay: Math.random() * 2 + 's',
                    fontSize: (12 + Math.random() * 8) + 'px'
                  }"
                >
                  💖
                </div>
              </div>
            </div>
            
            <!-- Info expandida -->
            <div class="mt-6 space-y-3 text-center">
              <h3 class="text-xl font-bold text-gray-800">{{ photos[currentPhotoIndex].caption }}</h3>
              <p class="text-sm text-gray-600 font-semibold">{{ photos[currentPhotoIndex].date }}</p>
              <p class="text-sm text-gray-500">📍 {{ photos[currentPhotoIndex].location }}</p>
              <p class="text-xs text-gray-400 italic leading-relaxed">{{ photos[currentPhotoIndex].story }}</p>
            </div>
          </div>

          <!-- Navegação -->
          <div class="absolute top-1/2 -translate-y-1/2 -left-20">
            <button @click="prevPhoto" class="bg-white/20 hover:bg-white/40 rounded-full p-4 text-white text-xl transition-all duration-300">←</button>
          </div>
          <div class="absolute top-1/2 -translate-y-1/2 -right-20">
            <button @click="nextPhoto" class="bg-white/20 hover:bg-white/40 rounded-full p-4 text-white text-xl transition-all duration-300">→</button>
          </div>

          <!-- Miniaturas -->
          <div class="flex justify-center space-x-2 mt-8 overflow-x-auto pb-2">
            <button
              v-for="(photo, index) in photos"
              :key="'thumb-' + photo.id"
              @click="currentPhotoIndex = index; resetPhotoEffects()"
              class="flex-shrink-0 transform transition-all duration-500"
              :class="index === currentPhotoIndex ? 'scale-125 ring-4 ring-white' : 'opacity-60'"
            >
              <div class="bg-white p-2 pb-4 rounded-lg shadow-lg">
                <img :src="photo.url" :alt="photo.caption" class="w-12 h-12 object-cover rounded" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de mensagem -->
    <Transition
      enter-active-class="transition-all duration-700 ease-out"
      enter-from-class="opacity-0 scale-50 translate-y-12"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-500 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-50 translate-y-12"
    >
      <div 
        v-if="showMessage"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div class="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-auto border-4 border-white/50">
          <div class="text-4xl mb-4 animate-bounce">💕</div>
          <p class="text-xl font-bold leading-relaxed">{{ currentMessage }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-romantic::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ec4899, #ef4444);
  cursor: pointer;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(236, 72, 153, 0.4);
  transition: all 0.3s ease;
}

.slider-romantic::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 6px 12px rgba(236, 72, 153, 0.6);
}

.slider-romantic::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ec4899, #ef4444);
  cursor: pointer;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(236, 72, 153, 0.4);
}

.slider-romantic::-webkit-slider-track {
  background: linear-gradient(to right, #ec4899, #ef4444);
  height: 4px;
  border-radius: 2px;
}
</style>
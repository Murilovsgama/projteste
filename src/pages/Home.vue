<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue'

// Imports das mídias
import DuasMetadesMsc from '@/assets/music/DuasMetadesMsc.mp3'
import DuasMetadesFoto from '@/assets/images/Duas_Metades.jpg'
import FotoCachoeira from '@/assets/images/WhatsApp Image 2025-06-13 at 22.15.22 1.svg'
import FotoAbraco from '@/assets/images/WhatsApp Image 2025-06-13 at 22.10.08.svg'
import FotoConjunto from '@/assets/images/WhatsApp Image 2025-06-13 at 22.07.30.svg'
import FotoPico from '@/assets/images/WhatsApp Image 2025-06-13 at 22.06.22.svg'
import FotoZoo from '@/assets/images/WhatsApp Image 2025-06-13 at 22.04.02.svg'
import FotoLingua from '@/assets/images/WhatsApp Image 2025-06-13 at 22.41.21 1 (1).svg'

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
const userName = ref<string>('Sara, minha princesa')
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
const volume = ref<number>(0.8)
const isLooping = ref<boolean>(true)
const showPlayer = ref<boolean>(false)

// Estados de interação móvel
const touchStartX = ref<number>(0)
const touchStartY = ref<number>(0)
const touchStartTime = ref<number>(0)
const isDragging = ref<boolean>(false)
const isSwipeGesture = ref<boolean>(false)
const shakingPhotos = ref<Set<number>>(new Set())
const polaroidRotations = ref<Record<number, number>>({})
const floatingElements = ref<FloatingElement[]>([])
const isTransitioning = ref<boolean>(false)

// Estados específicos do iPhone/Safari
const safeAreaTop = ref<number>(0)
const safeAreaBottom = ref<number>(0)
const isFullscreen = ref<boolean>(false)
const deviceMotionEnabled = ref<boolean>(false)
const orientation = ref<string>('portrait')

// Otimizações de performance
const animationFrameId = ref<number | null>(null)
const intersectionObserver = ref<IntersectionObserver | null>(null)
const prefersReducedMotion = ref<boolean>(false)

// Seções do app com fundos românticos modernos
const sections: Section[] = [
  {
    title: 'Nossos Momentos Mágicos',
    subtitle: '',
    content: 'Cada foto é uma janela para nossas memórias mais preciosas...',
    bg: 'romantic-sunset',
    icon: '📸',
    type: 'photos'
  },
  {
    title: 'Galeria do Nosso Amor',
    subtitle: 'Coleção de Sorrisos',
    content: '',
    bg: 'dreamy-aurora',
    icon: '🖼️',
    type: 'gallery'
  },
  {
    title: `Para: ${userName.value} ❤️`,
    subtitle: 'Meu Amor Infinito',
    content: 'Você é a luz que ilumina meus dias e a melodia que embala meus sonhos...',
    bg: 'passionate-love',
    icon: '💕',
    type: 'text'
  },
  {
    title: 'Feliz Dia dos Namorados!',
    subtitle: 'Celebrando Nosso Amor',
    content: 'Hoje e sempre, você será a razão do meu sorriso! 💕',
    bg: 'celebration-glow',
    icon: '🎉',
    type: 'celebration'
  }
]

// Fotos otimizadas para mobile
const photos: Photo[] = [
  {
    id: 1,
    url: FotoAbraco,
    caption: 'O melhor abraço do mundo❤️',
    date: '2024',
    location: '',
    effect: 'hearts',
    story: 'O lugar que me conforta.',
    polaroidStyle: 'rotate-2 shadow-pink-300/40'
  },
  {
    id: 2,
    url: FotoCachoeira,
    caption: 'Nossa primeira Trilha',
    date: 'Novembro 2024',
    location: '',
    effect: 'sparkles',
    story: 'Foi um dia incrível e essas fotos merecem um quadro, não acha?',
    polaroidStyle: '-rotate-1 shadow-purple-300/40'
  },
  {
    id: 3,
    url: FotoPico,
    caption: 'Que venham muitos pagodes ao vivo 🍷',
    date: 'Fevereiro 2025',
    location: '',
    effect: 'glow',
    story: 'Momentos únicos que guardamos no coração.',
    polaroidStyle: 'rotate-1 shadow-red-300/40'
  },
  {
    id: 4,
    url: FotoZoo,
    caption: 'Nosso dia no Zoológico',
    date: 'Fevereiro 2025',
    location: '',
    effect: 'zoom',
    story: 'Te ver toda criancinha conhecendo os axolotes foi incrível.',
    polaroidStyle: '-rotate-1 shadow-blue-300/40'
  },
  {
    id: 5,
    url: FotoConjunto,
    caption: 'Porto seguro um do outro 💫',
    date: 'Abril 2025',
    location: 'Nossa Casa',
    effect: 'rotate',
    story: 'Quando percebemos que lar é estar com quem amamos.',
    polaroidStyle: 'rotate-2 shadow-yellow-300/40'
  },
  {
    id: 6,
    url: FotoLingua,
    caption: 'Obrigado por tudo🌹',
    date: 'Junho 2025',
    location: '',
    effect: 'pulse',
    story: 'Que venham muitas datas para comemorarmos juntos.',
    polaroidStyle: '-rotate-2 shadow-green-300/40'
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

// Computed
const currentBg = computed(() => sections[currentSection.value]?.bg || 'romantic-sunset')

// Estados para efeitos de fundo
const backgroundParticles = ref<Array<{id: number, x: number, y: number, size: number, opacity: number, speed: number}>>([])
const mousePosition = ref({ x: 50, y: 50 })
const backgroundTime = ref(0)

// Gerar partículas românticas de fundo
const generateBackgroundParticles = (): void => {
  if (prefersReducedMotion.value) return
  
  const particles = []
  for (let i = 0; i < 20; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 2 + 1
    })
  }
  backgroundParticles.value = particles
}

// Animar partículas de fundo
const animateBackgroundParticles = (): void => {
  if (prefersReducedMotion.value) return
  
  backgroundTime.value += 0.02
  backgroundParticles.value.forEach(particle => {
    particle.y -= particle.speed * 0.1
    particle.x += Math.sin(backgroundTime.value + particle.id) * 0.1
    
    if (particle.y < -5) {
      particle.y = 105
      particle.x = Math.random() * 100
    }
    
    particle.opacity = 0.3 + Math.sin(backgroundTime.value + particle.id) * 0.3
  })
  
  requestAnimationFrame(animateBackgroundParticles)
}

// Detectar movimento do mouse/toque para efeitos interativos
const handleMouseMove = (e: MouseEvent | TouchEvent): void => {
  if (prefersReducedMotion.value) return
  
  const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY
  
  if (clientX !== undefined && clientY !== undefined) {
    mousePosition.value = {
      x: (clientX / window.innerWidth) * 100,
      y: (clientY / window.innerHeight) * 100
    }
  }
}

// Detecção de recursos do iPhone/Safari
const detectSafariFeatures = (): void => {
  try {
    // Safe area detection
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)
    
    safeAreaTop.value = parseInt(computedStyle.getPropertyValue('--sat') || '0') || 
                      parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0') || 44
    safeAreaBottom.value = parseInt(computedStyle.getPropertyValue('--sab') || '0') || 
                          parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0') || 34

    // Reduced motion preference
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Orientation detection
    const updateOrientation = () => {
      orientation.value = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    }
    updateOrientation()
    window.addEventListener('orientationchange', updateOrientation)

    // Device motion permission (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      deviceMotionEnabled.value = true
    }

    // Fullscreen API
    isFullscreen.value = !!document.fullscreenElement

  } catch (error) {
    console.warn('Feature detection error:', error)
  }
}

// Otimização de áudio para Safari
const initAudio = (): void => {
  try {
    if (!DuasMetadesMsc) {
      console.warn('Arquivo de música não encontrado')
      isLoading.value = false
      return
    }

    audio.value = new Audio()
    
    if (audio.value) {
      // Configurações específicas para Safari
      audio.value.preload = 'metadata'
      audio.value.loop = isLooping.value
      audio.value.volume = volume.value
      audio.value.crossOrigin = 'anonymous'
      
      // WebKit Audio Context unlock (necessário no Safari)
      const unlockAudio = () => {
        if (audio.value) {
          audio.value.play().then(() => {
            audio.value!.pause()
            audio.value!.currentTime = 0
          }).catch(() => {
            // Silenciar erro esperado
          })
        }
        document.removeEventListener('touchstart', unlockAudio)
        document.removeEventListener('click', unlockAudio)
      }
      
      document.addEventListener('touchstart', unlockAudio, { once: true })
      document.addEventListener('click', unlockAudio, { once: true })
      
      audio.value.src = DuasMetadesMsc
      
      // Event listeners otimizados
      audio.value.addEventListener('loadedmetadata', () => {
        if (audio.value) {
          duration.value = audio.value.duration || 0
          isLoading.value = false
        }
      }, { passive: true })
      
      audio.value.addEventListener('timeupdate', () => {
        if (audio.value && !isNaN(audio.value.currentTime)) {
          currentTime.value = audio.value.currentTime
        }
      }, { passive: true })
      
      audio.value.addEventListener('ended', () => {
        if (!isLooping.value) {
          isPlaying.value = false
          currentTime.value = 0
        }
      }, { passive: true })
      
      audio.value.addEventListener('error', (e) => {
        console.warn('Erro ao carregar música:', e)
        isLoading.value = false
        isPlaying.value = false
      }, { passive: true })
      
      audio.value.addEventListener('canplay', () => {
        isLoading.value = false
      }, { passive: true })

      // Prevent audio interruption on iOS
      audio.value.addEventListener('pause', (e) => {
        if (isPlaying.value && !audio.value!.ended) {
          setTimeout(() => {
            if (audio.value && isPlaying.value) {
              audio.value.play().catch(() => {
                isPlaying.value = false
              })
            }
          }, 100)
        }
      }, { passive: true })
    }
  } catch (error) {
    console.warn('Erro ao inicializar áudio:', error)
    isLoading.value = false
  }
}

const toggleMusic = async (): Promise<void> => {
  try {
    if (!audio.value) {
      initAudio()
      await nextTick()
    }
    
    if (audio.value) {
      if (isPlaying.value) {
        audio.value.pause()
        isPlaying.value = false
      } else {
        // Safari requires user gesture for play
        const playPromise = audio.value.play()
        if (playPromise !== undefined) {
          try {
            await playPromise
            isPlaying.value = true
            isLoading.value = false
          } catch (error) {
            console.warn('Erro ao reproduzir:', error)
            isPlaying.value = false
            isLoading.value = false
          }
        }
      }
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
  } catch (error) {
    console.warn('Erro no toggleMusic:', error)
    isPlaying.value = false
    isLoading.value = false
  }
}

// Gestos otimizados para iPhone
const handleTouchStart = (e: TouchEvent, photoId: number): void => {
  try {
    if (e.touches[0]) {
      touchStartX.value = e.touches[0].clientX
      touchStartY.value = e.touches[0].clientY
      touchStartTime.value = Date.now()
      isDragging.value = false
      isSwipeGesture.value = false
    }
  } catch (error) {
    console.warn('Erro no handleTouchStart:', error)
  }
}

const handleTouchMove = (e: TouchEvent): void => {
  try {
    if (e.touches[0]) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX.value)
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY.value)
      const deltaTime = Date.now() - touchStartTime.value
      
      // Detecção de swipe mais sensível para iPhone
      if ((deltaX > 20 || deltaY > 20) && deltaTime > 100) {
        isDragging.value = true
        
        // Detectar tipo de gesto
        if (deltaX > deltaY && deltaX > 50) {
          isSwipeGesture.value = true
        }
      }
    }
  } catch (error) {
    console.warn('Erro no handleTouchMove:', error)
  }
}

const handleTouchEnd = (e: TouchEvent, photoId: number, index: number): void => {
  try {
    const touchTime = Date.now() - touchStartTime.value
    
    // Tap rápido abre modal
    if (!isDragging.value && touchTime < 300) {
      openPhotoModal(index)
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30)
      }
    } 
    // Long press ou arrastar causa shake
    else if (isDragging.value || touchTime > 500) {
      shakingPhotos.value.add(photoId)
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }
      setTimeout(() => {
        shakingPhotos.value.delete(photoId)
      }, 800)
    }
  } catch (error) {
    console.warn('Erro no handleTouchEnd:', error)
  }
}

// Gestos no modal otimizados
const onModalTouchStart = (e: TouchEvent): void => {
  try {
    if (e.touches[0]) {
      touchStartX.value = e.touches[0].clientX
      touchStartY.value = e.touches[0].clientY
      touchStartTime.value = Date.now()
    }
  } catch (error) {
    console.warn('Erro no onModalTouchStart:', error)
  }
}

const onModalTouchEnd = (e: TouchEvent): void => {
  try {
    if (e.changedTouches[0]) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.value
      const deltaY = e.changedTouches[0].clientY - touchStartY.value
      const deltaTime = Date.now() - touchStartTime.value
      
      // Swipe horizontal para navegar
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100 && deltaTime < 500) {
        if (deltaX > 0) {
          prevPhoto()
        } else {
          nextPhoto()
        }
        if ('vibrate' in navigator) {
          navigator.vibrate(40)
        }
      }
      // Swipe vertical para baixo fecha modal
      else if (deltaY > 150 && Math.abs(deltaX) < 100 && deltaTime < 500) {
        closePhotoModal()
        if ('vibrate' in navigator) {
          navigator.vibrate(60)
        }
      }
    }
  } catch (error) {
    console.warn('Erro no onModalTouchEnd:', error)
  }
}

// Animações otimizadas com requestAnimationFrame
const generateHearts = (): void => {
  if (prefersReducedMotion.value) return
  
  const heartsArray: HeartElement[] = []
  const heartEmojis = ['❤️', '💕', '💖', '💗', '💝', '🌹', '💐']
  
  for (let i = 0; i < 15; i++) {
    heartsArray.push({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 4,
      size: 14 + Math.random() * 12,
      emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)]
    })
  }
  
  hearts.value = heartsArray
}

const generateFloatingElements = (): void => {
  if (prefersReducedMotion.value) return
  
  const elements: FloatingElement[] = []
  const floatingEmojis = ['✨', '💫', '⭐', '🌟', '💎', '🦋']
  
  for (let i = 0; i < 12; i++) {
    elements.push({
      id: i,
      emoji: floatingEmojis[Math.floor(Math.random() * floatingEmojis.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    })
  }
  
  floatingElements.value = elements
}

// Métodos principais otimizados
const startExperience = async (): Promise<void> => {
  try {
    gameStarted.value = true
    
    await nextTick()
    
    // Gerar animações se não houver preferência por movimento reduzido
    if (!prefersReducedMotion.value) {
      generateHearts()
      generateFloatingElements()
    }
    
    // Inicializar música após pequeno delay
    setTimeout(() => {
      initAudio()
    }, 800)
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 100, 200])
    }
  } catch (error) {
    console.warn('Erro no startExperience:', error)
  }
}

const nextSection = (): void => {
  if (currentSection.value < sections.length - 1) {
    isTransitioning.value = true
    
    // Feedback tátil
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    setTimeout(() => {
      currentSection.value++
      isTransitioning.value = false
    }, 300)
  }
}

const prevSection = (): void => {
  if (currentSection.value > 0) {
    isTransitioning.value = true
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
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
    
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }
    
    setTimeout(() => {
      showMessage.value = false
    }, 4000)
  } catch (error) {
    console.warn('Erro no showRandomMessage:', error)
  }
}

// Métodos de foto otimizados
const openPhotoModal = (index: number): void => {
  try {
    if (index >= 0 && index < photos.length) {
      currentPhotoIndex.value = index
      showPhotoModal.value = true
      photoZoom.value = 1
      photoRotation.value = 0
      
      // Prevent background scrolling on iOS
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    }
  } catch (error) {
    console.warn('Erro no openPhotoModal:', error)
  }
}

const closePhotoModal = (): void => {
  try {
    showPhotoModal.value = false
    
    // Restore scrolling
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  } catch (error) {
    console.warn('Erro no closePhotoModal:', error)
  }
}

const nextPhoto = (): void => {
  try {
    currentPhotoIndex.value = (currentPhotoIndex.value + 1) % photos.length
    resetPhotoEffects()
  } catch (error) {
    console.warn('Erro no nextPhoto:', error)
  }
}

const prevPhoto = (): void => {
  try {
    currentPhotoIndex.value = (currentPhotoIndex.value - 1 + photos.length) % photos.length
    resetPhotoEffects()
  } catch (error) {
    console.warn('Erro no prevPhoto:', error)
  }
}

const resetPhotoEffects = (): void => {
  photoZoom.value = 1
  photoRotation.value = 0
}

const zoomPhoto = (): void => {
  try {
    photoZoom.value = photoZoom.value === 1 ? 2.2 : 1
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
  } catch (error) {
    console.warn('Erro no zoomPhoto:', error)
  }
}

const rotatePhoto = (): void => {
  try {
    photoRotation.value += 90
    if ('vibrate' in navigator) {
      navigator.vibrate([40, 20, 40])
    }
  } catch (error) {
    console.warn('Erro no rotatePhoto:', error)
  }
}

// Utility functions
const seekTo = (percentage: number): void => {
  try {
    if (audio.value && duration.value && percentage >= 0 && percentage <= 100) {
      audio.value.currentTime = (percentage / 100) * duration.value
    }
  } catch (error) {
    console.warn('Erro no seekTo:', error)
  }
}

const setVolume = (newVolume: number | string): void => {
  try {
    const vol = Math.max(0, Math.min(1, parseFloat(String(newVolume))))
    volume.value = vol
    if (audio.value) {
      audio.value.volume = vol
    }
  } catch (error) {
    console.warn('Erro no setVolume:', error)
  }
}

const toggleLoop = (): void => {
  try {
    isLooping.value = !isLooping.value
    if (audio.value) {
      audio.value.loop = isLooping.value
    }
  } catch (error) {
    console.warn('Erro no toggleLoop:', error)
  }
}

const formatTime = (timeInSeconds: number): string => {
  try {
    const time = parseFloat(String(timeInSeconds)) || 0
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  } catch (error) {
    return '0:00'
  }
}

const togglePlayer = (): void => {
  showPlayer.value = !showPlayer.value
  if ('vibrate' in navigator) {
    navigator.vibrate(40)
  }
}

// Lifecycle hooks
onMounted((): void => {
  try {
    detectSafariFeatures()
    
    // Gerar efeitos de fundo
    generateBackgroundParticles()
    if (!prefersReducedMotion.value) {
      animateBackgroundParticles()
    }
    
    // Event listeners para efeitos interativos
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('touchmove', handleMouseMove, { passive: true })
    
    // Prevent zoom on iOS
    document.addEventListener('gesturestart', (e) => e.preventDefault())
    document.addEventListener('gesturechange', (e) => e.preventDefault())
    
    // Prevent scroll bounce
    document.addEventListener('touchmove', (e) => {
      if (showPhotoModal.value) {
        e.preventDefault()
      }
    }, { passive: false })
    
    // Set CSS custom properties for safe areas
    const root = document.documentElement
    root.style.setProperty('--safe-area-top', `${safeAreaTop.value}px`)
    root.style.setProperty('--safe-area-bottom', `${safeAreaBottom.value}px`)
    
    // Initialize animations if motion is allowed
    if (!prefersReducedMotion.value) {
      generateHearts()
      generateFloatingElements()
    }
    
  } catch (error) {
    console.warn('Erro no onMounted:', error)
  }
})

onUnmounted((): void => {
  // Cleanup
  if (audio.value) {
    audio.value.pause()
    audio.value = null
  }
  
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }
  
  // Remove event listeners
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('touchmove', handleMouseMove)
  
  // Restore body styles
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
})

// Error handling específico para Safari
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Promise rejection:', event.reason)
  event.preventDefault()
})
</script>

<template>
  <div 
    class="min-h-screen relative overflow-hidden select-none bg-black"
    :style="{ 
      paddingTop: safeAreaTop + 'px',
      paddingBottom: safeAreaBottom + 'px'
    }"
  >
    <!-- Tela Inicial Otimizada -->
    <div v-if="!gameStarted" class="fixed inset-0 z-50 romantic-welcome-bg flex items-center justify-center">
      <!-- Partículas flutuantes românticas -->
      <div v-if="!prefersReducedMotion" class="absolute inset-0 overflow-hidden pointer-events-none">
        <!-- Corações flutuantes -->
        <div
          v-for="i in 15"
          :key="'welcome-heart-' + i"
          class="absolute text-pink-200 romantic-float"
          :style="{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            fontSize: (8 + Math.random() * 12) + 'px',
            animationDelay: Math.random() * 3 + 's',
            animationDuration: (3 + Math.random() * 2) + 's'
          }"
        >
          {{ ['❤️', '💕', '💖', '💗', '💝', '🌹', '✨'][Math.floor(Math.random() * 7)] }}
        </div>
        
        <!-- Partículas de luz -->
        <div
          v-for="i in 25"
          :key="'light-particle-' + i"
          class="absolute w-1 h-1 bg-white rounded-full romantic-sparkle"
          :style="{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: Math.random() * 5 + 's',
            animationDuration: (2 + Math.random() * 3) + 's'
          }"
        ></div>
      </div>

      <!-- Conteúdo da tela inicial -->
      <div class="text-center px-6 max-w-sm mx-auto relative z-10">
        <div class="mb-8">
          <div class="text-7xl mb-6 romantic-pulse">💕</div>
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-2xl leading-tight romantic-glow">
            Para {{ userName }}
          </h1>
          <p class="text-lg text-pink-100 font-light opacity-90 leading-relaxed">
            Uma surpresa especial te aguarda...
          </p>
        </div>

        <!-- Botão de iniciar com efeito glass -->
        <button
          @click="startExperience"
          class="group romantic-glass-button w-full max-w-xs relative overflow-hidden"
          style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
        >
          <!-- Efeito de brilho animado -->
          <div class="absolute inset-0 romantic-shimmer opacity-0 group-hover:opacity-100 group-active:opacity-100"></div>
          
          <div class="relative flex items-center justify-center space-x-3">
            <span class="text-2xl">🎁</span>
            <span>Abrir Presente</span>
            <span class="text-2xl romantic-bounce">💖</span>
          </div>
        </button>

        <p class="text-pink-200 text-sm mt-6 opacity-70 romantic-twinkle">
          ✨ Prepare-se para uma experiência mágica ✨
        </p>
      </div>
    </div>

    <!-- App Principal -->
    <div v-if="gameStarted" class="min-h-screen flex flex-col">
      <!-- Elementos de fundo otimizados -->
      <div v-if="!prefersReducedMotion" class="fixed inset-0 pointer-events-none z-10">
        <div
          v-for="heart in hearts"
          :key="heart.id"
          class="absolute text-pink-300 opacity-60 animate-bounce"
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

      <!-- Background dinâmico romântico -->
      <div class="fixed inset-0 romantic-dynamic-bg" :class="currentBg">
        <!-- Camada base com gradiente -->
        <div class="absolute inset-0 romantic-base-gradient"></div>
        
        <!-- Partículas de fundo interativas -->
        <div v-if="!prefersReducedMotion" class="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            v-for="particle in backgroundParticles"
            :key="'bg-particle-' + particle.id"
            class="absolute romantic-particle"
            :style="{
              left: particle.x + '%',
              top: particle.y + '%',
              width: particle.size + 'px',
              height: particle.size + 'px',
              opacity: particle.opacity,
              transform: `translate(${Math.sin(backgroundTime + particle.id) * 20}px, ${Math.cos(backgroundTime + particle.id) * 10}px)`
            }"
          ></div>
        </div>
        
        <!-- Efeito de mouse/toque -->
        <div 
          v-if="!prefersReducedMotion"
          class="absolute romantic-mouse-effect pointer-events-none"
          :style="{
            left: mousePosition.x + '%',
            top: mousePosition.y + '%',
            transform: 'translate(-50%, -50%)'
          }"
        ></div>
        
        <!-- Overlay suave -->
        <div class="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
        
        <!-- Efeito de transição suave -->
        <div 
          v-if="isTransitioning"
          class="absolute inset-0 romantic-transition-overlay"
        ></div>
      </div>

      <!-- Header compacto para iPhone -->
      <header class="relative z-20 p-4 flex justify-between items-center">
        <!-- Player mini otimizado -->
        <button 
          @click="togglePlayer"
          class="bg-gradient-to-r from-pink-500/20 to-red-500/20 backdrop-blur-xl rounded-3xl p-3 text-white hover:from-pink-500/30 hover:to-red-500/30 transition-all duration-300 border border-pink-300/30 shadow-xl flex-1 max-w-xs"
          style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
        >
          <div class="flex items-center space-x-3">
            <div class="relative flex-shrink-0">
              <div class="w-10 h-10 rounded-xl overflow-hidden shadow-lg ring-2 ring-pink-300/50">
                <img 
                  :src="DuasMetadesFoto" 
                  alt="Duas Metades" 
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="absolute -top-1 -right-1 text-pink-300" :class="prefersReducedMotion ? '' : 'animate-pulse'">
                <span class="text-xs">💕</span>
              </div>
            </div>
            
            <div class="flex-1 text-left min-w-0">
              <p class="text-white text-sm font-bold truncate">Duas Metades</p>
              <p class="text-pink-200 text-xs truncate opacity-90">Jorge e Matheus</p>
            </div>
            
            <button 
              @click.stop="toggleMusic"
              class="bg-gradient-to-r from-pink-500 to-red-500 rounded-full p-2 text-white flex-shrink-0"
              style="touch-action: manipulation;"
            >
              <div v-if="isPlaying" class="flex space-x-0.5">
                <div class="w-1 h-3 bg-white rounded-full"></div>
                <div class="w-1 h-3 bg-white rounded-full"></div>
              </div>
              <svg v-else class="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
          
          <!-- Barra de progresso mini -->
          <div v-if="duration > 0" class="mt-2">
            <div class="h-1 bg-pink-300/30 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-pink-400 to-red-400 rounded-full transition-all duration-300"
                :style="{ width: (currentTime / duration) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </button>

        <!-- Botão de mensagem -->
        <button 
          @click="showRandomMessage"
          class="ml-3 bg-gradient-to-r from-pink-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-4 text-white hover:from-pink-500/30 hover:to-red-500/30 transition-all duration-300 border border-pink-300/30 shadow-xl relative"
          style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
        >
          <span class="text-xl">💌</span>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full" :class="prefersReducedMotion ? '' : 'animate-ping'"></div>
        </button>
      </header>

      <!-- Conteúdo principal adaptado para iPhone -->
      <main class="relative z-20 flex-1 flex flex-col justify-center items-center px-4 text-center pb-24">
        <!-- Seção de Fotos otimizada para mobile -->
        <div v-if="sections[currentSection].type === 'photos'" class="max-w-sm mx-auto w-full">
          <div class="text-center mb-8">
            <div class="text-6xl mb-4" :class="prefersReducedMotion ? '' : 'animate-bounce'">{{ sections[currentSection].icon }}</div>
            <h1 class="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
              {{ sections[currentSection].title }}
            </h1>
            <p class="text-white opacity-90 text-base leading-relaxed">{{ sections[currentSection].content }}</p>
          </div>

          <!-- Grid 2x2 otimizado para iPhone -->
          <div class="grid grid-cols-2 gap-4 mb-8">
            <div
              v-for="(photo, index) in photos.slice(0, 4)"
              :key="photo.id"
              class="polaroid-frame transform transition-all duration-500 cursor-pointer"
              :class="[
                photo.polaroidStyle,
                {
                  'animate-pulse': shakingPhotos.has(photo.id),
                  'hover:scale-105': !prefersReducedMotion
                }
              ]"
              @touchstart="(e: TouchEvent) => handleTouchStart(e, photo.id)"
              @touchmove="(e: TouchEvent) => handleTouchMove(e)"
              @touchend="(e: TouchEvent) => handleTouchEnd(e, photo.id, index)"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
            >
              <div class="bg-white p-3 pb-12 rounded-lg shadow-xl border border-gray-200 relative">
                <div class="relative overflow-hidden rounded">
                  <img
                    :src="photo.url"
                    :alt="photo.caption"
                    class="w-full h-28 object-cover"
                    loading="lazy"
                  />
                </div>
                
                <div class="mt-3 space-y-1">
                  <p class="text-gray-800 text-sm font-bold text-center leading-tight">{{ photo.caption }}</p>
                  <p class="text-gray-600 text-xs text-center">{{ photo.date }}</p>
                </div>
                
                <!-- Fita decorativa -->
                <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-yellow-200 opacity-70 rounded rotate-12"></div>
              </div>
            </div>
          </div>

          <!-- Botão para galeria -->
          <button
            @click="currentSection = 1"
            class="bg-white/15 backdrop-blur-xl rounded-2xl px-6 py-3 text-white font-bold hover:bg-white/25 transition-all duration-300 border border-white/30 w-full"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
          >
            Ver Todas as Fotos 📸✨
          </button>
        </div>

        <!-- Galeria Completa adaptada -->
        <div v-else-if="sections[currentSection].type === 'gallery'" class="max-w-sm mx-auto w-full">
          <div class="text-center mb-6">
            <div class="text-5xl mb-3">{{ sections[currentSection].icon }}</div>
            <h1 class="text-2xl font-bold text-white mb-2">{{ sections[currentSection].title }}</h1>
            <h2 class="text-lg text-pink-100 mb-3 font-light">{{ sections[currentSection].subtitle }}</h2>
          </div>

          <!-- Grid vertical para iPhone -->
          <div class="space-y-4 mb-6">
            <div
              v-for="(photo, index) in photos"
              :key="photo.id"
              class="transform transition-all duration-500 cursor-pointer"
              :class="photo.polaroidStyle"
              @click="openPhotoModal(index)"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
            >
              <div class="bg-white p-3 pb-8 rounded-lg shadow-lg border border-gray-200 relative">
                <div class="relative overflow-hidden rounded">
                  <img
                    :src="photo.url"
                    :alt="photo.caption"
                    class="w-full h-20 object-cover"
                    loading="lazy"
                  />
                  <div class="absolute top-1 right-1 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                    {{ index + 1 }}
                  </div>
                </div>
                
                <div class="mt-2">
                  <p class="text-gray-700 text-xs font-semibold text-center truncate">{{ photo.caption }}</p>
                  <p class="text-gray-500 text-xs text-center">{{ photo.date }}</p>
                </div>
                
                <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-yellow-200 opacity-60 rounded rotate-45"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Outras seções adaptadas -->
        <div v-else-if="sections[currentSection].type === 'text'" class="max-w-sm mx-auto">
          <div class="text-6xl mb-6" :class="prefersReducedMotion ? '' : 'animate-pulse'">{{ sections[currentSection].icon }}</div>
          <h1 class="text-3xl font-bold text-white mb-4 drop-shadow-2xl leading-tight">
            {{ sections[currentSection].title }}
          </h1>
          <h2 class="text-xl text-pink-100 mb-6 font-light leading-relaxed">
            {{ sections[currentSection].subtitle }}
          </h2>
          <p class="text-lg text-white leading-relaxed mb-8 drop-shadow-md">
            {{ sections[currentSection].content }}
          </p>
          <div class="text-7xl cursor-pointer" 
               :class="prefersReducedMotion ? '' : 'animate-pulse'"
               @click="showRandomMessage"
               style="touch-action: manipulation;">
            💖
          </div>
        </div>

        <div v-else-if="sections[currentSection].type === 'celebration'" class="max-w-sm mx-auto">
          <div class="text-7xl mb-6" :class="prefersReducedMotion ? '' : 'animate-bounce'">{{ sections[currentSection].icon }}</div>
          <h1 class="text-3xl font-bold text-white mb-4 drop-shadow-2xl leading-tight">
            {{ sections[currentSection].title }}
          </h1>
          <h2 class="text-xl text-pink-100 mb-6 font-light leading-relaxed">
            {{ sections[currentSection].subtitle }}
          </h2>
          <p class="text-lg text-white leading-relaxed mb-8">
            {{ sections[currentSection].content }}
          </p>
          
          <div class="relative">
            <div class="text-8xl cursor-pointer" 
                 :class="prefersReducedMotion ? '' : 'animate-pulse'"
                 @click="showRandomMessage"
                 style="touch-action: manipulation;">
              💝
            </div>
            <div v-if="!prefersReducedMotion" class="absolute -top-3 -right-3 text-2xl animate-ping">🎊</div>
            <div v-if="!prefersReducedMotion" class="absolute -bottom-3 -left-3 text-2xl animate-ping" style="animation-delay: 0.5s">🎉</div>
          </div>
        </div>
      </main>

      <!-- Navegação otimizada para iPhone -->
      <footer class="relative z-20 p-4" :style="{ paddingBottom: safeAreaBottom + 16 + 'px' }">
        <div class="flex justify-between items-center max-w-sm mx-auto">
          <button 
            @click="prevSection"
            class="bg-white/15 backdrop-blur-xl rounded-2xl px-5 py-3 text-white font-semibold hover:bg-white/25 transition-all duration-300 disabled:opacity-30 border border-white/30 flex-1 mr-3"
            :disabled="currentSection === 0"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
          >
            ← Anterior
          </button>

          <div class="flex space-x-2 mx-3">
            <div
              v-for="(section, index) in sections"
              :key="index"
              class="transition-all duration-300 rounded-full"
              :class="index === currentSection 
                ? 'w-8 h-3 bg-white' 
                : 'w-3 h-3 bg-white/40'"
            ></div>
          </div>

          <button 
            @click="nextSection"
            class="bg-white/15 backdrop-blur-xl rounded-2xl px-5 py-3 text-white font-semibold hover:bg-white/25 transition-all duration-300 disabled:opacity-30 border border-white/30 flex-1 ml-3"
            :disabled="currentSection === sections.length - 1"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
          >
            Próximo →
          </button>
        </div>
      </footer>
    </div>

    <!-- Player expandido otimizado para iPhone -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div v-if="showPlayer" class="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-pink-900/95 via-red-900/90 to-pink-800/85 backdrop-blur-2xl border-t border-pink-300/30"
           :style="{ paddingBottom: safeAreaBottom + 'px' }">
        <div class="p-6">
          <!-- Header compacto -->
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center space-x-4">
              <div class="relative">
                <div class="w-16 h-16 rounded-2xl overflow-hidden shadow-xl ring-3 ring-pink-300/50">
                  <img 
                    :src="DuasMetadesFoto" 
                    alt="Duas Metades" 
                    class="w-full h-full object-cover"
                  />
                </div>
                <div v-if="!prefersReducedMotion" class="absolute -top-1 -right-1 text-pink-300 animate-bounce">
                  <span class="text-sm">💕</span>
                </div>
              </div>
              
              <div>
                <h3 class="text-white font-bold text-lg mb-1">Duas Metades</h3>
                <p class="text-pink-200 text-sm opacity-90">Jorge e Matheus</p>
                <p class="text-pink-300 text-xs mt-1 opacity-70">✨ Trilha Sonora do Nosso Amor ✨</p>
              </div>
            </div>
            
            <button 
              @click="togglePlayer" 
              class="bg-pink-500/20 hover:bg-pink-500/30 rounded-full p-3 text-pink-200 transition-all duration-300"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
            >
              <span class="text-xl">⌄</span>
            </button>
          </div>

          <!-- Barra de progresso -->
          <div class="mb-6">
            <div 
              class="h-2 bg-pink-300/20 rounded-full overflow-hidden cursor-pointer mb-3 shadow-inner" 
              @click="(e: MouseEvent) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                seekTo((e.clientX - rect.left) / rect.width * 100);
              }"
              style="touch-action: manipulation;"
            >
              <div 
                class="h-full bg-gradient-to-r from-pink-400 via-red-400 to-pink-500 rounded-full transition-all duration-300 relative"
                :style="{ width: duration ? (currentTime / duration) * 100 + '%' : '0%' }"
              >
                <div class="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-pink-400"></div>
              </div>
            </div>
            <div class="flex justify-between text-sm text-pink-200 font-medium">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration || 0) }}</span>
            </div>
          </div>

          <!-- Controles principais -->
          <div class="flex items-center justify-center space-x-8 mb-6">
            <button 
              @click="toggleLoop" 
              class="p-3 rounded-full transition-all duration-300 active:scale-95" 
              :class="isLooping ? 'text-white bg-pink-500/30' : 'text-pink-300'"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
            
            <button 
              @click="toggleMusic"
              class="bg-gradient-to-r from-pink-500 to-red-500 rounded-full p-5 text-white transition-all duration-300 active:scale-95 shadow-2xl ring-4 ring-pink-300/30"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
            >
              <div v-if="isPlaying" class="flex space-x-1">
                <div class="w-2 h-6 bg-white rounded-full"></div>
                <div class="w-2 h-6 bg-white rounded-full"></div>
              </div>
              <svg v-else class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            
            <button 
              class="text-pink-300 transition-all duration-300 active:scale-95 p-3 rounded-full"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>

          <!-- Controle de volume -->
          <div class="flex items-center justify-center space-x-4">
            <svg class="w-4 h-4 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              :value="volume"
              @input="(e: Event) => setVolume((e.target as HTMLInputElement).value)"
              class="flex-1 max-w-32 h-2 bg-pink-300/20 rounded-full appearance-none cursor-pointer slider-romantic"
              style="touch-action: manipulation;"
            />
            <span class="text-pink-200 text-sm font-medium min-w-[35px]">{{ Math.round(volume * 100) }}%</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de Foto otimizado para iPhone -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-50"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-50"
    >
      <div 
        v-if="showPhotoModal"
        class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        @click="closePhotoModal"
        @touchstart="(e: TouchEvent) => onModalTouchStart(e)"
        @touchend="(e: TouchEvent) => onModalTouchEnd(e)"
        :style="{ 
          paddingTop: safeAreaTop + 16 + 'px',
          paddingBottom: safeAreaBottom + 16 + 'px'
        }"
      >
        <!-- Controles superiores -->
        <div class="absolute top-4 left-4 right-4 flex justify-between items-center text-white z-10"
             :style="{ top: safeAreaTop + 16 + 'px' }">
          <div class="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
            <span class="text-sm font-bold">{{ currentPhotoIndex + 1 }} / {{ photos.length }}</span>
          </div>
          <div class="flex space-x-2">
            <button 
              @click.stop="rotatePhoto" 
              class="bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all duration-300"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
            >
              🔄
            </button>
            <button 
              @click.stop="zoomPhoto" 
              class="bg-white/20 hover:bg-white/40 rounded-full p-3 transition-all duration-300"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
            >
              🔍
            </button>
            <button 
              @click.stop="closePhotoModal" 
              class="bg-red-500/80 hover:bg-red-500 rounded-full p-3 transition-all duration-300"
              style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Foto principal -->
        <div class="relative max-w-sm mx-auto" @click.stop>
          <div class="bg-white p-4 pb-16 rounded-2xl shadow-2xl">
            <div class="relative overflow-hidden rounded-xl">
              <img
                :src="photos[currentPhotoIndex].url"
                :alt="photos[currentPhotoIndex].caption"
                class="w-full h-64 object-cover transition-all duration-500 cursor-pointer"
                :style="{
                  transform: `scale(${photoZoom}) rotate(${photoRotation}deg)`
                }"
                @click="zoomPhoto"
                style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
                loading="lazy"
              />
            </div>
            
            <!-- Info da foto -->
            <div class="mt-4 space-y-2 text-center">
              <h3 class="text-lg font-bold text-gray-800 leading-tight">{{ photos[currentPhotoIndex].caption }}</h3>
              <p class="text-sm text-gray-600 font-semibold">{{ photos[currentPhotoIndex].date }}</p>
              <p class="text-sm text-gray-500">📍 {{ photos[currentPhotoIndex].location }}</p>
              <p class="text-xs text-gray-400 italic leading-relaxed">{{ photos[currentPhotoIndex].story }}</p>
            </div>
          </div>

          <!-- Navegação lateral -->
          <button 
            @click.stop="prevPhoto" 
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-white/20 hover:bg-white/40 rounded-full p-3 text-white text-lg transition-all duration-300"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
          >
            ←
          </button>
          <button 
            @click.stop="nextPhoto" 
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-white/20 hover:bg-white/40 rounded-full p-3 text-white text-lg transition-all duration-300"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
          >
            →
          </button>
        </div>

        <!-- Miniaturas na parte inferior -->
        <div class="absolute bottom-4 left-4 right-4 flex justify-center space-x-2 overflow-x-auto pb-2"
             :style="{ bottom: safeAreaBottom + 16 + 'px' }">
          <button
            v-for="(photo, index) in photos"
            :key="'thumb-' + photo.id"
            @click.stop="() => { currentPhotoIndex = index; resetPhotoEffects(); }"
            class="flex-shrink-0 transform transition-all duration-300"
            :class="index === currentPhotoIndex ? 'scale-110 ring-2 ring-white' : 'opacity-60'"
            style="touch-action: manipulation; -webkit-tap-highlight-color: transparent;"
          >
            <div class="bg-white p-2 pb-3 rounded-lg shadow-lg">
              <img :src="photo.url" :alt="photo.caption" class="w-10 h-10 object-cover rounded" loading="lazy" />
            </div>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Modal de mensagem otimizado -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-50 translate-y-8"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-50 translate-y-8"
    >
      <div 
        v-if="showMessage"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div class="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-3xl p-6 text-center shadow-2xl max-w-xs mx-auto border-4 border-white/50">
          <div class="text-3xl mb-3" :class="prefersReducedMotion ? '' : 'animate-bounce'">💕</div>
          <p class="text-lg font-bold leading-relaxed">{{ currentMessage }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Fundos românticos modernos */
.romantic-welcome-bg {
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 182, 255, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 105, 180, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 20, 147, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
  background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%;
  animation: welcomeBackgroundShift 8s ease-in-out infinite;
}

@keyframes welcomeBackgroundShift {
  0%, 100% { background-position: 0% 0%, 100% 100%, 50% 50%, 0% 0%; }
  25% { background-position: 100% 0%, 0% 100%, 80% 20%, 0% 0%; }
  50% { background-position: 100% 100%, 0% 0%, 20% 80%, 0% 0%; }
  75% { background-position: 0% 100%, 100% 0%, 60% 40%, 0% 0%; }
}

/* Fundos dinâmicos por seção */
.romantic-sunset {
  background: 
    radial-gradient(circle at 30% 20%, rgba(255, 154, 158, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(250, 114, 104, 0.6) 0%, transparent 50%),
    radial-gradient(circle at 20% 60%, rgba(255, 206, 84, 0.4) 0%, transparent 50%),
    linear-gradient(135deg, #667eea 0%, #764ba2 35%, #f093fb 70%, #f5576c 100%);
  animation: sunsetShift 12s ease-in-out infinite;
}

.dreamy-aurora {
  background: 
    radial-gradient(ellipse at 50% 0%, rgba(139, 69, 197, 0.6) 0%, transparent 70%),
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.5) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.5) 0%, transparent 50%),
    linear-gradient(180deg, #1e3a8a 0%, #3730a3 25%, #7c3aed 50%, #ec4899 75%, #be185d 100%);
  animation: auroraShift 15s ease-in-out infinite;
}

.passionate-love {
  background: 
    radial-gradient(circle at 40% 30%, rgba(244, 63, 94, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 60% 70%, rgba(251, 113, 133, 0.6) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(252, 165, 165, 0.4) 0%, transparent 40%),
    linear-gradient(45deg, #be185d 0%, #e11d48 25%, #f43f5e 50%, #fb7185 75%, #fca5a5 100%);
  animation: loveShift 10s ease-in-out infinite;
}

.celebration-glow {
  background: 
    radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.7) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(248, 113, 113, 0.6) 0%, transparent 50%),
    radial-gradient(circle at 50% 10%, rgba(167, 139, 250, 0.5) 0%, transparent 60%),
    radial-gradient(circle at 10% 90%, rgba(52, 211, 153, 0.4) 0%, transparent 50%),
    linear-gradient(135deg, #fbbf24 0%, #f87171 25%, #a78bfa 50%, #34d399 75%, #60a5fa 100%);
  animation: celebrationShift 8s ease-in-out infinite;
}

/* Animações de fundo */
@keyframes sunsetShift {
  0%, 100% { background-position: 0% 0%, 100% 100%, 50% 50%, 0% 0%; }
  33% { background-position: 100% 20%, 20% 80%, 80% 20%, 0% 0%; }
  66% { background-position: 20% 100%, 80% 20%, 20% 80%, 0% 0%; }
}

@keyframes auroraShift {
  0%, 100% { background-position: 50% 0%, 0% 50%, 100% 50%, 0% 0%; }
  25% { background-position: 60% 10%, 20% 80%, 80% 20%, 0% 0%; }
  50% { background-position: 40% 20%, 80% 20%, 20% 80%, 0% 0%; }
  75% { background-position: 70% 5%, 10% 70%, 90% 30%, 0% 0%; }
}

@keyframes loveShift {
  0%, 100% { background-position: 40% 30%, 60% 70%, 20% 80%, 0% 0%; }
  50% { background-position: 60% 20%, 40% 80%, 80% 20%, 0% 0%; }
}

@keyframes celebrationShift {
  0%, 100% { background-position: 25% 25%, 75% 75%, 50% 10%, 10% 90%, 0% 0%; }
  25% { background-position: 75% 25%, 25% 75%, 90% 50%, 50% 10%, 0% 0%; }
  50% { background-position: 75% 75%, 25% 25%, 10% 90%, 90% 50%, 0% 0%; }
  75% { background-position: 25% 75%, 75% 25%, 50% 90%, 50% 50%, 0% 0%; }
}

/* Partículas e efeitos */
.romantic-particle {
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 182, 255, 0.4) 50%, transparent 100%);
  border-radius: 50%;
  animation: particleFloat 6s ease-in-out infinite;
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
}

.romantic-mouse-effect {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 182, 255, 0.2) 0%, rgba(255, 105, 180, 0.1) 30%, transparent 70%);
  border-radius: 50%;
  transition: all 0.3s ease;
  animation: mouseGlow 3s ease-in-out infinite;
}

@keyframes mouseGlow {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
}

.romantic-transition-overlay {
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: transitionPulse 0.6s ease-in-out;
}

@keyframes transitionPulse {
  0% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1); }
}

/* Elementos da tela inicial */
.romantic-float {
  animation: romanticFloat 4s ease-in-out infinite;
}

@keyframes romanticFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
  25% { transform: translateY(-10px) rotate(5deg); opacity: 0.8; }
  50% { transform: translateY(-20px) rotate(-5deg); opacity: 1; }
  75% { transform: translateY(-15px) rotate(3deg); opacity: 0.9; }
}

.romantic-sparkle {
  animation: sparkle 3s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

.romantic-pulse {
  animation: romanticPulse 2s ease-in-out infinite;
}

@keyframes romanticPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.romantic-glow {
  text-shadow: 0 0 20px rgba(255, 182, 255, 0.6), 0 0 40px rgba(255, 105, 180, 0.4);
  animation: textGlow 3s ease-in-out infinite;
}

@keyframes textGlow {
  0%, 100% { text-shadow: 0 0 20px rgba(255, 182, 255, 0.6), 0 0 40px rgba(255, 105, 180, 0.4); }
  50% { text-shadow: 0 0 30px rgba(255, 182, 255, 0.8), 0 0 60px rgba(255, 105, 180, 0.6); }
}

.romantic-glass-button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px 32px;
  font-weight: 700;
  font-size: 1.125rem;
  color: white;
  box-shadow: 
    0 8px 32px rgba(255, 105, 180, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.romantic-glass-button:hover,
.romantic-glass-button:active {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px rgba(255, 105, 180, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.romantic-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.romantic-bounce {
  animation: romanticBounce 1.5s ease-in-out infinite;
}

@keyframes romanticBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.romantic-twinkle {
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Prevent zoom on input focus */
input[type="range"] {
  font-size: 16px;
}

/* Custom range slider para Safari */
.slider-romantic {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(239, 68, 68, 0.3));
  outline: none;
}

.slider-romantic::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ec4899, #ef4444);
  cursor: pointer;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(236, 72, 153, 0.4);
  transition: all 0.3s ease;
}

.slider-romantic::-webkit-slider-thumb:active {
  transform: scale(1.2);
  box-shadow: 0 6px 12px rgba(236, 72, 153, 0.6);
}

.slider-romantic::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ec4899, #ef4444);
  cursor: pointer;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(236, 72, 153, 0.4);
  border: none;
}

.slider-romantic::-moz-range-track {
  background: linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(239, 68, 68, 0.3));
  height: 6px;
  border-radius: 3px;
}

/* Polaroid effects otimizados */
.polaroid-frame {
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Smooth scroll para iPhone */
html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

/* Otimizações de performance */
.transition-all {
  transition-property: transform, opacity, background-color, border-color, color, fill, stroke;
}

/* Safe area support */
@supports (padding: max(0px)) {
  .safe-top {
    padding-top: max(var(--safe-area-top, 0px), env(safe-area-inset-top));
  }
  
  .safe-bottom {
    padding-bottom: max(var(--safe-area-bottom, 0px), env(safe-area-inset-bottom));
  }
}

/* Prevent overscroll bounce */
body {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

/* iOS specific fixes */
@supports (-webkit-touch-callout: none) {
  /* Remove iOS button styling */
  button {
    -webkit-appearance: none;
    border-radius: 0;
  }
  
  /* Fix iOS audio controls */
  audio {
    width: 100%;
    height: auto;
  }
  
  /* Fix iOS input styling */
  input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: transparent;
    outline: none;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark mode optimizations */
@media (prefers-color-scheme: dark) {
  .bg-white {
    background-color: rgba(255, 255, 255, 0.95);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .bg-gradient-to-r {
    background: #ec4899;
  }
  
  .text-pink-300 {
    color: #f9a8d4;
  }
}

/* Portrait/Landscape optimizations */
@media (orientation: landscape) and (max-height: 500px) {
  .text-7xl {
    font-size: 3rem;
  }
  
  .text-6xl {
    font-size: 2.5rem;
  }
  
  .text-3xl {
    font-size: 1.5rem;
  }
  
  .mb-8 {
    margin-bottom: 1rem;
  }
  
  .mb-6 {
    margin-bottom: 0.75rem;
  }
}

/* iPhone 11 specific optimizations */
@media only screen 
  and (device-width: 414px) 
  and (device-height: 896px) 
  and (-webkit-device-pixel-ratio: 2) {
  
  /* Optimize for iPhone 11 screen */
  .max-w-sm {
    max-width: 380px;
  }
  
  /* Better touch targets */
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Optimized text sizes */
  .text-sm {
    font-size: 0.95rem;
  }
  
  .text-base {
    font-size: 1.1rem;
  }
}

/* Safari-specific fixes */
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  /* Fix Safari backdrop-filter */
  .backdrop-blur-xl {
    -webkit-backdrop-filter: blur(24px);
    backdrop-filter: blur(24px);
  }
  
  .backdrop-blur-2xl {
    -webkit-backdrop-filter: blur(40px);
    backdrop-filter: blur(40px);
  }
  
  .backdrop-blur-sm {
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
  }
}

/* Loading states */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Improved focus states for accessibility */
button:focus-visible,
input:focus-visible {
  outline: 2px solid #ec4899;
  outline-offset: 2px;
}

/* Smooth transitions for better UX */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar for webkit */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(236, 72, 153, 0.5);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(236, 72, 153, 0.8);
}

/* Performance optimizations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Image optimization */
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* Text rendering optimization */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
</style>
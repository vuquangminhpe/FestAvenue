import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

gsap.registerPlugin(ScrollTrigger)

interface EventData {
  title: string
  subtitle: string
  description: string
  date: string
  time: string
  location: string
  venue: string
  price?: number
  currency?: string
  headerLogo: string
  heroImage: string
  djImage: string
  stageImage: string
  galleryImages: string[]
  artists: Artist[]
  contentSections: ContentSection[]
  sponsors: Sponsor[]
  socialLinks: SocialLink[]
  ticketTypes: TicketType[]
}

interface Artist {
  name: string
  genre: string
  image: string
  description: string
  socialMedia: string
}

interface ContentSection {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  features: string[]
  cta: string
  icon: string
}

interface Sponsor {
  name: string
  logo: string
  url: string
  tier: 'platinum' | 'gold' | 'silver'
}

interface SocialLink {
  platform: string
  url: string
  icon: string
}

interface TicketType {
  name: string
  price: number
  currency: string
  features: string[]
  popular?: boolean
}

// Animated Header with Glitch Effects
const CyberpunkHeader: React.FC<{ eventData: EventData }> = ({ eventData }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLHeadElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)

    // Glitch animation for logo
    if (logoRef.current) {
      const glitchTimeline = gsap.timeline({ repeat: -1, repeatDelay: 3 })

      glitchTimeline
        .to(logoRef.current, {
          duration: 0.1,
          skewX: 2,
          filter: 'hue-rotate(90deg)',
          textShadow: '2px 0 0 #ff00ff, -2px 0 0 #00ffff'
        })
        .to(logoRef.current, {
          duration: 0.1,
          skewX: -1,
          filter: 'hue-rotate(180deg)',
          textShadow: '3px 0 0 #ffff00, -1px 0 0 #ff00ff'
        })
        .to(logoRef.current, {
          duration: 0.1,
          skewX: 0,
          filter: 'hue-rotate(0deg)',
          textShadow: 'none'
        })
    }

    // Header entrance animation
    gsap.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
    )

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-xl border-b border-cyan-500/30 shadow-lg shadow-cyan-500/20'
          : 'bg-transparent'
      }`}
    >
      <nav className='container mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Animated Logo */}
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <img
                src={eventData.headerLogo}
                alt='Event Logo'
                className='h-12 w-12 object-cover rounded-lg border-2 border-cyan-400 shadow-lg shadow-cyan-400/50'
              />
              <div className='absolute inset-0 bg-cyan-400/20 rounded-lg animate-pulse'></div>
            </div>

            <div ref={logoRef} className='text-white'>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
                {eventData.title}
              </h1>
              <p className='text-sm text-cyan-200 font-mono'>{eventData.subtitle}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className='hidden lg:flex items-center space-x-8'>
            {['Home', 'Artists', 'Schedule', 'Gallery', 'Tickets'].map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className='relative text-white hover:text-cyan-400 transition-all duration-300 group font-mono'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item}
                <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 group-hover:w-full'></span>
                <div className='absolute inset-0 border border-cyan-400/0 group-hover:border-cyan-400/50 transition-all duration-300 -m-2 rounded'></div>
              </a>
            ))}

            {/* Price Badge */}
            {eventData.price && (
              <Badge className='bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-bold text-lg px-6 py-2 animate-pulse'>
                {eventData.currency || '$'}
                {eventData.price}
              </Badge>
            )}

            {/* CTA Button */}
            <Button className='bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:to-cyan-500 text-white font-bold px-8 py-3 shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300'>
              🎫 GET TICKETS
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className='lg:hidden text-cyan-400 hover:text-pink-400 transition-colors'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className='space-y-1'>
              <div
                className={`w-6 h-0.5 bg-current transform transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              ></div>
              <div
                className={`w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}
              ></div>
              <div
                className={`w-6 h-0.5 bg-current transform transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              ></div>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-500 overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className='mt-6 p-6 bg-black/80 backdrop-blur-lg rounded-xl border border-cyan-500/30'>
            <div className='flex flex-col space-y-4'>
              {['Home', 'Artists', 'Schedule', 'Gallery', 'Tickets'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className='text-white hover:text-cyan-400 transition-colors font-mono'
                >
                  {item}
                </a>
              ))}
              <Button className='bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold mt-4'>
                🎫 GET TICKETS
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

// 3D Cyberpunk City Banner
const CyberpunkHeroBanner: React.FC<{ eventData: EventData }> = ({ eventData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const buildingsRef = useRef<THREE.Group[]>([])
  const particleSystemsRef = useRef<THREE.Points[]>([])
  const hologramsRef = useRef<THREE.Mesh[]>([])

  const createNeonMaterial = useCallback((color: number) => {
    return new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    })
  }, [])

  const createHologram = useCallback((text: string, position: THREE.Vector3) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = 512
    canvas.height = 128

    if (context) {
      // Holographic background
      const gradient = context.createLinearGradient(0, 0, 512, 128)
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)')
      gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.2)')
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)')
      context.fillStyle = gradient
      context.fillRect(0, 0, 512, 128)

      // Text
      context.fillStyle = '#00ffff'
      context.font = 'bold 32px Arial'
      context.textAlign = 'center'
      context.fillText(text, 256, 80)

      // Scan lines effect
      for (let i = 0; i < 128; i += 4) {
        context.fillStyle = 'rgba(0, 255, 255, 0.1)'
        context.fillRect(0, i, 512, 1)
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8
    })
    const geometry = new THREE.PlaneGeometry(8, 2)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(position)

    return mesh
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000011, 50, 200)

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000011, 1)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Ground with neon grid
    const gridSize = 100
    const gridDivisions = 50
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00ffff, 0x0066cc)
    gridHelper.position.y = -5
    scene.add(gridHelper)

    // Cyberpunk Buildings
    const buildings: THREE.Group[] = []

    for (let i = 0; i < 20; i++) {
      const building = new THREE.Group()

      // Main structure
      const height = 10 + Math.random() * 30
      const width = 2 + Math.random() * 3
      const depth = 2 + Math.random() * 3

      const buildingGeometry = new THREE.BoxGeometry(width, height, depth)
      const buildingMaterial = new THREE.MeshPhongMaterial({
        color: 0x111122,
        emissive: 0x001122,
        emissiveIntensity: 0.2
      })
      const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial)
      buildingMesh.position.y = height / 2
      buildingMesh.castShadow = true
      building.add(buildingMesh)

      // Neon strips
      const neonColors = [0x00ffff, 0xff00ff, 0xffff00, 0xff0080]

      for (let j = 0; j < 5; j++) {
        const stripGeometry = new THREE.BoxGeometry(width + 0.1, 0.2, depth + 0.1)
        const stripMaterial = createNeonMaterial(neonColors[j % 4])
        const strip = new THREE.Mesh(stripGeometry, stripMaterial)
        strip.position.y = ((j + 1) * height) / 6
        building.add(strip)
      }

      // Position buildings in a grid
      const x = (Math.random() - 0.5) * 80
      const z = (Math.random() - 0.5) * 80
      building.position.set(x, 0, z)

      buildings.push(building)
      scene.add(building)
    }

    buildingsRef.current = buildings

    // Holographic displays
    const holograms: THREE.Mesh[] = []
    const hologramTexts = ['CYBER FEST', '2024', 'BASS DROP', 'NEON NIGHTS']

    hologramTexts.forEach((text, index) => {
      const hologram = createHologram(text, new THREE.Vector3((index - 1.5) * 15, 15 + Math.sin(index) * 5, -20))
      holograms.push(hologram)
      scene.add(hologram)
    })

    hologramsRef.current = holograms

    // Particle systems
    const particleSystems: THREE.Points[] = []

    // Digital rain effect
    for (let i = 0; i < 3; i++) {
      const particleCount = 1000
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(particleCount * 3)
      const colors = new Float32Array(particleCount * 3)

      for (let j = 0; j < particleCount; j++) {
        positions[j * 3] = (Math.random() - 0.5) * 100
        positions[j * 3 + 1] = Math.random() * 100
        positions[j * 3 + 2] = (Math.random() - 0.5) * 100

        const color = new THREE.Color()
        color.setHSL(0.5 + Math.random() * 0.3, 1, 0.5 + Math.random() * 0.5)
        colors[j * 3] = color.r
        colors[j * 3 + 1] = color.g
        colors[j * 3 + 2] = color.b
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      })

      const particles = new THREE.Points(geometry, material)
      particleSystems.push(particles)
      scene.add(particles)
    }

    particleSystemsRef.current = particleSystems

    // DJ Platform
    const platformGeometry = new THREE.CylinderGeometry(8, 10, 2, 16)
    const platformMaterial = createNeonMaterial(0x00ffff)
    const platform = new THREE.Mesh(platformGeometry, platformMaterial)
    platform.position.set(0, 1, 0)
    scene.add(platform)

    // DJ Equipment (simplified)
    const djBoothGeometry = new THREE.BoxGeometry(6, 3, 3)
    const djBoothMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      emissive: 0xff00ff,
      emissiveIntensity: 0.2
    })
    const djBooth = new THREE.Mesh(djBoothGeometry, djBoothMaterial)
    djBooth.position.set(0, 3.5, 0)
    scene.add(djBooth)

    // Speakers
    for (let i = 0; i < 4; i++) {
      const speakerGeometry = new THREE.BoxGeometry(2, 6, 2)
      const speakerMaterial = new THREE.MeshPhongMaterial({
        color: 0x111111,
        emissive: 0x004400
      })
      const speaker = new THREE.Mesh(speakerGeometry, speakerMaterial)
      const angle = (i / 4) * Math.PI * 2
      speaker.position.set(Math.cos(angle) * 12, 3, Math.sin(angle) * 12)
      scene.add(speaker)
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    scene.add(ambientLight)

    // Neon spotlights
    const neonLights = [
      { color: 0x00ffff, position: new THREE.Vector3(20, 30, 20) },
      { color: 0xff00ff, position: new THREE.Vector3(-20, 30, 20) },
      { color: 0xffff00, position: new THREE.Vector3(0, 40, -30) }
    ]

    neonLights.forEach((light) => {
      const spotLight = new THREE.SpotLight(light.color, 2, 100, Math.PI / 6, 0.3, 1)
      spotLight.position.copy(light.position)
      spotLight.target.position.set(0, 0, 0)
      spotLight.castShadow = true
      scene.add(spotLight)
      scene.add(spotLight.target)
    })

    camera.position.set(0, 20, 30)
    camera.lookAt(0, 5, 0)

    // GSAP Animations

    // Building neon pulsing
    buildings.forEach((building, index) => {
      building.children.slice(1).forEach((strip, stripIndex) => {
        if (strip instanceof THREE.Mesh) {
          gsap.to(strip.material, {
            duration: 1 + Math.random(),
            emissiveIntensity: 1.5,
            yoyo: true,
            repeat: -1,
            ease: 'power2.inOut',
            delay: index * 0.1 + stripIndex * 0.05
          })
        }
      })
    })

    // Hologram glitching
    holograms.forEach((hologram, index) => {
      gsap.to(hologram.position, {
        duration: 2 + index * 0.5,
        y: hologram.position.y + Math.sin(index) * 2,
        yoyo: true,
        repeat: -1,
        ease: 'power2.inOut'
      })

      gsap.to(hologram.material, {
        duration: 0.1,
        opacity: 0.3,
        yoyo: true,
        repeat: -1,
        repeatDelay: 3 + index,
        ease: 'power2.inOut'
      })
    })

    // Particle rain animation
    let rainTime = 0
    const animateParticles = () => {
      rainTime += 0.01

      particleSystems.forEach((particles, systemIndex) => {
        const positions = particles.geometry.attributes.position.array as Float32Array

        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] -= 0.5 + systemIndex * 0.2 // Fall speed

          if (positions[i + 1] < -10) {
            positions[i + 1] = 50
            positions[i] = (Math.random() - 0.5) * 100
            positions[i + 2] = (Math.random() - 0.5) * 100
          }
        }

        particles.geometry.attributes.position.needsUpdate = true
      })
    }

    // Platform rotation
    gsap.to(platform.rotation, {
      duration: 20,
      y: Math.PI * 2,
      repeat: -1,
      ease: 'none'
    })

    // Camera movement
    const cameraTimeline = gsap.timeline({ repeat: -1 })
    cameraTimeline
      .to(camera.position, {
        duration: 8,
        x: 25,
        y: 25,
        z: 25,
        ease: 'power2.inOut'
      })
      .to(camera.position, {
        duration: 8,
        x: -25,
        y: 15,
        z: 35,
        ease: 'power2.inOut'
      })
      .to(camera.position, {
        duration: 8,
        x: 0,
        y: 20,
        z: 30,
        ease: 'power2.inOut'
      })

    // DJ booth pulsing
    gsap.to(djBooth.material, {
      duration: 0.8,
      emissiveIntensity: 0.8,
      yoyo: true,
      repeat: -1,
      ease: 'power2.inOut'
    })

    const animate = () => {
      requestAnimationFrame(animate)
      animateParticles()
      camera.lookAt(0, 5, 0)
      renderer.render(scene, camera)
    }
    animate()

    sceneRef.current = scene
    rendererRef.current = renderer

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [createNeonMaterial, createHologram])

  return (
    <section id='home' className='relative h-screen overflow-hidden'>
      <canvas ref={canvasRef} className='absolute inset-0' />

      {/* Hero Content Overlay */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='text-center text-white z-10 max-w-5xl mx-auto px-6'>
          <div className='bg-black/20 backdrop-blur-sm rounded-3xl p-12 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20'>
            {/* Hero Image */}
            <div className='mb-8'>
              <img
                src={eventData.heroImage}
                alt='Hero'
                className='w-40 h-40 object-cover rounded-full mx-auto border-4 border-cyan-400 shadow-lg shadow-cyan-400/50'
              />
            </div>

            {/* Main Title with Glitch Effect */}
            <h1 className='text-7xl md:text-9xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse font-mono'>
              {eventData.title.split('').map((char, index) => (
                <span
                  key={index}
                  className='inline-block hover:animate-bounce'
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>

            <h2 className='text-3xl md:text-4xl text-cyan-200 mb-6 font-mono'>{eventData.subtitle}</h2>

            <p className='text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed'>{eventData.description}</p>

            {/* Event Details */}
            <div className='flex flex-col md:flex-row items-center justify-center gap-6 mb-8'>
              <div className='flex items-center gap-3 text-lg bg-black/40 rounded-full px-6 py-3 border border-cyan-500/30'>
                <span className='text-2xl'>🗓️</span>
                <span className='font-mono'>{eventData.date}</span>
              </div>
              <div className='flex items-center gap-3 text-lg bg-black/40 rounded-full px-6 py-3 border border-purple-500/30'>
                <span className='text-2xl'>🕖</span>
                <span className='font-mono'>{eventData.time}</span>
              </div>
              <div className='flex items-center gap-3 text-lg bg-black/40 rounded-full px-6 py-3 border border-pink-500/30'>
                <span className='text-2xl'>📍</span>
                <span className='font-mono'>{eventData.location}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-6 justify-center items-center'>
              {eventData.price && (
                <Badge className='text-3xl px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-bold font-mono animate-pulse'>
                  {eventData.currency || '$'}
                  {eventData.price}
                </Badge>
              )}

              <Button className='text-xl px-16 py-7 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:to-cyan-500 text-white font-bold transform hover:scale-110 transition-all duration-300 shadow-2xl shadow-cyan-500/30 font-mono'>
                🎫 ENTER THE MATRIX
              </Button>

              <Button
                variant='outline'
                className='text-xl px-16 py-7 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 font-mono'
              >
                👁️ PREVIEW
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 text-cyan-400'>
        <div className='flex flex-col items-center animate-bounce'>
          <span className='text-sm mb-2 font-mono'>JACK IN</span>
          <div className='w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center'>
            <div className='w-1 h-3 bg-cyan-400 rounded-full animate-pulse mt-2'></div>
          </div>
        </div>
      </div>

      {/* Floating UI Elements */}
      <div className='absolute top-20 left-20 text-cyan-400 font-mono text-sm opacity-70'>
        <div>NEURAL_LINK_ACTIVE</div>
        <div>BASS_FREQUENCY: 808Hz</div>
        <div>CROWD_SYNC: 99.7%</div>
      </div>

      <div className='absolute bottom-20 right-20 text-purple-400 font-mono text-sm opacity-70'>
        <div>HOLOGRAM_STATUS: ONLINE</div>
        <div>NEON_INTENSITY: MAX</div>
        <div>VIBE_LEVEL: INFINITE</div>
      </div>
    </section>
  )
}

// Artists Section with Hologram Cards
const ArtistsSection: React.FC<{ eventData: EventData }> = ({ eventData }) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%'
        }
      }
    )

    // Cards animation
    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, scale: 0.8, rotationY: -90 },
          {
            opacity: 1,
            scale: 1,
            rotationY: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%'
            },
            delay: index * 0.2
          }
        )
      }
    })
  }, [eventData.artists])

  return (
    <section id='artists' ref={sectionRef} className='py-20 bg-gradient-to-b from-black via-purple-900/20 to-black'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-6xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-mono'>
            FEATURED_ARTISTS.EXE
          </h2>
          <p className='text-xl text-gray-300 font-mono'>{'>'} Initializing sonic neural networks...</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {eventData.artists.map((artist, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el
              }}
              className='group cursor-pointer'
            >
              <Card className='bg-black/60 backdrop-blur-lg border-2 border-cyan-500/20 hover:border-purple-500/60 transition-all duration-500 transform group-hover:scale-105 group-hover:rotate-1 shadow-2xl shadow-cyan-500/10 group-hover:shadow-purple-500/30'>
                <CardContent className='p-0'>
                  {/* Artist Image */}
                  <div className='relative overflow-hidden'>
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className='w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60'></div>

                    {/* Hologram Effect */}
                    <div className='absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                    {/* Scan Lines */}
                    <div className='absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-500'>
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className='absolute w-full h-px bg-cyan-400/30' style={{ top: `${i * 5}%` }}></div>
                      ))}
                    </div>

                    {/* Genre Badge */}
                    <Badge className='absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-mono'>
                      {artist.genre}
                    </Badge>
                  </div>

                  {/* Artist Info */}
                  <div className='p-6'>
                    <h3 className='text-2xl font-bold text-white mb-3 font-mono bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'>
                      {artist.name}
                    </h3>

                    <p className='text-gray-300 mb-4 font-mono text-sm'>{artist.description}</p>

                    {/* Social Link */}
                    <a
                      href={artist.socialMedia}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-2 text-cyan-400 hover:text-purple-400 transition-colors font-mono text-sm'
                    >
                      <span>🔗</span>
                      NEURAL_LINK
                      <span className='ml-2'>{'>'}</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Interactive Content Sections
const ContentSections: React.FC<{ eventData: EventData }> = ({ eventData }) => {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.fromTo(
          ref,
          {
            opacity: 0,
            x: index % 2 === 0 ? -100 : 100,
            rotationY: index % 2 === 0 ? -30 : 30
          },
          {
            opacity: 1,
            x: 0,
            rotationY: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ref,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      }
    })
  }, [eventData.contentSections])

  return (
    <div className='py-20 bg-gradient-to-b from-black via-blue-900/10 to-black'>
      <div className='container mx-auto px-6'>
        {eventData.contentSections.map((section, index) => (
          <div
            key={section.id}
            ref={(el) => {
              sectionRefs.current[index] = el
            }}
            className='mb-32'
          >
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              {/* Image Side */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <div className='relative group'>
                  <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl transform group-hover:rotate-1 transition-transform duration-500'></div>
                  <img
                    src={section.image}
                    alt={section.title}
                    className='relative w-full h-96 object-cover rounded-2xl shadow-2xl shadow-cyan-500/20 group-hover:shadow-purple-500/30 transition-all duration-500 border border-cyan-500/30'
                  />

                  {/* Tech Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-purple-500/20 rounded-2xl'></div>

                  {/* Corner Brackets */}
                  <div className='absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400'></div>
                  <div className='absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400'></div>
                  <div className='absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400'></div>
                  <div className='absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400'></div>
                </div>
              </div>

              {/* Content Side */}
              <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <Card className='bg-black/40 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 hover:shadow-purple-500/20 transition-all duration-500'>
                  <CardContent className='p-8'>
                    {/* Section Icon */}
                    <div className='text-4xl mb-4'>{section.icon}</div>

                    <h3 className='text-4xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono'>
                      {section.title}
                    </h3>

                    <h4 className='text-xl text-cyan-200 mb-6 font-mono'>
                      {'>'} {section.subtitle}
                    </h4>

                    <p className='text-gray-300 text-lg mb-8 leading-relaxed'>{section.description}</p>

                    {/* Features Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
                      {section.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className='flex items-center gap-3 group/feature'>
                          <div className='w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full group-hover/feature:scale-150 transition-transform duration-300'></div>
                          <span className='text-white font-mono text-sm group-hover/feature:text-cyan-400 transition-colors duration-300'>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-cyan-500 hover:to-purple-500 text-white font-bold px-8 py-3 transform hover:scale-105 transition-all duration-300 font-mono'>
                      {section.cta} {'>>'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Ticket Types Section
const TicketsSection: React.FC<{ eventData: EventData }> = ({ eventData }) => {
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null)

  useEffect(() => {
    gsap.from('.ticket-card', {
      duration: 0.8,
      y: 100,
      opacity: 0,
      stagger: 0.2,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.tickets-container',
        start: 'top 80%'
      }
    })
  }, [])

  return (
    <section id='tickets' className='py-20 bg-gradient-to-b from-black via-cyan-900/10 to-black'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-6xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-mono'>
            ACCESS_TOKENS.SYS
          </h2>
          <p className='text-xl text-gray-300 font-mono'>{'>'} Select your neural interface level</p>
        </div>

        <div className='tickets-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
          {eventData.ticketTypes.map((ticket, index) => (
            <div
              key={index}
              className={`ticket-card cursor-pointer transform transition-all duration-500 ${
                selectedTicket === index ? 'scale-105' : 'hover:scale-105'
              }`}
              onClick={() => setSelectedTicket(selectedTicket === index ? null : index)}
            >
              <Card
                className={`relative bg-black/60 backdrop-blur-lg border-2 transition-all duration-500 shadow-2xl ${
                  ticket.popular
                    ? 'border-pink-500/60 shadow-pink-500/30'
                    : selectedTicket === index
                    ? 'border-purple-500/60 shadow-purple-500/30'
                    : 'border-cyan-500/20 hover:border-cyan-500/60 shadow-cyan-500/10'
                }`}
              >
                {/* Popular Badge */}
                {ticket.popular && (
                  <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                    <Badge className='bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-6 py-2 font-mono animate-pulse'>
                      🔥 MOST_POPULAR
                    </Badge>
                  </div>
                )}

                <CardContent className='p-8 text-center'>
                  <h3 className='text-3xl font-bold text-white mb-4 font-mono bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent'>
                    {ticket.name}
                  </h3>

                  <div className='mb-6'>
                    <span className='text-5xl font-bold text-white font-mono'>
                      {ticket.currency}
                      {ticket.price}
                    </span>
                    <div className='text-sm text-gray-400 font-mono mt-2'>// ONE_TIME_ACCESS</div>
                  </div>

                  <div className='space-y-3 mb-8'>
                    {ticket.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className='flex items-center gap-3'>
                        <div className='w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full'></div>
                        <span className='text-gray-300 font-mono text-sm'>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full font-bold py-4 font-mono transition-all duration-300 ${
                      ticket.popular
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500'
                        : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-purple-500 hover:to-cyan-500'
                    }`}
                  >
                    ACQUIRE_TOKEN {'>>'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className='text-center mt-12'>
          <p className='text-gray-400 font-mono text-sm'>
            {'>'} All access tokens include quantum encryption and neural sync protocols
          </p>
        </div>
      </div>
    </section>
  )
}

// Main Template Component
const CyberpunkMusicTemplate: React.FC = () => {
  const [eventData] = useState<EventData>({
    title: 'CYBER FEST',
    subtitle: 'Neural Bass Protocol',
    description:
      'Jack into the ultimate cyberpunk music experience. Neon-soaked beats, holographic visuals, and bass that syncs with your neural pathways. Welcome to the future of sound.',
    date: '2024.12.31',
    time: '23:59:00 GMT',
    location: 'Neo Tokyo Mega City',
    venue: 'Quantum Sound Complex',
    price: 150,
    currency: '$',
    headerLogo: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1571330735066-03aaa9675b89?w=400&h=400&fit=crop',
    djImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    stageImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&h=400&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1571330735066-03aaa9675b89?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571330735066-03aaa9675b89?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
    ],
    artists: [
      {
        name: 'NEON_SYNTH',
        genre: 'Cyberbass',
        image: 'https://images.unsplash.com/photo-1571330735066-03aaa9675b89?w=400&h=500&fit=crop',
        description:
          'Neural-linked bass architect from Neo Seoul. Specializes in quantum-entangled frequencies that sync directly with your consciousness.',
        socialMedia: 'https://soundcloud.com/neon_synth'
      },
      {
        name: 'GHOST_PROTOCOL',
        genre: 'Dark Synth',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=500&fit=crop',
        description:
          'Anonymous collective of AI-enhanced musicians. Their identity remains encrypted, but their beats decode emotions.',
        socialMedia: 'https://ghost-protocol.dark'
      },
      {
        name: 'VOLTAGE_QUEEN',
        genre: 'Electro Punk',
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=500&fit=crop',
        description:
          'Augmented reality performer who manipulates holographic instruments in real-time. Her shows are immersive neural experiences.',
        socialMedia: 'https://voltage-queen.matrix'
      }
    ],
    contentSections: [
      {
        id: 'neural-stage',
        title: 'NEURAL_STAGE.EXE',
        subtitle: 'Holographic Performance Arena',
        description:
          'Experience music in a completely new dimension. Our neural stage uses advanced holographic projection and spatial audio to create immersive soundscapes that react to crowd energy in real-time.',
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&h=400&fit=crop',
        features: [
          '360° Holographic Projections',
          'Neural-Sync Sound System',
          'Real-time Crowd Response',
          'Augmented Reality Overlays',
          'Quantum Bass Resonators',
          'Interactive Light Matrix'
        ],
        cta: 'INITIALIZE_EXPERIENCE',
        icon: '🎭'
      },
      {
        id: 'cyber-lounge',
        title: 'CYBER_LOUNGE.NET',
        subtitle: 'Digital Sanctuary',
        description:
          'Retreat to our cyberpunk lounge featuring neon-lit pods, digital art installations, and virtual reality experiences. Connect with fellow cyber-citizens or jack out and recharge.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop',
        features: [
          'VR Gaming Pods',
          'Neural Interface Charging',
          'Digital Art Gallery',
          'Quantum Cocktail Bar',
          'Neon Relaxation Zones',
          'Data Stream Ambient'
        ],
        cta: 'ENTER_MATRIX',
        icon: '🌐'
      },
      {
        id: 'tech-marketplace',
        title: 'TECH_MARKET.SYS',
        subtitle: 'Augmentation Station',
        description:
          'Upgrade your festival experience with cutting-edge tech. From LED accessories to neural interface enhancers, find everything you need to become one with the cyberpunk aesthetic.',
        image: 'https://images.unsplash.com/photo-1571330735066-03aaa9675b89?w=600&h=400&fit=crop',
        features: [
          'LED Wearable Tech',
          'Neural Interface Mods',
          'Holographic Accessories',
          'Cyber Fashion Line',
          'Digital Art NFTs',
          'Memory Enhancement Chips'
        ],
        cta: 'UPGRADE_SYSTEM',
        icon: '⚡'
      }
    ],
    sponsors: [
      {
        name: 'NeoTech Corp',
        logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=100&fit=crop',
        url: 'https://neotech.corp',
        tier: 'platinum'
      },
      {
        name: 'Quantum Sound',
        logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&h=100&fit=crop',
        url: 'https://quantumsound.io',
        tier: 'gold'
      },
      {
        name: 'Cyber Wear',
        logo: 'https://images.unsplash.com/photo-1611162618479-ee3d24aaef0b?w=200&h=100&fit=crop',
        url: 'https://cyberwear.net',
        tier: 'silver'
      },
      {
        name: 'Neural Labs',
        logo: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=100&fit=crop',
        url: 'https://neurallabs.ai',
        tier: 'gold'
      }
    ],
    socialLinks: [
      {
        platform: 'Neural Network',
        url: 'https://neural.link/cyberfest',
        icon: 'https://img.icons8.com/ios-filled/50/00ffff/brain.png'
      },
      {
        platform: 'Data Stream',
        url: 'https://datastream.live/cyberfest',
        icon: 'https://img.icons8.com/ios-filled/50/ff00ff/streaming.png'
      },
      {
        platform: 'Holo Channel',
        url: 'https://holo.tv/cyberfest',
        icon: 'https://img.icons8.com/ios-filled/50/ffff00/hologram.png'
      }
    ],
    ticketTypes: [
      {
        name: 'BASIC_ACCESS',
        price: 89,
        currency: '$',
        features: [
          'Neural Stage Access',
          'Basic Hologram View',
          'Standard Audio Feed',
          'Digital Wristband',
          'Entry Portal Access'
        ]
      },
      {
        name: 'PREMIUM_LINK',
        price: 150,
        currency: '$',
        popular: true,
        features: [
          'VIP Neural Stage Zone',
          'Enhanced Holographic View',
          'Premium Audio Neural-Link',
          'Cyber Lounge Access',
          'LED Wearable Tech Kit',
          'Express Entry Protocol'
        ]
      },
      {
        name: 'MATRIX_ELITE',
        price: 299,
        currency: '$',
        features: [
          'Backstage Neural Interface',
          'Private Cyber Pod',
          'Direct Artist Connection',
          'Exclusive Tech Marketplace',
          'Full Augmentation Package',
          'Neural Memory Recording',
          'Quantum Transportation'
        ]
      }
    ]
  })

  return (
    <div className='min-h-screen bg-black'>
      <CyberpunkHeader eventData={eventData} />
      <CyberpunkHeroBanner eventData={eventData} />
      <ArtistsSection eventData={eventData} />
      <ContentSections eventData={eventData} />
      <TicketsSection eventData={eventData} />
    </div>
  )
}

export default CyberpunkMusicTemplate

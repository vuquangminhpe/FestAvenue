export class SeatInteractionManager {
  private animationQueue: Map<string, any> = new Map()
  private seatStates: Map<string, 'available' | 'occupied' | 'locked'> = new Map()

  toggleSeat(
    seatElement: HTMLElement,
    seatId: string,
    onStatusChange: (seatId: string, newStatus: 'available' | 'occupied') => void
  ): boolean {
    const currentStatus = this.seatStates.get(seatId) || 'available'

    if (currentStatus === 'locked') {
      this.showLockedFeedback(seatElement)
      return false
    }

    if (this.animationQueue.has(seatId)) {
      return false
    }

    this.animationQueue.set(seatId, true)

    if (currentStatus === 'occupied') {
      this.animateCharacterLeaving(seatElement, seatId, () => {
        this.seatStates.set(seatId, 'available')
        onStatusChange(seatId, 'available')
        this.animationQueue.delete(seatId)
      })
    } else {
      this.animateCharacterEntering(seatElement, seatId, () => {
        this.seatStates.set(seatId, 'occupied')
        onStatusChange(seatId, 'occupied')
        this.animationQueue.delete(seatId)
      })
    }

    return true
  }

  setSeatStatus(seatId: string, status: 'available' | 'occupied' | 'locked') {
    this.seatStates.set(seatId, status)
  }

  getSeatStatus(seatId: string): 'available' | 'occupied' | 'locked' {
    return this.seatStates.get(seatId) || 'available'
  }

  private animateCharacterLeaving(seatElement: HTMLElement, _seatId: string, onComplete: () => void) {
    if (!window.gsap) {
      onComplete()
      return
    }

    const character = seatElement.querySelector('.seated-character')
    if (!character) {
      onComplete()
      return
    }

    const seat = seatElement.querySelector('.cinema-seat') as HTMLElement
    const col = parseInt(seatElement.dataset.col || '0')

    const tl = window.gsap.timeline({
      onComplete: () => {
        character.remove()
        if (seat) {
          seat.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
          const seatBack = seat.querySelector('.seat-back') as HTMLElement
          if (seatBack) {
            seatBack.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
          }
        }
        onComplete()
      }
    })

    tl.to(character, {
      y: -20,
      scale: 1.1,
      duration: 0.3,
      ease: 'power2.out'
    }).to(character, {
      x: col < 6 ? -250 : 250,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in'
    })
  }

  private animateCharacterEntering(seatElement: HTMLElement, _seatId: string, onComplete: () => void) {
    if (!window.gsap) {
      onComplete()
      return
    }

    const col = parseInt(seatElement.dataset.col || '0')

    const character = document.createElement('div')
    character.className = 'walking-character'
    character.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: ${col < 6 ? '-150px' : 'calc(100% + 150px)'};
      width: 40px;
      height: 60px;
      z-index: 100;
    `

    character.innerHTML = this.getCharacterSVG(false)
    seatElement.appendChild(character)

    const seat = seatElement.querySelector('.cinema-seat') as HTMLElement

    const tl = window.gsap.timeline({
      onComplete: () => {
        character.remove()

        const seatedChar = document.createElement('div')
        seatedChar.className = 'seated-character'
        seatedChar.style.cssText = `
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 50px;
          pointer-events: none;
          z-index: 5;
        `
        seatedChar.innerHTML = this.getCharacterSVG(true)
        seatElement.appendChild(seatedChar)

        if (seat) {
          seat.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          const seatBack = seat.querySelector('.seat-back') as HTMLElement
          if (seatBack) {
            seatBack.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
          }
        }

        window.gsap.fromTo(
          seatedChar,
          { opacity: 0, scale: 0.5, y: -10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
        )

        onComplete()
      }
    })

    tl.to(character, {
      left: '50%',
      x: '-50%',
      duration: 0.8,
      ease: 'power2.inOut'
    }).to(character, {
      y: 5,
      scale: 0.9,
      duration: 0.2,
      ease: 'power2.out'
    })
  }

  private getCharacterSVG(isSeated: boolean): string {
    if (isSeated) {
      return `
        <svg width="40" height="50" viewBox="0 0 40 50">
          <ellipse cx="20" cy="12" rx="10" ry="12" fill="#fdbcb4"/>
          <rect x="12" y="20" width="16" height="20" fill="#3b82f6" rx="2"/>
          <rect x="14" y="40" width="5" height="8" fill="#1f2937"/>
          <rect x="21" y="40" width="5" height="8" fill="#1f2937"/>
          <circle cx="16" cy="10" r="1.5" fill="#000"/>
          <circle cx="24" cy="10" r="1.5" fill="#000"/>
          <path d="M 16 14 Q 20 16 24 14" stroke="#000" stroke-width="1" fill="none"/>
        </svg>
      `
    } else {
      return `
        <svg width="40" height="60" viewBox="0 0 40 60">
          <ellipse cx="20" cy="15" rx="12" ry="15" fill="#fdbcb4"/>
          <rect x="10" y="25" width="20" height="25" fill="#3b82f6" rx="2"/>
          <rect class="leg" x="12" y="50" width="6" height="10" fill="#1f2937"/>
          <rect class="leg" x="22" y="50" width="6" height="10" fill="#1f2937"/>
          <circle cx="15" cy="12" r="2" fill="#000"/>
          <circle cx="25" cy="12" r="2" fill="#000"/>
        </svg>
      `
    }
  }

  private showLockedFeedback(seatElement: HTMLElement) {
    if (!window.gsap) return

    window.gsap.to(seatElement, {
      x: -2,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: 'power2.inOut',
      onComplete: () => {
        window.gsap.set(seatElement, { x: 0 })
      }
    })

    const lockIcon = document.createElement('div')
    lockIcon.innerHTML = '🔒'
    lockIcon.style.cssText = `
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 20px;
      z-index: 1000;
    `
    seatElement.appendChild(lockIcon)

    window.gsap.to(lockIcon, {
      y: -10,
      opacity: 0,
      duration: 1,
      onComplete: () => lockIcon.remove()
    })
  }

  clearState() {
    this.animationQueue.clear()
    this.seatStates.clear()
  }
}

// GSAP Type Definitions
declare global {
  interface Window {
    gsap?: {
      to: (target: any, vars: any) => any
      fromTo: (target: any, fromVars: any, toVars: any) => any
      timeline: () => any
      set: (target: any, vars: any) => void
    }
  }
}

export {}
